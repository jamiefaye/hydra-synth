import Hydra from './../src/hydra-synth.js'
// import { fugitiveGeometry, exampleVideo, exampleResize, nonGlobalCanvas } from './examples.js'

// console.log('HYDRA', Hydra)
// const HydraShaders = require('./../shader-generator.js')

// Toggle this to test WebGL vs WebGPU
const useWebGPU = true

async function init() {
  // Constructor returns a promise in WGSL mode, so await works for both backends
  window.hydra = await new Hydra({detectAudio: false, makeGlobal: true, useWGSL: useWebGPU})

  console.log(useWebGPU ? 'WebGPU mode active' : 'WebGL mode active')

  // Multiple outputs test
  osc(10).out(o0)
  noise(5).out(o1)
  src(o0).blend(src(o1)).out(o2)
  render()
}

window.onload = init
