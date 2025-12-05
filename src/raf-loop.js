// Simplified RAF loop - no Node.js dependencies
import { raf, cancel } from './raf.js';

function now() {
  return performance.now();
}

function Engine(fn) {
  if (!(this instanceof Engine))
    return new Engine(fn);
  this.running = false;
  this.last = now();
  this._frame = 0;
  this._tick = this.tick.bind(this);
  this._fn = fn;
}

Engine.prototype.start = function() {
  if (this.running)
    return;
  this.running = true;
  this.last = now();
  this._frame = raf(this._tick);
  return this;
};

Engine.prototype.stop = function() {
  this.running = false;
  if (this._frame !== 0)
    cancel(this._frame);
  this._frame = 0;
  return this;
};

Engine.prototype.tick = function() {
  this._frame = raf(this._tick);
  var time = now();
  var dt = time - this.last;
  if (this._fn) this._fn(dt);
  this.last = time;
};

var loop = Engine;

export { loop };
