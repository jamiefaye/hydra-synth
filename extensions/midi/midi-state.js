/**
 * MIDI control state for Hydra, written for the Faderfox EC4 but generic.
 *
 * Pure logic, no Web MIDI here: feed it raw messages with handleMessage() and
 * read control values back through the functions returned by cc() / note().
 * That keeps it testable in node.
 *
 * Encoder modes (names follow the EC4 editor):
 *   'r1'    relative, EC4 "CCr1": 127 = +1 step, 1 = -1 step (126 = +2, 2 = -2 with acceleration)
 *   'r2'    relative, EC4 "CCr2": 65 = +1 step, 63 = -1 step (66 = +2, 62 = -2 ...)
 *   'abs'   absolute 7 bit, 0..127 maps to min..max
 *   'abs14' absolute 14 bit, EC4 "CCah": MSB on cc n, LSB on cc n + 32, 0..16383 maps to min..max
 *
 * With relative modes the value lives here, not on the device, so a knob moves a
 * parameter by how far it turned and never jumps. That is what makes it safe to
 * hand the controller to someone else mid-performance.
 */

export const MODES = ['r1', 'r2', 'abs', 'abs14']

export function decodeRelative (mode, v) {
  if (mode === 'r1') return v === 0 ? 0 : (v < 64 ? -v : 128 - v)
  if (mode === 'r2') return v - 64
  return 0
}

const clamp = (x, a, b) => Math.min(Math.max(x, a), b)

function key (channel, number) {
  return `${channel == null ? '*' : channel}:${number}`
}

export class MidiState {
  constructor (defaults = {}) {
    this.defaults = Object.assign({
      mode: 'r2',      // encoder mode, see above
      channel: null,   // null = accept any channel
      steps: 64,       // relative: detents from min to max (EC4 is 36 pulses per turn)
      min: 0,
      max: 1
    }, defaults)
    this.controls = new Map()   // key -> control record
    this.notes = new Map()      // key -> {value, velocity}
    this.listeners = new Set()  // (event) => void, for monitors / learn
    this.pending14 = new Map()  // key -> msb awaiting lsb
    this.lastEvent = null
  }

  /**
   * Register a continuous control and get a function returning its value.
   * cc(number, min, max, init) or cc(number, {min, max, init, mode, channel, steps, curve})
   * The returned function also has .value, .set(v), .reset(), .config
   */
  cc (number, a, b, c) {
    const opts = (typeof a === 'object' && a !== null) ? a : { min: a, max: b, init: c }
    const cfg = Object.assign({}, this.defaults, opts)
    if (cfg.min === undefined) cfg.min = this.defaults.min
    if (cfg.max === undefined) cfg.max = this.defaults.max
    if (cfg.init === undefined || cfg.init === null) cfg.init = cfg.min
    if (!MODES.includes(cfg.mode)) throw new Error(`midi.cc: unknown mode "${cfg.mode}", use one of ${MODES.join(', ')}`)
    const k = key(cfg.channel, number)
    let rec = this.controls.get(k)
    if (!rec) {
      rec = { number, config: cfg, value: clamp(cfg.init, Math.min(cfg.min, cfg.max), Math.max(cfg.min, cfg.max)) }
      this.controls.set(k, rec)
    } else {
      // Re-registering (sketch re-eval): keep the live value, adopt new range if it changed
      const rangeChanged = rec.config.min !== cfg.min || rec.config.max !== cfg.max
      rec.config = cfg
      if (rangeChanged) rec.value = clamp(rec.value, Math.min(cfg.min, cfg.max), Math.max(cfg.min, cfg.max))
    }
    const fn = () => rec.value
    fn.value = () => rec.value
    fn.set = (v) => { rec.value = clamp(v, Math.min(cfg.min, cfg.max), Math.max(cfg.min, cfg.max)); return rec.value }
    fn.reset = () => fn.set(cfg.init)
    fn.config = cfg
    fn.number = number
    Object.defineProperty(fn, 'v', { get: () => rec.value })
    return fn
  }

  /**
   * Register a note (encoder push or button). Returns a function giving 1 while held
   * (or velocity / 127 if {velocity: true}), or toggling 0/1 on each press if {toggle: true}.
   */
  note (number, opts = {}) {
    const cfg = Object.assign({ channel: this.defaults.channel, toggle: false, velocity: false }, opts)
    const k = key(cfg.channel, number)
    let rec = this.notes.get(k)
    if (!rec) {
      rec = { number, config: cfg, held: 0, velocity: 0, toggled: 0 }
      this.notes.set(k, rec)
    } else {
      rec.config = cfg
    }
    const fn = () => cfg.toggle ? rec.toggled : (cfg.velocity ? rec.velocity / 127 : rec.held)
    fn.set = (v) => { rec.toggled = v ? 1 : 0; rec.held = v ? 1 : 0; return v }
    fn.config = cfg
    return fn
  }

  /** Snapshot of every registered control value, keyed "channel:number". */
  snapshot () {
    const out = {}
    for (const [k, rec] of this.controls) out[k] = rec.value
    return out
  }

  restore (snap) {
    for (const [k, v] of Object.entries(snap || {})) {
      const rec = this.controls.get(k)
      if (rec) rec.value = v
    }
  }

  onEvent (fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) }

  _emit (ev) {
    this.lastEvent = ev
    for (const fn of this.listeners) fn(ev)
  }

  _find (map, channel, number) {
    return map.get(key(channel, number)) || map.get(key(null, number))
  }

  /**
   * Feed a raw MIDI message. Returns a description of what happened (for monitors),
   * or null if the message was ignored.
   */
  handleMessage (data) {
    if (!data || data.length < 2) return null
    const status = data[0] & 0xf0
    const channel = (data[0] & 0x0f) + 1
    const d1 = data[1]
    const d2 = data.length > 2 ? data[2] : 0

    if (status === 0xB0) return this._handleCC(channel, d1, d2)
    if (status === 0x90 && d2 > 0) return this._handleNote(channel, d1, d2, true)
    if (status === 0x80 || (status === 0x90 && d2 === 0)) return this._handleNote(channel, d1, d2, false)
    return null
  }

  _handleCC (channel, number, value) {
    // 14-bit LSB arrives on cc number + 32 (only meaningful for a registered abs14 control)
    if (number >= 32 && number < 64) {
      const msbRec = this._find(this.controls, channel, number - 32)
      if (msbRec && msbRec.config.mode === 'abs14') {
        const k = key(channel, number - 32)
        const msb = this.pending14.get(k)
        if (msb !== undefined) {
          this.pending14.delete(k)
          const raw = (msb << 7) | value
          return this._apply(msbRec, channel, raw, raw / 16383, 'abs14')
        }
      }
    }

    const rec = this._find(this.controls, channel, number)
    if (!rec) {
      const ev = { type: 'cc', channel, number, value, registered: false }
      this._emit(ev)
      return ev
    }
    const mode = rec.config.mode
    if (mode === 'abs14') {
      this.pending14.set(key(channel, number), value)
      // Also apply MSB alone so the control responds even if the LSB never comes
      return this._apply(rec, channel, value << 7, (value << 7) / 16383, 'abs14-msb')
    }
    if (mode === 'abs') return this._apply(rec, channel, value, value / 127, 'abs')

    const delta = decodeRelative(mode, value)
    const range = rec.config.max - rec.config.min
    const step = range / rec.config.steps
    const before = rec.value
    rec.value = clamp(rec.value + delta * step, Math.min(rec.config.min, rec.config.max), Math.max(rec.config.min, rec.config.max))
    const ev = { type: 'cc', channel, number, value, registered: true, mode, delta, before, after: rec.value }
    this._emit(ev)
    return ev
  }

  _apply (rec, channel, raw, norm, how) {
    const cfg = rec.config
    const before = rec.value
    rec.value = cfg.min + norm * (cfg.max - cfg.min)
    const ev = { type: 'cc', channel, number: rec.number, value: raw, registered: true, mode: how, before, after: rec.value }
    this._emit(ev)
    return ev
  }

  _handleNote (channel, number, velocity, on) {
    const rec = this._find(this.notes, channel, number)
    if (rec) {
      rec.held = on ? 1 : 0
      rec.velocity = on ? velocity : 0
      if (on) rec.toggled = rec.toggled ? 0 : 1
    }
    const ev = { type: on ? 'noteon' : 'noteoff', channel, number, value: velocity, registered: !!rec }
    this._emit(ev)
    return ev
  }
}

export function describeEvent (ev) {
  if (!ev) return ''
  const base = `ch ${ev.channel} ${ev.type} ${ev.number} = ${ev.value}`
  if (ev.type === 'cc' && ev.registered) {
    if (ev.delta !== undefined) return `${base}  (${ev.mode} ${ev.delta >= 0 ? '+' : ''}${ev.delta}) -> ${ev.after.toFixed(3)}`
    return `${base}  (${ev.mode}) -> ${ev.after.toFixed(3)}`
  }
  return ev.registered ? base : `${base}  (unassigned)`
}
