
const Hydra = require('./../')
// import Hydra from './../src/index.js'
const { fugitiveGeometry, exampleVideo, exampleResize, nonGlobalCanvas } = require('./examples.js')

// console.log('HYDRA', Hydra)

async function init () {
 
//   const canvas = document.createElement('canvas')
//   canvas.style.backgroundColor = "#000"
//   canvas.width = 800
//   canvas.height = 200
//   document.body.appendChild(canvas)
//   // canvas.style.width = '100%'
//   // canvas.style.height = '100%'
// //  exampleCustomCanvas()



var hydra = new Hydra({detectAudio:false, makeGlobal: true})
if (hydra.wgslPromise) await hydra.wgslPromise;

//osc().out()
// console.log(hydra)
// window.hydra = hydra
// // //osc().out()
// exampleVideo()
// exampleResize()
//nonGlobalCanvas()

//s0.initVideo("https://media.giphy.com/media/26ufplp8yheSKUE00/giphy.mp4", {})
//src(s0).repeat().out()




// by Zach Krall
// http://zachkrall.online/

osc(10, 0.9, 300)
.color(0.9, 0.7, 0.8)
.diff(
  osc(45, 0.3, 100)
  .color(0.9, 0.9, 0.9)
  .rotate(0.18)
  .pixelate(12)
  .kaleid()
)
.scrollX(10)
.colorama()
.luma()
.repeatX(4)
.repeatY(4)
.modulate(
  osc(1, -0.9, 300)
)
.scale(2)
.out()


}

window.onload = init
