// Dev entry point for testing hydra-synth with extensions
import Hydra from '../src/hydra-synth.js'
import { install as installVertex } from '../extensions/vertex/index.js'

function init() {
  // Create hydra instance
  window.hydra = new Hydra({
    detectAudio: false,
    makeGlobal: true
  })

  // Install vertex extension
  installVertex(window.hydra)

  // Test: osc shader on sphere geometry
  console.log('[dev] Testing osc(10).out(o0, sphere())')
  osc(10).out(o0, sphere())
}

window.onload = init
