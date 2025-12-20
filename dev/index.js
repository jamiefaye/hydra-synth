import Hydra from './../src/hydra-synth.js'
// import { fugitiveGeometry, exampleVideo, exampleResize, nonGlobalCanvas } from './examples.js'

// console.log('HYDRA', Hydra)
// const HydraShaders = require('./../shader-generator.js')

// Toggle this to test WebGL vs WebGPU
const useWebGPU = true

async function init() {
  window.hydra = new Hydra({detectAudio: false, makeGlobal: true, useWGSL: useWebGPU})

  if (useWebGPU) {
    await hydra.wgslPromise
    console.log('WebGPU mode active')
  } else {
    console.log('WebGL mode active')
  }

  // Multiple outputs test
  osc(10).out(o0)
  noise(5).out(o1)
  src(o0).blend(src(o1)).out(o2)
  render()
}

window.onload = init
