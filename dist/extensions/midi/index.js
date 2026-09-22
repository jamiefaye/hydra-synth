const MODES$1 = ["r1", "r2", "abs", "abs14"];
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
      fine: 0,
      // relative: divide the step by this while the encoder's push note is held (0 = off)
      snap: true
      // relative: detents land on the grid of steps (of steps * fine while fine), so ends and round values are reachable
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
   * cc(number, {min, max, init, mode, channel, steps, curve, wrap, fine, fineNote, snap})
   * The returned function also has .value, .set(v), .reset(), .config, .v
   */
  cc(number, a, b, c) {
    const opts = typeof a === "object" && a !== null ? a : { min: a, max: b, init: c };
    const cfg = Object.assign({}, this.defaults, Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== void 0)));
    if (cfg.min === void 0) cfg.min = this.defaults.min;
    if (cfg.max === void 0) cfg.max = this.defaults.max;
    if (cfg.init === void 0 || cfg.init === null) cfg.init = cfg.min;
    if (!MODES$1.includes(cfg.mode)) throw new Error(`midi.cc: unknown mode "${cfg.mode}", use one of ${MODES$1.join(", ")}`);
    if (!CURVES.includes(cfg.curve)) throw new Error(`midi.cc: unknown curve "${cfg.curve}", use one of ${CURVES.join(", ")}`);
    if (cfg.curve === "log" && (cfg.min <= 0 || cfg.max <= 0)) throw new Error("midi.cc: log curve needs min and max > 0");
    if (cfg.fineNote === void 0) cfg.fineNote = number;
    const k = key(cfg.channel, number);
    let rec = this.controls.get(k);
    if (!rec) {
      rec = { number, config: cfg, pos: valueToPos(cfg, cfg.init), lastChannel: cfg.channel || 1, aliases: [{ channel: cfg.channel, number }] };
      this.controls.set(k, rec);
    } else {
      const value = posToValue(rec.config, rec.pos);
      rec.config = cfg;
      rec.pos = valueToPos(cfg, value);
    }
    return this._fnFor(rec, number);
  }
  _fnFor(rec, number) {
    const get = () => posToValue(rec.config, rec.pos);
    const fn = () => get();
    fn.value = get;
    fn.set = (v) => {
      rec.pos = valueToPos(rec.config, v);
      this._emitSet(rec);
      return get();
    };
    fn.reset = () => fn.set(rec.config.init);
    fn.number = number;
    Object.defineProperty(fn, "config", { get: () => rec.config });
    Object.defineProperty(fn, "v", { get });
    Object.defineProperty(fn, "pos", { get: () => rec.pos });
    Object.defineProperty(fn, "aliases", { get: () => rec.aliases.slice() });
    return fn;
  }
  /**
   * Bind a second encoder to an existing control: one value, several positions on the
   * surface. Turning either moves it, both displays follow, a push on either is the fine
   * push. Returns the same kind of getter cc() returns.
   */
  alias(number, ofNumber, opts = {}) {
    const channel = opts.channel === void 0 ? this.defaults.channel : opts.channel;
    const rec = this._find(this.controls, channel, ofNumber);
    if (!rec) throw new Error(`midi.alias: no control on cc ${ofNumber} to alias`);
    const k = key(channel, number);
    const taken = this.controls.get(k);
    if (taken && taken !== rec) throw new Error(`midi.alias: cc ${number} already has a control of its own`);
    if (!taken) {
      this.controls.set(k, rec);
      rec.aliases.push({ channel, number });
    }
    return this._fnFor(rec, number);
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
    for (const [k, rec] of this.controls) if (k === key(rec.aliases[0].channel, rec.number)) out[k] = posToValue(rec.config, rec.pos);
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
    for (const [k, rec] of this.controls) {
      if (k !== key(rec.aliases[0].channel, rec.number)) continue;
      for (const a of rec.aliases) out.push({ channel: a.channel || rec.lastChannel, number: a.number, pos: rec.pos, value: posToValue(rec.config, rec.pos) });
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
    this._emit({ type: "set", channel: rec.lastChannel, number: rec.number, registered: true, pos: rec.pos, after: posToValue(rec.config, rec.pos), aliases: rec.aliases });
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
    const fine = cfg.fine && (this._isHeld(channel, cfg.fineNote) || rec.aliases.some((a) => this._isHeld(channel, a.number)));
    const n = fine ? cfg.steps * cfg.fine : cfg.steps;
    const before = posToValue(cfg, rec.pos);
    let p;
    if (cfg.snap && delta !== 0) {
      let x = rec.pos * n;
      if (Math.abs(x - Math.round(x)) < 1e-6) x = Math.round(x);
      let k = (delta > 0 ? Math.floor(x) : Math.ceil(x)) + delta;
      if (cfg.wrap) k = (k % n + n) % n;
      p = clamp01(k / n);
    } else {
      p = rec.pos + delta / n;
      if (cfg.wrap) p = p - Math.floor(p);
      else p = clamp01(p);
    }
    rec.pos = p;
    const ev = { type: "cc", channel, number, value, registered: true, mode: cfg.mode, delta, fine: !!fine, before, after: posToValue(cfg, rec.pos), pos: rec.pos, aliases: rec.aliases };
    this._emit(ev);
    return ev;
  }
  _applyPos(rec, channel, raw, pos, how) {
    const cfg = rec.config;
    const before = posToValue(cfg, rec.pos);
    rec.pos = clamp01(pos);
    const ev = { type: "cc", channel, number: rec.number, value: raw, registered: true, mode: how, before, after: posToValue(cfg, rec.pos), pos: rec.pos, aliases: rec.aliases };
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
const byOffset = (channel) => ({
  encoder: (group, n) => ({ number: (group - 1) * 16 + (n - 1), channel }),
  push: (group, n) => ({ note: (group - 1) * 16 + (n - 1), channel }),
  locate: (number, ch) => number >= 0 && number < 128 && (ch == null || ch === channel) ? [Math.floor(number / 16) + 1, number % 16 + 1] : null
});
const ec4 = {
  name: "Faderfox EC4",
  match: /faderfox|ec4/i,
  mode: "r2",
  channel: 1,
  setup: 1,
  groups: 16,
  encodersPerGroup: 16,
  ...byOffset(1),
  names: {}
};
const parm = {
  name: "Faderfox EC4 PARM (setup 14)",
  match: /faderfox|ec4/i,
  mode: "r2",
  channel: 14,
  setup: 14,
  groups: 8,
  encodersPerGroup: 16,
  ...byOffset(14),
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
const profiles = { ec4, parm, generic };
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
    this._sysexListeners = /* @__PURE__ */ new Set();
    this._transportListeners = /* @__PURE__ */ new Set();
    this._labelListeners = /* @__PURE__ */ new Set();
    this._logging = !!this.opts.log;
    this._unlisten = this.state.onEvent((ev) => {
      if (this._logging) console.log("[midi]", describeEvent(ev));
      if (this.opts.feedback && ev.registered && ev.pos !== void 0 && (ev.type === "cc" || ev.type === "set")) {
        for (const a of ev.aliases || [{ channel: ev.channel, number: ev.number }]) this.sendFeedback(a.channel || ev.channel, a.number, ev.pos);
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
  /**
   * cc(id, min, max, init) or cc(id, opts); id = number | [group, n] | 'name'.
   * opts.label (up to 4 characters) names the encoder on a device display that can be
   * written live (EC4: midi.ec4.display); listeners from onLabels hear about it.
   */
  cc(id, a, b, c) {
    const { number, channel } = resolveControl(this.profile, id);
    const opts = typeof a === "object" && a !== null ? defined$1(a) : defined$1({ min: a, max: b, init: c });
    if (opts.channel === void 0 && channel != null) opts.channel = channel;
    const fn = this.state.cc(number, opts);
    if (opts.label !== void 0) for (const l of this._labelListeners) {
      try {
        l();
      } catch (e) {
      }
    }
    return fn;
  }
  /** alias(id, ofId): bind another encoder to an existing control (one value, two places). */
  alias(id, ofId) {
    const { number, channel } = resolveControl(this.profile, id);
    const of = resolveControl(this.profile, ofId);
    return this.state.alias(number, of.number, { channel: channel == null ? of.channel : channel });
  }
  /** note(id, opts); id = number | [group, n] | 'name' (the encoder's push) */
  note(id, opts = {}) {
    const { note, channel } = resolvePush(this.profile, id);
    const o = Object.assign({}, opts);
    if (o.channel === void 0 && channel != null) o.channel = channel;
    return this.state.note(note, o);
  }
  handleMessage(bytes) {
    if (bytes && bytes[0] === 240) return this.handleSysex(bytes);
    return this.state.handleMessage(bytes);
  }
  /** System exclusive messages go to onSysex listeners, not to the value model. */
  handleSysex(bytes) {
    for (const fn of this._sysexListeners) fn(bytes);
    return { type: "sysex", length: bytes.length };
  }
  onSysex(fn) {
    this._sysexListeners.add(fn);
    return () => this._sysexListeners.delete(fn);
  }
  /** Called after every attachTransport (ports opened or changed). */
  onTransport(fn) {
    this._transportListeners.add(fn);
    return () => this._transportListeners.delete(fn);
  }
  /** Called whenever a control is registered with a label. */
  onLabels(fn) {
    this._labelListeners.add(fn);
    return () => this._labelListeners.delete(fn);
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
    for (const fn of this._transportListeners) {
      try {
        fn(transport);
      } catch (e) {
      }
    }
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
    if (opts.sysex) {
      console.warn("[midi] no sysex access (" + e.message + "); carrying on without it");
      opts.sysex = false;
      try {
        access = await navigator.requestMIDIAccess({ sysex: false });
      } catch (e2) {
        access = null;
      }
    }
    if (!access) {
      console.warn("[midi] MIDI access refused:", e.message);
      return controller;
    }
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
      sysex: !!opts.sysex,
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
const MEMORY_OFFSET = 2816;
const MEMORY_SIZE = 62720;
const DEVICE_ID_EC4 = 11;
const PAGE = 64;
const ADDR = {
  key1: 2816 - MEMORY_OFFSET,
  // push mode(1) + push number(7), 16 bytes per group
  setupNames: 7104 - MEMORY_OFFSET,
  // 16 x 4 chars
  groupNames: 7168 - MEMORY_OFFSET,
  // 16 setups x 16 groups x 4 chars
  setupData: 8192 - MEMORY_OFFSET,
  // 192 bytes per group (see FIELD)
  key2: 57344 - MEMORY_OFFSET
  // push display/lower, link/upper, 32 bytes per group
};
const GROUP_BYTES = 192;
const KEY1_GROUP_BYTES = 16;
const KEY2_GROUP_BYTES = 32;
const FIELD = {
  typeChannel: 0,
  // type bits 4..7, channel-1 bits 0..3
  linkNumber: 16,
  // link bit 7, command number bits 0..6
  numberHigh: 32,
  // NRPN MSB
  lower: 48,
  upper: 64,
  modeScale: 80,
  // mode bits 4..7, display scale bits 0..3
  msbs: 96,
  // upper msb bits 4..7, lower msb bits 0..3 (14-bit ranges)
  pushTypeChannel: 112,
  names: 128
  // 16 x 4 chars
};
const TYPES = ["CCR1", "CCR2", "CCab", "PrgC", "CCAh", "PBnd", "AftT", "Note", "NRPN"];
const MODES = ["Div8", "Div4", "Div2", "Acc0", "Acc1", "Acc2", "Acc3", "LSp2", "LSp4", "LSp6"];
const SCALES = ["off", "127", "100", "1000", "+-63", "+-50", "+-500", "ONOF", "9999"];
const PUSH_TYPES = ["Off", "Note", "CC", "PrgC", "PBnd", "AftT", "Grp", "Set", "Acc0", "Acc3", "LSp6", "Min", "Max"];
const NAME_OK = /^[0-9A-Za-z .\/-]*$/;
function normalizeName(name) {
  const s = String(name ?? "").slice(0, 4);
  if (!NAME_OK.test(s)) throw new Error(`EC4 name "${name}": only 0-9 A-Z a-z space . / - allowed`);
  return s.padEnd(4, " ");
}
const enumIndex = (list, v, what) => {
  if (typeof v === "number") return v;
  const i = list.indexOf(v);
  if (i < 0) throw new Error(`EC4 ${what} "${v}": use one of ${list.join(", ")}`);
  return i;
};
class Ec4Image {
  /** @param {Uint8Array} [data] a MEMORY_SIZE image; empty (zeroed, blank names) when omitted */
  constructor(data = null) {
    this.data = data ? Uint8Array.from(data) : new Uint8Array(MEMORY_SIZE);
    if (this.data.length !== MEMORY_SIZE) throw new Error(`EC4 image must be ${MEMORY_SIZE} bytes, got ${this.data.length}`);
    this.version = null;
  }
  static blank() {
    const img = new Ec4Image();
    for (let s = 1; s <= 16; s++) {
      img.setSetupName(s, `SE${String(s).padStart(2, "0")}`);
      for (let g = 1; g <= 16; g++) {
        img.setGroupName(s, g, `GR${String(g).padStart(2, "0")}`);
        for (let e = 1; e <= 16; e++) {
          img.setEncoder(s, g, e, { type: "CCab", channel: 1, number: e - 1, lower: 0, upper: 127, mode: "Acc0", scale: "127", name: `EC${String(e).padStart(2, "0")}` });
        }
      }
    }
    return img;
  }
  _check(s, g, e) {
    if (s < 1 || s > 16) throw new Error(`EC4 setup ${s} out of range 1..16`);
    if (g !== void 0 && (g < 1 || g > 16)) throw new Error(`EC4 group ${g} out of range 1..16`);
    if (e !== void 0 && (e < 1 || e > 16)) throw new Error(`EC4 encoder ${e} out of range 1..16`);
  }
  _groupBase(s, g) {
    return ADDR.setupData + ((s - 1) * 16 + (g - 1)) * GROUP_BYTES;
  }
  _key1Base(s, g) {
    return ADDR.key1 + ((s - 1) * 16 + (g - 1)) * KEY1_GROUP_BYTES;
  }
  _key2Base(s, g) {
    return ADDR.key2 + ((s - 1) * 16 + (g - 1)) * KEY2_GROUP_BYTES;
  }
  _str(addr) {
    return String.fromCharCode(...this.data.subarray(addr, addr + 4));
  }
  _putStr(addr, name) {
    const n = normalizeName(name);
    for (let i = 0; i < 4; i++) this.data[addr + i] = n.charCodeAt(i);
  }
  getSetupName(s) {
    this._check(s);
    return this._str(ADDR.setupNames + (s - 1) * 4);
  }
  setSetupName(s, name) {
    this._check(s);
    this._putStr(ADDR.setupNames + (s - 1) * 4, name);
    return this;
  }
  getGroupName(s, g) {
    this._check(s, g);
    return this._str(ADDR.groupNames + (s - 1) * 64 + (g - 1) * 4);
  }
  setGroupName(s, g, name) {
    this._check(s, g);
    this._putStr(ADDR.groupNames + (s - 1) * 64 + (g - 1) * 4, name);
    return this;
  }
  getEncoderName(s, g, e) {
    this._check(s, g, e);
    return this._str(this._groupBase(s, g) + FIELD.names + (e - 1) * 4);
  }
  setEncoderName(s, g, e, name) {
    this._check(s, g, e);
    this._putStr(this._groupBase(s, g) + FIELD.names + (e - 1) * 4, name);
    return this;
  }
  /** All settings of one encoder, with enum names. */
  getEncoder(s, g, e) {
    this._check(s, g, e);
    const d = this.data, b = this._groupBase(s, g), i = e - 1;
    const k1 = this._key1Base(s, g), k2 = this._key2Base(s, g);
    return {
      type: TYPES[d[b + FIELD.typeChannel + i] >> 4] ?? d[b + FIELD.typeChannel + i] >> 4,
      channel: (d[b + FIELD.typeChannel + i] & 15) + 1,
      number: d[b + FIELD.linkNumber + i] & 127,
      link: !!(d[b + FIELD.linkNumber + i] & 128),
      numberHigh: d[b + FIELD.numberHigh + i],
      lower: d[b + FIELD.lower + i] + ((d[b + FIELD.msbs + i] & 15) << 8),
      upper: d[b + FIELD.upper + i] + (d[b + FIELD.msbs + i] >> 4 << 8),
      mode: MODES[d[b + FIELD.modeScale + i] >> 4] ?? d[b + FIELD.modeScale + i] >> 4,
      scale: SCALES[d[b + FIELD.modeScale + i] & 15] ?? d[b + FIELD.modeScale + i] & 15,
      name: this.getEncoderName(s, g, e),
      push: {
        type: PUSH_TYPES[d[b + FIELD.pushTypeChannel + i] >> 4] ?? d[b + FIELD.pushTypeChannel + i] >> 4,
        channel: (d[b + FIELD.pushTypeChannel + i] & 15) + 1,
        mode: d[k1 + i] >> 7,
        number: d[k1 + i] & 127,
        display: d[k2 + i] >> 7,
        lower: d[k2 + i] & 127,
        link: d[k2 + 16 + i] >> 7,
        upper: d[k2 + 16 + i] & 127
      }
    };
  }
  /** Set any subset of an encoder's settings; enum names or raw numbers accepted. */
  setEncoder(s, g, e, v = {}) {
    this._check(s, g, e);
    const d = this.data, b = this._groupBase(s, g), i = e - 1;
    const k1 = this._key1Base(s, g), k2 = this._key2Base(s, g);
    const setHi = (addr, hi) => {
      d[addr] = d[addr] & 15 | (hi & 15) << 4;
    };
    const setLo = (addr, lo) => {
      d[addr] = d[addr] & 240 | lo & 15;
    };
    if (v.type !== void 0) setHi(b + FIELD.typeChannel + i, enumIndex(TYPES, v.type, "type"));
    if (v.channel !== void 0) setLo(b + FIELD.typeChannel + i, v.channel - 1);
    if (v.number !== void 0) d[b + FIELD.linkNumber + i] = d[b + FIELD.linkNumber + i] & 128 | v.number & 127;
    if (v.link !== void 0) d[b + FIELD.linkNumber + i] = d[b + FIELD.linkNumber + i] & 127 | (v.link ? 128 : 0);
    if (v.numberHigh !== void 0) d[b + FIELD.numberHigh + i] = v.numberHigh & 255;
    if (v.lower !== void 0) {
      d[b + FIELD.lower + i] = v.lower & 255;
      setLo(b + FIELD.msbs + i, v.lower >> 8);
    }
    if (v.upper !== void 0) {
      d[b + FIELD.upper + i] = v.upper & 255;
      setHi(b + FIELD.msbs + i, v.upper >> 8);
    }
    if (v.mode !== void 0) setHi(b + FIELD.modeScale + i, enumIndex(MODES, v.mode, "mode"));
    if (v.scale !== void 0) setLo(b + FIELD.modeScale + i, enumIndex(SCALES, v.scale, "scale"));
    if (v.name !== void 0) this.setEncoderName(s, g, e, v.name);
    const p = v.push || {};
    if (p.type !== void 0) setHi(b + FIELD.pushTypeChannel + i, enumIndex(PUSH_TYPES, p.type, "push type"));
    if (p.channel !== void 0) setLo(b + FIELD.pushTypeChannel + i, p.channel - 1);
    if (p.mode !== void 0) d[k1 + i] = d[k1 + i] & 127 | (p.mode ? 128 : 0);
    if (p.number !== void 0) d[k1 + i] = d[k1 + i] & 128 | p.number & 127;
    if (p.display !== void 0) d[k2 + i] = d[k2 + i] & 127 | (p.display ? 128 : 0);
    if (p.lower !== void 0) d[k2 + i] = d[k2 + i] & 128 | p.lower & 127;
    if (p.link !== void 0) d[k2 + 16 + i] = d[k2 + 16 + i] & 127 | (p.link ? 128 : 0);
    if (p.upper !== void 0) d[k2 + 16 + i] = d[k2 + 16 + i] & 128 | p.upper & 127;
    return this;
  }
  /** Apply { [encoder]: name } or { [encoder]: {settings} } to one group. */
  labelGroup(s, g, map) {
    for (const [e, v] of Object.entries(map)) {
      if (typeof v === "string") this.setEncoderName(s, g, Number(e), v);
      else this.setEncoder(s, g, Number(e), v);
    }
    return this;
  }
  /** Human summary of one group. */
  describeGroup(s, g) {
    const lines = [`Setup ${s} "${this.getSetupName(s)}"  group ${g} "${this.getGroupName(s, g)}"`];
    for (let e = 1; e <= 16; e++) {
      const x = this.getEncoder(s, g, e);
      lines.push(`  ${String(e).padStart(2)} "${x.name}" ${x.type} ch${x.channel} #${x.number} ${x.mode} disp ${x.scale} ${x.lower}..${x.upper}  push ${x.push.type}`);
    }
    return lines.join("\n");
  }
}
const hilo = (v) => [32 | v >> 4 & 15, 16 | v & 15];
function encodeDump(image, { version = [2, 4] } = {}) {
  const data = image instanceof Ec4Image ? image.data : image;
  if (data.length !== MEMORY_SIZE) throw new Error(`EC4 image must be ${MEMORY_SIZE} bytes`);
  const out = [
    240,
    0,
    0,
    0,
    65,
    ...hilo(DEVICE_ID_EC4),
    // download start, device id
    66,
    ...hilo(3),
    // type: all setups
    67,
    ...hilo(version[0]),
    // app id high
    68,
    ...hilo(version[1])
  ];
  const pages = data.length / PAGE;
  for (let p = 0; p < pages; p++) {
    const pos = p * PAGE;
    const addr = pos + MEMORY_OFFSET;
    out.push(73, ...hilo(addr >> 8), 74, ...hilo(addr & 255));
    let crc = 0;
    for (let i = 0; i < PAGE; i++) {
      out.push(77, ...hilo(data[pos + i]));
      crc += data[pos + i];
    }
    crc &= 65535;
    out.push(75, ...hilo(crc >> 8), 76, ...hilo(crc & 255));
    for (let i = 0; i < 30; i++) out.push(0);
  }
  out.push(79, ...hilo(DEVICE_ID_EC4), 247);
  return Uint8Array.from(out);
}
function parseDump(bytes) {
  if (!bytes || bytes.length < 4 || bytes[0] !== 240) throw new Error("EC4 sysex: not a sysex dump");
  if (bytes[1] | bytes[2] | bytes[3]) throw new Error("EC4 sysex: wrong manufacturer id");
  const img = new Ec4Image();
  let ix = 4, version = 0, addr = 0, page = new Uint8Array(PAGE), pi = 0, crc = 0, done = false, pagesSeen = 0;
  while (!done) {
    while (ix < bytes.length && bytes[ix] === 0) ix++;
    if (ix > bytes.length - 3) throw new Error("EC4 sysex: data incomplete");
    const cmd = bytes[ix], val = (bytes[ix + 1] & 15) << 4 | bytes[ix + 2] & 15;
    ix += 3;
    switch (cmd) {
      case 65:
        if (val !== DEVICE_ID_EC4) throw new Error(`EC4 sysex: dump is for device id ${val}, not the EC4`);
        break;
      case 66:
        if (val !== 3) throw new Error(`EC4 sysex: download type ${val} (only "all setups" = 3 supported)`);
        break;
      case 67:
        version += val;
        break;
      case 68:
        version += val / 10;
        break;
      case 73:
        addr = val << 8;
        break;
      case 74:
        addr |= val;
        break;
      case 77:
        if (pi < PAGE) {
          page[pi++] = val;
          crc += val;
        }
        break;
      case 75:
        crc = crc & 65535;
        if (crc >> 8 !== val) throw new Error(`EC4 sysex: CRC high mismatch at page ${addr.toString(16)}`);
        break;
      case 76: {
        if ((crc & 255) !== val) throw new Error(`EC4 sysex: CRC low mismatch at page ${addr.toString(16)}`);
        const off = addr - MEMORY_OFFSET;
        if (off >= 0 && off + pi <= MEMORY_SIZE) img.data.set(page.subarray(0, pi), off);
        pagesSeen++;
        page = new Uint8Array(PAGE);
        pi = 0;
        crc = 0;
        break;
      }
      case 79:
        done = true;
        break;
      case 247:
        done = true;
        break;
    }
  }
  img.version = version;
  img.pages = pagesSeen;
  return img;
}
const EC4_HEAD = [240, 0, 0, 0, 78, 44, 27];
const NAME_WIDTH = 4;
const NAMES_PER_GROUP = 16;
const ROW_WIDTH = 20;
const ROWS = 4;
const BLANK_NAME = "----";
const nib = (v) => [32 | v >> 4 & 15, 16 | v & 15];
const chars = (text) => Array.from(text, (c) => [77, ...nib(c.charCodeAt(0))]).flat();
function fit(text, width) {
  const s = String(text ?? "").replace(/[^\x20-\x7e]/g, " ");
  return s.length >= width ? s.slice(0, width) : s.padEnd(width, " ");
}
function normalizeNames(names) {
  const out = Array(NAMES_PER_GROUP).fill(BLANK_NAME);
  const put = (i, n) => {
    if (i >= 0 && i < NAMES_PER_GROUP && n != null) out[i] = fit(n, NAME_WIDTH);
  };
  if (Array.isArray(names)) names.forEach((n, i) => put(i, n));
  else if (names && typeof names === "object") for (const [e, n] of Object.entries(names)) put(Number(e) - 1, n);
  return out;
}
function namesBytes(names) {
  return [...EC4_HEAD, 78, 34, 16, 74, ...nib(0), ...chars(normalizeNames(names).join("")), 247];
}
function clearNamesBytes() {
  return namesBytes([]);
}
function screenBytes(rows) {
  const list = Array.isArray(rows) ? rows : String(rows ?? "").split("\n");
  const text = Array.from({ length: ROWS }, (_, i) => fit(list[i], ROW_WIDTH)).join("");
  return [...EC4_HEAD, 78, 34, 19, 74, ...nib(0), ...chars(text), 247];
}
function hideScreenBytes() {
  return [...EC4_HEAD, 78, 34, 21, 247];
}
const selectBytes = (setup, group) => [...EC4_HEAD, 78, 40, 16 | setup - 1, 78, 36, 16 | group - 1, 247];
const QUERY_BYTES = [240, 0, 0, 0, 78, 32, 16, 247];
const parseSelect = (b) => b.length === 14 && EC4_HEAD.every((v, i) => b[i] === v) && b[7] === 78 && b[8] === 40 && b[10] === 78 && b[11] === 36 ? { setup: (b[9] & 15) + 1, group: (b[12] & 15) + 1 } : null;
class Ec4Labels {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static key(setup, group) {
    return `${setup}:${group}`;
  }
  /** Replace (array) or merge ({ encoder: name }) the names of one group. */
  set(setup, group, names) {
    const k = Ec4Labels.key(setup, group);
    if (Array.isArray(names) || !names) {
      this.map.set(k, normalizeNames(names));
      return this;
    }
    const cur = this.map.get(k) || Array(NAMES_PER_GROUP).fill(BLANK_NAME);
    const add = normalizeNames(names);
    for (const [e, n] of Object.entries(names)) {
      const i = Number(e) - 1;
      if (i >= 0 && i < NAMES_PER_GROUP && n != null) cur[i] = add[i];
    }
    this.map.set(k, cur);
    return this;
  }
  get(setup, group) {
    return this.map.get(Ec4Labels.key(setup, group)) || null;
  }
  clear(setup, group) {
    if (setup === void 0) this.map.clear();
    else if (group === void 0) for (const k of [...this.map.keys()]) {
      if (k.startsWith(`${setup}:`)) this.map.delete(k);
    }
    else this.map.delete(Ec4Labels.key(setup, group));
    return this;
  }
  /** Groups that have names in a setup, ascending. */
  groups(setup) {
    return [...this.map.keys()].filter((k) => k.startsWith(`${setup}:`)).map((k) => Number(k.split(":")[1])).sort((a, b) => a - b);
  }
}
function labelsFromControls(controller, setup) {
  const labels = new Ec4Labels();
  const profile = controller.profile;
  if (!profile || !profile.locate) return labels;
  const byKey = /* @__PURE__ */ new Map();
  for (const [name, id] of Object.entries(profile.names || {})) {
    try {
      const at = Array.isArray(id) ? profile.encoder(id[0], id[1]) : typeof id === "number" ? { number: id, channel: profile.channel } : null;
      if (at) byKey.set(`${at.channel ?? "*"}:${at.number}`, name);
    } catch (e) {
    }
  }
  for (const rec of controller.state.controls.values()) {
    for (const a of rec.aliases || []) {
      const at = profile.locate(a.number, a.channel);
      if (!at) continue;
      const label = rec.config.label ?? byKey.get(`${a.channel ?? "*"}:${a.number}`) ?? byKey.get(`*:${a.number}`);
      if (label == null) continue;
      labels.set(setup, at[0], { [at[1]]: label });
    }
  }
  return labels;
}
const SELECT_SETTLE_MS = 80;
const QUERY_AFTER_CONNECT_MS = 300;
function ec4Tools(controller) {
  const selectListeners = /* @__PURE__ */ new Set();
  const canSend = () => !!(controller.transport && controller.transport.send && controller.transport.sysex);
  const sendBytes = (bytes) => {
    if (!canSend()) return false;
    try {
      controller.transport.send(bytes);
    } catch (e) {
      return false;
    }
    return true;
  };
  controller.onSysex((bytes) => {
    const at = parseSelect(bytes);
    if (!at) return;
    tools.where = at;
    for (const fn of selectListeners) {
      try {
        fn(at);
      } catch (e) {
      }
    }
    if (display.auto) display.refresh();
  });
  controller.onTransport((t) => {
    if (t && t.sysex && display.auto) setTimeout(() => tools.query(), QUERY_AFTER_CONNECT_MS);
  });
  let labelTimer = null;
  controller.onLabels(() => {
    if (!display.auto || labelTimer) return;
    labelTimer = setTimeout(() => {
      labelTimer = null;
      display.fromControls();
    }, 0);
  });
  const homeSetup = () => controller.profile && controller.profile.setup || tools.where && tools.where.setup || 1;
  const display = {
    /** re-send on connect / group change / registration; off = a page does its own refresh() */
    auto: true,
    labels: new Ec4Labels(),
    /** names(group, names, setup?): array (encoder 1 first) or { encoder: name }; sent now if that group is on screen */
    names(group, names, setup = homeSetup()) {
      display.labels.set(setup, group, names);
      return display.refresh(setup, group);
    },
    /** Send the names of the group on screen from the model. (setup, group) given: only if that is the one on screen. */
    refresh(setup, group) {
      const at = tools.where;
      if (!at) return false;
      if (setup !== void 0 && group !== void 0 && (setup !== at.setup || group !== at.group)) return false;
      const names = display.labels.get(at.setup, at.group);
      return names ? sendBytes(namesBytes(names)) : false;
    },
    /** Labels for every group from the registered controls (their `label` option, else their profile name), then refresh. */
    fromControls(setup = homeSetup()) {
      const built = labelsFromControls(controller, setup);
      display.labels.clear(setup);
      for (const g of built.groups(setup)) display.labels.set(setup, g, built.get(setup, g));
      display.refresh();
      return display.labels;
    },
    /** Forget a group's names (or a setup's, or all) and put the device's blanks back if it is on screen. */
    clear(group, setup = homeSetup()) {
      display.labels.clear(group === void 0 ? void 0 : setup, group);
      const at = tools.where;
      if (at && (group === void 0 || group === at.group && setup === at.setup)) sendBytes(clearNamesBytes());
      return display.labels;
    },
    /** Free text over the whole display, up to 4 rows of 20, until hide(). */
    text(rows) {
      return sendBytes(screenBytes(rows));
    },
    hide() {
      return sendBytes(hideScreenBytes());
    }
  };
  const tools = {
    display,
    /** { setup, group } (1-based) as last reported by the device, or null. */
    where: null,
    /** Ask the device where it is; the answer arrives through onSelect and lands in `where`. */
    query() {
      return sendBytes(QUERY_BYTES);
    },
    /** Put the device on a group (and setup; default the one it is on). 1-based. False when it cannot be sent. */
    select(group, setup = tools.where && tools.where.setup || 1) {
      if (!canSend() || !(group >= 1 && group <= 16) || !(setup >= 1 && setup <= 16)) return false;
      controller.transport.send(selectBytes(setup, group));
      tools.where = { setup, group };
      if (display.auto) setTimeout(() => display.refresh(setup, group), SELECT_SETTLE_MS);
      return true;
    },
    /** Called with { setup, group } whenever the device reports a change (its own keys included). */
    onSelect(fn) {
      selectListeners.add(fn);
      return () => selectListeners.delete(fn);
    },
    image: null,
    Ec4Image,
    parseDump,
    encodeDump,
    /** Resolve with an Ec4Image when the device sends a dump (start it on the EC4). */
    receive({ timeoutMs = 12e4 } = {}) {
      console.log('[midi/ec4] waiting for a dump: on the EC4 press Func > Setup > Send, hold "Send all setups"');
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          off();
          reject(new Error("EC4 dump not received in time"));
        }, timeoutMs);
        const off = controller.onSysex((bytes) => {
          if (bytes.length < 100) return;
          try {
            const img = parseDump(bytes);
            clearTimeout(timer);
            off();
            tools.image = img;
            console.log(`[midi/ec4] received firmware ${img.version} dump, ${img.pages} pages`);
            resolve(img);
          } catch (e) {
            clearTimeout(timer);
            off();
            reject(e);
          }
        });
      });
    },
    /** Send an image (default: the last received/loaded one). Device must be in Setup > Receive. */
    send(image = tools.image) {
      if (!image) throw new Error("midi.ec4.send: no image; receive() or load one first");
      if (!controller.transport || !controller.transport.send) throw new Error("midi.ec4.send: no MIDI output");
      if (!controller.transport.sysex) throw new Error("midi.ec4.send: transport was opened without sysex (install with { sysex: true })");
      const bytes = encodeDump(image);
      console.log(`[midi/ec4] sending ${bytes.length} bytes; the EC4 must show "Work in progress" (Func > Setup > Receive)`);
      controller.transport.send(bytes);
      return bytes.length;
    },
    /** Label encoders of one group from a map { encoder: name | settings } on the current image. */
    label(setup, group, map) {
      if (!tools.image) throw new Error("midi.ec4.label: no image; receive() or load one first");
      return tools.image.labelGroup(setup, group, map);
    },
    /** Label encoders in the given setup from the controller's profile names ({ name: [group, n] }). */
    labelFromNames(setup = 1, names = controller.profile && controller.profile.names) {
      if (!names) throw new Error("midi.ec4.labelFromNames: no names; call midi.names({...}) first");
      for (const [name, id] of Object.entries(names)) {
        if (Array.isArray(id)) tools.image.setEncoderName(setup, id[0], id[1], name);
      }
      return tools.image;
    },
    /** Load a .syx file's bytes (e.g. from an <input type=file> or fetch) as the current image. */
    load(bytes) {
      tools.image = parseDump(bytes);
      return tools.image;
    },
    /** Bytes for saving the current image as a .syx file. */
    toBytes(image = tools.image) {
      return encodeDump(image);
    }
  };
  return tools;
}
const VERSION = "0.3.0";
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
  midi.ec4 = ec4Tools(midi);
  midi.ready = connectWebMidi(midi, { inputFilter: opts.inputFilter, outputFilter: opts.outputFilter, sysex: opts.sysex });
  _midi = midi;
  return midi;
}
function uninstall() {
  if (_midi) _midi.uninstall();
}
export {
  CURVES,
  Controller,
  Ec4Image,
  Ec4Labels,
  MODES$1 as MODES,
  MidiState,
  VERSION,
  connectVirtual,
  connectWebMidi,
  describeEvent,
  ec4,
  ec4Tools,
  encodeDump,
  generic,
  hideScreenBytes,
  install,
  labelsFromControls,
  namesBytes,
  parm,
  parseDump,
  profiles,
  screenBytes,
  uninstall
};
//# sourceMappingURL=index.js.map
