import Ge from "regl";
function Ie(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var J = { exports: {} }, _e;
function He() {
  return _e || (_e = 1, typeof Object.create == "function" ? J.exports = function(e, r) {
    r && (e.super_ = r, e.prototype = Object.create(r.prototype, {
      constructor: {
        value: e,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : J.exports = function(e, r) {
    if (r) {
      e.super_ = r;
      var n = function() {
      };
      n.prototype = r.prototype, e.prototype = new n(), e.prototype.constructor = e;
    }
  }), J.exports;
}
var ae, be;
function Ke() {
  if (be) return ae;
  be = 1;
  function t() {
    this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0;
  }
  ae = t, t.EventEmitter = t, t.prototype._events = void 0, t.prototype._maxListeners = void 0, t.defaultMaxListeners = 10, t.prototype.setMaxListeners = function(i) {
    if (!r(i) || i < 0 || isNaN(i))
      throw TypeError("n must be a positive number");
    return this._maxListeners = i, this;
  }, t.prototype.emit = function(i) {
    var u, f, v, p, T, b;
    if (this._events || (this._events = {}), i === "error" && (!this._events.error || n(this._events.error) && !this._events.error.length)) {
      if (u = arguments[1], u instanceof Error)
        throw u;
      var M = new Error('Uncaught, unspecified "error" event. (' + u + ")");
      throw M.context = u, M;
    }
    if (f = this._events[i], s(f))
      return !1;
    if (e(f))
      switch (arguments.length) {
        // fast cases
        case 1:
          f.call(this);
          break;
        case 2:
          f.call(this, arguments[1]);
          break;
        case 3:
          f.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          p = Array.prototype.slice.call(arguments, 1), f.apply(this, p);
      }
    else if (n(f))
      for (p = Array.prototype.slice.call(arguments, 1), b = f.slice(), v = b.length, T = 0; T < v; T++)
        b[T].apply(this, p);
    return !0;
  }, t.prototype.addListener = function(i, u) {
    var f;
    if (!e(u))
      throw TypeError("listener must be a function");
    return this._events || (this._events = {}), this._events.newListener && this.emit(
      "newListener",
      i,
      e(u.listener) ? u.listener : u
    ), this._events[i] ? n(this._events[i]) ? this._events[i].push(u) : this._events[i] = [this._events[i], u] : this._events[i] = u, n(this._events[i]) && !this._events[i].warned && (s(this._maxListeners) ? f = t.defaultMaxListeners : f = this._maxListeners, f && f > 0 && this._events[i].length > f && (this._events[i].warned = !0, console.error(
      "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
      this._events[i].length
    ), typeof console.trace == "function" && console.trace())), this;
  }, t.prototype.on = t.prototype.addListener, t.prototype.once = function(i, u) {
    if (!e(u))
      throw TypeError("listener must be a function");
    var f = !1;
    function v() {
      this.removeListener(i, v), f || (f = !0, u.apply(this, arguments));
    }
    return v.listener = u, this.on(i, v), this;
  }, t.prototype.removeListener = function(i, u) {
    var f, v, p, T;
    if (!e(u))
      throw TypeError("listener must be a function");
    if (!this._events || !this._events[i])
      return this;
    if (f = this._events[i], p = f.length, v = -1, f === u || e(f.listener) && f.listener === u)
      delete this._events[i], this._events.removeListener && this.emit("removeListener", i, u);
    else if (n(f)) {
      for (T = p; T-- > 0; )
        if (f[T] === u || f[T].listener && f[T].listener === u) {
          v = T;
          break;
        }
      if (v < 0)
        return this;
      f.length === 1 ? (f.length = 0, delete this._events[i]) : f.splice(v, 1), this._events.removeListener && this.emit("removeListener", i, u);
    }
    return this;
  }, t.prototype.removeAllListeners = function(i) {
    var u, f;
    if (!this._events)
      return this;
    if (!this._events.removeListener)
      return arguments.length === 0 ? this._events = {} : this._events[i] && delete this._events[i], this;
    if (arguments.length === 0) {
      for (u in this._events)
        u !== "removeListener" && this.removeAllListeners(u);
      return this.removeAllListeners("removeListener"), this._events = {}, this;
    }
    if (f = this._events[i], e(f))
      this.removeListener(i, f);
    else if (f)
      for (; f.length; )
        this.removeListener(i, f[f.length - 1]);
    return delete this._events[i], this;
  }, t.prototype.listeners = function(i) {
    var u;
    return !this._events || !this._events[i] ? u = [] : e(this._events[i]) ? u = [this._events[i]] : u = this._events[i].slice(), u;
  }, t.prototype.listenerCount = function(i) {
    if (this._events) {
      var u = this._events[i];
      if (e(u))
        return 1;
      if (u)
        return u.length;
    }
    return 0;
  }, t.listenerCount = function(i, u) {
    return i.listenerCount(u);
  };
  function e(i) {
    return typeof i == "function";
  }
  function r(i) {
    return typeof i == "number";
  }
  function n(i) {
    return typeof i == "object" && i !== null;
  }
  function s(i) {
    return i === void 0;
  }
  return ae;
}
var oe, xe;
function We() {
  return xe || (xe = 1, oe = globalThis.performance && globalThis.performance.now ? function() {
    return performance.now();
  } : Date.now || function() {
    return +/* @__PURE__ */ new Date();
  }), oe;
}
var K = { exports: {} }, Y = { exports: {} }, Ve = Y.exports, we;
function Qe() {
  return we || (we = 1, (function() {
    var t, e, r, n, s, i;
    typeof performance < "u" && performance !== null && performance.now ? Y.exports = function() {
      return performance.now();
    } : typeof process < "u" && process !== null && process.hrtime ? (Y.exports = function() {
      return (t() - s) / 1e6;
    }, e = process.hrtime, t = function() {
      var u;
      return u = e(), u[0] * 1e9 + u[1];
    }, n = t(), i = process.uptime() * 1e9, s = n - i) : Date.now ? (Y.exports = function() {
      return Date.now() - r;
    }, r = Date.now()) : (Y.exports = function() {
      return (/* @__PURE__ */ new Date()).getTime() - r;
    }, r = (/* @__PURE__ */ new Date()).getTime());
  }).call(Ve)), Y.exports;
}
var Se;
function Ze() {
  if (Se) return K.exports;
  Se = 1;
  for (var t = Qe(), e = typeof window > "u" ? globalThis : window, r = ["moz", "webkit"], n = "AnimationFrame", s = e["request" + n], i = e["cancel" + n] || e["cancelRequest" + n], u = 0; !s && u < r.length; u++)
    s = e[r[u] + "Request" + n], i = e[r[u] + "Cancel" + n] || e[r[u] + "CancelRequest" + n];
  if (!s || !i) {
    var f = 0, v = 0, p = [], T = 1e3 / 60;
    s = function(b) {
      if (p.length === 0) {
        var M = t(), F = Math.max(0, T - (M - f));
        f = F + M, setTimeout(function() {
          var L = p.slice(0);
          p.length = 0;
          for (var A = 0; A < L.length; A++)
            if (!L[A].cancelled)
              try {
                L[A].callback(f);
              } catch (N) {
                setTimeout(function() {
                  throw N;
                }, 0);
              }
        }, Math.round(F));
      }
      return p.push({
        handle: ++v,
        callback: b,
        cancelled: !1
      }), v;
    }, i = function(b) {
      for (var M = 0; M < p.length; M++)
        p[M].handle === b && (p[M].cancelled = !0);
    };
  }
  return K.exports = function(b) {
    return s.call(e, b);
  }, K.exports.cancel = function() {
    i.apply(e, arguments);
  }, K.exports.polyfill = function(b) {
    b || (b = e), b.requestAnimationFrame = s, b.cancelAnimationFrame = i;
  }, K.exports;
}
var ce, Ee;
function Je() {
  if (Ee) return ce;
  Ee = 1;
  var t = He(), e = Ke().EventEmitter, r = We(), n = Ze();
  ce = s;
  function s(i) {
    if (!(this instanceof s))
      return new s(i);
    this.running = !1, this.last = r(), this._frame = 0, this._tick = this.tick.bind(this), i && this.on("tick", i);
  }
  return t(s, e), s.prototype.start = function() {
    if (!this.running)
      return this.running = !0, this.last = r(), this._frame = n(this._tick), this;
  }, s.prototype.stop = function() {
    return this.running = !1, this._frame !== 0 && n.cancel(this._frame), this._frame = 0, this;
  }, s.prototype.tick = function() {
    this._frame = n(this._tick);
    var i = r(), u = i - this.last;
    this.emit("tick", u), this.last = i;
  }, ce;
}
var et = Je();
const tt = /* @__PURE__ */ Ie(et), rt = { bins: 64, max: 1, floor: 2 / 255, railAt: 0.98, step: 1, every: 1, grid: [64, 36], ease: 0.2 }, le = [0.299, 0.587, 0.114], re = 512, Me = 4, nt = 5;
function st(t = {}, e = !1) {
  const r = Object.assign({}, rt, Object.fromEntries(Object.entries(t || {}).filter(([, n]) => n !== void 0)));
  return t.max === void 0 && e && (r.max = 2), t.railAt === void 0 && (r.railAt = 0.98 * r.max), r.bins = Math.max(2, Math.min(1024, Math.round(r.bins))), {
    enabled: !0,
    options: r,
    bins: new Float32Array(r.bins),
    max: r.max,
    mean: 0,
    chroma: 0,
    black: 0,
    rail: 0,
    gain: 1,
    gainSmooth: 1,
    chromaGain: 1,
    count: 0,
    frame: 0
  };
}
function Te(t, e) {
  const r = t.options.bins, n = e[r + 4];
  if (!n) return t;
  const s = t.mean, i = t.chroma;
  for (let u = 0; u < r; u++) t.bins[u] = e[u] / n;
  return t.mean = e[r] / re / n, t.chroma = e[r + 1] / re / n, t.black = e[r + 2] / n, t.rail = e[r + 3] / n, t.count = n, t.gain = t.frame > 0 && s > 1e-4 ? t.mean / s : 1, t.chromaGain = t.frame > 0 && i > 1e-4 ? t.chroma / i : 1, t.gainSmooth += (t.gain - t.gainSmooth) * t.options.ease, t.frame++, t;
}
function $e(t, e, r = 1) {
  const n = t.options, s = n.bins, i = new Float64Array(s + nt);
  for (let u = 0; u + 3 < e.length; u += 4) {
    const f = Math.min(Math.max(e[u + 3] * r, 0), 1), v = e[u] * r * f, p = e[u + 1] * r * f, T = e[u + 2] * r * f, b = Math.min(Math.max(le[0] * v + le[1] * p + le[2] * T, 0), Me);
    i[Math.min(s - 1, Math.floor(b / n.max * s))]++, i[s] += b * re, i[s + 1] += Math.min(Math.max(Math.max(v, p, T) - Math.min(v, p, T), 0), Me) * re, b < n.floor && i[s + 2]++, b >= n.railAt && i[s + 3]++, i[s + 4]++;
  }
  return i;
}
function it(t) {
  const e = t.stats;
  if (!e || !e.enabled || !t.regl || (e._tick = (e._tick || 0) + 1, e._tick % Math.max(1, e.options.every))) return;
  const r = t.regl, [n, s] = e.options.grid, i = !!t.float;
  let u = t._measure;
  if (!u || u.regl !== r || u.w !== n || u.h !== s || u.isFloat !== i) {
    if (u && u.fbo)
      try {
        u.fbo.destroy();
      } catch {
      }
    u = t._measure = { regl: r, w: n, h: s, isFloat: i }, u.fbo = r.framebuffer({ color: r.texture({ width: n, height: s, format: "rgba", type: i ? "half float" : "uint8", mag: "nearest", min: "nearest" }), depthStencil: !1 }), u.draw = r({
      frag: "precision highp float; uniform sampler2D tex; varying vec2 uv; void main () { gl_FragColor = texture2D(tex, uv); }",
      vert: "precision highp float; attribute vec2 position; varying vec2 uv; void main () { uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }",
      attributes: { position: [[-1, -1], [3, -1], [-1, 3]] },
      uniforms: { tex: r.prop("tex") },
      count: 3,
      depth: { enable: !1 },
      blend: { enable: !1 },
      framebuffer: u.fbo
    }), u.bytes = new Uint8Array(n * s * 4), u.floats = new Float32Array(n * s * 4);
  }
  if (u.draw({ tex: t.getCurrent() }), !i) {
    r.read({ framebuffer: u.fbo, data: u.bytes }), Te(e, $e(e, u.bytes, 1 / 255));
    return;
  }
  const f = r._gl;
  f.bindFramebuffer(f.FRAMEBUFFER, u.fbo._framebuffer.framebuffer), f.readPixels(0, 0, n, s, f.RGBA, f.FLOAT, u.floats);
  const v = f.getError() === f.NO_ERROR;
  f.bindFramebuffer(f.FRAMEBUFFER, null), r._refresh(), v && Te(e, $e(e, u.floats, 1));
}
function at(t) {
  return t === !1 ? (this.stats && (this.stats.enabled = !1), this) : (this.stats = st(t === !0 ? {} : t, !!this.float || /16float/.test(this._textureDescriptor ? this._textureDescriptor.format : "")), this);
}
const X = {};
function ot(t) {
  if (typeof t == "object") {
    if ("buttons" in t)
      return t.buttons;
    if ("which" in t) {
      var e = t.which;
      if (e === 2)
        return 4;
      if (e === 3)
        return 2;
      if (e > 0)
        return 1 << e - 1;
    } else if ("button" in t) {
      var e = t.button;
      if (e === 1)
        return 4;
      if (e === 2)
        return 2;
      if (e >= 0)
        return 1 << e;
    }
  }
  return 0;
}
X.buttons = ot;
function ct(t) {
  return t.target || t.srcElement || window;
}
X.element = ct;
function lt(t) {
  return typeof t == "object" && "pageX" in t ? t.pageX : 0;
}
X.x = lt;
function ut(t) {
  return typeof t == "object" && "pageY" in t ? t.pageY : 0;
}
X.y = ut;
function ft(t, e) {
  e || (e = t, t = window);
  var r = 0, n = 0, s = 0, i = {
    shift: !1,
    alt: !1,
    control: !1,
    meta: !1
  }, u = !1;
  function f($) {
    var R = !1;
    return "altKey" in $ && (R = R || $.altKey !== i.alt, i.alt = !!$.altKey), "shiftKey" in $ && (R = R || $.shiftKey !== i.shift, i.shift = !!$.shiftKey), "ctrlKey" in $ && (R = R || $.ctrlKey !== i.control, i.control = !!$.ctrlKey), "metaKey" in $ && (R = R || $.metaKey !== i.meta, i.meta = !!$.metaKey), R;
  }
  function v($, R) {
    var Z = X.x(R), G = X.y(R);
    "buttons" in R && ($ = R.buttons | 0), ($ !== r || Z !== n || G !== s || f(R)) && (r = $ | 0, n = Z || 0, s = G || 0, e && e(r, n, s, i));
  }
  function p($) {
    v(0, $);
  }
  function T() {
    (r || n || s || i.shift || i.alt || i.meta || i.control) && (n = s = 0, r = 0, i.shift = i.alt = i.control = i.meta = !1, e && e(0, 0, 0, i));
  }
  function b($) {
    f($) && e && e(r, n, s, i);
  }
  function M($) {
    X.buttons($) === 0 ? v(0, $) : v(r, $);
  }
  function F($) {
    v(r | X.buttons($), $);
  }
  function L($) {
    v(r & ~X.buttons($), $);
  }
  function A() {
    u || (u = !0, t.addEventListener("mousemove", M), t.addEventListener("mousedown", F), t.addEventListener("mouseup", L), t.addEventListener("mouseleave", p), t.addEventListener("mouseenter", p), t.addEventListener("mouseout", p), t.addEventListener("mouseover", p), t.addEventListener("blur", T), t.addEventListener("keyup", b), t.addEventListener("keydown", b), t.addEventListener("keypress", b), t !== window && (window.addEventListener("blur", T), window.addEventListener("keyup", b), window.addEventListener("keydown", b), window.addEventListener("keypress", b)));
  }
  function N() {
    u && (u = !1, t.removeEventListener("mousemove", M), t.removeEventListener("mousedown", F), t.removeEventListener("mouseup", L), t.removeEventListener("mouseleave", p), t.removeEventListener("mouseenter", p), t.removeEventListener("mouseout", p), t.removeEventListener("mouseover", p), t.removeEventListener("blur", T), t.removeEventListener("keyup", b), t.removeEventListener("keydown", b), t.removeEventListener("keypress", b), t !== window && (window.removeEventListener("blur", T), window.removeEventListener("keyup", b), window.removeEventListener("keydown", b), window.removeEventListener("keypress", b)));
  }
  A();
  var k = {
    element: t
  };
  return Object.defineProperties(k, {
    enabled: {
      get: function() {
        return u;
      },
      set: function($) {
        $ ? A() : N();
      },
      enumerable: !0
    },
    buttons: {
      get: function() {
        return r;
      },
      enumerable: !0
    },
    x: {
      get: function() {
        return n;
      },
      enumerable: !0
    },
    y: {
      get: function() {
        return s;
      },
      enumerable: !0
    },
    mods: {
      get: function() {
        return i;
      },
      enumerable: !0
    }
  }), k;
}
var te = { exports: {} }, ht = te.exports, Ae;
function mt() {
  return Ae || (Ae = 1, (function(t, e) {
    (function(r, n) {
      t.exports = n();
    })(ht, (function() {
      function r(c, o, h) {
        for (var l, m = 0, d = o.length; m < d; m++) !l && m in o || (l || (l = Array.prototype.slice.call(o, 0, m)), l[m] = o[m]);
        return c.concat(l || Array.prototype.slice.call(o));
      }
      var n = Object.freeze({ __proto__: null, blackman: function(c) {
        for (var o = new Float32Array(c), h = 2 * Math.PI / (c - 1), l = 2 * h, m = 0; m < c / 2; m++) o[m] = 0.42 - 0.5 * Math.cos(m * h) + 0.08 * Math.cos(m * l);
        for (m = Math.ceil(c / 2); m > 0; m--) o[c - m] = o[m - 1];
        return o;
      }, hamming: function(c) {
        for (var o = new Float32Array(c), h = 0; h < c; h++) o[h] = 0.54 - 0.46 * Math.cos(2 * Math.PI * (h / c - 1));
        return o;
      }, hanning: function(c) {
        for (var o = new Float32Array(c), h = 0; h < c; h++) o[h] = 0.5 - 0.5 * Math.cos(2 * Math.PI * h / (c - 1));
        return o;
      }, sine: function(c) {
        for (var o = Math.PI / (c - 1), h = new Float32Array(c), l = 0; l < c; l++) h[l] = Math.sin(o * l);
        return h;
      } }), s = {};
      function i(c) {
        for (; c % 2 == 0 && c > 1; ) c /= 2;
        return c === 1;
      }
      function u(c, o) {
        if (o !== "rect") {
          if (o !== "" && o || (o = "hanning"), s[o] || (s[o] = {}), !s[o][c.length]) try {
            s[o][c.length] = n[o](c.length);
          } catch {
            throw new Error("Invalid windowing function");
          }
          c = (function(h, l) {
            for (var m = [], d = 0; d < Math.min(h.length, l.length); d++) m[d] = h[d] * l[d];
            return m;
          })(c, s[o][c.length]);
        }
        return c;
      }
      function f(c, o, h) {
        for (var l = new Float32Array(c), m = 0; m < l.length; m++) l[m] = m * o / h, l[m] = 13 * Math.atan(l[m] / 1315.8) + 3.5 * Math.atan(Math.pow(l[m] / 7518, 2));
        return l;
      }
      function v(c) {
        return Float32Array.from(c);
      }
      function p(c) {
        return 1125 * Math.log(1 + c / 700);
      }
      function T(c, o, h) {
        for (var l, m = new Float32Array(c + 2), d = new Float32Array(c + 2), _ = o / 2, S = p(0), y = (p(_) - S) / (c + 1), g = new Array(c + 2), E = 0; E < m.length; E++) m[E] = E * y, d[E] = (l = m[E], 700 * (Math.exp(l / 1125) - 1)), g[E] = Math.floor((h + 1) * d[E] / o);
        for (var z = new Array(c), w = 0; w < z.length; w++) {
          for (z[w] = new Array(h / 2 + 1).fill(0), E = g[w]; E < g[w + 1]; E++) z[w][E] = (E - g[w]) / (g[w + 1] - g[w]);
          for (E = g[w + 1]; E < g[w + 2]; E++) z[w][E] = (g[w + 2] - E) / (g[w + 2] - g[w + 1]);
        }
        return z;
      }
      function b(c, o, h, l, m, d, _) {
        l === void 0 && (l = 5), m === void 0 && (m = 2), d === void 0 && (d = !0), _ === void 0 && (_ = 440);
        var S = Math.floor(h / 2) + 1, y = new Array(h).fill(0).map((function(C, O) {
          return c * (function(I, q) {
            return Math.log2(16 * I / q);
          })(o * O / h, _);
        }));
        y[0] = y[1] - 1.5 * c;
        var g, E, z, w = y.slice(1).map((function(C, O) {
          return Math.max(C - y[O]);
        }), 1).concat([1]), U = Math.round(c / 2), D = new Array(c).fill(0).map((function(C, O) {
          return y.map((function(I) {
            return (10 * c + U + I - O) % c - U;
          }));
        })), B = D.map((function(C, O) {
          return C.map((function(I, q) {
            return Math.exp(-0.5 * Math.pow(2 * D[O][q] / w[q], 2));
          }));
        }));
        if (E = (g = B)[0].map((function() {
          return 0;
        })), z = g.reduce((function(C, O) {
          return O.forEach((function(I, q) {
            C[q] += Math.pow(I, 2);
          })), C;
        }), E).map(Math.sqrt), B = g.map((function(C, O) {
          return C.map((function(I, q) {
            return I / (z[q] || 1);
          }));
        })), m) {
          var ie = y.map((function(C) {
            return Math.exp(-0.5 * Math.pow((C / c - l) / m, 2));
          }));
          B = B.map((function(C) {
            return C.map((function(O, I) {
              return O * ie[I];
            }));
          }));
        }
        return d && (B = r(r([], B.slice(3), !0), B.slice(0, 3))), B.map((function(C) {
          return C.slice(0, S);
        }));
      }
      function M(c, o) {
        for (var h = 0, l = 0, m = 0; m < o.length; m++) h += Math.pow(m, c) * Math.abs(o[m]), l += o[m];
        return h / l;
      }
      function F(c) {
        var o = c.ampSpectrum, h = c.barkScale, l = c.numberOfBarkBands, m = l === void 0 ? 24 : l;
        if (typeof o != "object" || typeof h != "object") throw new TypeError();
        var d = m, _ = new Float32Array(d), S = 0, y = o, g = new Int32Array(d + 1);
        g[0] = 0;
        for (var E = h[y.length - 1] / d, z = 1, w = 0; w < y.length; w++) for (; h[w] > E; ) g[z++] = w, E = z * h[y.length - 1] / d;
        for (g[d] = y.length - 1, w = 0; w < d; w++) {
          for (var U = 0, D = g[w]; D < g[w + 1]; D++) U += y[D];
          _[w] = Math.pow(U, 0.23);
        }
        for (w = 0; w < _.length; w++) S += _[w];
        return { specific: _, total: S };
      }
      function L(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        for (var h = new Float32Array(o.length), l = 0; l < h.length; l++) h[l] = Math.pow(o[l], 2);
        return h;
      }
      function A(c) {
        var o = c.ampSpectrum, h = c.melFilterBank, l = c.bufferSize;
        if (typeof o != "object") throw new TypeError("Valid ampSpectrum is required to generate melBands");
        if (typeof h != "object") throw new TypeError("Valid melFilterBank is required to generate melBands");
        for (var m = L({ ampSpectrum: o }), d = h.length, _ = Array(d), S = new Float32Array(d), y = 0; y < S.length; y++) {
          _[y] = new Float32Array(l / 2), S[y] = 0;
          for (var g = 0; g < l / 2; g++) _[y][g] = h[y][g] * m[g], S[y] += _[y][g];
          S[y] = Math.log(S[y] + 1);
        }
        return Array.prototype.slice.call(S);
      }
      function N(c) {
        return c && c.__esModule && Object.prototype.hasOwnProperty.call(c, "default") ? c.default : c;
      }
      var k = null, $ = N((function(c, o) {
        var h = c.length;
        return o = o || 2, k && k[h] || (function(l) {
          (k = k || {})[l] = new Array(l * l);
          for (var m = Math.PI / l, d = 0; d < l; d++) for (var _ = 0; _ < l; _++) k[l][_ + d * l] = Math.cos(m * (_ + 0.5) * d);
        })(h), c.map((function() {
          return 0;
        })).map((function(l, m) {
          return o * c.reduce((function(d, _, S, y) {
            return d + _ * k[h][S + m * h];
          }), 0);
        }));
      })), R = Object.freeze({ __proto__: null, amplitudeSpectrum: function(c) {
        return c.ampSpectrum;
      }, buffer: function(c) {
        return c.signal;
      }, chroma: function(c) {
        var o = c.ampSpectrum, h = c.chromaFilterBank;
        if (typeof o != "object") throw new TypeError("Valid ampSpectrum is required to generate chroma");
        if (typeof h != "object") throw new TypeError("Valid chromaFilterBank is required to generate chroma");
        var l = h.map((function(d, _) {
          return o.reduce((function(S, y, g) {
            return S + y * d[g];
          }), 0);
        })), m = Math.max.apply(Math, l);
        return m ? l.map((function(d) {
          return d / m;
        })) : l;
      }, complexSpectrum: function(c) {
        return c.complexSpectrum;
      }, energy: function(c) {
        var o = c.signal;
        if (typeof o != "object") throw new TypeError();
        for (var h = 0, l = 0; l < o.length; l++) h += Math.pow(Math.abs(o[l]), 2);
        return h;
      }, loudness: F, melBands: A, mfcc: function(c) {
        var o = c.ampSpectrum, h = c.melFilterBank, l = c.numberOfMFCCCoefficients, m = c.bufferSize, d = Math.min(40, Math.max(1, l || 13));
        if (h.length < d) throw new Error("Insufficient filter bank for requested number of coefficients");
        var _ = A({ ampSpectrum: o, melFilterBank: h, bufferSize: m });
        return $(_).slice(0, d);
      }, perceptualSharpness: function(c) {
        for (var o = F({ ampSpectrum: c.ampSpectrum, barkScale: c.barkScale }), h = o.specific, l = 0, m = 0; m < h.length; m++) l += m < 15 ? (m + 1) * h[m + 1] : 0.066 * Math.exp(0.171 * (m + 1));
        return l *= 0.11 / o.total;
      }, perceptualSpread: function(c) {
        for (var o = F({ ampSpectrum: c.ampSpectrum, barkScale: c.barkScale }), h = 0, l = 0; l < o.specific.length; l++) o.specific[l] > h && (h = o.specific[l]);
        return Math.pow((o.total - h) / o.total, 2);
      }, powerSpectrum: L, rms: function(c) {
        var o = c.signal;
        if (typeof o != "object") throw new TypeError();
        for (var h = 0, l = 0; l < o.length; l++) h += Math.pow(o[l], 2);
        return h /= o.length, h = Math.sqrt(h);
      }, spectralCentroid: function(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        return M(1, o);
      }, spectralCrest: function(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        var h = 0, l = -1 / 0;
        return o.forEach((function(m) {
          h += Math.pow(m, 2), l = m > l ? m : l;
        })), h /= o.length, h = Math.sqrt(h), l / h;
      }, spectralFlatness: function(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        for (var h = 0, l = 0, m = 0; m < o.length; m++) h += Math.log(o[m]), l += o[m];
        return Math.exp(h / o.length) * o.length / l;
      }, spectralFlux: function(c) {
        var o = c.signal, h = c.previousSignal, l = c.bufferSize;
        if (typeof o != "object" || typeof h != "object") throw new TypeError();
        for (var m = 0, d = -l / 2; d < o.length / 2 - 1; d++) x = Math.abs(o[d]) - Math.abs(h[d]), m += (x + Math.abs(x)) / 2;
        return m;
      }, spectralKurtosis: function(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        var h = o, l = M(1, h), m = M(2, h), d = M(3, h), _ = M(4, h);
        return (-3 * Math.pow(l, 4) + 6 * l * m - 4 * l * d + _) / Math.pow(Math.sqrt(m - Math.pow(l, 2)), 4);
      }, spectralRolloff: function(c) {
        var o = c.ampSpectrum, h = c.sampleRate;
        if (typeof o != "object") throw new TypeError();
        for (var l = o, m = h / (2 * (l.length - 1)), d = 0, _ = 0; _ < l.length; _++) d += l[_];
        for (var S = 0.99 * d, y = l.length - 1; d > S && y >= 0; ) d -= l[y], --y;
        return (y + 1) * m;
      }, spectralSkewness: function(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        var h = M(1, o), l = M(2, o), m = M(3, o);
        return (2 * Math.pow(h, 3) - 3 * h * l + m) / Math.pow(Math.sqrt(l - Math.pow(h, 2)), 3);
      }, spectralSlope: function(c) {
        var o = c.ampSpectrum, h = c.sampleRate, l = c.bufferSize;
        if (typeof o != "object") throw new TypeError();
        for (var m = 0, d = 0, _ = new Float32Array(o.length), S = 0, y = 0, g = 0; g < o.length; g++) {
          m += o[g];
          var E = g * h / l;
          _[g] = E, S += E * E, d += E, y += E * o[g];
        }
        return (o.length * y - d * m) / (m * (S - Math.pow(d, 2)));
      }, spectralSpread: function(c) {
        var o = c.ampSpectrum;
        if (typeof o != "object") throw new TypeError();
        return Math.sqrt(M(2, o) - Math.pow(M(1, o), 2));
      }, zcr: function(c) {
        var o = c.signal;
        if (typeof o != "object") throw new TypeError();
        for (var h = 0, l = 1; l < o.length; l++) (o[l - 1] >= 0 && o[l] < 0 || o[l - 1] < 0 && o[l] >= 0) && h++;
        return h;
      } });
      function Z(c) {
        if (Array.isArray(c)) {
          for (var o = 0, h = Array(c.length); o < c.length; o++) h[o] = c[o];
          return h;
        }
        return Array.from(c);
      }
      var G = {}, ne = {}, H = { bitReverseArray: function(c) {
        if (G[c] === void 0) {
          for (var o = (c - 1).toString(2).length, h = "0".repeat(o), l = {}, m = 0; m < c; m++) {
            var d = m.toString(2);
            d = h.substr(d.length) + d, d = [].concat(Z(d)).reverse().join(""), l[m] = parseInt(d, 2);
          }
          G[c] = l;
        }
        return G[c];
      }, multiply: function(c, o) {
        return { real: c.real * o.real - c.imag * o.imag, imag: c.real * o.imag + c.imag * o.real };
      }, add: function(c, o) {
        return { real: c.real + o.real, imag: c.imag + o.imag };
      }, subtract: function(c, o) {
        return { real: c.real - o.real, imag: c.imag - o.imag };
      }, euler: function(c, o) {
        var h = -2 * Math.PI * c / o;
        return { real: Math.cos(h), imag: Math.sin(h) };
      }, conj: function(c) {
        return c.imag *= -1, c;
      }, constructComplexArray: function(c) {
        var o = {};
        o.real = c.real === void 0 ? c.slice() : c.real.slice();
        var h = o.real.length;
        return ne[h] === void 0 && (ne[h] = Array.apply(null, Array(h)).map(Number.prototype.valueOf, 0)), o.imag = ne[h].slice(), o;
      } }, Ne = function(c) {
        var o = {};
        c.real === void 0 || c.imag === void 0 ? o = H.constructComplexArray(c) : (o.real = c.real.slice(), o.imag = c.imag.slice());
        var h = o.real.length, l = Math.log2(h);
        if (Math.round(l) != l) throw new Error("Input size must be a power of 2.");
        if (o.real.length != o.imag.length) throw new Error("Real and imaginary components must have the same length.");
        for (var m = H.bitReverseArray(h), d = { real: [], imag: [] }, _ = 0; _ < h; _++) d.real[m[_]] = o.real[_], d.imag[m[_]] = o.imag[_];
        for (var S = 0; S < h; S++) o.real[S] = d.real[S], o.imag[S] = d.imag[S];
        for (var y = 1; y <= l; y++) for (var g = Math.pow(2, y), E = 0; E < g / 2; E++) for (var z = H.euler(E, g), w = 0; w < h / g; w++) {
          var U = g * w + E, D = g * w + E + g / 2, B = { real: o.real[U], imag: o.imag[U] }, ie = { real: o.real[D], imag: o.imag[D] }, C = H.multiply(z, ie), O = H.subtract(B, C);
          o.real[D] = O.real, o.imag[D] = O.imag;
          var I = H.add(C, B);
          o.real[U] = I.real, o.imag[U] = I.imag;
        }
        return o;
      }, qe = Ne, Ye = (function() {
        function c(o, h) {
          var l = this;
          if (this._m = h, !o.audioContext) throw this._m.errors.noAC;
          if (o.bufferSize && !i(o.bufferSize)) throw this._m._errors.notPow2;
          if (!o.source) throw this._m._errors.noSource;
          this._m.audioContext = o.audioContext, this._m.bufferSize = o.bufferSize || this._m.bufferSize || 256, this._m.hopSize = o.hopSize || this._m.hopSize || this._m.bufferSize, this._m.sampleRate = o.sampleRate || this._m.audioContext.sampleRate || 44100, this._m.callback = o.callback, this._m.windowingFunction = o.windowingFunction || "hanning", this._m.featureExtractors = R, this._m.EXTRACTION_STARTED = o.startImmediately || !1, this._m.channel = typeof o.channel == "number" ? o.channel : 0, this._m.inputs = o.inputs || 1, this._m.outputs = o.outputs || 1, this._m.numberOfMFCCCoefficients = o.numberOfMFCCCoefficients || this._m.numberOfMFCCCoefficients || 13, this._m.numberOfBarkBands = o.numberOfBarkBands || this._m.numberOfBarkBands || 24, this._m.spn = this._m.audioContext.createScriptProcessor(this._m.bufferSize, this._m.inputs, this._m.outputs), this._m.spn.connect(this._m.audioContext.destination), this._m._featuresToExtract = o.featureExtractors || [], this._m.barkScale = f(this._m.bufferSize, this._m.sampleRate, this._m.bufferSize), this._m.melFilterBank = T(Math.max(this._m.melBands, this._m.numberOfMFCCCoefficients), this._m.sampleRate, this._m.bufferSize), this._m.inputData = null, this._m.previousInputData = null, this._m.frame = null, this._m.previousFrame = null, this.setSource(o.source), this._m.spn.onaudioprocess = function(m) {
            var d;
            l._m.inputData !== null && (l._m.previousInputData = l._m.inputData), l._m.inputData = m.inputBuffer.getChannelData(l._m.channel), l._m.previousInputData ? ((d = new Float32Array(l._m.previousInputData.length + l._m.inputData.length - l._m.hopSize)).set(l._m.previousInputData.slice(l._m.hopSize)), d.set(l._m.inputData, l._m.previousInputData.length - l._m.hopSize)) : d = l._m.inputData;
            var _ = (function(S, y, g) {
              if (S.length < y) throw new Error("Buffer is too short for frame length");
              if (g < 1) throw new Error("Hop length cannot be less that 1");
              if (y < 1) throw new Error("Frame length cannot be less that 1");
              var E = 1 + Math.floor((S.length - y) / g);
              return new Array(E).fill(0).map((function(z, w) {
                return S.slice(w * g, w * g + y);
              }));
            })(d, l._m.bufferSize, l._m.hopSize);
            _.forEach((function(S) {
              l._m.frame = S;
              var y = l._m.extract(l._m._featuresToExtract, l._m.frame, l._m.previousFrame);
              typeof l._m.callback == "function" && l._m.EXTRACTION_STARTED && l._m.callback(y), l._m.previousFrame = l._m.frame;
            }));
          };
        }
        return c.prototype.start = function(o) {
          this._m._featuresToExtract = o || this._m._featuresToExtract, this._m.EXTRACTION_STARTED = !0;
        }, c.prototype.stop = function() {
          this._m.EXTRACTION_STARTED = !1;
        }, c.prototype.setSource = function(o) {
          this._m.source && this._m.source.disconnect(this._m.spn), this._m.source = o, this._m.source.connect(this._m.spn);
        }, c.prototype.setChannel = function(o) {
          o <= this._m.inputs ? this._m.channel = o : console.error("Channel ".concat(o, " does not exist. Make sure you've provided a value for 'inputs' that is greater than ").concat(o, " when instantiating the MeydaAnalyzer"));
        }, c.prototype.get = function(o) {
          return this._m.inputData ? this._m.extract(o || this._m._featuresToExtract, this._m.inputData, this._m.previousInputData) : null;
        }, c;
      })(), se = { audioContext: null, spn: null, bufferSize: 512, sampleRate: 44100, melBands: 26, chromaBands: 12, callback: null, windowingFunction: "hanning", featureExtractors: R, EXTRACTION_STARTED: !1, numberOfMFCCCoefficients: 13, numberOfBarkBands: 24, _featuresToExtract: [], windowing: u, _errors: { notPow2: new Error("Meyda: Buffer size must be a power of 2, e.g. 64 or 512"), featureUndef: new Error("Meyda: No features defined."), invalidFeatureFmt: new Error("Meyda: Invalid feature format"), invalidInput: new Error("Meyda: Invalid input."), noAC: new Error("Meyda: No AudioContext specified."), noSource: new Error("Meyda: No source node specified.") }, createMeydaAnalyzer: function(c) {
        return new Ye(c, Object.assign({}, se));
      }, listAvailableFeatureExtractors: function() {
        return Object.keys(this.featureExtractors);
      }, extract: function(c, o, h) {
        var l = this;
        if (!o) throw this._errors.invalidInput;
        if (typeof o != "object") throw this._errors.invalidInput;
        if (!c) throw this._errors.featureUndef;
        if (!i(o.length)) throw this._errors.notPow2;
        this.barkScale !== void 0 && this.barkScale.length == this.bufferSize || (this.barkScale = f(this.bufferSize, this.sampleRate, this.bufferSize)), this.melFilterBank !== void 0 && this.barkScale.length == this.bufferSize && this.melFilterBank.length == this.melBands || (this.melFilterBank = T(Math.max(this.melBands, this.numberOfMFCCCoefficients), this.sampleRate, this.bufferSize)), this.chromaFilterBank !== void 0 && this.chromaFilterBank.length == this.chromaBands || (this.chromaFilterBank = b(this.chromaBands, this.sampleRate, this.bufferSize)), "buffer" in o && o.buffer === void 0 ? this.signal = v(o) : this.signal = o;
        var m = ye(o, this.windowingFunction, this.bufferSize);
        if (this.signal = m.windowedSignal, this.complexSpectrum = m.complexSpectrum, this.ampSpectrum = m.ampSpectrum, h) {
          var d = ye(h, this.windowingFunction, this.bufferSize);
          this.previousSignal = d.windowedSignal, this.previousComplexSpectrum = d.complexSpectrum, this.previousAmpSpectrum = d.ampSpectrum;
        }
        var _ = function(S) {
          return l.featureExtractors[S]({ ampSpectrum: l.ampSpectrum, chromaFilterBank: l.chromaFilterBank, complexSpectrum: l.complexSpectrum, signal: l.signal, bufferSize: l.bufferSize, sampleRate: l.sampleRate, barkScale: l.barkScale, melFilterBank: l.melFilterBank, previousSignal: l.previousSignal, previousAmpSpectrum: l.previousAmpSpectrum, previousComplexSpectrum: l.previousComplexSpectrum, numberOfMFCCCoefficients: l.numberOfMFCCCoefficients, numberOfBarkBands: l.numberOfBarkBands });
        };
        if (typeof c == "object") return c.reduce((function(S, y) {
          var g;
          return Object.assign({}, S, ((g = {})[y] = _(y), g));
        }), {});
        if (typeof c == "string") return _(c);
        throw this._errors.invalidFeatureFmt;
      } }, ye = function(c, o, h) {
        var l = {};
        c.buffer === void 0 ? l.signal = v(c) : l.signal = c, l.windowedSignal = u(l.signal, o), l.complexSpectrum = qe(l.windowedSignal), l.ampSpectrum = new Float32Array(h / 2);
        for (var m = 0; m < h / 2; m++) l.ampSpectrum[m] = Math.sqrt(Math.pow(l.complexSpectrum.real[m], 2) + Math.pow(l.complexSpectrum.imag[m], 2));
        return l;
      };
      return typeof window < "u" && (window.Meyda = se), se;
    }));
  })(te)), te.exports;
}
var pt = mt();
const dt = /* @__PURE__ */ Ie(pt);
class vt {
  constructor({
    numBins: e = 4,
    cutoff: r = 2,
    smooth: n = 0.4,
    max: s = 15,
    scale: i = 10,
    isDrawing: u = !1,
    parentEl: f = document.body
  }) {
    this.vol = 0, this.scale = i, this.max = s, this.cutoff = r, this.smooth = n, this.setBins(e), this.beat = {
      holdFrames: 20,
      threshold: 40,
      _cutoff: 0,
      // adaptive based on sound state
      decay: 0.98,
      _framesSinceBeat: 0
      // keeps track of frames
    }, this.onBeat = () => {
    }, this.canvas = document.createElement("canvas"), this.canvas.width = 100, this.canvas.height = 80, this.canvas.style.width = "100px", this.canvas.style.height = "80px", this.canvas.style.position = "absolute", this.canvas.style.right = "0px", this.canvas.style.bottom = "0px", f.appendChild(this.canvas), this.isDrawing = u, this.ctx = this.canvas.getContext("2d"), this.ctx.fillStyle = "#DFFFFF", this.ctx.strokeStyle = "#0ff", this.ctx.lineWidth = 0.5, window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia({ video: !1, audio: !0 }).then((v) => {
      this.stream = v, this.context = new AudioContext();
      let p = this.context.createMediaStreamSource(v);
      this.meyda = dt.createMeydaAnalyzer({
        audioContext: this.context,
        source: p,
        featureExtractors: [
          "loudness"
          //  'perceptualSpread',
          //  'perceptualSharpness',
          //  'spectralCentroid'
        ]
      });
    }).catch((v) => console.log("ERROR", v));
  }
  detectBeat(e) {
    e > this.beat._cutoff && e > this.beat.threshold ? (this.onBeat(), this.beat._cutoff = e * 1.2, this.beat._framesSinceBeat = 0) : this.beat._framesSinceBeat <= this.beat.holdFrames ? this.beat._framesSinceBeat++ : (this.beat._cutoff *= this.beat.decay, this.beat._cutoff = Math.max(this.beat._cutoff, this.beat.threshold));
  }
  tick() {
    if (this.meyda) {
      var e = this.meyda.get();
      if (e && e !== null) {
        this.vol = e.loudness.total, this.detectBeat(this.vol);
        const r = (s, i) => s + i;
        let n = Math.floor(e.loudness.specific.length / this.bins.length);
        this.prevBins = this.bins.slice(0), this.bins = this.bins.map((s, i) => e.loudness.specific.slice(i * n, (i + 1) * n).reduce(r)).map((s, i) => s * (1 - this.settings[i].smooth) + this.prevBins[i] * this.settings[i].smooth), this.fft = this.bins.map((s, i) => (
          // Math.max(0, (bin - this.cutoff) / (this.max - this.cutoff))
          Math.max(0, (s - this.settings[i].cutoff) / this.settings[i].scale)
        )), this.isDrawing && this.draw();
      }
    }
  }
  setCutoff(e) {
    this.cutoff = e, this.settings = this.settings.map((r) => (r.cutoff = e, r));
  }
  setSmooth(e) {
    this.smooth = e, this.settings = this.settings.map((r) => (r.smooth = e, r));
  }
  setBins(e) {
    this.bins = Array(e).fill(0), this.prevBins = Array(e).fill(0), this.fft = Array(e).fill(0), this.settings = Array(e).fill(0).map(() => ({
      cutoff: this.cutoff,
      scale: this.scale,
      smooth: this.smooth
    })), this.bins.forEach((r, n) => {
      window["a" + n] = (s = 1, i = 0) => () => a.fft[n] * s + i;
    });
  }
  setScale(e) {
    this.scale = e, this.settings = this.settings.map((r) => (r.scale = e, r));
  }
  setMax(e) {
    this.max = e, console.log("set max is deprecated");
  }
  hide() {
    this.isDrawing = !1, this.canvas.style.display = "none";
  }
  show() {
    this.isDrawing = !0, this.canvas.style.display = "block";
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var e = this.canvas.width / this.bins.length, r = this.canvas.height / (this.max * 2);
    this.bins.forEach((n, s) => {
      var i = n * r;
      this.ctx.fillRect(s * e, this.canvas.height - i, e, i);
      var u = this.canvas.height - r * this.settings[s].cutoff;
      this.ctx.beginPath(), this.ctx.moveTo(s * e, u), this.ctx.lineTo((s + 1) * e, u), this.ctx.stroke();
      var f = this.canvas.height - r * (this.settings[s].scale + this.settings[s].cutoff);
      this.ctx.beginPath(), this.ctx.moveTo(s * e, f), this.ctx.lineTo((s + 1) * e, f), this.ctx.stroke();
    });
  }
}
let je = !1;
function gt(t) {
  je = t;
}
function P(...t) {
  je && console.log(...t);
}
class yt {
  constructor(e) {
    this.mediaSource = new MediaSource(), this.stream = e, this.output = document.createElement("video"), this.output.autoplay = !0, this.output.loop = !0;
    let r = this;
    this.mediaSource.addEventListener("sourceopen", () => {
      P("MediaSource opened"), r.sourceBuffer = r.mediaSource.addSourceBuffer('video/webm; codecs="vp8"'), P("Source buffer: ", r.sourceBuffer);
    });
  }
  start() {
    let e = { mimeType: "video/webm;codecs=vp9" };
    this.recordedBlobs = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, e);
    } catch (r) {
      console.log("Unable to create MediaRecorder with options Object: ", r);
      try {
        e = { mimeType: "video/webm,codecs=vp9" }, this.mediaRecorder = new MediaRecorder(this.stream, e);
      } catch (n) {
        console.log("Unable to create MediaRecorder with options Object: ", n);
        try {
          e = "video/vp8", this.mediaRecorder = new MediaRecorder(this.stream, e);
        } catch (s) {
          alert(`MediaRecorder is not supported by this browser.

Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.`), console.error("Exception while creating MediaRecorder:", s);
          return;
        }
      }
    }
    P("Created MediaRecorder", this.mediaRecorder, "with options", e), this.mediaRecorder.onstop = this._handleStop.bind(this), this.mediaRecorder.ondataavailable = this._handleDataAvailable.bind(this), this.mediaRecorder.start(100), P("MediaRecorder started", this.mediaRecorder);
  }
  stop() {
    this.mediaRecorder.stop();
  }
  _handleStop() {
    const e = new Blob(this.recordedBlobs, { type: this.mediaRecorder.mimeType }), r = window.URL.createObjectURL(e);
    this.output.src = r;
    const n = document.createElement("a");
    n.style.display = "none", n.href = r;
    let s = /* @__PURE__ */ new Date();
    n.download = `hydra-${s.getFullYear()}-${s.getMonth() + 1}-${s.getDate()}-${s.getHours()}.${s.getMinutes()}.${s.getSeconds()}.webm`, document.body.appendChild(n), n.click(), setTimeout(() => {
      document.body.removeChild(n), window.URL.revokeObjectURL(r);
    }, 300);
  }
  _handleDataAvailable(e) {
    e.data && e.data.size > 0 && this.recordedBlobs.push(e.data);
  }
}
const ue = {
  // no easing, no acceleration
  linear: function(t) {
    return t;
  },
  // accelerating from zero velocity
  easeInQuad: function(t) {
    return t * t;
  },
  // decelerating to zero velocity
  easeOutQuad: function(t) {
    return t * (2 - t);
  },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  // accelerating from zero velocity
  easeInCubic: function(t) {
    return t * t * t;
  },
  // decelerating to zero velocity
  easeOutCubic: function(t) {
    return --t * t * t + 1;
  },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  // accelerating from zero velocity
  easeInQuart: function(t) {
    return t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuart: function(t) {
    return 1 - --t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  // accelerating from zero velocity
  easeInQuint: function(t) {
    return t * t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuint: function(t) {
    return 1 + --t * t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },
  // sin shape
  sin: function(t) {
    return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
  }
};
var _t = (t, e, r, n, s) => (t - e) * (s - n) / (r - e) + n, fe = (t, e) => (t % e + e) % e;
const De = {
  init: () => {
    Array.prototype.fast = function(t = 1) {
      return this._speed = t, this;
    }, Array.prototype.smooth = function(t = 1) {
      return this._smooth = t, this;
    }, Array.prototype.ease = function(t = "linear") {
      return typeof t == "function" ? (this._smooth = 1, this._ease = t) : ue[t] && (this._smooth = 1, this._ease = ue[t]), this;
    }, Array.prototype.offset = function(t = 0.5) {
      return this._offset = t % 1, this;
    }, Array.prototype.fit = function(t = 0, e = 1) {
      let r = Math.min(...this), n = Math.max(...this);
      var s = this.map((i) => _t(i, r, n, t, e));
      return s._speed = this._speed, s._smooth = this._smooth, s._ease = this._ease, s;
    };
  },
  getValue: (t = []) => ({ time: e, bpm: r }) => {
    let n = t._speed ? t._speed : 1, s = t._smooth ? t._smooth : 0, i = e * n * (r / 60) + (t._offset || 0);
    if (s !== 0) {
      let u = t._ease ? t._ease : ue.linear, f = i - s / 2, v = t[Math.floor(fe(f, t.length))], p = t[Math.floor(fe(f + 1, t.length))], T = Math.min(fe(f, 1) / s, 1);
      return u(T) * (p - v) + v;
    } else
      return t[Math.floor(i % t.length)], t[Math.floor(i % t.length)];
  }
}, bt = (t) => {
  var e = "", r = s(e), n = (i, u) => {
    e += `
      var ${i} = ${u}
    `, r = s(e);
  };
  return {
    addToContext: n,
    eval: (i) => r.eval(i)
  };
  function s(i) {
    globalThis.eval(i);
    var u = function(f) {
      globalThis.eval(f);
    };
    return {
      eval: u
    };
  }
};
class xt {
  constructor(e, r, n = []) {
    this.makeGlobal = r, this.sandbox = bt(), this.parent = e;
    var s = Object.keys(e);
    s.forEach((i) => this.add(i)), this.userProps = n;
  }
  add(e) {
    this.makeGlobal && (window[e] = this.parent[e]);
  }
  // sets on window as well as synth object if global (not needed for objects, which can be set directly)
  set(e, r) {
    this.makeGlobal && (window[e] = r), this.parent[e] = r;
  }
  tick() {
    this.makeGlobal && this.userProps.forEach((e) => {
      this.parent[e] = window[e];
    });
  }
  eval(e) {
    this.sandbox.eval(e);
  }
}
const wt = {
  float: {
    vec4: { name: "sum", args: [[1, 1, 1, 1]] },
    vec2: { name: "sum", args: [[1, 1]] }
  }
}, he = (t) => (t = t.toString(), t.indexOf(".") < 0 && (t += "."), t);
function St(t, e, r) {
  const n = t.transform.inputs, s = t.userArgs, { generators: i } = t.synth, { src: u } = i;
  return n.map((f, v) => {
    const p = {
      value: f.default,
      type: f.type,
      //
      isUniform: !1,
      name: f.name,
      vecLen: 0
      //  generateGlsl: null // function for creating glsl
    };
    if (p.type === "float" && (p.value = he(f.default)), f.type.startsWith("vec"))
      try {
        p.vecLen = Number.parseInt(f.type.substr(3));
      } catch {
        console.log(`Error determining length of vector input type ${f.type} (${f.name})`);
      }
    if (s.length > v) {
      if (p.value = s[v], typeof p.value == "function" && p.value.isHydraFunction) {
        const M = p.value.hydraFunctionName;
        throw new Error(`${t.name}() received the hydra function ${M} without parentheses for argument "${f.name}" - did you mean ${M}()?`);
      }
      if (p.type === "vec4" && !(p.value.type === "GlslSource" || p.value.getTexture))
        throw new Error("Arguments must be a texture or GlslSource");
      typeof s[v] == "function" ? (p.value = (M, F, L) => {
        try {
          const A = s[v](F);
          return typeof A == "number" ? A : (console.warn("function does not return a number", s[v]), f.default);
        } catch (A) {
          return console.warn("ERROR", A), f.default;
        }
      }, p.isUniform = !0) : s[v].constructor === Array && (p.value = (M, F, L) => De.getValue(s[v])(F), p.isUniform = !0);
    }
    if (!(e < 0)) {
      if (p.value && p.value.transforms) {
        const M = p.value.transforms[p.value.transforms.length - 1];
        if (M.transform.glsl_return_type !== f.type) {
          const F = wt[f.type];
          if (typeof F < "u") {
            const L = F[M.transform.glsl_return_type];
            if (typeof L < "u") {
              const { name: A, args: N } = L;
              p.value = p.value[A](...N);
            }
          }
        }
        p.isUniform = !1;
      } else if (p.type === "float" && typeof p.value == "number")
        p.value = he(p.value);
      else if (p.type.startsWith("vec") && typeof p.value == "object" && Array.isArray(p.value))
        p.isUniform = !1, p.value = `${p.type}(${p.value.map(he).join(", ")})`;
      else if (f.type === "sampler2D") {
        var T = p.value;
        if (!T || typeof T.getTexture != "function")
          throw new Error(`${t.name}() expects a texture source (such as s0 or o0) for argument "${f.name}", but received ${T}`);
        p.value = () => T.getTexture(), p.isUniform = !0;
      } else if (p.value.getTexture && f.type === "vec4") {
        var b = p.value;
        p.value = u(b), p.isUniform = !1;
      }
      p.isUniform && (p.name += e);
    }
    return p;
  });
}
function Et(t) {
  var e = {
    uniforms: [],
    // list of uniforms used in shader
    glslFunctions: [],
    // list of functions used in shader
    fragColor: ""
  }, r = Be(t, e)("c", "st");
  e.fragColor = r;
  let n = {};
  return e.uniforms.forEach((s) => n[s.name] = s), e.uniforms = Object.values(n), e;
}
function de(t, e) {
  return `${t}_i${e}`;
}
function Be(t, e) {
  var r = (n, s) => "";
  return t.forEach((n, s) => {
    let i = St(n, e.uniforms.length);
    i.forEach((f) => {
      f.isUniform && e.uniforms.push(f);
    }), Mt(n, e.glslFunctions) || e.glslFunctions.push(n);
    var u = r;
    n.transform.type === "src" ? r = (f, v) => `${W(i, e)(`${f}${s}`, v)}
         vec4 ${f} = ${V(`${f}${s}`, v, n.name, i)};` : n.transform.type === "color" ? r = (f, v) => `${W(i, e)(`${f}${s}`, v)}
         ${u(f, v)}
         ${f} = ${V(`${f}${s}`, `${f}`, n.name, i)};` : n.transform.type === "coord" ? r = (f, v) => `${W(i, e)(`${f}${s}`, v)}
         ${v} = ${V(`${f}${s}`, `${v}`, n.name, i)};
         ${u(f, v)}` : n.transform.type === "combine" ? r = (f, v) => (
      // combining two generated shader strings (i.e. for blend, mult, add funtions)
      `${W(i, e)(`${f}${s}`, v)}
         ${u(f, v)}
         ${f} = ${V(`${f}${s}`, `${f}`, n.name, i)};`
    ) : n.transform.type === "combineCoord" && (r = (f, v) => `${W(i, e)(`${f}${s}`, v)}
         ${v} = ${V(`${f}${s}`, `${v}`, n.name, i)};
         ${u(f, v)}`);
  }), r;
}
function W(t, e) {
  let r = (s, i) => "";
  var n = r;
  return t.forEach((s, i) => {
    s.value.transforms && (n = r, r = (u, f) => {
      let v = de(u, i), p = de(`${f}_${u}`, i);
      return `vec2 ${p} = ${f};${n(u, f)}
         ${Be(s.value.transforms, e)(v, p)}`;
    });
  }), r;
}
function V(t, e, r, n) {
  const s = n.map((i, u) => i.isUniform ? i.name : i.value && i.value.transforms ? de(t, u) : i.value).reduce((i, u) => `${i}, ${u}`, "");
  return `${r}(${e}${s})`;
}
function Mt(t, e) {
  for (var r = 0; r < e.length; r++)
    if (t.name == e[r].name) return !0;
  return !1;
}
const ve = {
  _luminance: {
    type: "util",
    glsl: `float _luminance(vec3 rgb){
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);
      return dot(rgb, W);
    }`
  },
  _noise: {
    type: "util",
    glsl: `
    //	Simplex 3D Noise
    //	by Ian McEwan, Ashima Arts
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float _noise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

  // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
    `
  },
  _rgbToHsv: {
    type: "util",
    glsl: `vec3 _rgbToHsv(vec3 c){
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }`
  },
  _hsvToRgb: {
    type: "util",
    glsl: `vec3 _hsvToRgb(vec3 c){
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }`
  }
};
var Q = function(t) {
  return this.transforms = [], this.transforms.push(t), this.defaultOutput = t.defaultOutput, this.synth = t.synth, this.type = "GlslSource", this.defaultUniforms = t.defaultUniforms, this;
};
Q.prototype.addTransform = function(t) {
  this.transforms.push(t);
};
Q.prototype.out = function(t) {
  var e = t || this.defaultOutput;
  if (e) try {
    var r = this.glsl(e);
    this.synth.currentFunctions = [], e.render(r);
  } catch (n) {
    console.warn("shader could not compile", n);
  }
};
Q.prototype.glsl = function() {
  var t = [], e = [];
  return this.transforms.forEach((r) => {
    r.transform.type === "renderpass" ? console.warn("no support for renderpass") : e.push(r);
  }), e.length > 0 && t.push(this.compile(e)), t;
};
Q.prototype.compile = function(t) {
  var e = Et(t, this.synth), r = {};
  e.uniforms.forEach((i) => {
    r[i.name] = i.value;
  });
  const n = this.synth && this.synth.renderer;
  var s;
  return n && typeof n.buildShader == "function" ? s = n.buildShader(e, {
    precision: this.defaultOutput.precision
  }) : s = `
  precision ${this.defaultOutput.precision} float;
  ${Object.values(e.uniforms).map((i) => {
    let u = i.type;
    return i.type === "texture" && (u = "sampler2D"), `
      uniform ${u} ${i.name};`;
  }).join("")}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;
  uniform sampler2D prevBuffer;

  ${Object.values(ve).map((i) => `
            ${i.glsl}
          `).join("")}

  ${e.glslFunctions.map((i) => `
            ${i.transform.glsl}
          `).join("")}

  void main () {
    vec2 st = gl_FragCoord.xy/resolution.xy;

    ${e.fragColor}
    gl_FragColor = c;
  }
  `, {
    frag: s,
    uniforms: Object.assign({}, this.defaultUniforms, r)
  };
};
const Ue = "vec2 m = step(vec2(0.), p) * step(p, vec2(1.));", Xe = "let m = step(vec2<f32>(0.), p) * step(p, vec2<f32>(1.));", Tt = [
  [0, 0, 0.2],
  [1, 0, 0.12],
  [-1, 0, 0.12],
  [0, 1, 0.12],
  [0, -1, 0.12],
  [0.7071, 0.7071, 0.06],
  [-0.7071, -0.7071, 0.06],
  [0.7071, -0.7071, 0.06],
  [-0.7071, 0.7071, 0.06],
  [2, 0, 0.02],
  [-2, 0, 0.02],
  [0, 2, 0.02],
  [0, -2, 0.02]
], ee = (t) => Number.isInteger(t) ? `${t}.` : `${t}`, Ce = (t, e) => {
  const r = t === "wgsl" ? "vec2<f32>" : "vec2", n = (i) => t === "wgsl" ? `textureSample(tex, samptex, ${i})` : `texture2D(tex, ${i})`, s = t === "wgsl" ? ["let r = vec2<f32>(radius, radius * resolution.x / resolution.y);", "var c = vec4<f32>(0.);", "var p: vec2<f32>;"] : ["vec2 r = vec2(radius, radius * resolution.x / resolution.y);", "vec4 c = vec4(0.);", "vec2 p;"];
  e && s.push(t === "wgsl" ? "var m: vec2<f32>;" : "vec2 m;");
  for (const [i, u, f] of Tt)
    s.push(`p = _st + ${r}(${ee(i)}, ${ee(u)}) * r;`), e ? (s.push((t === "wgsl" ? Xe : Ue).replace(/^(let|vec2) m =/, "m =")), s.push(`c += ${n("p")} * (m.x * m.y) * ${ee(f)};`)) : s.push(`c += ${n("fract(p)")} * ${ee(f)};`);
  return s.push("return c;"), s.map((i) => "   " + i).join(`
`);
}, Fe = (t, e) => ({
  name: t,
  type: "src",
  inputs: [
    { type: "sampler2D", name: "tex", default: NaN },
    { type: "float", name: "radius", default: 5e-3 }
  ],
  glsl: Ce("glsl", e),
  wgsl: Ce("wgsl", e)
}), $t = () => [
  {
    name: "noise",
    type: "src",
    inputs: [
      {
        type: "float",
        name: "scale",
        default: 10
      },
      {
        type: "float",
        name: "offset",
        default: 0.1
      }
    ],
    glsl: "   return vec4(vec3(_noise(vec3(_st*scale, offset*time))), 1.0);",
    wgsl: "   return vec4<f32>(vec3<f32>(_noise(vec3(_st*scale, offset*time))), 1.0);",
    needs: ["_noise"]
  },
  {
    name: "voronoi",
    type: "src",
    inputs: [
      {
        type: "float",
        name: "scale",
        default: 5
      },
      {
        type: "float",
        name: "speed",
        default: 0.3
      },
      {
        type: "float",
        name: "blending",
        default: 0.3
      }
    ],
    glsl: `   vec3 color = vec3(.0);
   // Scale
   _st *= scale;
   // Tile the space
   vec2 i_st = floor(_st);
   vec2 f_st = fract(_st);
   float m_dist = 10.;  // minimun distance
   vec2 m_point;        // minimum point
   for (int j=-1; j<=1; j++ ) {
   for (int i=-1; i<=1; i++ ) {
   vec2 neighbor = vec2(float(i),float(j));
   vec2 p = i_st + neighbor;
   vec2 point = fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
   point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
   vec2 diff = neighbor + point - f_st;
   float dist = length(diff);
   if( dist < m_dist ) {
   m_dist = dist;
   m_point = point;
   }
   }
   }
   // Assign a color using the closest point position
   color += dot(m_point,vec2(.3,.6));
   color *= 1.0 - blending*m_dist;
   return vec4(color, 1.0);`,
    wgsl: `
	 var color = vec3<f32>(.0);
   // Scale
   var st = _st * scale;
   // Tile the space
   let i_st = floor(st);
   let f_st = fract(st);
   var m_dist : f32 = 10.;  // minimun distance
   var m_point : vec2<f32>; // minimum point
   for (var j=-1; j<=1; j++ ) {
   for (var i=-1; i<=1; i++ ) {
   var neighbor = vec2<f32>(f32(i),f32(j));
   var p = i_st + neighbor;
   var point = fract(sin(vec2<f32>(dot(p,vec2<f32>(127.1,311.7)),dot(p,vec2<f32>(269.5,183.3))))*43758.5453);
   point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
   let diff = neighbor + point - f_st;
   let dist = length(diff);
   if( dist < m_dist ) {
   m_dist = dist;
   m_point = point;
   }
   }
   }
   // Assign a color using the closest point position
   color = color + dot(m_point,vec2<f32>(.3,.6));
   color = color * (1.0 - blending*m_dist);
 return vec4<f32>(color, 1.0);
`
  },
  {
    name: "osc",
    type: "src",
    inputs: [
      {
        type: "float",
        name: "frequency",
        default: 60
      },
      {
        type: "float",
        name: "sync",
        default: 0.1
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: `   vec2 st = _st;
   float r = sin((st.x-offset/frequency+time*sync)*frequency)*0.5  + 0.5;
   float g = sin((st.x+time*sync)*frequency)*0.5 + 0.5;
   float b = sin((st.x+offset/frequency+time*sync)*frequency)*0.5  + 0.5;
   return vec4(r, g, b, 1.0);`,
    wgsl: `  var st = vec2<f32>(_st);
   let r = f32(sin((st.x-offset/frequency+time*sync)*frequency)*0.5  + 0.5);
   let g = f32(sin((st.x+time*sync)*frequency)*0.5 + 0.5);
   let b = f32(sin((st.x+offset/frequency+time*sync)*frequency)*0.5  + 0.5);
   return vec4<f32>(r, g, b, 1.0);`
  },
  {
    name: "shape",
    type: "src",
    inputs: [
      {
        type: "float",
        name: "sides",
        default: 3
      },
      {
        type: "float",
        name: "radius",
        default: 0.3
      },
      {
        type: "float",
        name: "smoothing",
        default: 0.01
      }
    ],
    glsl: `   vec2 st = _st * 2. - 1.;
   // Angle and radius from the current pixel
   float a = atan(st.x,st.y)+3.1416;
   float r = (2.*3.1416)/sides;
   float d = cos(floor(.5+a/r)*r-a)*length(st);
   return vec4(vec3(1.0-smoothstep(radius,radius + smoothing + 0.0000001,d)), 1.0);`,
    wgsl: `  var st = _st * 2. - 1.;
   // Angle and radius from the current pixel
   let a = f32(atan2(st.x,st.y)+3.1416);
   let r = f32((2.*3.1416)/sides);
   let d = f32(cos(floor(.5+a/r)*r-a)*length(st));
   return vec4<f32>(vec3<f32>(1.0-smoothstep(radius,radius + smoothing + 0.0000001,d)), 1.0);`
  },
  {
    name: "gradient",
    type: "src",
    inputs: [
      {
        type: "float",
        name: "speed",
        default: 0
      }
    ],
    glsl: "   return vec4(_st, sin(time*speed), 1.0);",
    wgsl: "   return vec4<f32>(_st, sin(time*speed), 1.0);"
  },
  {
    name: "src",
    type: "src",
    inputs: [
      {
        type: "sampler2D",
        name: "tex",
        default: NaN
      }
    ],
    strange: !0,
    glsl: `   //  vec2 uv = gl_FragCoord.xy/vec2(1280., 720.);
   return texture2D(tex, fract(_st));`,
    // This variant should not be actually used as the texture sampler stuff
    // is handled explicitly in generateGlsl.
    wgsl: `
//		return texture2D(tex, fract(_st));`
  },
  {
    name: "srcb",
    type: "src",
    inputs: [
      {
        type: "sampler2D",
        name: "tex",
        default: NaN
      }
    ],
    // src() that reads black beyond the texture instead of wrapping: what a camera sees past
    // the monitor. Use it on feedback paths that model a camera (blurb() is the blurred one).
    glsl: `   vec2 p = _st;
   ${Ue}
   return texture2D(tex, p) * (m.x * m.y);`,
    wgsl: `   let p = _st;
   ${Xe}
   return textureSample(tex, samptex, p) * (m.x * m.y);`
  },
  {
    name: "solid",
    type: "src",
    inputs: [
      {
        type: "float",
        name: "r",
        default: 0
      },
      {
        type: "float",
        name: "g",
        default: 0
      },
      {
        type: "float",
        name: "b",
        default: 0
      },
      {
        type: "float",
        name: "a",
        default: 1
      }
    ],
    glsl: "   return vec4(r, g, b, a);",
    wgsl: "   return vec4<f32>(r, g, b, a);"
  },
  {
    name: "rotate",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "angle",
        default: 10
      },
      {
        type: "float",
        name: "speed",
        default: 0
      }
    ],
    glsl: `   vec2 xy = _st - vec2(0.5);
   float ang = angle + speed *time;
   xy = mat2(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;
   xy += 0.5;
   return xy;`,
    wgsl: `  var xy = _st - vec2<f32>(0.5);
   let ang = f32(angle + speed *time);
   xy = mat2x2<f32>(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;
   xy = xy + 0.5;
   return xy;`
  },
  {
    name: "scale",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1.5
      },
      {
        type: "float",
        name: "xMult",
        default: 1
      },
      {
        type: "float",
        name: "yMult",
        default: 1
      },
      {
        type: "float",
        name: "offsetX",
        default: 0.5
      },
      {
        type: "float",
        name: "offsetY",
        default: 0.5
      }
    ],
    glsl: `   vec2 xy = _st - vec2(offsetX, offsetY);
   xy*=(1.0/vec2(amount*xMult, amount*yMult));
   xy+=vec2(offsetX, offsetY);
   return xy;
   `,
    wgsl: `  var xy = _st - vec2<f32>(offsetX, offsetY);
   xy = xy * (1.0/vec2<f32>(amount*xMult, amount*yMult));
   xy = xy + vec2<f32>(offsetX, offsetY);
   return xy;
   `
  },
  {
    name: "pixelate",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "pixelX",
        default: 20
      },
      {
        type: "float",
        name: "pixelY",
        default: 20
      }
    ],
    glsl: `   vec2 xy = vec2(pixelX, pixelY);
   return (floor(_st * xy) + 0.5)/xy;`,
    wgsl: `  let xy = vec2<f32>(pixelX, pixelY);
   return (floor(_st * xy) + 0.5)/xy;`
  },
  {
    name: "posterize",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "bins",
        default: 3
      },
      {
        type: "float",
        name: "gamma",
        default: 0.6
      }
    ],
    glsl: `   vec4 c2 = pow(_c0, vec4(gamma));
   c2 *= vec4(bins);
   c2 = floor(c2);
   c2/= vec4(bins);
   c2 = pow(c2, vec4(1.0/gamma));
   return vec4(c2.xyz, _c0.a);`,
    wgsl: `  var c2 : vec4<f32> = pow(_c0, vec4<f32>(gamma));
   c2 = c2 * vec4(bins);
   c2 = floor(c2);
   c2/= vec4(bins);
   c2 = pow(c2, vec4<f32>(1.0/gamma));
   return vec4<f32>(c2.xyz, _c0.a);`
  },
  {
    name: "shift",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "r",
        default: 0.5
      },
      {
        type: "float",
        name: "g",
        default: 0
      },
      {
        type: "float",
        name: "b",
        default: 0
      },
      {
        type: "float",
        name: "a",
        default: 0
      }
    ],
    glsl: `   vec4 c2 = vec4(_c0);
   c2.r = fract(c2.r + r);
   c2.g = fract(c2.g + g);
   c2.b = fract(c2.b + b);
   c2.a = fract(c2.a + a);
   return vec4(c2.rgba);`,
    wgsl: `  var c2 = vec4<f32>(_c0);
   c2.r = fract(c2.r + r);
   c2.g = fract(c2.g + g);
   c2.b = fract(c2.b + b);
   c2.a = fract(c2.a + a);
   return vec4<f32>(c2.rgba);`
  },
  {
    name: "repeat",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "repeatX",
        default: 3
      },
      {
        type: "float",
        name: "repeatY",
        default: 3
      },
      {
        type: "float",
        name: "offsetX",
        default: 0
      },
      {
        type: "float",
        name: "offsetY",
        default: 0
      }
    ],
    glsl: `   vec2 st = _st * vec2(repeatX, repeatY);
   st.x += step(1., mod(st.y,2.0)) * offsetX;
   st.y += step(1., mod(st.x,2.0)) * offsetY;
   return fract(st);`,
    wgsl: `  var st = _st * vec2<f32>(repeatX, repeatY);
   st.x = st.x + (step(1., _mod(st.y, 2.0)) * offsetX);
   st.y = st.y + (step(1., _mod(st.x, 2.0)) * offsetY);
   return fract(st);`
  },
  {
    name: "modulateRepeat",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "repeatX",
        default: 3
      },
      {
        type: "float",
        name: "repeatY",
        default: 3
      },
      {
        type: "float",
        name: "offsetX",
        default: 0.5
      },
      {
        type: "float",
        name: "offsetY",
        default: 0.5
      }
    ],
    glsl: `   vec2 st = _st * vec2(repeatX, repeatY);
   st.x += step(1., mod(st.y,2.0)) + _c0.r * offsetX;
   st.y += step(1., mod(st.x,2.0)) + _c0.g * offsetY;
   return fract(st);`,
    wgsl: `  var st = _st * vec2<f32>(repeatX, repeatY);
   st.x = st.x + (step(1., _mod(st.y, 2.0)) + _c0.r * offsetX);
   st.y = st.y + (step(1., _mod(st.x, 2.0)) + _c0.g * offsetY);
   return fract(st);`
  },
  {
    name: "repeatX",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "reps",
        default: 3
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: `   vec2 st = _st * vec2(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y += step(1., mod(st.x,2.0))* offset;
   return fract(st);`,
    wgsl: `   var st = _st * vec2<f32>(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y = st.y + (step(1., _mod(st.x, 2.0))* offset);
   return fract(st);`
  },
  {
    name: "modulateRepeatX",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "reps",
        default: 3
      },
      {
        type: "float",
        name: "offset",
        default: 0.5
      }
    ],
    glsl: `   vec2 st = _st * vec2(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y += step(1., mod(st.x,2.0)) + _c0.r * offset;
   return fract(st);`,
    wgsl: `  var st = _st * vec2<f32>(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y = st.y + (step(1., _mod(st.x, 2.0)) + _c0.r * offset);
   return fract(st);`
  },
  {
    name: "repeatY",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "reps",
        default: 3
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: `   vec2 st = _st * vec2(1.0, reps);
   //  float f =  mod(_st.y,2.0);
   st.x += step(1., mod(st.y,2.0))* offset;
   return fract(st);`,
    wgsl: `   var st = _st * vec2<f32>(1.0, reps);
   //  float f =  mod(_st.y,2.0);
   st.x = st.x + (step(1., _mod(st.y, 2.0))* offset);
   return fract(st);`
  },
  {
    name: "modulateRepeatY",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "reps",
        default: 3
      },
      {
        type: "float",
        name: "offset",
        default: 0.5
      }
    ],
    glsl: `   vec2 st = _st * vec2(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.x += step(1., mod(st.y,2.0)) + _c0.r * offset;
   return fract(st);`,
    wgsl: `   var st = _st * vec2<f32>(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.x = st.x + (step(1., _mod(st.y,2.0)) + _c0.r * offset);
   return fract(st);`
  },
  {
    name: "kaleid",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "nSides",
        default: 4
      }
    ],
    glsl: `   vec2 st = _st;
   st -= 0.5;
   float r = length(st);
   float a = atan(st.y, st.x);
   float pi = 2.*3.1416;
   a = mod(a,pi/nSides);
   a = abs(a-pi/nSides/2.);
   return r*vec2(cos(a), sin(a));`,
    wgsl: `  var st = _st;
   st = st - 0.5;
   let r : f32 = length(st);
   var a : f32 = atan2(st.y, st.x);
   let pi : f32 = 2.*3.1416;
   a = _mod(a, pi/nSides);
   a = abs(a-pi/nSides/2.);
   return r*vec2<f32>(cos(a), sin(a));`
  },
  {
    name: "modulateKaleid",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "nSides",
        default: 4
      }
    ],
    glsl: `   vec2 st = _st - 0.5;
   float r = length(st);
   float a = atan(st.y, st.x);
   float pi = 2.*3.1416;
   a = mod(a,pi/nSides);
   a = abs(a-pi/nSides/2.);
   return (_c0.r+r)*vec2(cos(a), sin(a));`,
    wgsl: `  var st = _st - 0.5;
   let r : f32= length(st);
   var a : f32 = atan2(st.y, st.x);
   let pi : f32= 2.*3.1416;
   a = _mod(a,pi/nSides);
   a = abs(a-pi/nSides/2.);
   return (_c0.r+r)*vec2<f32>(cos(a), sin(a));`
  },
  {
    name: "offset",
    type: "coord",
    inputs: [
      { type: "float", name: "x", default: 0 },
      { type: "float", name: "y", default: 0 }
    ],
    // scroll() without the fract(): a translate that lets coordinates leave 0..1, so srcb()/blurb()
    // can read black there. A camera moved off the monitor's axis, not a texture scrolled round.
    glsl: "   return _st + vec2(x, y);",
    wgsl: "   return _st + vec2<f32>(x, y);"
  },
  {
    name: "tilt",
    type: "coord",
    inputs: [
      { type: "float", name: "pitch", default: 0 },
      { type: "float", name: "yaw", default: 0 },
      { type: "float", name: "dist", default: 2.5 }
    ],
    // A pinhole camera looking at a monitor that is turned away from it: the perspective (keystone)
    // that scale/rotate/offset cannot make. Camera at the origin looking down +z, monitor of half-size 1
    // centred at (0, 0, dist), turned by pitch about x (positive: its top leans away) and yaw about y
    // (positive: its right edge leans away). Framed so zero tilt is the identity; dist sets how strong
    // the perspective is (2.5 is a normal lens, 1 a very wide one). Coordinates off the monitor come
    // back far outside 0..1, so srcb()/blurb() read black there and src() wraps as it always did.
    glsl: `   vec2 u = _st * 2.0 - 1.0;
   float cp = cos(pitch), sp = sin(pitch), cy = cos(yaw), sy = sin(yaw);
   vec3 X = vec3(cy, 0.0, -sy);
   vec3 Y = vec3(sy * sp, cp, cy * sp);
   vec3 N = vec3(sy * cp, -sp, cy * cp);
   vec3 d = vec3(u, dist);
   float denom = dot(d, N);
   if (denom <= 1e-4) return vec2(-10.0);
   vec3 P = (dist * N.z / denom) * d - vec3(0.0, 0.0, dist);
   return vec2(dot(P, X), dot(P, Y)) * 0.5 + 0.5;`,
    wgsl: `   let u = _st * 2.0 - 1.0;
   let cp = cos(pitch); let sp = sin(pitch); let cy = cos(yaw); let sy = sin(yaw);
   let X = vec3<f32>(cy, 0.0, -sy);
   let Y = vec3<f32>(sy * sp, cp, cy * sp);
   let N = vec3<f32>(sy * cp, -sp, cy * cp);
   let d = vec3<f32>(u, dist);
   let denom = dot(d, N);
   if (denom <= 1e-4) { return vec2<f32>(-10.0); }
   let P = (dist * N.z / denom) * d - vec3<f32>(0.0, 0.0, dist);
   return vec2<f32>(dot(P, X), dot(P, Y)) * 0.5 + 0.5;`
  },
  {
    name: "scroll",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "scrollX",
        default: 0.5
      },
      {
        type: "float",
        name: "scrollY",
        default: 0.5
      },
      {
        type: "float",
        name: "speedX",
        default: 0
      },
      {
        type: "float",
        name: "speedY",
        default: 0
      }
    ],
    glsl: `
   _st.x += scrollX + time*speedX;
   _st.y += scrollY + time*speedY;
   return fract(_st);`,
    wgsl: `
	 var st : vec2<f32> = _st;
   st.x = st.x + (scrollX + time*speedX);
   st.y =  st.y + (scrollY + time*speedY);
   return fract(st);`
  },
  {
    name: "scrollX",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "scrollX",
        default: 0.5
      },
      {
        type: "float",
        name: "speed",
        default: 0
      }
    ],
    glsl: `   _st.x += scrollX + time*speed;
   return fract(_st);`,
    wgsl: `  var st : vec2<f32>  = _st;
	 st.x = st.x + (scrollX + time*speed);
   return fract(st);`
  },
  {
    name: "modulateScrollX",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "scrollX",
        default: 0.5
      },
      {
        type: "float",
        name: "speed",
        default: 0
      }
    ],
    glsl: `   _st.x += _c0.r*scrollX + time*speed;
   return fract(_st);`,
    wgsl: `   var st : vec2<f32>  = _st; 
	  st.x = st.x + (_c0.r*scrollX + time*speed);
   return fract(st);`
  },
  {
    name: "scrollY",
    type: "coord",
    inputs: [
      {
        type: "float",
        name: "scrollY",
        default: 0.5
      },
      {
        type: "float",
        name: "speed",
        default: 0
      }
    ],
    glsl: `   _st.y += scrollY + time*speed;
   return fract(_st);`,
    wgsl: `  var st : vec2<f32>  = _st;
   st.y = st.y + (scrollY + time*speed);
   return fract(st);`
  },
  {
    name: "modulateScrollY",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "scrollY",
        default: 0.5
      },
      {
        type: "float",
        name: "speed",
        default: 0
      }
    ],
    glsl: `   _st.y += _c0.r*scrollY + time*speed;
   return fract(_st);`,
    wgsl: `  var st : vec2<f32>  = _st;
   st.y = st.y + (_c0.r*scrollY + time*speed);
   return fract(st);`
  },
  {
    name: "add",
    type: "combine",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1
      }
    ],
    glsl: "   return (_c0+_c1)*amount + _c0*(1.0-amount);",
    wgsl: "   return (_c0+_c1)*amount + _c0*(1.0-amount);"
  },
  {
    name: "sub",
    type: "combine",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1
      }
    ],
    glsl: "   return (_c0-_c1)*amount + _c0*(1.0-amount);",
    wgsl: "   return (_c0-_c1)*amount + _c0*(1.0-amount);"
  },
  {
    name: "layer",
    type: "combine",
    inputs: [],
    glsl: "   return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));",
    wgsl: "   return vec4<f32>(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));"
  },
  {
    name: "blend",
    type: "combine",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 0.5
      }
    ],
    glsl: "   return _c0*(1.0-amount)+_c1*amount;",
    wgsl: "   return _c0*(1.0-amount)+_c1*amount;"
  },
  {
    name: "mult",
    type: "combine",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1
      }
    ],
    glsl: "   return _c0*(1.0-amount)+(_c0*_c1)*amount;",
    wgsl: "   return _c0*(1.0-amount)+(_c0*_c1)*amount;"
  },
  {
    name: "diff",
    type: "combine",
    inputs: [],
    glsl: "   return vec4(abs(_c0.rgb-_c1.rgb), max(_c0.a, _c1.a));",
    wgsl: "   return vec4<f32>(abs(_c0.rgb-_c1.rgb), max(_c0.a, _c1.a));"
  },
  {
    name: "modulate",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 0.1
      }
    ],
    glsl: `   //  return fract(st+(_c0.xy-0.5)*amount);
   return _st + _c0.xy*amount;`,
    wgsl: `   //  return fract(st+(_c0.xy-0.5)*amount);
   return _st + _c0.xy*amount;`
  },
  {
    name: "modulateScale",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "multiple",
        default: 1
      },
      {
        type: "float",
        name: "offset",
        default: 1
      }
    ],
    glsl: `   vec2 xy = _st - vec2(0.5);
   xy*=(1.0/vec2(offset + multiple*_c0.r, offset + multiple*_c0.g));
   xy+=vec2(0.5);
   return xy;`,
    wgsl: `  var xy : vec2<f32> = _st - vec2<f32>(0.5);
   xy =xy *(1.0/vec2<f32>(offset + multiple*_c0.r, offset + multiple*_c0.g));
   xy= xy + vec2<f32>(0.5);
   return xy;`
  },
  {
    name: "modulatePixelate",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "multiple",
        default: 10
      },
      {
        type: "float",
        name: "offset",
        default: 3
      }
    ],
    glsl: `   vec2 xy = vec2(offset + _c0.x*multiple, offset + _c0.y*multiple);
   return (floor(_st * xy) + 0.5)/xy;`,
    wgsl: `   let xy : vec2<f32> = vec2<f32>(offset + _c0.x*multiple, offset + _c0.y*multiple);
   return (floor(_st * xy) + 0.5)/xy;`
  },
  {
    name: "modulateRotate",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "multiple",
        default: 1
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: `   vec2 xy = _st - vec2(0.5);
   float angle = offset + _c0.x * multiple;
   xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
   xy += 0.5;
   return xy;`,
    wgsl: `  var xy : vec2<f32> = _st - vec2<f32>(0.5);
   let angle = offset + _c0.x * multiple;
   xy = mat2x2<f32>(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
   xy = xy +  0.5;
   return xy;`
  },
  {
    name: "modulateHue",
    type: "combineCoord",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1
      }
    ],
    glsl: "   return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0/resolution);",
    wgsl: "   return _st + (vec2<f32>(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0/resolution);"
  },
  {
    name: "invert",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1
      }
    ],
    glsl: "   return vec4((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);",
    wgsl: "   return vec4<f32>((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);"
  },
  {
    name: "contrast",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 1.6
      }
    ],
    glsl: `   vec4 c = (_c0-vec4(0.5))*vec4(amount) + vec4(0.5);
   return vec4(c.rgb, _c0.a);`,
    wgsl: `   let c = vec4<f32> ((_c0-vec4(0.5))*vec4(amount) + vec4(0.5));
   return vec4<f32>(c.rgb, _c0.a);`
  },
  {
    // Negative light back into gamut without adding any. A chroma rotation or a saturation above 1 keeps luminance
    // but can push a channel below zero; a plain floor (max 0) then raises the luminance, and in a feedback loop
    // that is a gain the knobs never asked for. Here the colour is pulled toward its own luminance just far enough
    // for the lowest channel to reach zero: hue and luminance stay. In-gamut colours pass through untouched, exactly.
    // Not for a feedback path: applied every pass it bleeds chroma away (an overdriven loop goes white, a quiet one grey).
    // There a plain floor is the better rail, as on real monitors; this is for a single pass that must not gain light.
    name: "ingamut",
    type: "color",
    inputs: [],
    glsl: `   vec3 c = _c0.rgb;
   float mn = min(c.r, min(c.g, c.b));
   if (mn >= 0.0) return _c0;
   float y = dot(c, vec3(0.299, 0.587, 0.114));
   if (y <= 0.0) return vec4(0.0, 0.0, 0.0, _c0.a);
   return vec4(vec3(y) + (c - vec3(y)) * (y / (y - mn)), _c0.a);`,
    wgsl: `   let c = _c0.rgb;
   let mn = min(c.r, min(c.g, c.b));
   if (mn >= 0.0) { return _c0; }
   let y = dot(c, vec3<f32>(0.299, 0.587, 0.114));
   if (y <= 0.0) { return vec4<f32>(0.0, 0.0, 0.0, _c0.a); }
   return vec4<f32>(vec3<f32>(y) + (c - vec3<f32>(y)) * (y / (y - mn)), _c0.a);`
  },
  {
    // Alpha back to a known value (1 by default). Hydra's blend/add/mult treat alpha as a fourth number and
    // srcb/blurb/luma/mask write it, so at the end of a feedback chain it is whatever the path left; with float
    // outputs nothing clamps it on the way round. End a loop with opaque() unless alpha is meant to carry something.
    name: "opaque",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "alpha",
        default: 1
      }
    ],
    glsl: "   return vec4(_c0.rgb, alpha);",
    wgsl: "   return vec4<f32>(_c0.rgb, alpha);"
  },
  {
    // Moves alpha by delta and nothing else: a' = clamp(a + delta, 0, 1). In a feedback loop written with
    // out(o, { blend: 'replace' }) (the write that keeps alpha) it is a counter riding on every pixel: negative counts
    // down to expiry (time to live: -0.01 is a life of 100 passes), positive counts up. Alpha is how much of a pixel is
    // shown (the blit to the canvas and layer() both go by it), so 0 is no-show and anything between is a fade, up or
    // down; the colour underneath is left as it is. On 8 bit outputs a delta under about 0.002 rounds away to
    // nothing; use float outputs for long lives. Test: dev/test-alpha.html
    name: "age",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "delta",
        default: -0.01
      }
    ],
    glsl: "   return vec4(_c0.rgb, clamp(_c0.a + delta, 0.0, 1.0));",
    wgsl: "   return vec4<f32>(_c0.rgb, clamp(_c0.a + delta, 0.0, 1.0));"
  },
  {
    // Any affine colour transform in one step: rgb' = M * rgb + offset. Rows first (rr rg rb = what red is made
    // of), then the offset (ro go bo). Hue, saturation, brightness, contrast, white point and per-channel gain are
    // all special cases; composed into one matrix they cost one multiply, behave on values past 0..1 (hue() goes
    // through HSV, which does not), and at neutral are exactly the identity, so nothing ratchets round a loop.
    name: "colormat",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "rr",
        default: 1
      },
      {
        type: "float",
        name: "rg",
        default: 0
      },
      {
        type: "float",
        name: "rb",
        default: 0
      },
      {
        type: "float",
        name: "gr",
        default: 0
      },
      {
        type: "float",
        name: "gg",
        default: 1
      },
      {
        type: "float",
        name: "gb",
        default: 0
      },
      {
        type: "float",
        name: "br",
        default: 0
      },
      {
        type: "float",
        name: "bg",
        default: 0
      },
      {
        type: "float",
        name: "bb",
        default: 1
      },
      {
        type: "float",
        name: "ro",
        default: 0
      },
      {
        type: "float",
        name: "go",
        default: 0
      },
      {
        type: "float",
        name: "bo",
        default: 0
      }
    ],
    glsl: `   vec3 c = _c0.rgb;
   return vec4(dot(vec3(rr, rg, rb), c) + ro, dot(vec3(gr, gg, gb), c) + go, dot(vec3(br, bg, bb), c) + bo, _c0.a);`,
    wgsl: `   let c = _c0.rgb;
   return vec4<f32>(dot(vec3<f32>(rr, rg, rb), c) + ro, dot(vec3<f32>(gr, gg, gb), c) + go, dot(vec3<f32>(br, bg, bb), c) + bo, _c0.a);`
  },
  {
    // The rails of a video amplifier: untouched below half the headroom, bending asymptotically onto it
    // above (the arms meet in value and slope), floored at black. After lightherder's front panel. With
    // float outputs an overdriven feedback loop settles into structure instead of a flat white.
    name: "knee",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "headroom",
        default: 2
      },
      {
        // 0: each channel bends on its own (a bright colour pales toward white as it nears the rail, as on a real
        //    monitor). 1: the brightest channel sets one factor for all three, so hue and saturation are kept and only
        //    brightness is limited. In between blends the two. In a feedback loop that turns chroma with a matrix, 0 sends
        //    an overdriven centre to white; 1 lets it rest on saturated colour, as Hydra's HSV hue() did by construction.
        type: "float",
        name: "keep",
        default: 0
      }
    ],
    glsl: `   vec3 x = max(_c0.rgb, vec3(1e-6));
   vec3 bent = vec3(headroom) - vec3(headroom * headroom) / (4.0 * x);
   vec3 per = max(mix(bent, _c0.rgb, step(x, vec3(0.5 * headroom))), vec3(0.0));
   vec3 f = max(_c0.rgb, vec3(0.0));
   float m = max(max(f.r, f.g), max(f.b, 1e-6));
   float km = m <= 0.5 * headroom ? m : headroom - headroom * headroom / (4.0 * m);
   return vec4(mix(per, f * (km / m), keep), _c0.a);`,
    wgsl: `   let x = max(_c0.rgb, vec3<f32>(1e-6));
   let bent = vec3<f32>(headroom) - vec3<f32>(headroom * headroom) / (4.0 * x);
   let per = max(mix(bent, _c0.rgb, step(x, vec3<f32>(0.5 * headroom))), vec3<f32>(0.0));
   let f = max(_c0.rgb, vec3<f32>(0.0));
   let m = max(max(f.r, f.g), max(f.b, 1e-6));
   let km = select(headroom - headroom * headroom / (4.0 * m), m, m <= 0.5 * headroom);
   return vec4<f32>(mix(per, f * (km / m), keep), _c0.a);`
  },
  {
    name: "brightness",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 0.4
      }
    ],
    glsl: "   return vec4(_c0.rgb + vec3(amount), _c0.a);",
    wgsl: "   return vec4<f32>(_c0.rgb + vec3<f32>(amount), _c0.a);"
  },
  {
    name: "mask",
    type: "combine",
    inputs: [],
    glsl: `   float a = _luminance(_c1.rgb);
  return vec4(_c0.rgb*a, a*_c0.a);`,
    wgsl: `   let a = _luminance(_c1.rgb);
  return vec4<f32>(_c0.rgb*a, a*_c0.a);`
  },
  {
    name: "luma",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "threshold",
        default: 0.5
      },
      {
        type: "float",
        name: "tolerance",
        default: 0.1
      }
    ],
    glsl: `   float a = smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb));
   return vec4(_c0.rgb*a, a);`,
    wgsl: `   let a : f32 = smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb));
   return vec4<f32>(_c0.rgb*a, a);`
  },
  {
    name: "thresh",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "threshold",
        default: 0.5
      },
      {
        type: "float",
        name: "tolerance",
        default: 0.04
      }
    ],
    glsl: "   return vec4(vec3(smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb))), _c0.a);",
    wgsl: "   return vec4<f32>(vec3<f32>(smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb))), _c0.a);"
  },
  {
    name: "color",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "r",
        default: 1
      },
      {
        type: "float",
        name: "g",
        default: 1
      },
      {
        type: "float",
        name: "b",
        default: 1
      },
      {
        type: "float",
        name: "a",
        default: 1
      }
    ],
    glsl: `   vec4 c = vec4(r, g, b, a);
   vec4 pos = step(0.0, c); // detect whether negative
   // if > 0, return r * _c0
   // if < 0 return (1.0-r) * _c0
   return vec4(mix((1.0-_c0)*abs(c), c*_c0, pos));`,
    wgsl: `  let c = vec4<f32>(r, g, b, a);
   let pos : vec4<f32> = step(vec4<f32>(0.0), c); // detect whether negative
   // if > 0, return r * _c0
   // if < 0 return (1.0-r) * _c0
   return vec4<f32>(mix((1.0-_c0)*abs(c), c*_c0, pos));`
  },
  {
    name: "saturate",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 2
      }
    ],
    glsl: `   const vec3 W = vec3(0.2125, 0.7154, 0.0721);
   vec3 intensity = vec3(dot(_c0.rgb, W));
   return vec4(mix(intensity, _c0.rgb, amount), _c0.a);`,
    wgsl: `   const W = vec3<f32>(0.2125, 0.7154, 0.0721);
    let intensity = vec3<f32>(dot(_c0.rgb, W));
   return vec4<f32>(mix(intensity, _c0.rgb, amount), _c0.a);`
  },
  {
    name: "hue",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "hue",
        default: 0.4
      }
    ],
    glsl: `   vec3 c = _rgbToHsv(_c0.rgb);
   c.r += hue;
   //  c.r = fract(c.r);
   return vec4(_hsvToRgb(c), _c0.a);`,
    wgsl: `   var c  = _rgbToHsv(_c0.rgb);
   c.r = c.r + hue;
   //  c.r = fract(c.r);
   return vec4<f32>(_hsvToRgb(c), _c0.a);`,
    needs: ["_rgbToHsv", "_hsvToRgb"]
  },
  {
    name: "colorama",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "amount",
        default: 5e-3
      }
    ],
    glsl: `   vec3 c = _rgbToHsv(_c0.rgb);
   c += vec3(amount);
   c = _hsvToRgb(c);
   c = fract(c);
   return vec4(c, _c0.a);`,
    wgsl: `  var c : vec3<f32> = _rgbToHsv(_c0.rgb);
   c = c + vec3<f32>(amount);
   c = _hsvToRgb(c);
   c = fract(c);
   return vec4<f32>(c, _c0.a);`,
    needs: ["_rgbToHsv", "_hsvToRgb"]
  },
  Fe("blur", !1),
  Fe("blurb", !0),
  {
    name: "prev",
    type: "src",
    inputs: [],
    glsl: "   return texture2D(prevBuffer, fract(_st));",
    // There is only one preview sampler per render chain
    // so we can get away with using an unmodified name.
    wgsl: "   return samplerprev(prevBuffer, fract(_st));"
  },
  {
    name: "sum",
    type: "color",
    inputs: [
      {
        type: "vec4",
        name: "scale",
        default: [1, 1, 1, 1]
      }
    ],
    glsl: `   vec4 v = _c0 * scale;
   return vec4(vec3(v.r + v.g + v.b + v.a), _c0.a);
   }
   float sum(vec2 _st, vec4 scale) { // vec4 is not a typo, because argument type is not overloaded
   vec2 v = _st.xy * scale.xy;
   return v.x + v.y;`,
    wgsl: `   let v : vec4<f32> = _c0 * scale;
   return vec4<f32>(vec3<f32>(v.r + v.g + v.b + v.a), _c0.a);
   }
   fn sum( _st : vec2<f32>, scale : vec4<f32>) -> f32 { // vec4 is not a typo, because argument type is not overloaded
   let v : vec2<f32> = _st.xy * scale.xy;
   return v.x + v.y;`
  },
  {
    name: "r",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "scale",
        default: 1
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: "   return vec4(_c0.r * scale + offset);",
    wgsl: "   return vec4<f32>(_c0.r * scale + offset);"
  },
  {
    name: "g",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "scale",
        default: 1
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: "   return vec4(_c0.g * scale + offset);",
    wgsl: "   return vec4<f32>(_c0.g * scale + offset);"
  },
  {
    name: "b",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "scale",
        default: 1
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: "   return vec4(_c0.b * scale + offset);",
    wgsl: "   return vec4<f32>(_c0.b * scale + offset);"
  },
  {
    name: "a",
    type: "color",
    inputs: [
      {
        type: "float",
        name: "scale",
        default: 1
      },
      {
        type: "float",
        name: "offset",
        default: 0
      }
    ],
    glsl: "   return vec4(_c0.a * scale + offset);",
    wgsl: "   return vec4<f32>(_c0.a * scale + offset);"
  }
];
class At {
  constructor({
    defaultUniforms: e,
    defaultOutput: r,
    extendTransforms: n = [],
    changeListener: s = (() => {
    }),
    renderer: i = null
  } = {}) {
    this.defaultOutput = r, this.defaultUniforms = e, this.changeListener = s, this.extendTransforms = n, this.renderer = i, this.generators = {}, this.init();
  }
  init() {
    const e = $t();
    return this.glslTransforms = {}, this.generators = Object.entries(this.generators).reduce((r, [n, s]) => (this.changeListener({ type: "remove", synth: this, method: n }), r), {}), this.sourceClass = class extends Q {
    }, Array.isArray(this.extendTransforms) ? e.concat(this.extendTransforms) : typeof this.extendTransforms == "object" && this.extendTransforms.type && e.push(this.extendTransforms), e.map((r) => this.setFunction(r));
  }
  _addMethod(e, r) {
    const n = this;
    if (this.glslTransforms[e] = r, r.type === "src") {
      const s = (...i) => new this.sourceClass({
        name: e,
        transform: r,
        userArgs: i,
        defaultOutput: this.defaultOutput,
        defaultUniforms: this.defaultUniforms,
        synth: n
      });
      return Re(s, e), this.generators[e] = s, this.changeListener({ type: "add", synth: this, method: e }), s;
    } else
      this.sourceClass.prototype[e] = function(...s) {
        return this.transforms.push({ name: e, transform: r, userArgs: s, synth: n }), this;
      }, Re(this.sourceClass.prototype[e], e);
  }
  setFunction(e) {
    var r = Ct(e);
    r && this._addMethod(e.name, r);
  }
}
function Re(t, e) {
  t.isHydraFunction = !0, t.hydraFunctionName = e;
}
const ke = {
  src: {
    returnType: "vec4",
    args: [{ type: "vec2", name: "_st" }]
  },
  coord: {
    returnType: "vec2",
    args: [{ type: "vec2", name: "_st" }]
  },
  color: {
    returnType: "vec4",
    args: [{ type: "vec4", name: "_c0" }]
  },
  combine: {
    returnType: "vec4",
    args: [
      { type: "vec4", name: "_c0" },
      { type: "vec4", name: "_c1" }
    ]
  },
  combineCoord: {
    returnType: "vec2",
    args: [
      { type: "vec2", name: "_st" },
      { type: "vec4", name: "_c0" }
    ]
  }
};
function Ct(t) {
  let e = ke[t.type];
  if (e) {
    let r = e.args.concat(t.inputs), n = r.map((i) => `${i.type} ${i.name}`).join(", "), s = `
  ${e.returnType} ${t.name}(${n}) {
      ${t.glsl}
  }
`;
    return t.inputs = r.slice(1), Object.assign({}, t, { glsl: s });
  } else
    console.warn(`type ${t.type} not recognized`, t, ke);
}
class Ft {
  /**
   * Initialize the renderer with a canvas
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Object} options - Renderer options
   * @param {string} options.precision - Float precision ('lowp', 'mediump', 'highp')
   * @param {number} options.width - Initial width
   * @param {number} options.height - Initial height
   * @returns {void|Promise<void>} - May be sync (WebGL) or async (WebGPU)
   */
  init(e, r = {}) {
    throw new Error("RendererInterface.init() must be implemented");
  }
  /**
   * Clean up all resources
   */
  destroy() {
    throw new Error("RendererInterface.destroy() must be implemented");
  }
  /**
   * Resize all outputs and refresh context
   * @param {number} width
   * @param {number} height
   */
  resize(e, r) {
    throw new Error("RendererInterface.resize() must be implemented");
  }
  // ============================================================
  // Output Management
  // ============================================================
  /**
   * Create an output buffer (o0, o1, o2, o3)
   * @param {number} index - Output index
   * @param {Object} options - { width, height, label }
   * @returns {OutputBuffer} - Renderer-specific output buffer
   */
  createOutput(e, r = {}) {
    throw new Error("RendererInterface.createOutput() must be implemented");
  }
  /**
   * Get an output by index
   * @param {number} index
   * @returns {OutputBuffer}
   */
  getOutput(e) {
    throw new Error("RendererInterface.getOutput() must be implemented");
  }
  // ============================================================
  // Source Management
  // ============================================================
  /**
   * Create a source for external input (video, image, canvas)
   * @param {number} index - Source index
   * @param {Object} options - { width, height, label }
   * @returns {Source} - Renderer-specific source
   */
  createSource(e, r = {}) {
    throw new Error("RendererInterface.createSource() must be implemented");
  }
  // ============================================================
  // Rendering
  // ============================================================
  /**
   * Render a compiled pass to an output
   * Called by Output.render() internally
   * @param {OutputBuffer} output - Target output
   * @param {Object} pass - { frag, uniforms }
   */
  renderPass(e, r) {
    throw new Error("RendererInterface.renderPass() must be implemented");
  }
  /**
   * Execute a tick on an output (runs the compiled draw command)
   * @param {OutputBuffer} output
   * @param {Object} props - { time, mouse, bpm, resolution }
   */
  tickOutput(e, r) {
    throw new Error("RendererInterface.tickOutput() must be implemented");
  }
  /**
   * Render a single output to the canvas
   * @param {OutputBuffer} output - Source output to display
   */
  renderToScreen(e) {
    throw new Error("RendererInterface.renderToScreen() must be implemented");
  }
  /**
   * Render all outputs tiled in a grid to the canvas
   * @param {Array<OutputBuffer>} outputs - All outputs, in order
   */
  renderAllToScreen(e) {
    throw new Error("RendererInterface.renderAllToScreen() must be implemented");
  }
  /**
   * Choose how outputs tile the canvas in render-all mode
   * @param {Object} opts - {cols, rows, fit, order} (see src/lib/grid-layout.js)
   */
  setGridLayout(e = {}) {
    return null;
  }
  // ============================================================
  // Capabilities & Info
  // ============================================================
  /**
   * Get renderer capabilities
   * @returns {Object} - { name, glslVersion, ... }
   */
  get capabilities() {
    throw new Error("RendererInterface.capabilities must be implemented");
  }
  /**
   * Get the underlying canvas
   * @returns {HTMLCanvasElement}
   */
  get canvas() {
    throw new Error("RendererInterface.canvas must be implemented");
  }
  /**
   * Get current width
   * @returns {number}
   */
  get width() {
    throw new Error("RendererInterface.width must be implemented");
  }
  /**
   * Get current height
   * @returns {number}
   */
  get height() {
    throw new Error("RendererInterface.height must be implemented");
  }
  // ============================================================
  // Shader Generation Hooks
  // ============================================================
  /**
   * Get the shader language this renderer uses.
   * Used to select 'glsl' or 'wgsl' property from function dictionary.
   * @returns {string} - 'glsl' or 'wgsl'
   */
  get shaderLanguage() {
    return "glsl";
  }
  /**
   * Get utility functions in the renderer's shader language.
   * @returns {Object} - Map of function name to shader code
   */
  getUtilityFunctions() {
    throw new Error("RendererInterface.getUtilityFunctions() must be implemented");
  }
  /**
   * Build a complete shader from transform info.
   * @param {Object} shaderInfo - { fragColor, uniforms, glslFunctions }
   * @param {Object} options - { precision }
   * @returns {string} - Complete shader source code
   */
  buildShader(e, r = {}) {
    throw new Error("RendererInterface.buildShader() must be implemented");
  }
  // ============================================================
  // Extension Points (optional overrides)
  // ============================================================
  /**
   * Called before each frame
   */
  beginFrame() {
  }
  /**
   * Called after each frame
   */
  endFrame() {
  }
  /**
   * Hook called when a new transform function is registered.
   * Allows renderer to add shader templates in its native language.
   * @param {Object} transform - Transform definition
   */
  onTransformRegistered(e) {
  }
}
const me = 2, Le = 256;
function Pe(t) {
  const e = Math.round(Number(t) || me);
  if (e < me || e > Le) throw new Error(`frame ring depth ${t} out of range ${me}..${Le}`);
  return e;
}
function Rt(t, e, r) {
  let n = typeof r == "function" ? r() : r;
  return n = Math.round(Number(n) || 1), n < 1 && (n = 1), n > e - 1 && (n = e - 1), ((t - n) % e + e) % e;
}
function kt(t, e) {
  return {
    type: "delay",
    output: t,
    delay: e,
    id: t.id,
    label: `${t.label || "o" + t.id}.delay(${typeof e == "function" ? "fn" : e})`,
    getTexture: () => t.getTexture(e),
    getCurrent: () => t.getTexture(e)
  };
}
const Oe = ["OES_texture_half_float", "OES_texture_half_float_linear", "EXT_color_buffer_half_float"];
let ze = !1;
function Lt(t, e) {
  const n = (e === "linear" ? Oe : Oe.filter((s) => s !== "OES_texture_half_float_linear")).filter((s) => !t.hasExtension(s));
  return n.length && !ze && (ze = !0, console.warn("[hydra-synth] float outputs need " + n.join(", ") + "; staying 8-bit")), n.length === 0;
}
var j = function({ regl: t, precision: e, filter: r = "nearest", float: n = !1, label: s = "", width: i, height: u, depth: f = 2 }) {
  this.regl = t, this.precision = e, this.filter = r, this.float = n && Lt(t, r), this.label = s, this.positionBuffer = this.regl.buffer([
    [-2, 0],
    [0, -2],
    [2, 2]
  ]), this.draw = () => {
  }, this.init(), this.pingPongIndex = 0, this.width = i, this.height = u, this.depth = Pe(f), this.fbos = this._makeFbos(this.depth, i, u);
};
j.prototype._makeFbos = function(t, e, r, n = !1) {
  return Array(t).fill().map(() => this.regl.framebuffer(Object.assign({
    color: this.regl.texture({
      mag: this.filter,
      min: this.filter,
      width: e,
      height: r,
      format: "rgba",
      type: this.float ? "half float" : "uint8"
    })
  }, n ? { depth: !0 } : { depthStencil: !1 })));
};
j.prototype.resize = function(t, e) {
  this.width = t, this.height = e, this.fbos.forEach((r) => {
    r.resize(t, e);
  });
};
j.prototype.setDepth = function(t) {
  if (t = Pe(t), t === this.depth) return this;
  const e = this.fbos[0].width, r = this.fbos[0].height;
  return this.fbos.forEach((n) => n.destroy()), this.depth = t, this.pingPongIndex = 0, this.fbos = this._makeFbos(t, e, r, !!this.hasDepthBuffer), this;
};
j.prototype.getCurrent = function() {
  return this.fbos[this.pingPongIndex];
};
j.prototype.advance = function() {
  this.pingPongIndex = (this.pingPongIndex + 1) % this.depth, this._advanced = !0;
};
j.prototype.getTexture = function(t = 1) {
  return this.fbos[Rt(this.pingPongIndex, this.depth, t)];
};
j.prototype.delay = function(t) {
  return kt(this, t);
};
j.prototype.init = function() {
  return this.transformIndex = 0, this.fragHeader = `
  precision ${this.precision} float;

  uniform float time;
  varying vec2 uv;
  `, this.fragBody = "", this.vert = `
  precision ${this.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`, this.attributes = {
    position: this.positionBuffer
  }, this.uniforms = {
    time: this.regl.prop("time"),
    resolution: this.regl.prop("resolution")
  }, this.frag = `
       ${this.fragHeader}

      void main () {
        vec4 c = vec4(0, 0, 0, 0);
        vec2 st = uv;
        ${this.fragBody}
        gl_FragColor = c;
      }
  `, this;
};
j.prototype.render = function(t) {
  let e = t[0];
  var r = this, n = Object.assign(e.uniforms, {
    prevBuffer: () => r._advanced ? r.getTexture(1) : r.fbos[r.pingPongIndex]
  });
  r.draw = r.regl({
    frag: e.frag,
    vert: r.vert,
    attributes: r.attributes,
    uniforms: n,
    count: 3,
    framebuffer: () => (r._advanced ? r._advanced = !1 : r.pingPongIndex = (r.pingPongIndex + 1) % r.depth, r.fbos[r.pingPongIndex])
  });
};
j.prototype.tick = function(t) {
  this.draw(t);
};
j.prototype.measure = at;
function Ot(t) {
  return navigator.mediaDevices.enumerateDevices().then((e) => e.filter((r) => r.kind === "videoinput")).then((e) => {
    let r = { audio: !1, video: !0 };
    return e[t] && (r.video = {
      deviceId: { exact: e[t].deviceId }
    }), window.navigator.mediaDevices.getUserMedia(r);
  }).then((e) => {
    const r = document.createElement("video");
    return r.setAttribute("autoplay", ""), r.setAttribute("muted", ""), r.setAttribute("playsinline", ""), r.srcObject = e, new Promise((n, s) => {
      r.addEventListener("loadedmetadata", () => {
        r.play().then(() => n({ video: r }));
      });
    });
  }).catch(console.log.bind(console));
}
function zt(t) {
  return new Promise(function(e, r) {
    navigator.mediaDevices.getDisplayMedia(t).then((n) => {
      const s = document.createElement("video");
      s.srcObject = n, s.addEventListener("loadedmetadata", () => {
        s.play(), e({ video: s });
      });
    }).catch((n) => r(n));
  });
}
class It {
  constructor({ regl: e, width: r, height: n, pb: s, label: i = "" }) {
    this.label = i, this.regl = e, this.src = null, this.dynamic = !0, this.width = r, this.height = n, this.tex = this.regl.texture({
      //  shape: [width, height]
      shape: [1, 1]
    }), this.pb = s;
  }
  init(e, r) {
    "src" in e && (this.src = e.src, this.tex = this.regl.texture({ data: this.src, ...r })), "dynamic" in e && (this.dynamic = e.dynamic);
  }
  initCam(e, r) {
    const n = this;
    Ot(e).then((s) => {
      n.src = s.video, n.dynamic = !0, n.tex = n.regl.texture({ data: n.src, ...r });
    }).catch((s) => console.log("could not get camera", s));
  }
  initVideo(e = "", r) {
    const n = document.createElement("video");
    n.crossOrigin = "anonymous", n.autoplay = !0, n.loop = !0, n.muted = !0, n.addEventListener("loadeddata", () => {
      this.src = n, n.play(), this.tex = this.regl.texture({ data: this.src, ...r }), this.dynamic = !0;
    }), n.src = e;
  }
  initImage(e = "", r) {
    const n = document.createElement("img");
    n.crossOrigin = "anonymous", n.src = e, n.onload = () => {
      this.src = n, this.dynamic = !1, this.tex = this.regl.texture({ data: this.src, ...r });
    };
  }
  initStream(e, r) {
    let n = this;
    e && this.pb && (this.pb.initSource(e), this.pb.on("got video", function(s, i) {
      s === e && (n.src = i, n.dynamic = !0, n.tex = n.regl.texture({ data: n.src, ...r }));
    }));
  }
  // index only relevant in atom-hydra + desktop apps
  initScreen(e = 0, r) {
    const n = this;
    zt().then(function(s) {
      n.src = s.video, n.tex = n.regl.texture({ data: n.src, ...r }), n.dynamic = !0;
    }).catch((s) => console.log("could not get screen", s));
  }
  // cache for the canvases, so we don't create them every time
  canvases = {};
  // Creates a canvas and returns the 2d context
  initCanvas(e = 1e3, r = 1e3) {
    if (this.canvases[this.label] == null) {
      const u = document.createElement("canvas").getContext("2d");
      u != null && (this.canvases[this.label] = u);
    }
    const n = this.canvases[this.label], s = n.canvas;
    return s.width !== e && s.height !== r ? (s.width = e, s.height = r) : n.clearRect(0, 0, e, r), this.init({ src: s }), this.dynamic = !0, n;
  }
  resize(e, r) {
    this.width = e, this.height = r;
  }
  clear() {
    this.src && this.src.srcObject && this.src.srcObject.getTracks && this.src.srcObject.getTracks().forEach((e) => e.stop()), this.src = null, this.tex = this.regl.texture({ shape: [1, 1] });
  }
  tick(e) {
    this.src && this.dynamic === !0 && (this.src.videoWidth && this.src.videoWidth !== this.tex.width && (P(
      this.src.videoWidth,
      this.src.videoHeight,
      this.tex.width,
      this.tex.height
    ), this.tex.resize(this.src.videoWidth, this.src.videoHeight)), this.src.width && this.src.width !== this.tex.width && this.tex.resize(this.src.width, this.src.height), this.tex.subimage(this.src));
  }
  getTexture() {
    return this.tex;
  }
}
function pe(t, e = {}) {
  let r = e.cols, n = e.rows;
  !r && !n ? (r = Math.ceil(Math.sqrt(t)), n = Math.ceil(t / r)) : n ? r || (r = Math.ceil(t / n)) : n = Math.ceil(t / r), r = Math.max(1, r), n = Math.max(1, n);
  const s = e.fit === !1 ? [1, 1] : [Math.min(1, r / n), Math.min(1, n / r)];
  return {
    cols: r,
    rows: n,
    fit: s,
    rowMajor: e.order === "row"
  };
}
function jt(t) {
  return {
    grid: [t.cols, t.rows],
    fit: t.fit,
    rowMajor: t.rowMajor ? 1 : 0
  };
}
function Dt(t, e, r) {
  const n = Object.assign({ resolution: r }, jt(e));
  return t.forEach((s, i) => {
    n[`tex${i}`] = s.getCurrent();
  }), n;
}
const ge = (t) => Array.from({ length: t }, (e, r) => r);
function Bt(t) {
  return `
  precision ${t} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`;
}
function Ut(t, e, r = !1) {
  const n = ge(t).map((i) => `uniform sampler2D tex${i};`).join(`
  `), s = ge(t).map((i) => `${i ? "else " : ""}if (idx == ${i}) gl_FragColor = texture2D(tex${i}, local);`).join(`
    `);
  return `
  precision ${e} float;
  varying vec2 uv;
  uniform vec2 grid;       // (cols, rows)
  uniform vec2 fit;        // fraction of each cell used, to keep the output aspect
  uniform float rowMajor;  // 1.0 = left-to-right then down, 0.0 = top-to-bottom then right
  ${n}

  void main () {
    vec2 st = vec2(1.0 - uv.x, uv.y);   // x from left, y from top
    vec2 cell = floor(st * grid);
    int cx = int(cell.x);
    int cy = int(cell.y);
    int idx = rowMajor > 0.5 ? cx + cy * int(grid.x) : cy + cx * int(grid.y);
    vec2 local = (fract(st * grid) - 0.5) / fit + 0.5;
    if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    ${s}
    else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);${r ? `
    gl_FragColor = vec4(gl_FragColor.rgb * clamp(gl_FragColor.a, 0.0, 1.0), 1.0);` : ""}
  }`;
}
function Xt(t, e) {
  const r = {
    grid: t.prop("grid"),
    fit: t.prop("fit"),
    rowMajor: t.prop("rowMajor")
  };
  return ge(e).forEach((n) => {
    r[`tex${n}`] = t.prop(`tex${n}`);
  }), r;
}
class Pt extends Ft {
  constructor() {
    super(), this._canvas = null, this._regl = null, this._width = 0, this._height = 0, this._precision = "mediump", this._outputs = [], this._sources = [], this._renderFboCommand = null, this._renderAllCommand = null, this._numOutputs = 4, this._gridLayout = null;
  }
  init(e, r = {}) {
    const {
      precision: n = "mediump",
      filter: s = "nearest",
      float: i = !1,
      width: u = e.width || 1280,
      height: f = e.height || 720,
      pb: v = null,
      numOutputs: p = 4
    } = r;
    this._canvas = e, this._numOutputs = p, this._gridLayout = pe(p), this._width = u, this._height = f, this._precision = n, this._filter = s, this._float = i, this._pb = v, this._regl = Ge({
      canvas: this._canvas,
      pixelRatio: 1,
      optionalExtensions: ["OES_texture_half_float", "OES_texture_half_float_linear", "EXT_color_buffer_half_float"]
    }), this._regl.clear({
      color: [0, 0, 0, 1]
    }), this._renderFboCommand = this._regl({
      frag: `
      precision ${this._precision} float;
      varying vec2 uv;
      uniform vec2 resolution;
      uniform sampler2D tex0;

      void main () {
        gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
      }
      `,
      vert: `
      precision ${this._precision} float;
      attribute vec2 position;
      varying vec2 uv;

      void main () {
        uv = position;
        gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
      }`,
      attributes: {
        position: [
          [-2, 0],
          [0, -2],
          [2, 2]
        ]
      },
      uniforms: {
        tex0: this._regl.prop("tex0"),
        resolution: this._regl.prop("resolution")
      },
      count: 3,
      depth: { enable: !1 }
    }), this._renderAllCommand = this._buildRenderAllCommand(p);
  }
  _buildRenderAllCommand(e) {
    return this._regl({
      frag: Ut(e, this._precision),
      vert: Bt(this._precision),
      attributes: {
        position: [
          [-2, 0],
          [0, -2],
          [2, 2]
        ]
      },
      uniforms: Xt(this._regl, e),
      count: 3,
      depth: { enable: !1 }
    });
  }
  // Choose how outputs tile the canvas in render-all mode: {cols, rows, fit, order}
  setGridLayout(e = {}) {
    return this._gridLayout = pe(this._numOutputs, e), this._gridLayout;
  }
  destroy() {
    this._regl && (this._regl.destroy(), this._regl = null), this._outputs = [], this._sources = [];
  }
  resize(e, r) {
    this._width = e, this._height = r, this._canvas.width = e, this._canvas.height = r, this._outputs.forEach((n) => {
      n.resize(e, r);
    }), this._sources.forEach((n) => {
      n.resize(e, r);
    }), this._regl._refresh();
  }
  // ============================================================
  // Output Management
  // ============================================================
  createOutput(e, r = {}) {
    const n = new j({
      regl: this._regl,
      width: r.width || this._width,
      height: r.height || this._height,
      precision: this._precision,
      filter: this._filter,
      float: this._float,
      label: r.label || `o${e}`
    });
    return n.id = e, this._outputs[e] = n, n;
  }
  getOutput(e) {
    return this._outputs[e];
  }
  // ============================================================
  // Source Management
  // ============================================================
  createSource(e, r = {}) {
    const n = new It({
      regl: this._regl,
      pb: this._pb,
      width: r.width || this._width,
      height: r.height || this._height,
      label: r.label || `s${e}`
    });
    return this._sources[e] = n, n;
  }
  // ============================================================
  // Rendering
  // ============================================================
  renderPass(e, r) {
    e.render([r]);
  }
  tickOutput(e, r) {
    e.tick(r);
  }
  renderToScreen(e) {
    this._renderFboCommand({
      tex0: e.getCurrent(),
      resolution: [this._width, this._height]
    });
  }
  renderAllToScreen(e) {
    e.length !== this._numOutputs && (this._numOutputs = e.length, this._gridLayout = pe(e.length), this._renderAllCommand = this._buildRenderAllCommand(e.length)), this._renderAllCommand(Dt(e, this._gridLayout, [this._width, this._height]));
  }
  // ============================================================
  // Capabilities & Info
  // ============================================================
  get capabilities() {
    const e = this._regl._gl;
    return {
      name: "webgl1",
      glslVersion: "100",
      instancing: !!e.getExtension("ANGLE_instanced_arrays"),
      floatTextures: !!e.getExtension("OES_texture_float"),
      halfFloatTextures: !!e.getExtension("OES_texture_half_float"),
      maxTextureSize: e.getParameter(e.MAX_TEXTURE_SIZE),
      maxTextureUnits: e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS)
    };
  }
  get canvas() {
    return this._canvas;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  // ============================================================
  // Additional accessors for compatibility
  // ============================================================
  get regl() {
    return this._regl;
  }
  get precision() {
    return this._precision;
  }
  get outputs() {
    return this._outputs;
  }
  get sources() {
    return this._sources;
  }
  // ============================================================
  // Shader Generation Hooks
  // ============================================================
  get shaderLanguage() {
    return "glsl";
  }
  getUtilityFunctions() {
    return ve;
  }
  buildShader(e, r = {}) {
    return `
  precision ${r.precision || this._precision} float;
  ${Object.values(e.uniforms).map((s) => {
      let i = s.type;
      return s.type === "texture" && (i = "sampler2D"), `
      uniform ${i} ${s.name};`;
    }).join("")}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;
  uniform sampler2D prevBuffer;

  ${Object.values(ve).map((s) => `
            ${s.glsl}
          `).join("")}

  ${e.glslFunctions.map((s) => `
            ${s.transform[this.shaderLanguage] || s.transform.glsl}
          `).join("")}

  void main () {
    vec2 st = gl_FragCoord.xy/resolution.xy;

    ${e.fragColor}
    gl_FragColor = c;
  }
  `;
  }
}
const Nt = ft();
class Yt {
  constructor({
    pb: e = null,
    width: r = 1280,
    height: n = 720,
    numSources: s = 4,
    numOutputs: i = 4,
    makeGlobal: u = !0,
    autoLoop: f = !0,
    detectAudio: v = !0,
    enableStreamCapture: p = !0,
    canvas: T,
    precision: b,
    filter: M = "nearest",
    // output texture sampling: 'nearest' (hydra's look) or 'linear' (smooth feedback)
    float: F = !1,
    // half-float outputs: feedback keeps values past 0..1 and fine steps between frames (changes how feedback sketches look)
    extendTransforms: L = {},
    // add your own functions on init
    debug: A = !1
    // enable non-error console logging
  } = {}) {
    if (gt(A), De.init(), this.pb = e, this.width = r, this.height = n, this.renderAll = !1, this.detectAudio = v, this._initCanvas(T), this.synth = {
      time: 0,
      bpm: 30,
      width: this.width,
      height: this.height,
      fps: void 0,
      stats: {
        fps: 0
      },
      speed: 1,
      mouse: Nt,
      render: this._render.bind(this),
      setResolution: this.setResolution.bind(this),
      update: (k) => {
      },
      // user defined update function
      afterUpdate: (k) => {
      },
      // user defined function run after update
      hush: this.hush.bind(this),
      tick: this.tick.bind(this)
    }, u && (window.loadScript = this.loadScript), this.timeSinceLastUpdate = 0, this._time = 0, b && ["lowp", "mediump", "highp"].includes(b.toLowerCase()))
      this.precision = b.toLowerCase();
    else {
      let k = (/iPad|iPhone|iPod/.test(navigator.platform) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) && !window.MSStream;
      this.precision = k ? "highp" : "mediump";
    }
    if (this.extendTransforms = L, this.saveFrame = !1, this.captureStream = null, this.generator = void 0, this.renderer = new Pt(), this.renderer.init(this.canvas, {
      precision: this.precision,
      filter: M,
      float: F,
      width: this.width,
      height: this.height,
      pb: this.pb,
      numOutputs: i
    }), this.regl = this.renderer.regl, this.synth.renderer = this.renderer, this._initOutputs(i), this._initSources(s), this._generateGlslTransforms(), this.synth.screencap = () => {
      this.saveFrame = !0;
    }, this.synth.setGridLayout = (k) => this.renderer.setGridLayout(k), p)
      try {
        this.captureStream = this.canvas.captureStream(25), this.synth.vidRecorder = new yt(this.captureStream);
      } catch (k) {
        console.warn(`[hydra-synth warning]
new MediaSource() is not currently supported on iOS.`), console.error(k);
      }
    v && this._initAudio(), f && tt(this.tick.bind(this)).start(), this.sandbox = new xt(this.synth, u, ["speed", "update", "afterUpdate", "bpm", "fps"]);
  }
  eval(e) {
    this.sandbox.eval(e);
  }
  // Returns a promise that resolves when Hydra is ready
  // Currently initialization is synchronous, but this provides
  // a consistent async API for future async initialization needs
  ready() {
    return Promise.resolve(this);
  }
  getScreenImage(e) {
    this.imageCallback = e, this.saveFrame = !0;
  }
  hush() {
    this.s.forEach((e) => {
      e.clear();
    }), this.o.forEach((e) => {
      this.synth.solid(0, 0, 0, 0).out(e);
    }), this.synth.render(this.o[0]), this.sandbox.set("update", (e) => {
    }), this.sandbox.set("afterUpdate", (e) => {
    }), this.synth.time = 0, this.sandbox.set("time", 0);
  }
  loadScript(e = "") {
    return new Promise((n, s) => {
      var i = document.createElement("script");
      i.onload = function() {
        P(`loaded script ${e}`), n();
      }, i.onerror = (u) => {
        console.log(`error loading script ${e}`, "log-error"), n();
      }, i.src = e, document.head.appendChild(i);
    });
  }
  setResolution(e, r) {
    this.width = e, this.height = r, this.sandbox.set("width", e), this.sandbox.set("height", r), P(this.width), this.renderer.resize(e, r), P(this.canvas.width);
  }
  canvasToImage(e) {
    const r = document.createElement("a");
    r.style.display = "none";
    let n = /* @__PURE__ */ new Date();
    r.download = `hydra-${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}-${n.getHours()}.${n.getMinutes()}.${n.getSeconds()}.png`, document.body.appendChild(r);
    var s = this;
    this.canvas.toBlob((i) => {
      s.imageCallback ? (s.imageCallback(i), delete s.imageCallback) : (r.href = URL.createObjectURL(i), P(r.href), r.click());
    }, "image/png"), setTimeout(() => {
      document.body.removeChild(r), window.URL.revokeObjectURL(r.href);
    }, 300);
  }
  _initAudio() {
    this.synth.a = new vt({
      numBins: 4,
      parentEl: this.canvas.parentNode
      // changeListener: ({audio}) => {
      //   that.a = audio.bins.map((_, index) =>
      //     (scale = 1, offset = 0) => () => (audio.fft[index] * scale + offset)
      //   )
      //
      //   if (that.makeGlobal) {
      //     that.a.forEach((a, index) => {
      //       const aname = `a${index}`
      //       window[aname] = a
      //     })
      //   }
      // }
    });
  }
  // create main output canvas and add to screen
  _initCanvas(e) {
    e ? (this.canvas = e, this.width = e.width, this.height = e.height) : (this.canvas = document.createElement("canvas"), this.canvas.width = this.width, this.canvas.height = this.height, this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.imageRendering = "pixelated", document.body.appendChild(this.canvas));
  }
  _initOutputs(e) {
    const r = this;
    this.o = Array(e).fill().map((n, s) => {
      var i = this.renderer.createOutput(s, {
        width: this.width,
        height: this.height,
        label: `o${s}`
      });
      return r.synth["o" + s] = i, i;
    }), this.output = this.o[0];
  }
  _initSources(e) {
    this.s = [];
    for (var r = 0; r < e; r++)
      this.createSource(r);
  }
  createSource(e) {
    let r = this.renderer.createSource(this.s.length, {
      width: this.width,
      height: this.height,
      label: `s${e}`
    });
    return this.synth["s" + this.s.length] = r, this.s.push(r), r;
  }
  _generateGlslTransforms() {
    var e = this;
    this.generator = new At({
      defaultOutput: this.o[0],
      defaultUniforms: this.o[0].uniforms,
      extendTransforms: this.extendTransforms,
      renderer: this.renderer,
      changeListener: ({ type: r, method: n, synth: s }) => {
        r === "add" && (e.synth[n] = s.generators[n], e.sandbox && e.sandbox.add(n));
      }
    }), this.synth.setFunction = this.generator.setFunction.bind(this.generator);
  }
  _render(e) {
    e ? (this.output = e, this.isRenderingAll = !1) : this.isRenderingAll = !0;
  }
  // dt in ms
  tick(e, r) {
    try {
      if (this.sandbox.tick(), this.detectAudio === !0 && this.synth.a.tick(), this.sandbox.set("time", this.synth.time += e * 1e-3 * this.synth.speed), this.timeSinceLastUpdate += e, !this.synth.fps || this.timeSinceLastUpdate >= 1e3 / this.synth.fps) {
        if (this.synth.stats.fps = Math.ceil(1e3 / this.timeSinceLastUpdate), this.synth.update)
          try {
            this.synth.update(this.timeSinceLastUpdate);
          } catch (s) {
            console.log(s);
          }
        for (let s = 0; s < this.s.length; s++)
          this.s[s].tick(this.synth.time);
        const n = this.synth.time;
        for (let s = 0; s < this.o.length; s++) this.o[s].advance && this.o[s].advance();
        for (let s = 0; s < this.o.length; s++)
          this.o[s].tick({
            time: n,
            mouse: this.synth.mouse,
            bpm: this.synth.bpm,
            resolution: [this.canvas.width, this.canvas.height]
          });
        for (let s = 0; s < this.o.length; s++) this.o[s].stats && it(this.o[s]);
        if (this.isRenderingAll ? this.renderer.renderAllToScreen(this.o) : this.renderer.renderToScreen(this.output), this.synth.afterUpdate)
          try {
            this.synth.afterUpdate(this.timeSinceLastUpdate);
          } catch (s) {
            console.log(s);
          }
        this.timeSinceLastUpdate = 0;
      }
      this.saveFrame === !0 && (this.canvasToImage(), this.saveFrame = !1);
    } catch (n) {
      console.warn("Error during tick():", n);
    }
  }
}
export {
  Yt as default
};
