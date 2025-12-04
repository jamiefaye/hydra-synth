import Hydra from './../src/hydra-synth.js'
import {BGSynth} from './../src/workers/BGSynth.js'
import {openMsgBroker} from './../src/workers/MsgBroker.js'
import {getSharedDevice, hasSharedDevice, releaseSharedDevice} from './../src/wgsl/gpu-device-factory.js'

// export default Synth
export {Hydra, BGSynth, openMsgBroker, getSharedDevice, hasSharedDevice, releaseSharedDevice}