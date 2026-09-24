/**
 * Device: one controller surface with its own profile, value model, ports and feedback.
 *
 * A Controller owns one or more of these. Each has its own MidiState, so two surfaces that
 * both speak on channel 1 never collide, and its own transport, so feedback goes to the
 * right box. The profile says how the device explains itself back (profile.feedback), how
 * to greet and release it (profile.connect / release), how to read its messages
 * (profile.translate) and how fast it takes bytes (profile.pace, ms between messages).
 *
 * Feedback hooks, all optional, each returning bytes (or a list of byte arrays) or null:
 *   feedback.value(at, pos)         a control's 0..1 position (default: echo the CC; false = never)
 *   feedback.colour(at, index)      a palette colour for a control's LED
 *   feedback.lamp(at, level)        a button lamp, 0..1
 *   feedback.text(at, lines, opts)  a control's own display page
 *   feedback.page(lines, opts)      the device's static display (device.screen(lines))
 * `at` is { number, channel, group, n } for the control addressed.
 */

import { MidiState } from './midi-state.js'
import { resolveControl, resolvePush } from './profiles.js'

const defined = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined))
const frames = (x) => (x == null ? [] : (Array.isArray(x[0]) ? x : [x]))

export class Device {
  constructor (controller, profile, options = {}) {
    this.controller = controller
    this.opts = Object.assign({ mode: 'r2', channel: null, steps: 64, feedback: true, pace: undefined, match: undefined }, defined(options))
    // pages: one value model each, the same knobs many times over; `state` is the live page's
    this._pages = []
    this.page = 1
    this._pageListeners = new Set()
    this.profile = null
    this.transport = null
    this.inputs = []
    this.outputs = []
    this._queue = []
    this._timer = null
    this._nextAt = 0
    this._colours = new Map()   // 'channel:number' -> palette index last given to a control's LED
    this._lamps = new Map()     // 'channel:number' -> level last given to a button lamp
    this._labelListeners = new Set()
    this._transportListeners = new Set()
    this.stateFor(1)
    this.use(profile || {}, options.extra || {})
    this.id = options.id || this.profile.id || (this.profile.name ? String(this.profile.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : 'device')
  }

  get state () { return this._pages[this.page - 1] }
  get pages () { return this._pages.length }

  /** The value model of a page (made on first use, with the device's defaults). */
  stateFor (page) {
    while (this._pages.length < page) {
      const st = new MidiState(this._pages[0] ? this._pages[0].defaults : { mode: this.opts.mode, channel: this.opts.channel, steps: this.opts.steps })
      const index = this._pages.length
      this._pages.push(st)
      st.onEvent(ev => {
        ev.device = this.id
        ev.page = index + 1
        // feedback for the page on the surface; another page's values wait for their turn
        if (index + 1 === this.page && this.opts.feedback && ev.registered && ev.pos !== undefined && (ev.type === 'cc' || ev.type === 'set')) {
          // every encoder the control sits on follows, not only the one that moved
          for (const a of ev.aliases || [{ channel: ev.channel, number: ev.number }]) this.sendFeedback(a.channel || ev.channel, a.number, ev.pos)
        }
        if (this.controller) this.controller._emit(ev, this)
      })
    }
    return this._pages[page - 1]
  }

  /** Put another page on the surface: its values, colours and names go out; knobs it leaves empty go dark. */
  setPage (page) {
    page = Math.max(1, page | 0)
    if (page === this.page && this._pages[page - 1]) return this.page
    const before = this.state
    this.stateFor(page)
    this.page = page
    const now = this.state
    const fb = this.profile.feedback || {}
    for (const [k, rec] of before.controls) {
      if (now.controls.has(k)) continue
      const a = rec.aliases[0]
      if (fb.colour) this.send(fb.colour({ number: a.number, channel: a.channel, ...this._where(a.number, a.channel) }, 0, this), `colour:${a.channel}:${a.number}`)
      if (fb.text) this.send(fb.text({ number: a.number, channel: a.channel, ...this._where(a.number, a.channel) }, [''], { show: false }, this), `text:${a.channel}:${a.number}`)
    }
    this.refresh()
    for (const fn of this._pageListeners) { try { fn(page) } catch (e) { /* a listener's problem */ } }
    return this.page
  }
  onPage (fn) { this._pageListeners.add(fn); return () => this._pageListeners.delete(fn) }

  get match () { return this.opts.match !== undefined ? this.opts.match : (this.profile && this.profile.match) || null }
  get pace () { return this.opts.pace !== undefined ? this.opts.pace : (this.profile && this.profile.pace) || 0 }
  get isDefault () { return !!this.controller && this.controller.default === this }

  /** Adopt a device profile: defaults for mode/channel plus name and [group, n] addressing. */
  use (profile, extra = {}) {
    this.profile = Object.assign({}, profile, extra, { names: Object.assign({}, (profile && profile.names) || {}, extra.names || {}) })
    for (const st of this._pages) {
      if (this.profile.mode) st.defaults.mode = this.profile.mode
      if (this.profile.channel !== undefined) st.defaults.channel = this.profile.channel
    }
    return this.profile
  }

  /** Add or replace control names: names({ gain: [1, 1], rot: [1, 2] }) */
  names (map) {
    Object.assign(this.profile.names, map)
    return this.profile.names
  }

  /** Where a control sits: { number, channel, group, n } (group and n when the profile can say). */
  at (id) {
    const { number, channel } = resolveControl(this.profile, id)
    const where = this.profile.locate ? this.profile.locate(number, channel) : null
    return { number, channel, group: where ? where[0] : undefined, n: where ? where[1] : undefined }
  }

  _row (at) {
    if (!this.profile.layout || at.group === undefined) return null
    return this.profile.layout.find(r => r.group === at.group) || null
  }

  /**
   * cc(id, min, max, init) or cc(id, opts); id = number | [group, n] | 'name'.
   * opts.label names the control on a display the device can write (EC4 OLED names, XL3 pages);
   * opts.colour is a palette index for its LED where the device has one. A bounded row (fader,
   * pot) takes soft pickup unless opts.pickup says otherwise.
   */
  cc (id, a, b, c) {
    const at = this.at(id)
    const opts = (typeof a === 'object' && a !== null) ? defined(a) : defined({ min: a, max: b, init: c })
    if (opts.channel === undefined && at.channel != null) opts.channel = at.channel
    const row = this._row(at)
    if (row && row.mode && opts.mode === undefined) opts.mode = row.mode
    const mode = opts.mode || this.state.defaults.mode
    if (row && row.kind === 'bounded' && opts.pickup === undefined && mode !== 'r1' && mode !== 'r2') opts.pickup = 'soft'
    const page = opts.page || this.page
    delete opts.page
    const st = this.stateFor(page)
    const before = st.controls.get(`${opts.channel == null ? '*' : opts.channel}:${at.number}`)
    const hadLabel = before ? before.config.label : undefined
    const hadColour = before ? before.config.colour : undefined
    const fn = st.cc(at.number, opts)
    fn.page = page
    const live = page === this.page
    // a re-registration with the same label (a sketch re-eval, a per-frame call) is not news
    if (opts.label !== undefined && opts.label !== hadLabel) {
      if (live) this.text(id, [opts.label], { show: false })
      for (const l of this._labelListeners) { try { l() } catch (e) { /* a listener's problem */ } }
      if (this.controller) this.controller._labels(this)
    }
    if (live && opts.colour !== undefined && opts.colour !== hadColour) this.colour(id, opts.colour)
    return fn
  }

  /** alias(id, ofId): bind another control to an existing one (one value, two places). */
  alias (id, ofId) {
    const { number, channel } = resolveControl(this.profile, id)
    const of = resolveControl(this.profile, ofId)
    return this.state.alias(number, of.number, { channel: channel == null ? of.channel : channel })
  }

  /** note(id, opts); id = number | [group, n] | 'name' (a push, a button, a touch) */
  note (id, opts = {}) {
    const { note, channel } = resolvePush(this.profile, id)
    const o = Object.assign({}, opts)
    if (o.channel === undefined && channel != null) o.channel = channel
    return this.state.note(note, o)
  }

  snapshot () { return this.state.snapshot() }
  restore (snap) { return this.state.restore(snap) }

  handleMessage (bytes) {
    if (bytes && bytes[0] === 0xf0) return this.controller ? this.controller.handleSysex(bytes, this) : { type: 'sysex', length: bytes.length }
    const b = this.profile.translate ? this.profile.translate(bytes) : bytes
    return b ? this.state.handleMessage(b) : null
  }

  // ---- feedback

  /**
   * Queue bytes for the device, paced by profile.pace. A key coalesces: a newer frame with the
   * same key replaces one still waiting. Frames are handed to the transport a short window ahead
   * with a timestamp each (Web MIDI sends them on time itself), so the pacing survives a page
   * whose timers are throttled; what is beyond the window waits here, where it can still be replaced.
   */
  send (bytes, key) {
    if (!this.transport || !this.transport.send) return false
    if (key !== undefined) this._queue = this._queue.filter(q => q.key !== key)
    for (const f of frames(bytes)) this._queue.push({ bytes: f, key })
    this._drain()
    return true
  }

  _now () { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now() }

  _drain () {
    const pace = this.pace
    if (!pace) {
      while (this._queue.length) this._put(this._queue.shift().bytes)
      return
    }
    const now = this._now()
    if (!(this._nextAt > now)) this._nextAt = now
    const horizon = now + Math.max(pace * 4, 100)
    while (this._queue.length && this._nextAt <= horizon) {
      this._put(this._queue.shift().bytes, this._nextAt)
      this._nextAt += pace
    }
    if (this._queue.length && !this._timer) {
      this._timer = setTimeout(() => { this._timer = null; this._drain() }, Math.max(1, Math.round((horizon - now) / 2)))
    }
  }

  _put (bytes, at) {
    try { this.transport.send(bytes, at) } catch (e) { /* port went away, or sysex without permission */ }
  }

  /** Send everything waiting now, unpaced (before a release, on close). */
  flush () {
    if (this._timer) { clearTimeout(this._timer); this._timer = null }
    while (this._queue.length) this._put(this._queue.shift().bytes)
  }

  /** Echo a control's 0..1 position to the device (a display, a ring, a written encoder value). */
  sendFeedback (channel, number, pos) {
    if (!this.opts.feedback || !this.transport || !this.transport.send) return
    const fb = this.profile.feedback || {}
    if (fb.value === false) return
    const shown = Math.min(Math.max(pos, 0), 1)   // an open control's position can leave 0..1: pin at the end
    const at = { number, channel, ...this._where(number, channel) }
    const bytes = fb.value ? fb.value(at, shown, this) : [0xB0 | ((channel || 1) - 1), number & 0x7f, Math.round(shown * 127) & 0x7f]
    if (bytes) this.send(bytes, `value:${channel}:${number}`)
  }

  _where (number, channel) {
    const w = this.profile.locate ? this.profile.locate(number, channel) : null
    return w ? { group: w[0], n: w[1] } : {}
  }

  /** LED colour of a control, a palette index (devices with RGB LEDs). */
  colour (id, index) {
    const fb = this.profile.feedback || {}
    if (!fb.colour) return false
    const at = this.at(id)
    this._colours.set(`${at.channel}:${at.number}`, index | 0)
    return this.send(fb.colour(at, index | 0, this), `colour:${at.channel}:${at.number}`)
  }

  /** A button lamp, 0..1 (off, dim, bright as the device allows), in the colour the button was given. */
  lamp (id, level = 1) {
    const fb = this.profile.feedback || {}
    if (!fb.lamp) return false
    const at = this.at(id)
    at.colour = this._colours.get(`${at.channel}:${at.number}`)
    const lv = Math.min(Math.max(+level || 0, 0), 1)
    this._lamps.set(`${at.channel}:${at.number}`, { id, level: lv })
    return this.send(fb.lamp(at, lv, this), `lamp:${at.channel}:${at.number}`)
  }

  /** A control's own display page: lines of text (devices with a per-control display). */
  text (id, lines, opts = {}) {
    const fb = this.profile.feedback || {}
    if (!fb.text) return false
    const at = this.at(id)
    return this.send(fb.text(at, [].concat(lines), opts, this), `text:${at.channel}:${at.number}`)
  }

  /** The device's static display (the feedback hook is still called `page`). */
  screen (lines, opts = {}) {
    const fb = this.profile.feedback || {}
    if (!fb.page) return false
    return this.send(fb.page([].concat(lines), opts, this), 'page')
  }

  /** Resend every control value (and colour) to the device. */
  refresh () {
    for (const p of this.state.positions()) this.sendFeedback(p.channel, p.number, p.pos)
    for (const [, rec] of this.state.controls) {
      if (rec.config.colour !== undefined) this.colour(rec.number, rec.config.colour)
      if (rec.config.label !== undefined) this.text(rec.number, [rec.config.label], { show: false })
    }
    for (const { id, level } of this._lamps.values()) this.lamp(id, level)
  }

  // ---- transport

  onLabels (fn) { this._labelListeners.add(fn); return () => this._labelListeners.delete(fn) }
  onTransport (fn) { this._transportListeners.add(fn); return () => this._transportListeners.delete(fn) }

  /** Called by an adapter once this device's ports are open (and again when they change). */
  attachTransport (transport) {
    this.transport = transport
    this.inputs = transport.inputs || []
    this.outputs = transport.outputs || []
    if (this.profile.connect) this.send(this.profile.connect(this))
    this.refresh()
    for (const fn of this._transportListeners) { try { fn(transport) } catch (e) { /* a listener's problem */ } }
    if (this.controller) this.controller._transportChanged(this)
  }

  /** Say goodbye to the device (DAW mode off, lamps as they were) without closing the ports. */
  release () {
    if (this.profile.release && this.transport) { this.send(this.profile.release(this)); this.flush() }
  }

  close () {
    this.release()
    if (this.transport && this.transport.close) { try { this.transport.close() } catch (e) { /* already gone */ } }
    this.transport = null
  }
}
