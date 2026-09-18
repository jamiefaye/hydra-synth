//const transforms = require('./glsl-transforms.js')
import { normalizeDepth, delayedIndex, makeDelayProxy } from './lib/frame-ring.js'

var Output = function ({ regl, precision, filter = 'nearest', label = "", width, height, depth = 2 }) {
  this.regl = regl
  this.precision = precision
  this.filter = filter
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

Output.prototype._makeFbos = function (depth, width, height) {
  return (Array(depth)).fill().map(() => this.regl.framebuffer({
    color: this.regl.texture({
      mag: this.filter,
      min: this.filter,
      width: width,
      height: height,
      format: 'rgba'
    }),
    depthStencil: false
  }))
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
  this.fbos = this._makeFbos(depth, width, height)
  return this
}

Output.prototype.getCurrent = function () {
  return this.fbos[this.pingPongIndex]
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
            return self.fbos[self.pingPongIndex]
          }
        })

  self.draw = self.regl({
    frag: pass.frag,
    vert: self.vert,
    attributes: self.attributes,
    uniforms: uniforms,
    count: 3,
    framebuffer: () => {
      self.pingPongIndex = (self.pingPongIndex + 1) % self.depth
      return self.fbos[self.pingPongIndex]
    }
  })
}


Output.prototype.tick = function (props) {
//  console.log(props)
  this.draw(props)
}

export default Output
