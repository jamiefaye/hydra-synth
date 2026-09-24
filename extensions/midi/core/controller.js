/**
 * Controller: the object a program talks to. Owns one or more Devices (core/device.js), each
 * a surface with its own profile, value model, ports and feedback. The first device is the
 * default, and the controller's own cc/note/names/snapshot/state/profile are that device's,
 * so a page written for one controller keeps working when a second is added:
 *
 *   const midi = new Controller({ profile: ec4 })        // the default device
 *   const xl = midi.add(xl3daw)                          // a second one, its own ports
 *   osc(midi.cc([1, 1], 5, 60)).rotate(xl.cc([1, 1], { label: 'ROT' })).out(o0)
 *
 * No browser, node or Hydra dependency. A transport (adapters/*.js) opens ports per device
 * and calls device.attachTransport({ name, send, inputs, outputs }); a message from a port
 * goes to device.handleMessage(bytes). Legacy single-port adapters call the controller's
 * handleMessage / attachTransport, which go to the default device.
 */

import { Device } from './device.js'
import { describeEvent } from './midi-state.js'

// Object.assign copies keys whose value is undefined, which would erase defaults
const defined = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined))

export class Controller {
  constructor (options = {}) {
    this.opts = Object.assign({
      mode: 'r2',
      channel: null,
      steps: 64,
      log: false,
      feedback: true,
      profile: null
    }, defined(options))
    this.devices = new Map()
    this._order = []
    this.ready = Promise.resolve(this)
    this.onInputsChanged = null
    this.lastEvent = null
    this._listeners = new Set()
    this._sysexListeners = new Set()
    this._transportListeners = new Set()
    this._labelListeners = new Set()
    this._logging = !!this.opts.log
    this.add(this.opts.profile, { mode: this.opts.mode, channel: this.opts.channel, steps: this.opts.steps, feedback: this.opts.feedback })
  }

  /** Add a device: add(profile, { id, match, pace, mode, channel, steps, feedback, extra }). The first added is the default. */
  add (profile, options = {}) {
    const dev = new Device(this, profile, Object.assign({ feedback: this.opts.feedback }, options))
    let id = dev.id; let i = 2
    while (this.devices.has(id)) id = `${dev.id}-${i++}`
    dev.id = id
    this.devices.set(id, dev)
    this._order.push(dev)
    return dev
  }

  /** A device by id (or the device itself); undefined when there is none. */
  device (id) { return id instanceof Device ? id : this.devices.get(id) }
  get default () { return this._order[0] }

  // ---- the default device's face, as before there were several

  get state () { return this.default.state }
  get profile () { return this.default.profile }
  set profile (p) { this.default.profile = p }
  get transport () { return this.default.transport }
  get inputs () { return this._order.flatMap(d => d.inputs) }
  get outputs () { return this._order.flatMap(d => d.outputs) }
  get last () { return this.lastEvent }

  use (profile, extra) { return this.default.use(profile, extra) }
  names (map) { if (!this.profile) throw new Error('midi.names: call use(profile) first'); return this.default.names(map) }
  cc (id, a, b, c) { return this.default.cc(id, a, b, c) }
  alias (id, ofId) { return this.default.alias(id, ofId) }
  note (id, opts) { return this.default.note(id, opts) }
  snapshot () { return this.default.snapshot() }
  restore (snap) { return this.default.restore(snap) }
  sendFeedback (channel, number, pos) { return this.default.sendFeedback(channel, number, pos) }
  colour (id, index) { return this.default.colour(id, index) }
  lamp (id, level) { return this.default.lamp(id, level) }
  text (id, lines, opts) { return this.default.text(id, lines, opts) }
  screen (lines, opts) { return this.default.screen(lines, opts) }

  /** Resend every device's control values. */
  refresh () { for (const d of this._order) d.refresh() }

  /** Feed a message: to the device named in meta ({ device: id | Device }), else the default. */
  handleMessage (bytes, meta) {
    const dev = (meta && meta.device && this.device(meta.device)) || this.default
    return dev.handleMessage(bytes)
  }

  /** System exclusive messages go to onSysex listeners (bytes, device), not to the value model. */
  handleSysex (bytes, device = this.default) {
    for (const fn of this._sysexListeners) fn(bytes, device)
    return { type: 'sysex', length: bytes.length, device: device && device.id }
  }

  onSysex (fn) { this._sysexListeners.add(fn); return () => this._sysexListeners.delete(fn) }
  /** Every event from every device (ev.device says which). */
  onEvent (fn) { this._listeners.add(fn); return () => this._listeners.delete(fn) }
  /** Called after the default device's ports opened or changed (legacy; device.onTransport for others). */
  onTransport (fn) { this._transportListeners.add(fn); return () => this._transportListeners.delete(fn) }
  /** Called whenever a control on the default device is registered with a label. */
  onLabels (fn) { this._labelListeners.add(fn); return () => this._labelListeners.delete(fn) }

  _emit (ev, device) {
    this.lastEvent = ev
    if (this._logging) console.log(`[midi${this._order.length > 1 ? ' ' + device.id : ''}]`, describeEvent(ev))
    for (const fn of this._listeners) fn(ev)
  }

  _labels (device) {
    if (device !== this.default) return
    for (const l of this._labelListeners) { try { l() } catch (e) { /* a listener's problem */ } }
  }

  _transportChanged (device) {
    if (this.onInputsChanged) this.onInputsChanged(this.inputs)
    if (device !== this.default) return
    for (const fn of this._transportListeners) { try { fn(device.transport) } catch (e) { /* a listener's problem */ } }
  }

  learn (on = true) {
    this._logging = !!on
    console.log(`[midi] learn ${this._logging ? 'on' : 'off'}`)
    return this._logging
  }

  /** A legacy single-port adapter attaches to the default device. */
  attachTransport (transport) { this.default.attachTransport(transport) }

  /** Release every device (DAW modes off) and close their ports. */
  close () {
    for (const d of this._order) d.close()
  }
}
