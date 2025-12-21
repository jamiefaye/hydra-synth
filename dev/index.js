import { createHydra } from './../extensions/vertex/index-webgpu.js'

// Toggle this to test WebGL vs WebGPU
const useWebGPU = false

async function init() {
  // createHydra handles both WebGL and WebGPU, auto-installs vertex extension
  window.hydra = await createHydra({
    detectAudio: false,
    makeGlobal: true,
    useWGSL: useWebGPU
  })

  console.log(useWebGPU ? 'WebGPU mode active' : 'WebGL mode active')

  loadGlb('https://raw.githubusercontent.com/jamiefaye/hydra-models/main/AnimalKit/Cat.glb').then(model => {
    osc(10).out(o0, model.rotateY(() => time).perspective(45))
  })
}

window.onload = init
