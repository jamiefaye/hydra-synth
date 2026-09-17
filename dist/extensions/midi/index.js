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
    defaults = Object.fromEntries(Object.entries(defaults || {}).filter(([, v]) => v !== void 0));
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
    const cfg = Object.assign({}, this.defaults, Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== void 0)));
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
const ec4 = {
  name: "Faderfox EC4",
  match: /faderfox|ec4/i,
  mode: "r2",
  channel: 1,
  groups: 16,
  encodersPerGroup: 16,
  encoder: (group, n) => ({ number: (group - 1) * 16 + (n - 1), channel: 1 }),
  push: (group, n) => ({ note: (group - 1) * 16 + (n - 1), channel: 1 }),
  names: {}
};
const generic = {
  name: "Generic CC controller",
  match: null,
  mode: "abs",
  channel: null,
  encoder: (group, n) => ({ number: n, channel: null }),
  push: (group, n) => ({ note: n, channel: null }),
  names: {}
};
const profiles = { ec4, generic };
function resolveControl(profile, id) {
  if (typeof id === "number") return { number: id, channel: profile ? profile.channel : null };
  if (Array.isArray(id) && id.length === 2) {
    if (!profile || !profile.encoder) throw new Error(`midi: [group, encoder] ids need a profile (use(profile))`);
    return profile.encoder(id[0], id[1]);
  }
  if (typeof id === "string") {
    if (!profile || !profile.names || !(id in profile.names)) throw new Error(`midi: unknown control name "${id}"`);
    return resolveControl(profile, profile.names[id]);
  }
  throw new Error(`midi: bad control id ${JSON.stringify(id)}`);
}
function resolvePush(profile, id) {
  if (typeof id === "number") return { note: id, channel: profile ? profile.channel : null };
  if (Array.isArray(id) && id.length === 2) {
    if (!profile || !profile.push) throw new Error(`midi: [group, encoder] ids need a profile (use(profile))`);
    return profile.push(id[0], id[1]);
  }
  if (typeof id === "string") {
    if (!profile || !profile.names || !(id in profile.names)) throw new Error(`midi: unknown control name "${id}"`);
    return resolvePush(profile, profile.names[id]);
  }
  throw new Error(`midi: bad control id ${JSON.stringify(id)}`);
}
const defined$1 = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== void 0));
class Controller {
  constructor(options = {}) {
    this.opts = Object.assign({
      mode: "r2",
      channel: null,
      steps: 64,
      log: false,
      feedback: true,
      profile: null
    }, defined$1(options));
    this.state = new MidiState({ mode: this.opts.mode, channel: this.opts.channel, steps: this.opts.steps });
    this.profile = null;
    this.transport = null;
    this.inputs = [];
    this.outputs = [];
    this.ready = Promise.resolve(this);
    this.onInputsChanged = null;
    this._logging = !!this.opts.log;
    this._unlisten = this.state.onEvent((ev) => {
      if (this._logging) console.log("[midi]", describeEvent(ev));
      if (this.opts.feedback && ev.registered && ev.pos !== void 0 && (ev.type === "cc" || ev.type === "set")) {
        this.sendFeedback(ev.channel, ev.number, ev.pos);
      }
    });
    if (this.opts.profile) this.use(this.opts.profile);
  }
  /** Adopt a device profile: defaults for mode/channel plus name and [group, n] addressing. */
  use(profile, extra = {}) {
    this.profile = Object.assign({}, profile, extra, { names: Object.assign({}, profile.names || {}, extra.names || {}) });
    if (this.profile.mode) this.state.defaults.mode = this.profile.mode;
    if (this.profile.channel !== void 0) this.state.defaults.channel = this.profile.channel;
    return this.profile;
  }
  /** Add or replace control names: names({ gain: [1, 1], rot: [1, 2] }) */
  names(map) {
    if (!this.profile) throw new Error("midi.names: call use(profile) first");
    Object.assign(this.profile.names, map);
    return this.profile.names;
  }
  /** cc(id, min, max, init) or cc(id, opts); id = number | [group, n] | 'name' */
  cc(id, a, b, c) {
    const { number, channel } = resolveControl(this.profile, id);
    const opts = typeof a === "object" && a !== null ? defined$1(a) : defined$1({ min: a, max: b, init: c });
    if (opts.channel === void 0 && channel != null) opts.channel = channel;
    return this.state.cc(number, opts);
  }
  /** note(id, opts); id = number | [group, n] | 'name' (the encoder's push) */
  note(id, opts = {}) {
    const { note, channel } = resolvePush(this.profile, id);
    const o = Object.assign({}, opts);
    if (o.channel === void 0 && channel != null) o.channel = channel;
    return this.state.note(note, o);
  }
  handleMessage(bytes) {
    return this.state.handleMessage(bytes);
  }
  snapshot() {
    return this.state.snapshot();
  }
  restore(snap) {
    return this.state.restore(snap);
  }
  onEvent(fn) {
    return this.state.onEvent(fn);
  }
  get last() {
    return this.state.lastEvent;
  }
  learn(on = true) {
    this._logging = !!on;
    console.log(`[midi] learn ${this._logging ? "on" : "off"}`);
    return this._logging;
  }
  /** Echo a control's 0..1 position to the device as the same CC (display feedback). */
  sendFeedback(channel, number, pos) {
    if (!this.opts.feedback || !this.transport || !this.transport.send) return;
    const msg = [176 | (channel || 1) - 1, number & 127, Math.round(pos * 127) & 127];
    try {
      this.transport.send(msg);
    } catch (e) {
    }
  }
  /** Resend every control value to the device display. */
  refresh() {
    for (const p of this.state.positions()) this.sendFeedback(p.channel, p.number, p.pos);
  }
  /** Called by an adapter once ports are open (and again when they change). */
  attachTransport(transport) {
    this.transport = transport;
    this.inputs = transport.inputs || [];
    this.outputs = transport.outputs || [];
    if (this.onInputsChanged) this.onInputsChanged(this.inputs);
    this.refresh();
  }
  close() {
    this._unlisten();
    if (this.transport && this.transport.close) this.transport.close();
    this.transport = null;
  }
}
const matcher = (filter) => (name) => {
  if (!filter) return true;
  if (filter instanceof RegExp) return filter.test(name);
  return name.toLowerCase().includes(String(filter).toLowerCase());
};
const defined = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== void 0));
async function connectWebMidi(controller, options = {}) {
  const opts = Object.assign({
    inputFilter: null,
    // Feedback only to the profiled device by default. Sending to everything would reach
    // loopback ports such as the IAC bus, and the echo would feed back into the controller.
    outputFilter: controller.profile && controller.profile.match || null,
    sysex: false,
    log: true
  }, defined(options));
  if (opts.outputFilter === null && controller.opts.feedback) {
    console.warn("[midi] feedback with no outputFilter: sending to every output, including loopbacks");
  }
  if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) {
    console.warn("[midi] Web MIDI is not available here; controls keep their initial values");
    return controller;
  }
  let access;
  try {
    access = await navigator.requestMIDIAccess({ sysex: opts.sysex });
  } catch (e) {
    console.warn("[midi] MIDI access refused:", e.message);
    return controller;
  }
  const matchIn = matcher(opts.inputFilter);
  const matchOut = matcher(opts.outputFilter);
  let inputs = [];
  let outputs = [];
  let lastKey = null;
  const attach = () => {
    const foundIn = [...access.inputs.values()].filter((i) => matchIn(i.name));
    const foundOut = controller.opts.feedback ? [...access.outputs.values()].filter((o) => matchOut(o.name)) : [];
    const key2 = foundIn.map((i) => i.id).join("|") + "#" + foundOut.map((o) => o.id).join("|");
    if (key2 === lastKey) return;
    lastKey = key2;
    for (const input of inputs) input.onmidimessage = null;
    inputs = foundIn;
    outputs = foundOut;
    for (const input of inputs) input.onmidimessage = (msg) => controller.handleMessage(msg.data);
    const transport = {
      name: "web-midi",
      access,
      inputs: inputs.map((i) => i.name),
      outputs: outputs.map((o) => o.name),
      send: (bytes) => {
        for (const o of outputs) o.send(bytes);
      },
      close: () => {
        for (const input of inputs) input.onmidimessage = null;
        access.onstatechange = null;
      }
    };
    if (opts.log) {
      console.log(`[midi] listening on: ${transport.inputs.join(", ") || "(no inputs)"}` + (controller.opts.feedback ? `; feedback to: ${transport.outputs.join(", ") || "(no outputs)"}` : ""));
    }
    controller.attachTransport(transport);
  };
  attach();
  access.onstatechange = attach;
  return controller;
}
function connectVirtual(controller, { name = "virtual" } = {}) {
  const transport = {
    name,
    inputs: [name],
    outputs: [name],
    sent: [],
    send: (bytes) => {
      transport.sent.push(Array.from(bytes));
    },
    close: () => {
    }
  };
  controller.attachTransport(transport);
  return transport;
}
const VERSION = "0.2.0";
let _midi = null;
async function install(hydra = null, options = {}) {
  if (_midi) return _midi;
  const opts = Object.assign({ profile: ec4, makeGlobal: true }, options);
  const midi = new Controller({
    mode: opts.mode,
    channel: opts.channel,
    steps: opts.steps,
    feedback: opts.feedback,
    log: opts.log,
    profile: opts.profile
  });
  midi.handleMessageRaw = midi.handleMessage.bind(midi);
  midi.uninstall = () => {
    midi.close();
    if (typeof window !== "undefined" && window.midi === midi) delete window.midi;
    _midi = null;
  };
  const _hydra = hydra || (typeof window !== "undefined" ? window.hydraSynth : null);
  if (_hydra && _hydra.synth) _hydra.synth.midi = midi;
  if (opts.makeGlobal && typeof window !== "undefined") window.midi = midi;
  midi.ready = connectWebMidi(midi, { inputFilter: opts.inputFilter, outputFilter: opts.outputFilter });
  _midi = midi;
  return midi;
}
function uninstall() {
  if (_midi) _midi.uninstall();
}
export {
  CURVES,
  Controller,
  MODES,
  MidiState,
  VERSION,
  connectVirtual,
  connectWebMidi,
  describeEvent,
  ec4,
  generic,
  install,
  profiles,
  uninstall
};
//# sourceMappingURL=index.js.map
