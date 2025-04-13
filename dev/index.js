
import Hydra from "./../src/hydra-synth.js";

//const { fugitiveGeometry, exampleVideo, exampleResize, nonGlobalCanvas } = import('./examples.js')

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

console.log("Hydra loaded!");

var hydra = new Hydra({detectAudio:false, makeGlobal: true, genWGSL: true})
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

//s1.initCam();
//src(s1).out();

//osc(10, 0.9, 300).out(o2);
//noise().blend(o2, 0.5).out();



//noise(()=>{time}).out();
//osc(8,-0.5, 1).color(-1.5, -1.5, -1.5).blend(o0).rotate(-0.5, -0.5).modulate(shape(4).rotate(0.5, 0.5).scale(2).repeatX(2, 2).repeatY(2, 2)).out(o1);

//osc(()=>time % 5 *10, 0.9, 300).kaleid(31).out(o2);
//noise([1,2,5,8,10]).blend(o2, 0.8).out();




s1.initCam();
src(s1).out(o0);

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
.out(o0)

//osc(()=>time % 5 *10, 0.9, 300).kaleid(31).out(o1);

s1.initCam();
src(s1).out(o1);

s2.initVideo("https://media.giphy.com/media/26ufplp8yheSKUE00/giphy.mp4", {})
src(s2).out(o2);

osc(()=>time % 5 *10, 0.9, 300).kaleid(7).out(o3);
//noise([1,2,5,8,10]).blend(o2, 0.8).out(o3);

render()

//s0.initImage("https://upload.wikimedia.org/wikipedia/commons/2/25/Hydra-Foto.jpg")
//s0.initVideo("https://media.giphy.com/media/AS9LIFttYzkc0/giphy.mp4");
//src(s0).out()
}
window.onload = init
