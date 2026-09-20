//const transforms = require('./glsl-transforms.js')
import { normalizeDepth, delayedIndex, makeDelayProxy } from './lib/frame-ring.js'

const HALF_FLOAT_EXTENSIONS = ['OES_texture_half_float', 'OES_texture_half_float_linear', 'EXT_color_buffer_half_float']
let warnedNoHalfFloat = false
function halfFloatOk (regl, filter) {
  const need = filter === 'linear' ? HALF_FLOAT_EXTENSIONS : HALF_FLOAT_EXTENSIONS.filter(e => e !== 'OES_texture_half_float_linear')
  const missing = need.filter(e => !regl.hasExtension(e))
  if (missing.length && !warnedNoHalfFloat) {
    warnedNoHalfFloat = true
    console.warn('[hydra-synth] float outputs need ' + missing.join(', ') + '; staying 8-bit')
  }
  return missing.length === 0
}

var Output = function ({ regl, precision, filter = 'nearest', float = false, label = "", width, height, depth = 2 }) {
  this.regl = regl
  this.precision = precision
  this.filter = filter
  // half-float frames: values past 0..1 and fine steps survive from one frame to the next (feedback
  // with headroom). Needs the half-float extensions; without them the output stays 8-bit.
  this.float = float && halfFloatOk(regl, filter)
  this.label = label
  this.positionBuffer = this.regl.buffer([
    [-2, 0],
    [0, -2],
    [2, 2]
  ])

  this.draw = () => {}
  this.init()
  this.pingPongIndex = 0
  this.width = width
  this.height = height

  // Frame ring: `depth` fbos, 2 = classic ping-pong. See src/lib/frame-ring.js
  this.depth = normalizeDepth(depth)
  this.fbos = this._makeFbos(this.depth, width, height)

  // array containing render passes
//  this.passes = []
}

// withDepthBuffer: the vertex extension asks for a z buffer once 3D geometry is drawn (its enableDepthBuffer
// and setDepth call this one: createHydra's outputs are these Outputs with the extension's methods laid over)
Output.prototype._makeFbos = function (depth, width, height, withDepthBuffer = false) {
  return (Array(depth)).fill().map(() => this.regl.framebuffer(Object.assign({
    color: this.regl.texture({
      mag: this.filter,
      min: this.filter,
      width: width,
      height: height,
      format: 'rgba',
      type: this.float ? 'half float' : 'uint8'
    })
  }, withDepthBuffer ? { depth: true } : { depthStencil: false })))
}

Output.prototype.resize = function(width, height) {
  this.width = width
  this.height = height
  this.fbos.forEach((fbo) => {
    fbo.resize(width, height)
  })
//  console.log(this)
}

// Number of frames kept; delay(k) can reach k = 1 .. depth - 1. Reallocates the ring.
Output.prototype.setDepth = function (depth) {
  depth = normalizeDepth(depth)
  if (depth === this.depth) return this
  const width = this.fbos[0].width, height = this.fbos[0].height
  this.fbos.forEach(fbo => fbo.destroy())
  this.depth = depth
  this.pingPongIndex = 0
  this.fbos = this._makeFbos(depth, width, height, !!this.hasDepthBuffer)
  return this
}

Output.prototype.getCurrent = function () {
  return this.fbos[this.pingPongIndex]
}

// Step the ring. The frame loop calls this on every output before any of them draws, so outputs read
// each other at the same frame (T-1) whichever draws first. Not called: the draw steps the ring itself.
Output.prototype.advance = function () {
  this.pingPongIndex = (this.pingPongIndex + 1) % this.depth
  this._advanced = true
}

// The frame `delay` frames ago (default 1 = the last completed frame)
Output.prototype.getTexture = function (delay = 1) {
  return this.fbos[delayedIndex(this.pingPongIndex, this.depth, delay)]
}

// Texture source for k frames ago: src(o0.delay(12)); k may be a function
Output.prototype.delay = function (k) {
  return makeDelayProxy(this, k)
}

Output.prototype.init = function () {
//  console.log('clearing')
  this.transformIndex = 0
  this.fragHeader = `
  precision ${this.precision} float;

  uniform float time;
  varying vec2 uv;
  `

  this.fragBody = ``

  this.vert = `
  precision ${this.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`

  this.attributes = {
    position: this.positionBuffer
  }
  this.uniforms = {
    time: this.regl.prop('time'),
    resolution: this.regl.prop('resolution')
  }

  this.frag = `
       ${this.fragHeader}

      void main () {
        vec4 c = vec4(0, 0, 0, 0);
        vec2 st = uv;
        ${this.fragBody}
        gl_FragColor = c;
      }
  `
  return this
}


Output.prototype.render = function (passes) {
  let pass = passes[0]
  //console.log('pass', pass, this.pingPongIndex)
  var self = this
      var uniforms = Object.assign(pass.uniforms, { prevBuffer:  () =>  {
             //var index = this.pingPongIndex ? 0 : 1
          //   var index = self.pingPong[(passIndex+1)%2]
          //  console.log('ping pong', self.pingPongIndex)
            return self._advanced ? self.getTexture(1) : self.fbos[self.pingPongIndex]   // same frame as before advance(), whether or not the ring has stepped yet
          }
        })

  self.draw = self.regl({
    frag: pass.frag,
    vert: self.vert,
    attributes: self.attributes,
    uniforms: uniforms,
    count: 3,
    framebuffer: () => {
      if (self._advanced) self._advanced = false; else self.pingPongIndex = (self.pingPongIndex + 1) % self.depth
      return self.fbos[self.pingPongIndex]
    }
  })
}


Output.prototype.tick = function (props) {
//  console.log(props)
  this.draw(props)
}

export default Output
