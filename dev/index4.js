import Hydra from "./../src/hydra-synth.js";
import {BGSynth} from './../src/BGSynth.js';
import * as Comlink from "comlink";

//const { fugitiveGeometry, exampleVideo, exampleResize, nonGlobalCanvas } = import('./examples.js')

// console.log('HYDRA', Hydra)

async function init () {

  const canvas = document.createElement('canvas')
  canvas.style.backgroundColor = "#000"
  document.body.appendChild(canvas);
//  canvas.width = 720
//  canvas.height = 480
  document.body.appendChild(canvas)

	canvas.style.width = '100%'
	canvas.style.height = '100%'
// //  exampleCustomCanvas()



//var hydra = new Hydra({canvas: canvas, detectAudio:true, makeGlobal: true, genWGSL: true}) // true false
//if (hydra.wgslPromise) await hydra.wgslPromise;

let hydra;
let wgsl = true;
let runBG = false;
let useOffscreen = true;

if (runBG) {
	if (useOffscreen) { // true  false
 const offscreen = canvas.transferControlToOffscreen();
 hydra = new BGSynth(offscreen, wgsl, true);
} else {
	 hydra = new BGSynth(canvas, wgsl, false);
}
	await	hydra.openWorker();
} else {
// Run in foreground 
	 hydra = new Hydra({canvas: canvas, detectAudio:true, makeGlobal: true, useWGSL: wgsl}) // true false
	 if (wgsl) await hydra.wgslPromise;
}


function fitCanvas() {
	 canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   hydra.setResolution(canvas.width, canvas.height);
}

window.addEventListener('resize', fitCanvas, false);

// *******************************************
// test code follows:

let testcode = `


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
//.luma()
.repeatX(4)
.repeatY(4)
.modulate(
  osc(1, -0.9, 300)
)
.scale(2)
.out()

//Glitch River
//Flor de Fuego
//https://flordefuego.github.io/
voronoi(8,1)
.mult(osc(10,0.1,()=>Math.sin(time)*3).saturate(3).kaleid(200))
.modulate(o2,0.5)
.add(o2,0.8)
.scrollY(-0.01)
.scale(0.99)
.modulate(voronoi(8,1),0.008)
.luma(0.3)
.out(o2)

noise(()=>time, ()=>time / 10.).out(o1);

s3.initVideo("https://media.giphy.com/media/26ufplp8yheSKUE00/giphy.mp4", {})
//s3.initCam();
src(s3).scale(1.1).blend(src(o3).scale(1.1), 0.8).out(o3);
//src(s3).out(o3)
render();

`;

// *******************************************
// current test code should be above


if (runBG) {
	hydra.setSketch(testcode, false);
} else {
  hydra.eval(testcode, false);
}


// *******************************************
// Inactive code parked below.
//

/*
`
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
//.luma()
.repeatX(4)
.repeatY(4)
.modulate(
  osc(1, -0.9, 300)
)
.scale(2)
.out()

//Glitch River
//Flor de Fuego
//https://flordefuego.github.io/
voronoi(8,1)
.mult(osc(10,0.1,()=>Math.sin(time)*3).saturate(3).kaleid(200))
.modulate(o2,0.5)
.add(o2,0.8)
.scrollY(-0.01)
.scale(0.99)
.modulate(voronoi(8,1),0.008)
.luma(0.3)
.out(o2)

noise(()=>time, ()=>time / 10.).out(o1);
render()


//s3.initVideo("https://media.giphy.com/media/26ufplp8yheSKUE00/giphy.mp4", {})
s3.initCam();
//src(s3).scale(1.1).blend(src(o3).scale(1.1), 0.8).out(o3);
src(s3).out(o3)
render();

*/


/*
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
//.luma()
.repeatX(4)
.repeatY(4)
.modulate(
  osc(1, -0.9, 300)
)
.scale(2)
.out(o1)


//Glitch River
//Flor de Fuego
//https://flordefuego.github.io/
voronoi(8,1)
.mult(osc(10,0.1,()=>Math.sin(time)*3).saturate(3).kaleid(200))
.modulate(o2,0.5)
.add(o2,0.8)
.scrollY(-0.01)
.scale(0.99)
.modulate(voronoi(8,1),0.008)
.luma(0.3)
.out(o2)

s3.initVideo("https://media.giphy.com/media/26ufplp8yheSKUE00/giphy.mp4", {})
src(s3).out(o3);
render();


//ee_5 . FUGITIVE GEOMETRY VHS . audioreactive shapes and gradients
// e_e // @eerie_ear
//
let s= ()=>
  shape(4)
.scrollX([-0.5,-0.2,0.3,-0.1,-0.1].smooth(0.1).fast(0.3))
.scrollY([0.25,-0.2,0.3,-0.1,0.2].smooth(0.9).fast(0.15))
//
solid()
.add(gradient(3,0.05).rotate(0.05,-0.2).posterize(2).contrast(0.6),[1,0,1,0.5,0,0.6].smooth(0.9))
.add(s())
.mult(s().scale(0.8).scrollX(0.01).scrollY(-0.01).rotate(0.2,0.06).add(gradient(3).contrast(0.6),[1,0,1,0.5].smooth(0.9),0.5).mult(src(o0).scale(0.98),()=>a.fft[0]*9)
     )
.diff(s().modulate(shape(500)).scale([1.7,1.2].smooth(0.9).fast(0.05)))
.add(gradient(2).invert(),()=>a.fft[2])
.mult(gradient(()=>a.fft[3]*8))
.blend(src((o0),()=>a.fft[1]*40))
.add(voronoi(()=>a.fft[1],()=>a.fft[3],()=>a.fft[0]).thresh(0.7).posterize(2,4).luma(0.9).scrollY(1,()=>a.fft[0]/30).colorama(3).thresh(()=>a.fft[1]).scale(()=>a.fft[3]*2),()=>a.fft[0]/2)
  .out()
//
speed= 1

a.setSmooth(0.96)

//noise(()=>time, ()=>time / 10.).out();


*/


// *******************************************
// don't step on the following:
}


// Hello humans
window.onload = init
