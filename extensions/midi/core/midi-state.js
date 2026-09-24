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
 * Every control keeps a normalised position 0..1 and derives its value through a
 * curve, so relative steps, absolute positions, display feedback and snapshots
 * all share one representation.
 *
 * With relative modes the value lives here, not on the device, so a knob moves a
 * parameter by how far it turned and never jumps. That is what makes it safe to
 * hand the controller to someone else mid-performance.
 *
 * Bounded controls (pots, faders: absolute modes) have a position of their own that the
 * host cannot move, so an absolute control takes a pickup mode:
 *   'jump'      the value is wherever the control stands (the default: a knob box)
 *   'soft'      the value waits until the control crosses it, then follows (position = value,
 *               nothing jumps; the event and positions() say whether it is caught yet)
 *   'distance'  the value moves by how far the control moved, scaled by pickupScale
 *               (lightherder's fader: never jumps, position means nothing, clamps at the ends)
 * Setting a value from outside (set, restore, init) lets go of a soft pickup again.
 */

export const MODES = ['r1', 'r2', 'abs', 'abs14']
export const CURVES = ['linear', 'log', 'exp']
export const PICKUPS = ['jump', 'soft', 'distance']

export function decodeRelative (mode, v) {
  if (mode === 'r1') return v === 0 ? 0 : (v < 64 ? -v : 128 - v)
  if (mode === 'r2') return v - 64
  return 0
}

const clamp01 = (x) => Math.min(Math.max(x, 0), 1)

// The rails: a position stays in 0..1 unless the control is open at that end
function rail (cfg, p) {
  if (cfg.open === true) return p
  if (cfg.open === 'up') return Math.max(p, 0)
  if (cfg.open === 'down') return Math.min(p, 1)
  return clamp01(p)
}

function key (channel, number) {
  return `${channel == null ? '*' : channel}:${number}`
}

// position 0..1 -> value, and back
function posToValue (cfg, p) {
  const { min, max, curve } = cfg
  if (curve === 'log') return min * Math.pow(max / min, p)
  if (curve === 'exp') return min + (max - min) * p * p
  return min + (max - min) * p
}

function valueToPos (cfg, v) {
  const { min, max, curve } = cfg
  if (max === min) return 0
  if (curve === 'log') return rail(cfg, Math.log(v / min) / Math.log(max / min))
  if (curve === 'exp') return rail(cfg, Math.sqrt(Math.max(0, (v - min) / (max - min))))
  return rail(cfg, (v - min) / (max - min))
}

export class MidiState {
  constructor (defaults = {}) {
    defaults = Object.fromEntries(Object.entries(defaults || {}).filter(([, v]) => v !== undefined))
    this.defaults = Object.assign({
      mode: 'r2',      // encoder mode, see above
      channel: null,   // null = accept any channel
      steps: 64,       // relative: detents from min to max (EC4 is 36 pulses per turn)
      min: 0,
      max: 1,
      curve: 'linear', // 'linear' | 'log' (min and max must be > 0) | 'exp'
      wrap: false,     // relative: wrap around instead of clamping (rotation)
      open: false,     // relative: no rails; min..max sets the detent size and the value keeps going past either end
                       //   ('up': past max only, 'down': past min only; log never reaches 0). Endless encoders only
      fine: 0,         // relative: divide the step by this while the encoder's push note is held (0 = off)
      snap: true,      // relative: detents land on the grid of steps (of steps * fine while fine), so ends and round values are reachable
      pickup: 'jump',  // absolute: 'jump' | 'soft' | 'distance', see above
      pickupScale: 1   // distance: value travel per full control travel
    }, defaults)
    this.controls = new Map()   // key -> control record
    this.notes = new Map()      // key -> registered note record
    this.held = new Set()       // keys of every note currently held, registered or not
    this.listeners = new Set()  // (event) => void, for monitors / learn / feedback
    this.pending14 = new Map()  // key -> msb awaiting lsb
    this.lastEvent = null
  }

  /**
   * Register a continuous control and get a function returning its value.
   * cc(number, min, max, init) or
   * cc(number, {min, max, init, mode, channel, steps, curve, wrap, fine, fineNote, snap})
   * The returned function also has .value, .set(v), .reset(), .config, .v
   */
  cc (number, a, b, c) {
    const opts = (typeof a === 'object' && a !== null) ? a : { min: a, max: b, init: c }
    const cfg = Object.assign({}, this.defaults, Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined)))
    if (cfg.min === undefined) cfg.min = this.defaults.min
    if (cfg.max === undefined) cfg.max = this.defaults.max
    if (cfg.init === undefined || cfg.init === null) cfg.init = cfg.min
    if (!MODES.includes(cfg.mode)) throw new Error(`midi.cc: unknown mode "${cfg.mode}", use one of ${MODES.join(', ')}`)
    if (!CURVES.includes(cfg.curve)) throw new Error(`midi.cc: unknown curve "${cfg.curve}", use one of ${CURVES.join(', ')}`)
    if (cfg.curve === 'log' && (cfg.min <= 0 || cfg.max <= 0)) throw new Error('midi.cc: log curve needs min and max > 0')
    if (!PICKUPS.includes(cfg.pickup)) throw new Error(`midi.cc: unknown pickup "${cfg.pickup}", use one of ${PICKUPS.join(', ')}`)
    if (cfg.fineNote === undefined) cfg.fineNote = number   // EC4 "Note" push sends the encoder's own number

    const k = key(cfg.channel, number)
    let rec = this.controls.get(k)
    if (!rec) {
      rec = { number, config: cfg, pos: valueToPos(cfg, cfg.init), lastChannel: cfg.channel || 1, aliases: [{ channel: cfg.channel, number }], phys: undefined, caught: cfg.pickup !== 'soft' }
      this.controls.set(k, rec)
    } else {
      // Re-registering (sketch re-eval): keep the live value, re-fit it into the new range/curve
      const value = posToValue(rec.config, rec.pos)
      rec.config = cfg
      rec.pos = valueToPos(cfg, value)
      if (cfg.pickup !== 'soft') rec.caught = true
    }
    return this._fnFor(rec, number)
  }

  _fnFor (rec, number) {
    const get = () => posToValue(rec.config, rec.pos)
    const fn = () => get()
    fn.value = get
    fn.set = (v) => { rec.pos = valueToPos(rec.config, v); this._letGo(rec); this._emitSet(rec); return get() }
    fn.reset = () => fn.set(rec.config.init)
    fn.number = number
    Object.defineProperty(fn, 'config', { get: () => rec.config })
    Object.defineProperty(fn, 'v', { get })
    Object.defineProperty(fn, 'pos', { get: () => rec.pos })
    Object.defineProperty(fn, 'caught', { get: () => rec.caught })
    Object.defineProperty(fn, 'phys', { get: () => rec.phys })
    Object.defineProperty(fn, 'aliases', { get: () => rec.aliases.slice() })
    return fn
  }

  /**
   * Bind a second encoder to an existing control: one value, several positions on the
   * surface. Turning either moves it, both displays follow, a push on either is the fine
   * push. Returns the same kind of getter cc() returns.
   */
  alias (number, ofNumber, opts = {}) {
    const channel = opts.channel === undefined ? this.defaults.channel : opts.channel
    const rec = this._find(this.controls, channel, ofNumber)
    if (!rec) throw new Error(`midi.alias: no control on cc ${ofNumber} to alias`)
    const k = key(channel, number)
    const taken = this.controls.get(k)
    if (taken && taken !== rec) throw new Error(`midi.alias: cc ${number} already has a control of its own`)
    if (!taken) { this.controls.set(k, rec); rec.aliases.push({ channel, number }) }
    return this._fnFor(rec, number)
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
    for (const [k, rec] of this.controls) if (k === key(rec.aliases[0].channel, rec.number)) out[k] = posToValue(rec.config, rec.pos)
    return out
  }

  restore (snap) {
    for (const [k, v] of Object.entries(snap || {})) {
      const rec = this.controls.get(k)
      if (rec) { rec.pos = valueToPos(rec.config, v); this._letGo(rec); this._emitSet(rec) }
    }
  }

  // A value set from outside: a soft pickup has to catch it again
  _letGo (rec) { if (rec.config.pickup === 'soft') rec.caught = false }

  /** Every registered control as {channel, number, pos, value}, e.g. to refresh a device display. */
  positions () {
    const out = []
    for (const [k, rec] of this.controls) {
      if (k !== key(rec.aliases[0].channel, rec.number)) continue
      for (const a of rec.aliases) out.push({ channel: a.channel || rec.lastChannel, number: a.number, pos: rec.pos, value: posToValue(rec.config, rec.pos), caught: rec.caught, phys: rec.phys })
    }
    return out
  }

  onEvent (fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) }

  _emit (ev) {
    this.lastEvent = ev
    for (const fn of this.listeners) fn(ev)
  }

  _emitSet (rec) {
    this._emit({ type: 'set', channel: rec.lastChannel, number: rec.number, registered: true, pos: rec.pos, after: posToValue(rec.config, rec.pos), aliases: rec.aliases })
  }

  _find (map, channel, number) {
    return map.get(key(channel, number)) || map.get(key(null, number))
  }

  _isHeld (channel, number) {
    return this.held.has(key(channel, number))
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
          return this._applyPos(msbRec, channel, raw, raw / 16383, 'abs14')
        }
      }
    }

    const rec = this._find(this.controls, channel, number)
    if (!rec) {
      const ev = { type: 'cc', channel, number, value, registered: false }
      this._emit(ev)
      return ev
    }
    rec.lastChannel = channel
    const cfg = rec.config
    if (cfg.mode === 'abs14') {
      this.pending14.set(key(channel, number), value)
      // Also apply MSB alone so the control responds even if the LSB never comes
      return this._applyPos(rec, channel, value << 7, (value << 7) / 16383, 'abs14-msb')
    }
    if (cfg.mode === 'abs') return this._applyPos(rec, channel, value, value / 127, 'abs')

    let delta = decodeRelative(cfg.mode, value)
    const fine = cfg.fine && (this._isHeld(channel, cfg.fineNote) || rec.aliases.some(a => this._isHeld(channel, a.number)))
    const n = fine ? cfg.steps * cfg.fine : cfg.steps   // grid lines from min to max at this step size
    const before = posToValue(cfg, rec.pos)
    let p
    if (cfg.snap && delta !== 0) {
      // A value set from outside (init, a patch, a glide) sits between grid lines. The first detent
      // goes to the next line in the direction turned, never further than a detent, and the knob
      // stays on the grid from there: min, max and the round values between can be hit exactly.
      let x = rec.pos * n
      if (Math.abs(x - Math.round(x)) < 1e-6) x = Math.round(x)
      let k = (delta > 0 ? Math.floor(x) : Math.ceil(x)) + delta
      if (cfg.wrap) k = ((k % n) + n) % n
      p = rail(cfg, k / n)
    } else {
      p = rec.pos + delta / n
      if (cfg.wrap) p = p - Math.floor(p)
      else p = rail(cfg, p)
    }
    rec.pos = p
    const ev = { type: 'cc', channel, number, value, registered: true, mode: cfg.mode, delta, fine: !!fine, before, after: posToValue(cfg, rec.pos), pos: rec.pos, aliases: rec.aliases }
    this._emit(ev)
    return ev
  }

  _applyPos (rec, channel, raw, pos, how) {
    const cfg = rec.config
    const before = posToValue(cfg, rec.pos)
    pos = clamp01(pos)
    const prev = rec.phys
    rec.phys = pos
    if (cfg.pickup === 'soft' && !rec.caught) {
      // caught when the control lands on the value or crosses it (was on one side, is now on the other)
      const near = Math.abs(pos - rec.pos) < 1 / 127
      const crossed = prev !== undefined && (prev - rec.pos) * (pos - rec.pos) <= 0
      if (!near && !crossed) {
        const ev = { type: 'cc', channel, number: rec.number, value: raw, registered: true, mode: how, before, after: before, pos: rec.pos, phys: pos, caught: false, aliases: rec.aliases }
        this._emit(ev)
        return ev
      }
      rec.caught = true
    }
    if (cfg.pickup === 'distance') {
      // the first message only tells us where the control stands
      if (prev !== undefined) rec.pos = rail(cfg, rec.pos + (pos - prev) * cfg.pickupScale)
    } else {
      rec.pos = pos
    }
    const ev = { type: 'cc', channel, number: rec.number, value: raw, registered: true, mode: how, before, after: posToValue(cfg, rec.pos), pos: rec.pos, phys: pos, caught: rec.caught, aliases: rec.aliases }
    this._emit(ev)
    return ev
  }

  _handleNote (channel, number, velocity, on) {
    const k = key(channel, number)
    if (on) this.held.add(k); else this.held.delete(k)
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
  if (ev.type === 'set') return `set ch ${ev.channel} cc ${ev.number} -> ${ev.after.toFixed(3)}`
  const base = `ch ${ev.channel} ${ev.type} ${ev.number} = ${ev.value}`
  if (ev.type === 'cc' && ev.registered) {
    if (ev.delta !== undefined) return `${base}  (${ev.mode} ${ev.delta >= 0 ? '+' : ''}${ev.delta}${ev.fine ? ' fine' : ''}) -> ${ev.after.toFixed(3)}`
    return `${base}  (${ev.mode}) -> ${ev.after.toFixed(3)}`
  }
  return ev.registered ? base : `${base}  (unassigned)`
}
