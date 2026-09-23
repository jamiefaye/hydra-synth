/**
 * Controller: the object a program talks to. Wraps MidiState with device profiles,
 * display feedback, learn logging and a transport-agnostic port interface.
 *
 * No browser, node or Hydra dependency. A transport (adapters/*.js) calls
 *   controller.handleMessage(bytes)             for every incoming message
 *   controller.attachTransport({ name, send, inputs, outputs })
 * and the controller calls transport.send(bytes) for feedback.
 */

import { MidiState, describeEvent } from './midi-state.js'
import { resolveControl, resolvePush } from './profiles.js'

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
    this.state = new MidiState({ mode: this.opts.mode, channel: this.opts.channel, steps: this.opts.steps })
    this.profile = null
    this.transport = null
    this.inputs = []
    this.outputs = []
    this.ready = Promise.resolve(this)
    this.onInputsChanged = null
    this._sysexListeners = new Set()
    this._transportListeners = new Set()
    this._labelListeners = new Set()
    this._logging = !!this.opts.log
    this._unlisten = this.state.onEvent(ev => {
      if (this._logging) console.log('[midi]', describeEvent(ev))
      if (this.opts.feedback && ev.registered && ev.pos !== undefined && (ev.type === 'cc' || ev.type === 'set')) {
        // every encoder the control sits on follows, not only the one that moved
        for (const a of ev.aliases || [{ channel: ev.channel, number: ev.number }]) this.sendFeedback(a.channel || ev.channel, a.number, ev.pos)
      }
    })
    if (this.opts.profile) this.use(this.opts.profile)
  }

  /** Adopt a device profile: defaults for mode/channel plus name and [group, n] addressing. */
  use (profile, extra = {}) {
    this.profile = Object.assign({}, profile, extra, { names: Object.assign({}, profile.names || {}, extra.names || {}) })
    if (this.profile.mode) this.state.defaults.mode = this.profile.mode
    if (this.profile.channel !== undefined) this.state.defaults.channel = this.profile.channel
    return this.profile
  }

  /** Add or replace control names: names({ gain: [1, 1], rot: [1, 2] }) */
  names (map) {
    if (!this.profile) throw new Error('midi.names: call use(profile) first')
    Object.assign(this.profile.names, map)
    return this.profile.names
  }

  /**
   * cc(id, min, max, init) or cc(id, opts); id = number | [group, n] | 'name'.
   * opts.label (up to 4 characters) names the encoder on a device display that can be
   * written live (EC4: midi.ec4.display); listeners from onLabels hear about it.
   */
  cc (id, a, b, c) {
    const { number, channel } = resolveControl(this.profile, id)
    const opts = (typeof a === 'object' && a !== null) ? defined(a) : defined({ min: a, max: b, init: c })
    if (opts.channel === undefined && channel != null) opts.channel = channel
    const before = this.state.controls.get(`${opts.channel == null ? '*' : opts.channel}:${number}`)
    const hadLabel = before ? before.config.label : undefined
    const fn = this.state.cc(number, opts)
    // a re-registration with the same label (a sketch re-eval, a per-frame call) is not news
    if (opts.label !== undefined && opts.label !== hadLabel) for (const l of this._labelListeners) { try { l() } catch (e) { /* a listener's problem */ } }
    return fn
  }

  /** alias(id, ofId): bind another encoder to an existing control (one value, two places). */
  alias (id, ofId) {
    const { number, channel } = resolveControl(this.profile, id)
    const of = resolveControl(this.profile, ofId)
    return this.state.alias(number, of.number, { channel: channel == null ? of.channel : channel })
  }

  /** note(id, opts); id = number | [group, n] | 'name' (the encoder's push) */
  note (id, opts = {}) {
    const { note, channel } = resolvePush(this.profile, id)
    const o = Object.assign({}, opts)
    if (o.channel === undefined && channel != null) o.channel = channel
    return this.state.note(note, o)
  }

  handleMessage (bytes) {
    if (bytes && bytes[0] === 0xf0) return this.handleSysex(bytes)
    return this.state.handleMessage(bytes)
  }

  /** System exclusive messages go to onSysex listeners, not to the value model. */
  handleSysex (bytes) {
    for (const fn of this._sysexListeners) fn(bytes)
    return { type: 'sysex', length: bytes.length }
  }

  onSysex (fn) { this._sysexListeners.add(fn); return () => this._sysexListeners.delete(fn) }
  /** Called after every attachTransport (ports opened or changed). */
  onTransport (fn) { this._transportListeners.add(fn); return () => this._transportListeners.delete(fn) }
  /** Called whenever a control is registered with a label. */
  onLabels (fn) { this._labelListeners.add(fn); return () => this._labelListeners.delete(fn) }
  snapshot () { return this.state.snapshot() }
  restore (snap) { return this.state.restore(snap) }
  onEvent (fn) { return this.state.onEvent(fn) }
  get last () { return this.state.lastEvent }

  learn (on = true) {
    this._logging = !!on
    console.log(`[midi] learn ${this._logging ? 'on' : 'off'}`)
    return this._logging
  }

  /** Echo a control's 0..1 position to the device as the same CC (display feedback). */
  sendFeedback (channel, number, pos) {
    if (!this.opts.feedback || !this.transport || !this.transport.send) return
    // An open control's position can leave 0..1: the display pins at the end rather than wrapping
    const shown = Math.min(Math.max(pos, 0), 1)
    const msg = [0xB0 | ((channel || 1) - 1), number & 0x7f, Math.round(shown * 127) & 0x7f]
    try { this.transport.send(msg) } catch (e) { /* port went away */ }
  }

  /** Resend every control value to the device display. */
  refresh () {
    for (const p of this.state.positions()) this.sendFeedback(p.channel, p.number, p.pos)
  }

  /** Called by an adapter once ports are open (and again when they change). */
  attachTransport (transport) {
    this.transport = transport
    this.inputs = transport.inputs || []
    this.outputs = transport.outputs || []
    if (this.onInputsChanged) this.onInputsChanged(this.inputs)
    this.refresh()
    for (const fn of this._transportListeners) { try { fn(transport) } catch (e) { /* a listener's problem */ } }
  }

  close () {
    this._unlisten()
    if (this.transport && this.transport.close) this.transport.close()
    this.transport = null
  }
}
