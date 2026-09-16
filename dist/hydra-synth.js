import Fe from "regl";
function Ee(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var J = { exports: {} }, de;
function Le() {
  return de || (de = 1, typeof Object.create == "function" ? J.exports = function(e, r) {
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
var ne, ve;
function ke() {
  if (ve) return ne;
  ve = 1;
  function t() {
    this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0;
  }
  ne = t, t.EventEmitter = t, t.prototype._events = void 0, t.prototype._maxListeners = void 0, t.defaultMaxListeners = 10, t.prototype.setMaxListeners = function(i) {
    if (!r(i) || i < 0 || isNaN(i))
      throw TypeError("n must be a positive number");
    return this._maxListeners = i, this;
  }, t.prototype.emit = function(i) {
    var m, f, v, p, C, E;
    if (this._events || (this._events = {}), i === "error" && (!this._events.error || n(this._events.error) && !this._events.error.length)) {
      if (m = arguments[1], m instanceof Error)
        throw m;
      var M = new Error('Uncaught, unspecified "error" event. (' + m + ")");
      throw M.context = m, M;
    }
    if (f = this._events[i], o(f))
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
      for (p = Array.prototype.slice.call(arguments, 1), E = f.slice(), v = E.length, C = 0; C < v; C++)
        E[C].apply(this, p);
    return !0;
  }, t.prototype.addListener = function(i, m) {
    var f;
    if (!e(m))
      throw TypeError("listener must be a function");
    return this._events || (this._events = {}), this._events.newListener && this.emit(
      "newListener",
      i,
      e(m.listener) ? m.listener : m
    ), this._events[i] ? n(this._events[i]) ? this._events[i].push(m) : this._events[i] = [this._events[i], m] : this._events[i] = m, n(this._events[i]) && !this._events[i].warned && (o(this._maxListeners) ? f = t.defaultMaxListeners : f = this._maxListeners, f && f > 0 && this._events[i].length > f && (this._events[i].warned = !0, console.error(
      "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
      this._events[i].length
    ), typeof console.trace == "function" && console.trace())), this;
  }, t.prototype.on = t.prototype.addListener, t.prototype.once = function(i, m) {
    if (!e(m))
      throw TypeError("listener must be a function");
    var f = !1;
    function v() {
      this.removeListener(i, v), f || (f = !0, m.apply(this, arguments));
    }
    return v.listener = m, this.on(i, v), this;
  }, t.prototype.removeListener = function(i, m) {
    var f, v, p, C;
    if (!e(m))
      throw TypeError("listener must be a function");
    if (!this._events || !this._events[i])
      return this;
    if (f = this._events[i], p = f.length, v = -1, f === m || e(f.listener) && f.listener === m)
      delete this._events[i], this._events.removeListener && this.emit("removeListener", i, m);
    else if (n(f)) {
      for (C = p; C-- > 0; )
        if (f[C] === m || f[C].listener && f[C].listener === m) {
          v = C;
          break;
        }
      if (v < 0)
        return this;
      f.length === 1 ? (f.length = 0, delete this._events[i]) : f.splice(v, 1), this._events.removeListener && this.emit("removeListener", i, m);
    }
    return this;
  }, t.prototype.removeAllListeners = function(i) {
    var m, f;
    if (!this._events)
      return this;
    if (!this._events.removeListener)
      return arguments.length === 0 ? this._events = {} : this._events[i] && delete this._events[i], this;
    if (arguments.length === 0) {
      for (m in this._events)
        m !== "removeListener" && this.removeAllListeners(m);
      return this.removeAllListeners("removeListener"), this._events = {}, this;
    }
    if (f = this._events[i], e(f))
      this.removeListener(i, f);
    else if (f)
      for (; f.length; )
        this.removeListener(i, f[f.length - 1]);
    return delete this._events[i], this;
  }, t.prototype.listeners = function(i) {
    var m;
    return !this._events || !this._events[i] ? m = [] : e(this._events[i]) ? m = [this._events[i]] : m = this._events[i].slice(), m;
  }, t.prototype.listenerCount = function(i) {
    if (this._events) {
      var m = this._events[i];
      if (e(m))
        return 1;
      if (m)
        return m.length;
    }
    return 0;
  }, t.listenerCount = function(i, m) {
    return i.listenerCount(m);
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
  function o(i) {
    return i === void 0;
  }
  return ne;
}
var ie, ge;
function Oe() {
  return ge || (ge = 1, ie = globalThis.performance && globalThis.performance.now ? function() {
    return performance.now();
  } : Date.now || function() {
    return +/* @__PURE__ */ new Date();
  }), ie;
}
var H = { exports: {} }, P = { exports: {} }, ze = P.exports, ye;
function Ie() {
  return ye || (ye = 1, (function() {
    var t, e, r, n, o, i;
    typeof performance < "u" && performance !== null && performance.now ? P.exports = function() {
      return performance.now();
    } : typeof process < "u" && process !== null && process.hrtime ? (P.exports = function() {
      return (t() - o) / 1e6;
    }, e = process.hrtime, t = function() {
      var m;
      return m = e(), m[0] * 1e9 + m[1];
    }, n = t(), i = process.uptime() * 1e9, o = n - i) : Date.now ? (P.exports = function() {
      return Date.now() - r;
    }, r = Date.now()) : (P.exports = function() {
      return (/* @__PURE__ */ new Date()).getTime() - r;
    }, r = (/* @__PURE__ */ new Date()).getTime());
  }).call(ze)), P.exports;
}
var _e;
function je() {
  if (_e) return H.exports;
  _e = 1;
  for (var t = Ie(), e = typeof window > "u" ? globalThis : window, r = ["moz", "webkit"], n = "AnimationFrame", o = e["request" + n], i = e["cancel" + n] || e["cancelRequest" + n], m = 0; !o && m < r.length; m++)
    o = e[r[m] + "Request" + n], i = e[r[m] + "Cancel" + n] || e[r[m] + "CancelRequest" + n];
  if (!o || !i) {
    var f = 0, v = 0, p = [], C = 1e3 / 60;
    o = function(E) {
      if (p.length === 0) {
        var M = t(), R = Math.max(0, C - (M - f));
        f = R + M, setTimeout(function() {
          var L = p.slice(0);
          p.length = 0;
          for (var $ = 0; $ < L.length; $++)
            if (!L[$].cancelled)
              try {
                L[$].callback(f);
              } catch (Y) {
                setTimeout(function() {
                  throw Y;
                }, 0);
              }
        }, Math.round(R));
      }
      return p.push({
        handle: ++v,
        callback: E,
        cancelled: !1
      }), v;
    }, i = function(E) {
      for (var M = 0; M < p.length; M++)
        p[M].handle === E && (p[M].cancelled = !0);
    };
  }
  return H.exports = function(E) {
    return o.call(e, E);
  }, H.exports.cancel = function() {
    i.apply(e, arguments);
  }, H.exports.polyfill = function(E) {
    E || (E = e), E.requestAnimationFrame = o, E.cancelAnimationFrame = i;
  }, H.exports;
}
var ae, be;
function Be() {
  if (be) return ae;
  be = 1;
  var t = Le(), e = ke().EventEmitter, r = Oe(), n = je();
  ae = o;
  function o(i) {
    if (!(this instanceof o))
      return new o(i);
    this.running = !1, this.last = r(), this._frame = 0, this._tick = this.tick.bind(this), i && this.on("tick", i);
  }
  return t(o, e), o.prototype.start = function() {
    if (!this.running)
      return this.running = !0, this.last = r(), this._frame = n(this._tick), this;
  }, o.prototype.stop = function() {
    return this.running = !1, this._frame !== 0 && n.cancel(this._frame), this._frame = 0, this;
  }, o.prototype.tick = function() {
    this._frame = n(this._tick);
    var i = r(), m = i - this.last;
    this.emit("tick", m), this.last = i;
  }, ae;
}
var De = Be();
const Ue = /* @__PURE__ */ Ee(De), U = {};
function qe(t) {
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
U.buttons = qe;
function Xe(t) {
  return t.target || t.srcElement || window;
}
U.element = Xe;
function Ye(t) {
  return typeof t == "object" && "pageX" in t ? t.pageX : 0;
}
U.x = Ye;
function Pe(t) {
  return typeof t == "object" && "pageY" in t ? t.pageY : 0;
}
U.y = Pe;
function Ne(t, e) {
  e || (e = t, t = window);
  var r = 0, n = 0, o = 0, i = {
    shift: !1,
    alt: !1,
    control: !1,
    meta: !1
  }, m = !1;
  function f(T) {
    var F = !1;
    return "altKey" in T && (F = F || T.altKey !== i.alt, i.alt = !!T.altKey), "shiftKey" in T && (F = F || T.shiftKey !== i.shift, i.shift = !!T.shiftKey), "ctrlKey" in T && (F = F || T.ctrlKey !== i.control, i.control = !!T.ctrlKey), "metaKey" in T && (F = F || T.metaKey !== i.meta, i.meta = !!T.metaKey), F;
  }
  function v(T, F) {
    var Z = U.x(F), G = U.y(F);
    "buttons" in F && (T = F.buttons | 0), (T !== r || Z !== n || G !== o || f(F)) && (r = T | 0, n = Z || 0, o = G || 0, e && e(r, n, o, i));
  }
  function p(T) {
    v(0, T);
  }
  function C() {
    (r || n || o || i.shift || i.alt || i.meta || i.control) && (n = o = 0, r = 0, i.shift = i.alt = i.control = i.meta = !1, e && e(0, 0, 0, i));
  }
  function E(T) {
    f(T) && e && e(r, n, o, i);
  }
  function M(T) {
    U.buttons(T) === 0 ? v(0, T) : v(r, T);
  }
  function R(T) {
    v(r | U.buttons(T), T);
  }
  function L(T) {
    v(r & ~U.buttons(T), T);
  }
  function $() {
    m || (m = !0, t.addEventListener("mousemove", M), t.addEventListener("mousedown", R), t.addEventListener("mouseup", L), t.addEventListener("mouseleave", p), t.addEventListener("mouseenter", p), t.addEventListener("mouseout", p), t.addEventListener("mouseover", p), t.addEventListener("blur", C), t.addEventListener("keyup", E), t.addEventListener("keydown", E), t.addEventListener("keypress", E), t !== window && (window.addEventListener("blur", C), window.addEventListener("keyup", E), window.addEventListener("keydown", E), window.addEventListener("keypress", E)));
  }
  function Y() {
    m && (m = !1, t.removeEventListener("mousemove", M), t.removeEventListener("mousedown", R), t.removeEventListener("mouseup", L), t.removeEventListener("mouseleave", p), t.removeEventListener("mouseenter", p), t.removeEventListener("mouseout", p), t.removeEventListener("mouseover", p), t.removeEventListener("blur", C), t.removeEventListener("keyup", E), t.removeEventListener("keydown", E), t.removeEventListener("keypress", E), t !== window && (window.removeEventListener("blur", C), window.removeEventListener("keyup", E), window.removeEventListener("keydown", E), window.removeEventListener("keypress", E)));
  }
  $();
  var D = {
    element: t
  };
  return Object.defineProperties(D, {
    enabled: {
      get: function() {
        return m;
      },
      set: function(T) {
        T ? $() : Y();
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
        return o;
      },
      enumerable: !0
    },
    mods: {
      get: function() {
        return i;
      },
      enumerable: !0
    }
  }), D;
}
var ee = { exports: {} }, Ge = ee.exports, we;
function Ke() {
  return we || (we = 1, (function(t, e) {
    (function(r, n) {
      t.exports = n();
    })(Ge, (function() {
      function r(c, s, u) {
        for (var l, h = 0, d = s.length; h < d; h++) !l && h in s || (l || (l = Array.prototype.slice.call(s, 0, h)), l[h] = s[h]);
        return c.concat(l || Array.prototype.slice.call(s));
      }
      var n = Object.freeze({ __proto__: null, blackman: function(c) {
        for (var s = new Float32Array(c), u = 2 * Math.PI / (c - 1), l = 2 * u, h = 0; h < c / 2; h++) s[h] = 0.42 - 0.5 * Math.cos(h * u) + 0.08 * Math.cos(h * l);
        for (h = Math.ceil(c / 2); h > 0; h--) s[c - h] = s[h - 1];
        return s;
      }, hamming: function(c) {
        for (var s = new Float32Array(c), u = 0; u < c; u++) s[u] = 0.54 - 0.46 * Math.cos(2 * Math.PI * (u / c - 1));
        return s;
      }, hanning: function(c) {
        for (var s = new Float32Array(c), u = 0; u < c; u++) s[u] = 0.5 - 0.5 * Math.cos(2 * Math.PI * u / (c - 1));
        return s;
      }, sine: function(c) {
        for (var s = Math.PI / (c - 1), u = new Float32Array(c), l = 0; l < c; l++) u[l] = Math.sin(s * l);
        return u;
      } }), o = {};
      function i(c) {
        for (; c % 2 == 0 && c > 1; ) c /= 2;
        return c === 1;
      }
      function m(c, s) {
        if (s !== "rect") {
          if (s !== "" && s || (s = "hanning"), o[s] || (o[s] = {}), !o[s][c.length]) try {
            o[s][c.length] = n[s](c.length);
          } catch {
            throw new Error("Invalid windowing function");
          }
          c = (function(u, l) {
            for (var h = [], d = 0; d < Math.min(u.length, l.length); d++) h[d] = u[d] * l[d];
            return h;
          })(c, o[s][c.length]);
        }
        return c;
      }
      function f(c, s, u) {
        for (var l = new Float32Array(c), h = 0; h < l.length; h++) l[h] = h * s / u, l[h] = 13 * Math.atan(l[h] / 1315.8) + 3.5 * Math.atan(Math.pow(l[h] / 7518, 2));
        return l;
      }
      function v(c) {
        return Float32Array.from(c);
      }
      function p(c) {
        return 1125 * Math.log(1 + c / 700);
      }
      function C(c, s, u) {
        for (var l, h = new Float32Array(c + 2), d = new Float32Array(c + 2), _ = s / 2, w = p(0), y = (p(_) - w) / (c + 1), g = new Array(c + 2), S = 0; S < h.length; S++) h[S] = S * y, d[S] = (l = h[S], 700 * (Math.exp(l / 1125) - 1)), g[S] = Math.floor((u + 1) * d[S] / s);
        for (var O = new Array(c), b = 0; b < O.length; b++) {
          for (O[b] = new Array(u / 2 + 1).fill(0), S = g[b]; S < g[b + 1]; S++) O[b][S] = (S - g[b]) / (g[b + 1] - g[b]);
          for (S = g[b + 1]; S < g[b + 2]; S++) O[b][S] = (g[b + 2] - S) / (g[b + 2] - g[b + 1]);
        }
        return O;
      }
      function E(c, s, u, l, h, d, _) {
        l === void 0 && (l = 5), h === void 0 && (h = 2), d === void 0 && (d = !0), _ === void 0 && (_ = 440);
        var w = Math.floor(u / 2) + 1, y = new Array(u).fill(0).map((function(A, k) {
          return c * (function(z, X) {
            return Math.log2(16 * z / X);
          })(s * k / u, _);
        }));
        y[0] = y[1] - 1.5 * c;
        var g, S, O, b = y.slice(1).map((function(A, k) {
          return Math.max(A - y[k]);
        }), 1).concat([1]), B = Math.round(c / 2), I = new Array(c).fill(0).map((function(A, k) {
          return y.map((function(z) {
            return (10 * c + B + z - k) % c - B;
          }));
        })), j = I.map((function(A, k) {
          return A.map((function(z, X) {
            return Math.exp(-0.5 * Math.pow(2 * I[k][X] / b[X], 2));
          }));
        }));
        if (S = (g = j)[0].map((function() {
          return 0;
        })), O = g.reduce((function(A, k) {
          return k.forEach((function(z, X) {
            A[X] += Math.pow(z, 2);
          })), A;
        }), S).map(Math.sqrt), j = g.map((function(A, k) {
          return A.map((function(z, X) {
            return z / (O[X] || 1);
          }));
        })), h) {
          var se = y.map((function(A) {
            return Math.exp(-0.5 * Math.pow((A / c - l) / h, 2));
          }));
          j = j.map((function(A) {
            return A.map((function(k, z) {
              return k * se[z];
            }));
          }));
        }
        return d && (j = r(r([], j.slice(3), !0), j.slice(0, 3))), j.map((function(A) {
          return A.slice(0, w);
        }));
      }
      function M(c, s) {
        for (var u = 0, l = 0, h = 0; h < s.length; h++) u += Math.pow(h, c) * Math.abs(s[h]), l += s[h];
        return u / l;
      }
      function R(c) {
        var s = c.ampSpectrum, u = c.barkScale, l = c.numberOfBarkBands, h = l === void 0 ? 24 : l;
        if (typeof s != "object" || typeof u != "object") throw new TypeError();
        var d = h, _ = new Float32Array(d), w = 0, y = s, g = new Int32Array(d + 1);
        g[0] = 0;
        for (var S = u[y.length - 1] / d, O = 1, b = 0; b < y.length; b++) for (; u[b] > S; ) g[O++] = b, S = O * u[y.length - 1] / d;
        for (g[d] = y.length - 1, b = 0; b < d; b++) {
          for (var B = 0, I = g[b]; I < g[b + 1]; I++) B += y[I];
          _[b] = Math.pow(B, 0.23);
        }
        for (b = 0; b < _.length; b++) w += _[b];
        return { specific: _, total: w };
      }
      function L(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        for (var u = new Float32Array(s.length), l = 0; l < u.length; l++) u[l] = Math.pow(s[l], 2);
        return u;
      }
      function $(c) {
        var s = c.ampSpectrum, u = c.melFilterBank, l = c.bufferSize;
        if (typeof s != "object") throw new TypeError("Valid ampSpectrum is required to generate melBands");
        if (typeof u != "object") throw new TypeError("Valid melFilterBank is required to generate melBands");
        for (var h = L({ ampSpectrum: s }), d = u.length, _ = Array(d), w = new Float32Array(d), y = 0; y < w.length; y++) {
          _[y] = new Float32Array(l / 2), w[y] = 0;
          for (var g = 0; g < l / 2; g++) _[y][g] = u[y][g] * h[g], w[y] += _[y][g];
          w[y] = Math.log(w[y] + 1);
        }
        return Array.prototype.slice.call(w);
      }
      function Y(c) {
        return c && c.__esModule && Object.prototype.hasOwnProperty.call(c, "default") ? c.default : c;
      }
      var D = null, T = Y((function(c, s) {
        var u = c.length;
        return s = s || 2, D && D[u] || (function(l) {
          (D = D || {})[l] = new Array(l * l);
          for (var h = Math.PI / l, d = 0; d < l; d++) for (var _ = 0; _ < l; _++) D[l][_ + d * l] = Math.cos(h * (_ + 0.5) * d);
        })(u), c.map((function() {
          return 0;
        })).map((function(l, h) {
          return s * c.reduce((function(d, _, w, y) {
            return d + _ * D[u][w + h * u];
          }), 0);
        }));
      })), F = Object.freeze({ __proto__: null, amplitudeSpectrum: function(c) {
        return c.ampSpectrum;
      }, buffer: function(c) {
        return c.signal;
      }, chroma: function(c) {
        var s = c.ampSpectrum, u = c.chromaFilterBank;
        if (typeof s != "object") throw new TypeError("Valid ampSpectrum is required to generate chroma");
        if (typeof u != "object") throw new TypeError("Valid chromaFilterBank is required to generate chroma");
        var l = u.map((function(d, _) {
          return s.reduce((function(w, y, g) {
            return w + y * d[g];
          }), 0);
        })), h = Math.max.apply(Math, l);
        return h ? l.map((function(d) {
          return d / h;
        })) : l;
      }, complexSpectrum: function(c) {
        return c.complexSpectrum;
      }, energy: function(c) {
        var s = c.signal;
        if (typeof s != "object") throw new TypeError();
        for (var u = 0, l = 0; l < s.length; l++) u += Math.pow(Math.abs(s[l]), 2);
        return u;
      }, loudness: R, melBands: $, mfcc: function(c) {
        var s = c.ampSpectrum, u = c.melFilterBank, l = c.numberOfMFCCCoefficients, h = c.bufferSize, d = Math.min(40, Math.max(1, l || 13));
        if (u.length < d) throw new Error("Insufficient filter bank for requested number of coefficients");
        var _ = $({ ampSpectrum: s, melFilterBank: u, bufferSize: h });
        return T(_).slice(0, d);
      }, perceptualSharpness: function(c) {
        for (var s = R({ ampSpectrum: c.ampSpectrum, barkScale: c.barkScale }), u = s.specific, l = 0, h = 0; h < u.length; h++) l += h < 15 ? (h + 1) * u[h + 1] : 0.066 * Math.exp(0.171 * (h + 1));
        return l *= 0.11 / s.total;
      }, perceptualSpread: function(c) {
        for (var s = R({ ampSpectrum: c.ampSpectrum, barkScale: c.barkScale }), u = 0, l = 0; l < s.specific.length; l++) s.specific[l] > u && (u = s.specific[l]);
        return Math.pow((s.total - u) / s.total, 2);
      }, powerSpectrum: L, rms: function(c) {
        var s = c.signal;
        if (typeof s != "object") throw new TypeError();
        for (var u = 0, l = 0; l < s.length; l++) u += Math.pow(s[l], 2);
        return u /= s.length, u = Math.sqrt(u);
      }, spectralCentroid: function(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        return M(1, s);
      }, spectralCrest: function(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        var u = 0, l = -1 / 0;
        return s.forEach((function(h) {
          u += Math.pow(h, 2), l = h > l ? h : l;
        })), u /= s.length, u = Math.sqrt(u), l / u;
      }, spectralFlatness: function(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        for (var u = 0, l = 0, h = 0; h < s.length; h++) u += Math.log(s[h]), l += s[h];
        return Math.exp(u / s.length) * s.length / l;
      }, spectralFlux: function(c) {
        var s = c.signal, u = c.previousSignal, l = c.bufferSize;
        if (typeof s != "object" || typeof u != "object") throw new TypeError();
        for (var h = 0, d = -l / 2; d < s.length / 2 - 1; d++) x = Math.abs(s[d]) - Math.abs(u[d]), h += (x + Math.abs(x)) / 2;
        return h;
      }, spectralKurtosis: function(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        var u = s, l = M(1, u), h = M(2, u), d = M(3, u), _ = M(4, u);
        return (-3 * Math.pow(l, 4) + 6 * l * h - 4 * l * d + _) / Math.pow(Math.sqrt(h - Math.pow(l, 2)), 4);
      }, spectralRolloff: function(c) {
        var s = c.ampSpectrum, u = c.sampleRate;
        if (typeof s != "object") throw new TypeError();
        for (var l = s, h = u / (2 * (l.length - 1)), d = 0, _ = 0; _ < l.length; _++) d += l[_];
        for (var w = 0.99 * d, y = l.length - 1; d > w && y >= 0; ) d -= l[y], --y;
        return (y + 1) * h;
      }, spectralSkewness: function(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        var u = M(1, s), l = M(2, s), h = M(3, s);
        return (2 * Math.pow(u, 3) - 3 * u * l + h) / Math.pow(Math.sqrt(l - Math.pow(u, 2)), 3);
      }, spectralSlope: function(c) {
        var s = c.ampSpectrum, u = c.sampleRate, l = c.bufferSize;
        if (typeof s != "object") throw new TypeError();
        for (var h = 0, d = 0, _ = new Float32Array(s.length), w = 0, y = 0, g = 0; g < s.length; g++) {
          h += s[g];
          var S = g * u / l;
          _[g] = S, w += S * S, d += S, y += S * s[g];
        }
        return (s.length * y - d * h) / (h * (w - Math.pow(d, 2)));
      }, spectralSpread: function(c) {
        var s = c.ampSpectrum;
        if (typeof s != "object") throw new TypeError();
        return Math.sqrt(M(2, s) - Math.pow(M(1, s), 2));
      }, zcr: function(c) {
        var s = c.signal;
        if (typeof s != "object") throw new TypeError();
        for (var u = 0, l = 1; l < s.length; l++) (s[l - 1] >= 0 && s[l] < 0 || s[l - 1] < 0 && s[l] >= 0) && u++;
        return u;
      } });
      function Z(c) {
        if (Array.isArray(c)) {
          for (var s = 0, u = Array(c.length); s < c.length; s++) u[s] = c[s];
          return u;
        }
        return Array.from(c);
      }
      var G = {}, te = {}, K = { bitReverseArray: function(c) {
        if (G[c] === void 0) {
          for (var s = (c - 1).toString(2).length, u = "0".repeat(s), l = {}, h = 0; h < c; h++) {
            var d = h.toString(2);
            d = u.substr(d.length) + d, d = [].concat(Z(d)).reverse().join(""), l[h] = parseInt(d, 2);
          }
          G[c] = l;
        }
        return G[c];
      }, multiply: function(c, s) {
        return { real: c.real * s.real - c.imag * s.imag, imag: c.real * s.imag + c.imag * s.real };
      }, add: function(c, s) {
        return { real: c.real + s.real, imag: c.imag + s.imag };
      }, subtract: function(c, s) {
        return { real: c.real - s.real, imag: c.imag - s.imag };
      }, euler: function(c, s) {
        var u = -2 * Math.PI * c / s;
        return { real: Math.cos(u), imag: Math.sin(u) };
      }, conj: function(c) {
        return c.imag *= -1, c;
      }, constructComplexArray: function(c) {
        var s = {};
        s.real = c.real === void 0 ? c.slice() : c.real.slice();
        var u = s.real.length;
        return te[u] === void 0 && (te[u] = Array.apply(null, Array(u)).map(Number.prototype.valueOf, 0)), s.imag = te[u].slice(), s;
      } }, $e = function(c) {
        var s = {};
        c.real === void 0 || c.imag === void 0 ? s = K.constructComplexArray(c) : (s.real = c.real.slice(), s.imag = c.imag.slice());
        var u = s.real.length, l = Math.log2(u);
        if (Math.round(l) != l) throw new Error("Input size must be a power of 2.");
        if (s.real.length != s.imag.length) throw new Error("Real and imaginary components must have the same length.");
        for (var h = K.bitReverseArray(u), d = { real: [], imag: [] }, _ = 0; _ < u; _++) d.real[h[_]] = s.real[_], d.imag[h[_]] = s.imag[_];
        for (var w = 0; w < u; w++) s.real[w] = d.real[w], s.imag[w] = d.imag[w];
        for (var y = 1; y <= l; y++) for (var g = Math.pow(2, y), S = 0; S < g / 2; S++) for (var O = K.euler(S, g), b = 0; b < u / g; b++) {
          var B = g * b + S, I = g * b + S + g / 2, j = { real: s.real[B], imag: s.imag[B] }, se = { real: s.real[I], imag: s.imag[I] }, A = K.multiply(O, se), k = K.subtract(j, A);
          s.real[I] = k.real, s.imag[I] = k.imag;
          var z = K.add(A, j);
          s.real[B] = z.real, s.imag[B] = z.imag;
        }
        return s;
      }, Ae = $e, Re = (function() {
        function c(s, u) {
          var l = this;
          if (this._m = u, !s.audioContext) throw this._m.errors.noAC;
          if (s.bufferSize && !i(s.bufferSize)) throw this._m._errors.notPow2;
          if (!s.source) throw this._m._errors.noSource;
          this._m.audioContext = s.audioContext, this._m.bufferSize = s.bufferSize || this._m.bufferSize || 256, this._m.hopSize = s.hopSize || this._m.hopSize || this._m.bufferSize, this._m.sampleRate = s.sampleRate || this._m.audioContext.sampleRate || 44100, this._m.callback = s.callback, this._m.windowingFunction = s.windowingFunction || "hanning", this._m.featureExtractors = F, this._m.EXTRACTION_STARTED = s.startImmediately || !1, this._m.channel = typeof s.channel == "number" ? s.channel : 0, this._m.inputs = s.inputs || 1, this._m.outputs = s.outputs || 1, this._m.numberOfMFCCCoefficients = s.numberOfMFCCCoefficients || this._m.numberOfMFCCCoefficients || 13, this._m.numberOfBarkBands = s.numberOfBarkBands || this._m.numberOfBarkBands || 24, this._m.spn = this._m.audioContext.createScriptProcessor(this._m.bufferSize, this._m.inputs, this._m.outputs), this._m.spn.connect(this._m.audioContext.destination), this._m._featuresToExtract = s.featureExtractors || [], this._m.barkScale = f(this._m.bufferSize, this._m.sampleRate, this._m.bufferSize), this._m.melFilterBank = C(Math.max(this._m.melBands, this._m.numberOfMFCCCoefficients), this._m.sampleRate, this._m.bufferSize), this._m.inputData = null, this._m.previousInputData = null, this._m.frame = null, this._m.previousFrame = null, this.setSource(s.source), this._m.spn.onaudioprocess = function(h) {
            var d;
            l._m.inputData !== null && (l._m.previousInputData = l._m.inputData), l._m.inputData = h.inputBuffer.getChannelData(l._m.channel), l._m.previousInputData ? ((d = new Float32Array(l._m.previousInputData.length + l._m.inputData.length - l._m.hopSize)).set(l._m.previousInputData.slice(l._m.hopSize)), d.set(l._m.inputData, l._m.previousInputData.length - l._m.hopSize)) : d = l._m.inputData;
            var _ = (function(w, y, g) {
              if (w.length < y) throw new Error("Buffer is too short for frame length");
              if (g < 1) throw new Error("Hop length cannot be less that 1");
              if (y < 1) throw new Error("Frame length cannot be less that 1");
              var S = 1 + Math.floor((w.length - y) / g);
              return new Array(S).fill(0).map((function(O, b) {
                return w.slice(b * g, b * g + y);
              }));
            })(d, l._m.bufferSize, l._m.hopSize);
            _.forEach((function(w) {
              l._m.frame = w;
              var y = l._m.extract(l._m._featuresToExtract, l._m.frame, l._m.previousFrame);
              typeof l._m.callback == "function" && l._m.EXTRACTION_STARTED && l._m.callback(y), l._m.previousFrame = l._m.frame;
            }));
          };
        }
        return c.prototype.start = function(s) {
          this._m._featuresToExtract = s || this._m._featuresToExtract, this._m.EXTRACTION_STARTED = !0;
        }, c.prototype.stop = function() {
          this._m.EXTRACTION_STARTED = !1;
        }, c.prototype.setSource = function(s) {
          this._m.source && this._m.source.disconnect(this._m.spn), this._m.source = s, this._m.source.connect(this._m.spn);
        }, c.prototype.setChannel = function(s) {
          s <= this._m.inputs ? this._m.channel = s : console.error("Channel ".concat(s, " does not exist. Make sure you've provided a value for 'inputs' that is greater than ").concat(s, " when instantiating the MeydaAnalyzer"));
        }, c.prototype.get = function(s) {
          return this._m.inputData ? this._m.extract(s || this._m._featuresToExtract, this._m.inputData, this._m.previousInputData) : null;
        }, c;
      })(), re = { audioContext: null, spn: null, bufferSize: 512, sampleRate: 44100, melBands: 26, chromaBands: 12, callback: null, windowingFunction: "hanning", featureExtractors: F, EXTRACTION_STARTED: !1, numberOfMFCCCoefficients: 13, numberOfBarkBands: 24, _featuresToExtract: [], windowing: m, _errors: { notPow2: new Error("Meyda: Buffer size must be a power of 2, e.g. 64 or 512"), featureUndef: new Error("Meyda: No features defined."), invalidFeatureFmt: new Error("Meyda: Invalid feature format"), invalidInput: new Error("Meyda: Invalid input."), noAC: new Error("Meyda: No AudioContext specified."), noSource: new Error("Meyda: No source node specified.") }, createMeydaAnalyzer: function(c) {
        return new Re(c, Object.assign({}, re));
      }, listAvailableFeatureExtractors: function() {
        return Object.keys(this.featureExtractors);
      }, extract: function(c, s, u) {
        var l = this;
        if (!s) throw this._errors.invalidInput;
        if (typeof s != "object") throw this._errors.invalidInput;
        if (!c) throw this._errors.featureUndef;
        if (!i(s.length)) throw this._errors.notPow2;
        this.barkScale !== void 0 && this.barkScale.length == this.bufferSize || (this.barkScale = f(this.bufferSize, this.sampleRate, this.bufferSize)), this.melFilterBank !== void 0 && this.barkScale.length == this.bufferSize && this.melFilterBank.length == this.melBands || (this.melFilterBank = C(Math.max(this.melBands, this.numberOfMFCCCoefficients), this.sampleRate, this.bufferSize)), this.chromaFilterBank !== void 0 && this.chromaFilterBank.length == this.chromaBands || (this.chromaFilterBank = E(this.chromaBands, this.sampleRate, this.bufferSize)), "buffer" in s && s.buffer === void 0 ? this.signal = v(s) : this.signal = s;
        var h = pe(s, this.windowingFunction, this.bufferSize);
        if (this.signal = h.windowedSignal, this.complexSpectrum = h.complexSpectrum, this.ampSpectrum = h.ampSpectrum, u) {
          var d = pe(u, this.windowingFunction, this.bufferSize);
          this.previousSignal = d.windowedSignal, this.previousComplexSpectrum = d.complexSpectrum, this.previousAmpSpectrum = d.ampSpectrum;
        }
        var _ = function(w) {
          return l.featureExtractors[w]({ ampSpectrum: l.ampSpectrum, chromaFilterBank: l.chromaFilterBank, complexSpectrum: l.complexSpectrum, signal: l.signal, bufferSize: l.bufferSize, sampleRate: l.sampleRate, barkScale: l.barkScale, melFilterBank: l.melFilterBank, previousSignal: l.previousSignal, previousAmpSpectrum: l.previousAmpSpectrum, previousComplexSpectrum: l.previousComplexSpectrum, numberOfMFCCCoefficients: l.numberOfMFCCCoefficients, numberOfBarkBands: l.numberOfBarkBands });
        };
        if (typeof c == "object") return c.reduce((function(w, y) {
          var g;
          return Object.assign({}, w, ((g = {})[y] = _(y), g));
        }), {});
        if (typeof c == "string") return _(c);
        throw this._errors.invalidFeatureFmt;
      } }, pe = function(c, s, u) {
        var l = {};
        c.buffer === void 0 ? l.signal = v(c) : l.signal = c, l.windowedSignal = m(l.signal, s), l.complexSpectrum = Ae(l.windowedSignal), l.ampSpectrum = new Float32Array(u / 2);
        for (var h = 0; h < u / 2; h++) l.ampSpectrum[h] = Math.sqrt(Math.pow(l.complexSpectrum.real[h], 2) + Math.pow(l.complexSpectrum.imag[h], 2));
        return l;
      };
      return typeof window < "u" && (window.Meyda = re), re;
    }));
  })(ee)), ee.exports;
}
var He = Ke();
const We = /* @__PURE__ */ Ee(He);
class Ve {
  constructor({
    numBins: e = 4,
    cutoff: r = 2,
    smooth: n = 0.4,
    max: o = 15,
    scale: i = 10,
    isDrawing: m = !1,
    parentEl: f = document.body
  }) {
    this.vol = 0, this.scale = i, this.max = o, this.cutoff = r, this.smooth = n, this.setBins(e), this.beat = {
      holdFrames: 20,
      threshold: 40,
      _cutoff: 0,
      // adaptive based on sound state
      decay: 0.98,
      _framesSinceBeat: 0
      // keeps track of frames
    }, this.onBeat = () => {
    }, this.canvas = document.createElement("canvas"), this.canvas.width = 100, this.canvas.height = 80, this.canvas.style.width = "100px", this.canvas.style.height = "80px", this.canvas.style.position = "absolute", this.canvas.style.right = "0px", this.canvas.style.bottom = "0px", f.appendChild(this.canvas), this.isDrawing = m, this.ctx = this.canvas.getContext("2d"), this.ctx.fillStyle = "#DFFFFF", this.ctx.strokeStyle = "#0ff", this.ctx.lineWidth = 0.5, window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia({ video: !1, audio: !0 }).then((v) => {
      this.stream = v, this.context = new AudioContext();
      let p = this.context.createMediaStreamSource(v);
      this.meyda = We.createMeydaAnalyzer({
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
        const r = (o, i) => o + i;
        let n = Math.floor(e.loudness.specific.length / this.bins.length);
        this.prevBins = this.bins.slice(0), this.bins = this.bins.map((o, i) => e.loudness.specific.slice(i * n, (i + 1) * n).reduce(r)).map((o, i) => o * (1 - this.settings[i].smooth) + this.prevBins[i] * this.settings[i].smooth), this.fft = this.bins.map((o, i) => (
          // Math.max(0, (bin - this.cutoff) / (this.max - this.cutoff))
          Math.max(0, (o - this.settings[i].cutoff) / this.settings[i].scale)
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
      window["a" + n] = (o = 1, i = 0) => () => a.fft[n] * o + i;
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
    this.bins.forEach((n, o) => {
      var i = n * r;
      this.ctx.fillRect(o * e, this.canvas.height - i, e, i);
      var m = this.canvas.height - r * this.settings[o].cutoff;
      this.ctx.beginPath(), this.ctx.moveTo(o * e, m), this.ctx.lineTo((o + 1) * e, m), this.ctx.stroke();
      var f = this.canvas.height - r * (this.settings[o].scale + this.settings[o].cutoff);
      this.ctx.beginPath(), this.ctx.moveTo(o * e, f), this.ctx.lineTo((o + 1) * e, f), this.ctx.stroke();
    });
  }
}
let Me = !1;
function Qe(t) {
  Me = t;
}
function q(...t) {
  Me && console.log(...t);
}
class Ze {
  constructor(e) {
    this.mediaSource = new MediaSource(), this.stream = e, this.output = document.createElement("video"), this.output.autoplay = !0, this.output.loop = !0;
    let r = this;
    this.mediaSource.addEventListener("sourceopen", () => {
      q("MediaSource opened"), r.sourceBuffer = r.mediaSource.addSourceBuffer('video/webm; codecs="vp8"'), q("Source buffer: ", r.sourceBuffer);
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
        } catch (o) {
          alert(`MediaRecorder is not supported by this browser.

Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.`), console.error("Exception while creating MediaRecorder:", o);
          return;
        }
      }
    }
    q("Created MediaRecorder", this.mediaRecorder, "with options", e), this.mediaRecorder.onstop = this._handleStop.bind(this), this.mediaRecorder.ondataavailable = this._handleDataAvailable.bind(this), this.mediaRecorder.start(100), q("MediaRecorder started", this.mediaRecorder);
  }
  stop() {
    this.mediaRecorder.stop();
  }
  _handleStop() {
    const e = new Blob(this.recordedBlobs, { type: this.mediaRecorder.mimeType }), r = window.URL.createObjectURL(e);
    this.output.src = r;
    const n = document.createElement("a");
    n.style.display = "none", n.href = r;
    let o = /* @__PURE__ */ new Date();
    n.download = `hydra-${o.getFullYear()}-${o.getMonth() + 1}-${o.getDate()}-${o.getHours()}.${o.getMinutes()}.${o.getSeconds()}.webm`, document.body.appendChild(n), n.click(), setTimeout(() => {
      document.body.removeChild(n), window.URL.revokeObjectURL(r);
    }, 300);
  }
  _handleDataAvailable(e) {
    e.data && e.data.size > 0 && this.recordedBlobs.push(e.data);
  }
}
const oe = {
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
var Je = (t, e, r, n, o) => (t - e) * (o - n) / (r - e) + n, ce = (t, e) => (t % e + e) % e;
const Te = {
  init: () => {
    Array.prototype.fast = function(t = 1) {
      return this._speed = t, this;
    }, Array.prototype.smooth = function(t = 1) {
      return this._smooth = t, this;
    }, Array.prototype.ease = function(t = "linear") {
      return typeof t == "function" ? (this._smooth = 1, this._ease = t) : oe[t] && (this._smooth = 1, this._ease = oe[t]), this;
    }, Array.prototype.offset = function(t = 0.5) {
      return this._offset = t % 1, this;
    }, Array.prototype.fit = function(t = 0, e = 1) {
      let r = Math.min(...this), n = Math.max(...this);
      var o = this.map((i) => Je(i, r, n, t, e));
      return o._speed = this._speed, o._smooth = this._smooth, o._ease = this._ease, o;
    };
  },
  getValue: (t = []) => ({ time: e, bpm: r }) => {
    let n = t._speed ? t._speed : 1, o = t._smooth ? t._smooth : 0, i = e * n * (r / 60) + (t._offset || 0);
    if (o !== 0) {
      let m = t._ease ? t._ease : oe.linear, f = i - o / 2, v = t[Math.floor(ce(f, t.length))], p = t[Math.floor(ce(f + 1, t.length))], C = Math.min(ce(f, 1) / o, 1);
      return m(C) * (p - v) + v;
    } else
      return t[Math.floor(i % t.length)], t[Math.floor(i % t.length)];
  }
}, et = (t) => {
  var e = "", r = o(e), n = (i, m) => {
    e += `
      var ${i} = ${m}
    `, r = o(e);
  };
  return {
    addToContext: n,
    eval: (i) => r.eval(i)
  };
  function o(i) {
    globalThis.eval(i);
    var m = function(f) {
      globalThis.eval(f);
    };
    return {
      eval: m
    };
  }
};
class tt {
  constructor(e, r, n = []) {
    this.makeGlobal = r, this.sandbox = et(), this.parent = e;
    var o = Object.keys(e);
    o.forEach((i) => this.add(i)), this.userProps = n;
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
const rt = {
  float: {
    vec4: { name: "sum", args: [[1, 1, 1, 1]] },
    vec2: { name: "sum", args: [[1, 1]] }
  }
}, le = (t) => (t = t.toString(), t.indexOf(".") < 0 && (t += "."), t);
function st(t, e, r) {
  const n = t.transform.inputs, o = t.userArgs, { generators: i } = t.synth, { src: m } = i;
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
    if (p.type === "float" && (p.value = le(f.default)), f.type.startsWith("vec"))
      try {
        p.vecLen = Number.parseInt(f.type.substr(3));
      } catch {
        console.log(`Error determining length of vector input type ${f.type} (${f.name})`);
      }
    if (o.length > v) {
      if (p.value = o[v], typeof p.value == "function" && p.value.isHydraFunction) {
        const M = p.value.hydraFunctionName;
        throw new Error(`${t.name}() received the hydra function ${M} without parentheses for argument "${f.name}" - did you mean ${M}()?`);
      }
      if (p.type === "vec4" && !(p.value.type === "GlslSource" || p.value.getTexture))
        throw new Error("Arguments must be a texture or GlslSource");
      typeof o[v] == "function" ? (p.value = (M, R, L) => {
        try {
          const $ = o[v](R);
          return typeof $ == "number" ? $ : (console.warn("function does not return a number", o[v]), f.default);
        } catch ($) {
          return console.warn("ERROR", $), f.default;
        }
      }, p.isUniform = !0) : o[v].constructor === Array && (p.value = (M, R, L) => Te.getValue(o[v])(R), p.isUniform = !0);
    }
    if (!(e < 0)) {
      if (p.value && p.value.transforms) {
        const M = p.value.transforms[p.value.transforms.length - 1];
        if (M.transform.glsl_return_type !== f.type) {
          const R = rt[f.type];
          if (typeof R < "u") {
            const L = R[M.transform.glsl_return_type];
            if (typeof L < "u") {
              const { name: $, args: Y } = L;
              p.value = p.value[$](...Y);
            }
          }
        }
        p.isUniform = !1;
      } else if (p.type === "float" && typeof p.value == "number")
        p.value = le(p.value);
      else if (p.type.startsWith("vec") && typeof p.value == "object" && Array.isArray(p.value))
        p.isUniform = !1, p.value = `${p.type}(${p.value.map(le).join(", ")})`;
      else if (f.type === "sampler2D") {
        var C = p.value;
        if (!C || typeof C.getTexture != "function")
          throw new Error(`${t.name}() expects a texture source (such as s0 or o0) for argument "${f.name}", but received ${C}`);
        p.value = () => C.getTexture(), p.isUniform = !0;
      } else if (p.value.getTexture && f.type === "vec4") {
        var E = p.value;
        p.value = m(E), p.isUniform = !1;
      }
      p.isUniform && (p.name += e);
    }
    return p;
  });
}
function nt(t) {
  var e = {
    uniforms: [],
    // list of uniforms used in shader
    glslFunctions: [],
    // list of functions used in shader
    fragColor: ""
  }, r = Ce(t, e)("c", "st");
  e.fragColor = r;
  let n = {};
  return e.uniforms.forEach((o) => n[o.name] = o), e.uniforms = Object.values(n), e;
}
function fe(t, e) {
  return `${t}_i${e}`;
}
function Ce(t, e) {
  var r = (n, o) => "";
  return t.forEach((n, o) => {
    let i = st(n, e.uniforms.length);
    i.forEach((f) => {
      f.isUniform && e.uniforms.push(f);
    }), it(n, e.glslFunctions) || e.glslFunctions.push(n);
    var m = r;
    n.transform.type === "src" ? r = (f, v) => `${W(i, e)(`${f}${o}`, v)}
         vec4 ${f} = ${V(`${f}${o}`, v, n.name, i)};` : n.transform.type === "color" ? r = (f, v) => `${W(i, e)(`${f}${o}`, v)}
         ${m(f, v)}
         ${f} = ${V(`${f}${o}`, `${f}`, n.name, i)};` : n.transform.type === "coord" ? r = (f, v) => `${W(i, e)(`${f}${o}`, v)}
         ${v} = ${V(`${f}${o}`, `${v}`, n.name, i)};
         ${m(f, v)}` : n.transform.type === "combine" ? r = (f, v) => (
      // combining two generated shader strings (i.e. for blend, mult, add funtions)
      `${W(i, e)(`${f}${o}`, v)}
         ${m(f, v)}
         ${f} = ${V(`${f}${o}`, `${f}`, n.name, i)};`
    ) : n.transform.type === "combineCoord" && (r = (f, v) => `${W(i, e)(`${f}${o}`, v)}
         ${v} = ${V(`${f}${o}`, `${v}`, n.name, i)};
         ${m(f, v)}`);
  }), r;
}
function W(t, e) {
  let r = (o, i) => "";
  var n = r;
  return t.forEach((o, i) => {
    o.value.transforms && (n = r, r = (m, f) => {
      let v = fe(m, i), p = fe(`${f}_${m}`, i);
      return `vec2 ${p} = ${f};${n(m, f)}
         ${Ce(o.value.transforms, e)(v, p)}`;
    });
  }), r;
}
function V(t, e, r, n) {
  const o = n.map((i, m) => i.isUniform ? i.name : i.value && i.value.transforms ? fe(t, m) : i.value).reduce((i, m) => `${i}, ${m}`, "");
  return `${r}(${e}${o})`;
}
function it(t, e) {
  for (var r = 0; r < e.length; r++)
    if (t.name == e[r].name) return !0;
  return !1;
}
const he = {
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
  var e = nt(t, this.synth), r = {};
  e.uniforms.forEach((i) => {
    r[i.name] = i.value;
  });
  const n = this.synth && this.synth.renderer;
  var o;
  return n && typeof n.buildShader == "function" ? o = n.buildShader(e, {
    precision: this.defaultOutput.precision
  }) : o = `
  precision ${this.defaultOutput.precision} float;
  ${Object.values(e.uniforms).map((i) => {
    let m = i.type;
    return i.type === "texture" && (m = "sampler2D"), `
      uniform ${m} ${i.name};`;
  }).join("")}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;
  uniform sampler2D prevBuffer;

  ${Object.values(he).map((i) => `
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
    frag: o,
    uniforms: Object.assign({}, this.defaultUniforms, r)
  };
};
const at = () => [
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
class ot {
  constructor({
    defaultUniforms: e,
    defaultOutput: r,
    extendTransforms: n = [],
    changeListener: o = (() => {
    }),
    renderer: i = null
  } = {}) {
    this.defaultOutput = r, this.defaultUniforms = e, this.changeListener = o, this.extendTransforms = n, this.renderer = i, this.generators = {}, this.init();
  }
  init() {
    const e = at();
    return this.glslTransforms = {}, this.generators = Object.entries(this.generators).reduce((r, [n, o]) => (this.changeListener({ type: "remove", synth: this, method: n }), r), {}), this.sourceClass = class extends Q {
    }, Array.isArray(this.extendTransforms) ? e.concat(this.extendTransforms) : typeof this.extendTransforms == "object" && this.extendTransforms.type && e.push(this.extendTransforms), e.map((r) => this.setFunction(r));
  }
  _addMethod(e, r) {
    const n = this;
    if (this.glslTransforms[e] = r, r.type === "src") {
      const o = (...i) => new this.sourceClass({
        name: e,
        transform: r,
        userArgs: i,
        defaultOutput: this.defaultOutput,
        defaultUniforms: this.defaultUniforms,
        synth: n
      });
      return xe(o, e), this.generators[e] = o, this.changeListener({ type: "add", synth: this, method: e }), o;
    } else
      this.sourceClass.prototype[e] = function(...o) {
        return this.transforms.push({ name: e, transform: r, userArgs: o, synth: n }), this;
      }, xe(this.sourceClass.prototype[e], e);
  }
  setFunction(e) {
    var r = ct(e);
    r && this._addMethod(e.name, r);
  }
}
function xe(t, e) {
  t.isHydraFunction = !0, t.hydraFunctionName = e;
}
const Se = {
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
function ct(t) {
  let e = Se[t.type];
  if (e) {
    let r = e.args.concat(t.inputs), n = r.map((i) => `${i.type} ${i.name}`).join(", "), o = `
  ${e.returnType} ${t.name}(${n}) {
      ${t.glsl}
  }
`;
    return t.inputs = r.slice(1), Object.assign({}, t, { glsl: o });
  } else
    console.warn(`type ${t.type} not recognized`, t, Se);
}
class lt {
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
var N = function({ regl: t, precision: e, label: r = "", width: n, height: o }) {
  this.regl = t, this.precision = e, this.label = r, this.positionBuffer = this.regl.buffer([
    [-2, 0],
    [0, -2],
    [2, 2]
  ]), this.draw = () => {
  }, this.init(), this.pingPongIndex = 0, this.fbos = Array(2).fill().map(() => this.regl.framebuffer({
    color: this.regl.texture({
      mag: "nearest",
      width: n,
      height: o,
      format: "rgba"
    }),
    depthStencil: !1
  }));
};
N.prototype.resize = function(t, e) {
  this.fbos.forEach((r) => {
    r.resize(t, e);
  });
};
N.prototype.getCurrent = function() {
  return this.fbos[this.pingPongIndex];
};
N.prototype.getTexture = function() {
  var t = this.pingPongIndex ? 0 : 1;
  return this.fbos[t];
};
N.prototype.init = function() {
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
N.prototype.render = function(t) {
  let e = t[0];
  var r = this, n = Object.assign(e.uniforms, {
    prevBuffer: () => r.fbos[r.pingPongIndex]
  });
  r.draw = r.regl({
    frag: e.frag,
    vert: r.vert,
    attributes: r.attributes,
    uniforms: n,
    count: 3,
    framebuffer: () => (r.pingPongIndex = r.pingPongIndex ? 0 : 1, r.fbos[r.pingPongIndex])
  });
};
N.prototype.tick = function(t) {
  this.draw(t);
};
function ut(t) {
  return navigator.mediaDevices.enumerateDevices().then((e) => e.filter((r) => r.kind === "videoinput")).then((e) => {
    let r = { audio: !1, video: !0 };
    return e[t] && (r.video = {
      deviceId: { exact: e[t].deviceId }
    }), window.navigator.mediaDevices.getUserMedia(r);
  }).then((e) => {
    const r = document.createElement("video");
    return r.setAttribute("autoplay", ""), r.setAttribute("muted", ""), r.setAttribute("playsinline", ""), r.srcObject = e, new Promise((n, o) => {
      r.addEventListener("loadedmetadata", () => {
        r.play().then(() => n({ video: r }));
      });
    });
  }).catch(console.log.bind(console));
}
function ft(t) {
  return new Promise(function(e, r) {
    navigator.mediaDevices.getDisplayMedia(t).then((n) => {
      const o = document.createElement("video");
      o.srcObject = n, o.addEventListener("loadedmetadata", () => {
        o.play(), e({ video: o });
      });
    }).catch((n) => r(n));
  });
}
class ht {
  constructor({ regl: e, width: r, height: n, pb: o, label: i = "" }) {
    this.label = i, this.regl = e, this.src = null, this.dynamic = !0, this.width = r, this.height = n, this.tex = this.regl.texture({
      //  shape: [width, height]
      shape: [1, 1]
    }), this.pb = o;
  }
  init(e, r) {
    "src" in e && (this.src = e.src, this.tex = this.regl.texture({ data: this.src, ...r })), "dynamic" in e && (this.dynamic = e.dynamic);
  }
  initCam(e, r) {
    const n = this;
    ut(e).then((o) => {
      n.src = o.video, n.dynamic = !0, n.tex = n.regl.texture({ data: n.src, ...r });
    }).catch((o) => console.log("could not get camera", o));
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
    e && this.pb && (this.pb.initSource(e), this.pb.on("got video", function(o, i) {
      o === e && (n.src = i, n.dynamic = !0, n.tex = n.regl.texture({ data: n.src, ...r }));
    }));
  }
  // index only relevant in atom-hydra + desktop apps
  initScreen(e = 0, r) {
    const n = this;
    ft().then(function(o) {
      n.src = o.video, n.tex = n.regl.texture({ data: n.src, ...r }), n.dynamic = !0;
    }).catch((o) => console.log("could not get screen", o));
  }
  // cache for the canvases, so we don't create them every time
  canvases = {};
  // Creates a canvas and returns the 2d context
  initCanvas(e = 1e3, r = 1e3) {
    if (this.canvases[this.label] == null) {
      const m = document.createElement("canvas").getContext("2d");
      m != null && (this.canvases[this.label] = m);
    }
    const n = this.canvases[this.label], o = n.canvas;
    return o.width !== e && o.height !== r ? (o.width = e, o.height = r) : n.clearRect(0, 0, e, r), this.init({ src: o }), this.dynamic = !0, n;
  }
  resize(e, r) {
    this.width = e, this.height = r;
  }
  clear() {
    this.src && this.src.srcObject && this.src.srcObject.getTracks && this.src.srcObject.getTracks().forEach((e) => e.stop()), this.src = null, this.tex = this.regl.texture({ shape: [1, 1] });
  }
  tick(e) {
    this.src && this.dynamic === !0 && (this.src.videoWidth && this.src.videoWidth !== this.tex.width && (q(
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
function ue(t, e = {}) {
  let r = e.cols, n = e.rows;
  !r && !n ? (r = Math.ceil(Math.sqrt(t)), n = Math.ceil(t / r)) : n ? r || (r = Math.ceil(t / n)) : n = Math.ceil(t / r), r = Math.max(1, r), n = Math.max(1, n);
  const o = e.fit === !1 ? [1, 1] : [Math.min(1, r / n), Math.min(1, n / r)];
  return {
    cols: r,
    rows: n,
    fit: o,
    rowMajor: e.order === "row"
  };
}
function mt(t) {
  return {
    grid: [t.cols, t.rows],
    fit: t.fit,
    rowMajor: t.rowMajor ? 1 : 0
  };
}
function pt(t, e, r) {
  const n = Object.assign({ resolution: r }, mt(e));
  return t.forEach((o, i) => {
    n[`tex${i}`] = o.getCurrent();
  }), n;
}
const me = (t) => Array.from({ length: t }, (e, r) => r);
function dt(t) {
  return `
  precision ${t} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`;
}
function vt(t, e) {
  const r = me(t).map((o) => `uniform sampler2D tex${o};`).join(`
  `), n = me(t).map((o) => `${o ? "else " : ""}if (idx == ${o}) gl_FragColor = texture2D(tex${o}, local);`).join(`
    `);
  return `
  precision ${e} float;
  varying vec2 uv;
  uniform vec2 grid;       // (cols, rows)
  uniform vec2 fit;        // fraction of each cell used, to keep the output aspect
  uniform float rowMajor;  // 1.0 = left-to-right then down, 0.0 = top-to-bottom then right
  ${r}

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
    ${n}
    else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }`;
}
function gt(t, e) {
  const r = {
    grid: t.prop("grid"),
    fit: t.prop("fit"),
    rowMajor: t.prop("rowMajor")
  };
  return me(e).forEach((n) => {
    r[`tex${n}`] = t.prop(`tex${n}`);
  }), r;
}
class yt extends lt {
  constructor() {
    super(), this._canvas = null, this._regl = null, this._width = 0, this._height = 0, this._precision = "mediump", this._outputs = [], this._sources = [], this._renderFboCommand = null, this._renderAllCommand = null, this._numOutputs = 4, this._gridLayout = null;
  }
  init(e, r = {}) {
    const {
      precision: n = "mediump",
      width: o = e.width || 1280,
      height: i = e.height || 720,
      pb: m = null,
      numOutputs: f = 4
    } = r;
    this._canvas = e, this._numOutputs = f, this._gridLayout = ue(f), this._width = o, this._height = i, this._precision = n, this._pb = m, this._regl = Fe({
      canvas: this._canvas,
      pixelRatio: 1
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
    }), this._renderAllCommand = this._buildRenderAllCommand(f);
  }
  _buildRenderAllCommand(e) {
    return this._regl({
      frag: vt(e, this._precision),
      vert: dt(this._precision),
      attributes: {
        position: [
          [-2, 0],
          [0, -2],
          [2, 2]
        ]
      },
      uniforms: gt(this._regl, e),
      count: 3,
      depth: { enable: !1 }
    });
  }
  // Choose how outputs tile the canvas in render-all mode: {cols, rows, fit, order}
  setGridLayout(e = {}) {
    return this._gridLayout = ue(this._numOutputs, e), this._gridLayout;
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
    const n = new N({
      regl: this._regl,
      width: r.width || this._width,
      height: r.height || this._height,
      precision: this._precision,
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
    const n = new ht({
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
    e.length !== this._numOutputs && (this._numOutputs = e.length, this._gridLayout = ue(e.length), this._renderAllCommand = this._buildRenderAllCommand(e.length)), this._renderAllCommand(pt(e, this._gridLayout, [this._width, this._height]));
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
    return he;
  }
  buildShader(e, r = {}) {
    return `
  precision ${r.precision || this._precision} float;
  ${Object.values(e.uniforms).map((o) => {
      let i = o.type;
      return o.type === "texture" && (i = "sampler2D"), `
      uniform ${i} ${o.name};`;
    }).join("")}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;
  uniform sampler2D prevBuffer;

  ${Object.values(he).map((o) => `
            ${o.glsl}
          `).join("")}

  ${e.glslFunctions.map((o) => `
            ${o.transform[this.shaderLanguage] || o.transform.glsl}
          `).join("")}

  void main () {
    vec2 st = gl_FragCoord.xy/resolution.xy;

    ${e.fragColor}
    gl_FragColor = c;
  }
  `;
  }
}
const _t = Ne();
class wt {
  constructor({
    pb: e = null,
    width: r = 1280,
    height: n = 720,
    numSources: o = 4,
    numOutputs: i = 4,
    makeGlobal: m = !0,
    autoLoop: f = !0,
    detectAudio: v = !0,
    enableStreamCapture: p = !0,
    canvas: C,
    precision: E,
    extendTransforms: M = {},
    // add your own functions on init
    debug: R = !1
    // enable non-error console logging
  } = {}) {
    if (Qe(R), Te.init(), this.pb = e, this.width = r, this.height = n, this.renderAll = !1, this.detectAudio = v, this._initCanvas(C), this.synth = {
      time: 0,
      bpm: 30,
      width: this.width,
      height: this.height,
      fps: void 0,
      stats: {
        fps: 0
      },
      speed: 1,
      mouse: _t,
      render: this._render.bind(this),
      setResolution: this.setResolution.bind(this),
      update: ($) => {
      },
      // user defined update function
      afterUpdate: ($) => {
      },
      // user defined function run after update
      hush: this.hush.bind(this),
      tick: this.tick.bind(this)
    }, m && (window.loadScript = this.loadScript), this.timeSinceLastUpdate = 0, this._time = 0, E && ["lowp", "mediump", "highp"].includes(E.toLowerCase()))
      this.precision = E.toLowerCase();
    else {
      let $ = (/iPad|iPhone|iPod/.test(navigator.platform) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) && !window.MSStream;
      this.precision = $ ? "highp" : "mediump";
    }
    if (this.extendTransforms = M, this.saveFrame = !1, this.captureStream = null, this.generator = void 0, this.renderer = new yt(), this.renderer.init(this.canvas, {
      precision: this.precision,
      width: this.width,
      height: this.height,
      pb: this.pb,
      numOutputs: i
    }), this.regl = this.renderer.regl, this.synth.renderer = this.renderer, this._initOutputs(i), this._initSources(o), this._generateGlslTransforms(), this.synth.screencap = () => {
      this.saveFrame = !0;
    }, this.synth.setGridLayout = ($) => this.renderer.setGridLayout($), p)
      try {
        this.captureStream = this.canvas.captureStream(25), this.synth.vidRecorder = new Ze(this.captureStream);
      } catch ($) {
        console.warn(`[hydra-synth warning]
new MediaSource() is not currently supported on iOS.`), console.error($);
      }
    v && this._initAudio(), f && Ue(this.tick.bind(this)).start(), this.sandbox = new tt(this.synth, m, ["speed", "update", "afterUpdate", "bpm", "fps"]);
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
    return new Promise((n, o) => {
      var i = document.createElement("script");
      i.onload = function() {
        q(`loaded script ${e}`), n();
      }, i.onerror = (m) => {
        console.log(`error loading script ${e}`, "log-error"), n();
      }, i.src = e, document.head.appendChild(i);
    });
  }
  setResolution(e, r) {
    this.width = e, this.height = r, this.sandbox.set("width", e), this.sandbox.set("height", r), q(this.width), this.renderer.resize(e, r), q(this.canvas.width);
  }
  canvasToImage(e) {
    const r = document.createElement("a");
    r.style.display = "none";
    let n = /* @__PURE__ */ new Date();
    r.download = `hydra-${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}-${n.getHours()}.${n.getMinutes()}.${n.getSeconds()}.png`, document.body.appendChild(r);
    var o = this;
    this.canvas.toBlob((i) => {
      o.imageCallback ? (o.imageCallback(i), delete o.imageCallback) : (r.href = URL.createObjectURL(i), q(r.href), r.click());
    }, "image/png"), setTimeout(() => {
      document.body.removeChild(r), window.URL.revokeObjectURL(r.href);
    }, 300);
  }
  _initAudio() {
    this.synth.a = new Ve({
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
    this.o = Array(e).fill().map((n, o) => {
      var i = this.renderer.createOutput(o, {
        width: this.width,
        height: this.height,
        label: `o${o}`
      });
      return r.synth["o" + o] = i, i;
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
    this.generator = new ot({
      defaultOutput: this.o[0],
      defaultUniforms: this.o[0].uniforms,
      extendTransforms: this.extendTransforms,
      renderer: this.renderer,
      changeListener: ({ type: r, method: n, synth: o }) => {
        r === "add" && (e.synth[n] = o.generators[n], e.sandbox && e.sandbox.add(n));
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
          } catch (o) {
            console.log(o);
          }
        for (let o = 0; o < this.s.length; o++)
          this.s[o].tick(this.synth.time);
        const n = this.synth.time;
        for (let o = 0; o < this.o.length; o++)
          this.o[o].tick({
            time: n,
            mouse: this.synth.mouse,
            bpm: this.synth.bpm,
            resolution: [this.canvas.width, this.canvas.height]
          });
        if (this.isRenderingAll ? this.renderer.renderAllToScreen(this.o) : this.renderer.renderToScreen(this.output), this.synth.afterUpdate)
          try {
            this.synth.afterUpdate(this.timeSinceLastUpdate);
          } catch (o) {
            console.log(o);
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
  wt as default
};
