(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.HydraMidiExtension = {}));
})(this, (function(exports2) {
  "use strict";
  const MODES = ["r1", "r2", "abs", "abs14"];
  const CURVES = ["linear", "log", "exp"];
  function decodeRelative(mode, v) {
    if (mode === "r1") return v === 0 ? 0 : v < 64 ? -v : 128 - v;
    if (mode === "r2") return v - 64;
    return 0;
  }
  const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
  function key(channel, number) {
    return `${channel == null ? "*" : channel}:${number}`;
  }
  function posToValue(cfg, p) {
    const { min, max, curve } = cfg;
    if (curve === "log") return min * Math.pow(max / min, p);
    if (curve === "exp") return min + (max - min) * p * p;
    return min + (max - min) * p;
  }
  function valueToPos(cfg, v) {
    const { min, max, curve } = cfg;
    if (max === min) return 0;
    if (curve === "log") return clamp01(Math.log(v / min) / Math.log(max / min));
    if (curve === "exp") return clamp01(Math.sqrt((v - min) / (max - min)));
    return clamp01((v - min) / (max - min));
  }
  class MidiState {
    constructor(defaults = {}) {
      this.defaults = Object.assign({
        mode: "r2",
        // encoder mode, see above
        channel: null,
        // null = accept any channel
        steps: 64,
        // relative: detents from min to max (EC4 is 36 pulses per turn)
        min: 0,
        max: 1,
        curve: "linear",
        // 'linear' | 'log' (min and max must be > 0) | 'exp'
        wrap: false,
        // relative: wrap around instead of clamping (rotation)
        fine: 0
        // relative: divide the step by this while the encoder's push note is held (0 = off)
      }, defaults);
      this.controls = /* @__PURE__ */ new Map();
      this.notes = /* @__PURE__ */ new Map();
      this.held = /* @__PURE__ */ new Set();
      this.listeners = /* @__PURE__ */ new Set();
      this.pending14 = /* @__PURE__ */ new Map();
      this.lastEvent = null;
    }
    /**
     * Register a continuous control and get a function returning its value.
     * cc(number, min, max, init) or
     * cc(number, {min, max, init, mode, channel, steps, curve, wrap, fine, fineNote})
     * The returned function also has .value, .set(v), .reset(), .config, .v
     */
    cc(number, a, b, c) {
      const opts = typeof a === "object" && a !== null ? a : { min: a, max: b, init: c };
      const cfg = Object.assign({}, this.defaults, opts);
      if (cfg.min === void 0) cfg.min = this.defaults.min;
      if (cfg.max === void 0) cfg.max = this.defaults.max;
      if (cfg.init === void 0 || cfg.init === null) cfg.init = cfg.min;
      if (!MODES.includes(cfg.mode)) throw new Error(`midi.cc: unknown mode "${cfg.mode}", use one of ${MODES.join(", ")}`);
      if (!CURVES.includes(cfg.curve)) throw new Error(`midi.cc: unknown curve "${cfg.curve}", use one of ${CURVES.join(", ")}`);
      if (cfg.curve === "log" && (cfg.min <= 0 || cfg.max <= 0)) throw new Error("midi.cc: log curve needs min and max > 0");
      if (cfg.fineNote === void 0) cfg.fineNote = number;
      const k = key(cfg.channel, number);
      let rec = this.controls.get(k);
      if (!rec) {
        rec = { number, config: cfg, pos: valueToPos(cfg, cfg.init), lastChannel: cfg.channel || 1 };
        this.controls.set(k, rec);
      } else {
        const value = posToValue(rec.config, rec.pos);
        rec.config = cfg;
        rec.pos = valueToPos(cfg, value);
      }
      const get = () => posToValue(rec.config, rec.pos);
      const fn = () => get();
      fn.value = get;
      fn.set = (v) => {
        rec.pos = valueToPos(rec.config, v);
        this._emitSet(rec);
        return get();
      };
      fn.reset = () => fn.set(cfg.init);
      fn.config = cfg;
      fn.number = number;
      Object.defineProperty(fn, "v", { get });
      Object.defineProperty(fn, "pos", { get: () => rec.pos });
      return fn;
    }
    /**
     * Register a note (encoder push or button). Returns a function giving 1 while held
     * (or velocity / 127 if {velocity: true}), or toggling 0/1 on each press if {toggle: true}.
     */
    note(number, opts = {}) {
      const cfg = Object.assign({ channel: this.defaults.channel, toggle: false, velocity: false }, opts);
      const k = key(cfg.channel, number);
      let rec = this.notes.get(k);
      if (!rec) {
        rec = { number, config: cfg, held: 0, velocity: 0, toggled: 0 };
        this.notes.set(k, rec);
      } else {
        rec.config = cfg;
      }
      const fn = () => cfg.toggle ? rec.toggled : cfg.velocity ? rec.velocity / 127 : rec.held;
      fn.set = (v) => {
        rec.toggled = v ? 1 : 0;
        rec.held = v ? 1 : 0;
        return v;
      };
      fn.config = cfg;
      return fn;
    }
    /** Snapshot of every registered control value, keyed "channel:number". */
    snapshot() {
      const out = {};
      for (const [k, rec] of this.controls) out[k] = posToValue(rec.config, rec.pos);
      return out;
    }
    restore(snap) {
      for (const [k, v] of Object.entries(snap || {})) {
        const rec = this.controls.get(k);
        if (rec) {
          rec.pos = valueToPos(rec.config, v);
          this._emitSet(rec);
        }
      }
    }
    /** Every registered control as {channel, number, pos, value}, e.g. to refresh a device display. */
    positions() {
      const out = [];
      for (const rec of this.controls.values()) {
        out.push({ channel: rec.lastChannel, number: rec.number, pos: rec.pos, value: posToValue(rec.config, rec.pos) });
      }
      return out;
    }
    onEvent(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }
    _emit(ev) {
      this.lastEvent = ev;
      for (const fn of this.listeners) fn(ev);
    }
    _emitSet(rec) {
      this._emit({ type: "set", channel: rec.lastChannel, number: rec.number, registered: true, pos: rec.pos, after: posToValue(rec.config, rec.pos) });
    }
    _find(map, channel, number) {
      return map.get(key(channel, number)) || map.get(key(null, number));
    }
    _isHeld(channel, number) {
      return this.held.has(key(channel, number));
    }
    /**
     * Feed a raw MIDI message. Returns a description of what happened (for monitors),
     * or null if the message was ignored.
     */
    handleMessage(data) {
      if (!data || data.length < 2) return null;
      const status = data[0] & 240;
      const channel = (data[0] & 15) + 1;
      const d1 = data[1];
      const d2 = data.length > 2 ? data[2] : 0;
      if (status === 176) return this._handleCC(channel, d1, d2);
      if (status === 144 && d2 > 0) return this._handleNote(channel, d1, d2, true);
      if (status === 128 || status === 144 && d2 === 0) return this._handleNote(channel, d1, d2, false);
      return null;
    }
    _handleCC(channel, number, value) {
      if (number >= 32 && number < 64) {
        const msbRec = this._find(this.controls, channel, number - 32);
        if (msbRec && msbRec.config.mode === "abs14") {
          const k = key(channel, number - 32);
          const msb = this.pending14.get(k);
          if (msb !== void 0) {
            this.pending14.delete(k);
            const raw = msb << 7 | value;
            return this._applyPos(msbRec, channel, raw, raw / 16383, "abs14");
          }
        }
      }
      const rec = this._find(this.controls, channel, number);
      if (!rec) {
        const ev2 = { type: "cc", channel, number, value, registered: false };
        this._emit(ev2);
        return ev2;
      }
      rec.lastChannel = channel;
      const cfg = rec.config;
      if (cfg.mode === "abs14") {
        this.pending14.set(key(channel, number), value);
        return this._applyPos(rec, channel, value << 7, (value << 7) / 16383, "abs14-msb");
      }
      if (cfg.mode === "abs") return this._applyPos(rec, channel, value, value / 127, "abs");
      let delta = decodeRelative(cfg.mode, value);
      const fine = cfg.fine && this._isHeld(channel, cfg.fineNote);
      let step = 1 / cfg.steps;
      if (fine) step /= cfg.fine;
      const before = posToValue(cfg, rec.pos);
      let p = rec.pos + delta * step;
      if (cfg.wrap) p = p - Math.floor(p);
      else p = clamp01(p);
      rec.pos = p;
      const ev = { type: "cc", channel, number, value, registered: true, mode: cfg.mode, delta, fine: !!fine, before, after: posToValue(cfg, rec.pos), pos: rec.pos };
      this._emit(ev);
      return ev;
    }
    _applyPos(rec, channel, raw, pos, how) {
      const cfg = rec.config;
      const before = posToValue(cfg, rec.pos);
      rec.pos = clamp01(pos);
      const ev = { type: "cc", channel, number: rec.number, value: raw, registered: true, mode: how, before, after: posToValue(cfg, rec.pos), pos: rec.pos };
      this._emit(ev);
      return ev;
    }
    _handleNote(channel, number, velocity, on) {
      const k = key(channel, number);
      if (on) this.held.add(k);
      else this.held.delete(k);
      const rec = this._find(this.notes, channel, number);
      if (rec) {
        rec.held = on ? 1 : 0;
        rec.velocity = on ? velocity : 0;
        if (on) rec.toggled = rec.toggled ? 0 : 1;
      }
      const ev = { type: on ? "noteon" : "noteoff", channel, number, value: velocity, registered: !!rec };
      this._emit(ev);
      return ev;
    }
  }
  function describeEvent(ev) {
    if (!ev) return "";
    if (ev.type === "set") return `set ch ${ev.channel} cc ${ev.number} -> ${ev.after.toFixed(3)}`;
    const base = `ch ${ev.channel} ${ev.type} ${ev.number} = ${ev.value}`;
    if (ev.type === "cc" && ev.registered) {
      if (ev.delta !== void 0) return `${base}  (${ev.mode} ${ev.delta >= 0 ? "+" : ""}${ev.delta}${ev.fine ? " fine" : ""}) -> ${ev.after.toFixed(3)}`;
      return `${base}  (${ev.mode}) -> ${ev.after.toFixed(3)}`;
    }
    return ev.registered ? base : `${base}  (unassigned)`;
  }
  const VERSION = "0.1.0";
  let _midi = null;
  async function install(hydra = null, options = {}) {
    if (_midi) return _midi;
    const opts = Object.assign({
      mode: "r2",
      channel: null,
      steps: 64,
      log: false,
      makeGlobal: true,
      inputFilter: null,
      // string or RegExp matched against input names; null = all inputs
      feedback: true,
      // send values back to the controller display (relative encoders need this)
      outputFilter: /faderfox|ec4/i
      // which output(s) receive feedback; null = every output
    }, options);
    const state = new MidiState({ mode: opts.mode, channel: opts.channel, steps: opts.steps });
    let logging = !!opts.log;
    const unlog = state.onEvent((ev) => {
      if (logging) console.log("[midi]", describeEvent(ev));
    });
    const midi = {
      state,
      cc: (...args) => state.cc(...args),
      note: (...args) => state.note(...args),
      snapshot: () => state.snapshot(),
      restore: (s) => state.restore(s),
      refresh: () => {
        for (const p of state.positions()) sendFeedback(p.channel, p.number, p.pos);
      },
      outputs: [],
      _outputs: [],
      learn: (on = true) => {
        logging = !!on;
        console.log(`[midi] learn ${logging ? "on" : "off"}`);
        return logging;
      },
      get last() {
        return state.lastEvent;
      },
      inputs: [],
      access: null,
      handleMessage: (data) => state.handleMessage(data),
      ready: null,
      // promise resolved once Web MIDI access has been granted or refused
      onInputsChanged: null,
      // optional callback (names) when inputs connect or disconnect
      uninstall: () => {
        unlog();
        if (midi.access) midi.access.onstatechange = null;
        for (const input of midi._inputs) input.onmidimessage = null;
        midi._outputs = [];
        if (typeof window !== "undefined" && window.midi === midi) delete window.midi;
        _midi = null;
      },
      _inputs: []
    };
    const sendFeedback = (channel, number, pos) => {
      if (!opts.feedback || !midi._outputs.length) return;
      const msg = [176 | (channel || 1) - 1, number & 127, Math.round(pos * 127) & 127];
      for (const out of midi._outputs) {
        try {
          out.send(msg);
        } catch (e) {
        }
      }
    };
    midi.sendFeedback = sendFeedback;
    state.onEvent((ev) => {
      if (ev.registered && ev.pos !== void 0 && (ev.type === "cc" || ev.type === "set")) sendFeedback(ev.channel, ev.number, ev.pos);
    });
    const _hydra = hydra || (typeof window !== "undefined" ? window.hydraSynth : null);
    if (_hydra && _hydra.synth) _hydra.synth.midi = midi;
    if (opts.makeGlobal && typeof window !== "undefined") window.midi = midi;
    midi.ready = connect(midi, state, opts);
    _midi = midi;
    return midi;
  }
  async function connect(midi, state, opts) {
    if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) {
      console.warn("[midi] Web MIDI is not available in this browser; controls will keep their initial values");
      return midi;
    }
    try {
      midi.access = await navigator.requestMIDIAccess({ sysex: false });
    } catch (e) {
      console.warn("[midi] MIDI access refused:", e.message);
      return midi;
    }
    const matcher = (filter) => (name) => {
      if (!filter) return true;
      if (filter instanceof RegExp) return filter.test(name);
      return name.toLowerCase().includes(String(filter).toLowerCase());
    };
    const matches = matcher(opts.inputFilter);
    const matchesOut = matcher(opts.outputFilter);
    const attach = () => {
      const found = [...midi.access.inputs.values()].filter((i) => matches(i.name));
      const names = found.map((i) => i.name);
      if (names.join("|") === midi.inputs.join("|") && midi._inputs.length === found.length) return;
      for (const input of midi._inputs) input.onmidimessage = null;
      midi._inputs = found;
      midi.inputs = names;
      for (const input of found) input.onmidimessage = (msg) => state.handleMessage(msg.data);
      midi._outputs = opts.feedback ? [...midi.access.outputs.values()].filter((o) => matchesOut(o.name)) : [];
      midi.outputs = midi._outputs.map((o) => o.name);
      console.log(`[midi] v${VERSION} listening on: ${names.length ? names.join(", ") : "(no inputs)"}` + (opts.feedback ? `; feedback to: ${midi.outputs.length ? midi.outputs.join(", ") : "(no outputs)"}` : ""));
      if (midi.onInputsChanged) midi.onInputsChanged(midi.inputs);
      midi.refresh();
    };
    attach();
    midi.access.onstatechange = attach;
    return midi;
  }
  function uninstall() {
    if (_midi) _midi.uninstall();
  }
  exports2.MODES = MODES;
  exports2.MidiState = MidiState;
  exports2.VERSION = VERSION;
  exports2.describeEvent = describeEvent;
  exports2.install = install;
  exports2.uninstall = uninstall;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=index.umd.js.map
