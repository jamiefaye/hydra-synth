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
    this._logging = !!this.opts.log
    this._unlisten = this.state.onEvent(ev => {
      if (this._logging) console.log('[midi]', describeEvent(ev))
      if (this.opts.feedback && ev.registered && ev.pos !== undefined && (ev.type === 'cc' || ev.type === 'set')) {
        this.sendFeedback(ev.channel, ev.number, ev.pos)
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

  /** cc(id, min, max, init) or cc(id, opts); id = number | [group, n] | 'name' */
  cc (id, a, b, c) {
    const { number, channel } = resolveControl(this.profile, id)
    const opts = (typeof a === 'object' && a !== null) ? defined(a) : defined({ min: a, max: b, init: c })
    if (opts.channel === undefined && channel != null) opts.channel = channel
    return this.state.cc(number, opts)
  }

  /** note(id, opts); id = number | [group, n] | 'name' (the encoder's push) */
  note (id, opts = {}) {
    const { note, channel } = resolvePush(this.profile, id)
    const o = Object.assign({}, opts)
    if (o.channel === undefined && channel != null) o.channel = channel
    return this.state.note(note, o)
  }

  handleMessage (bytes) { return this.state.handleMessage(bytes) }
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
    const msg = [0xB0 | ((channel || 1) - 1), number & 0x7f, Math.round(pos * 127) & 0x7f]
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
  }

  close () {
    this._unlisten()
    if (this.transport && this.transport.close) this.transport.close()
    this.transport = null
  }
}
