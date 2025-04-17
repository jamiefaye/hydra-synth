import * as Comlink from "comlink";
import {Webcam} from './lib/webcam.js'
import Screen from './lib/screenmedia.js'

class SourceProxy {
// sourceX = 0-3 (or whatever), which BGHydraSource to send to.
	constructor(kind, worker, sourceX, mediaAddr, params) {
		this.kind = kind;
		this.bgWorker = worker;
		this.sourceX = sourceX;
		this.mediaAddr = mediaAddr;
		this.params = params;
		this.open = false;
		this.updates = 0;
		this.openSource();
	}

	openSource() {
	  const self = this;

		if (this.kind === 'webcam') {
      Webcam(this.mediaAddr)
      .then(response => {
        self.src = response.video
        self.dynamic = true
        self.offCan = new OffscreenCanvas(640, 480);
        self.offCTX = self.offCan.getContext('2d');
        self.open = true;
      })
      .catch(err => console.log('could not get camera', err))
		} else if (this.kind === 'video') {
    	const vid = document.createElement('video')
    	vid.crossOrigin = 'anonymous'
    	vid.autoplay = true
    	vid.loop = true
    	vid.muted = true // mute in order to load without user interaction
    	const onload = vid.addEventListener('loadeddata', () => {
      	self.src = vid
      	vid.play()
      	self.offCan = new OffscreenCanvas(vid.videoWidth, vid.videoHeight);
        self.offCTX = self.offCan.getContext('2d');
      	self.dynamic = true
      	self.open = true
    	})
   	 vid.src = this.mediaAddr
		} else if (this.kind === 'image') {
    	const img = document.createElement('img')
    	img.crossOrigin = 'anonymous'
    	img.src = this.mediaAddr
    	img.onload = () => {
      	self.src = img
      	self.dynamic = false
      	self.offCan = new OffscreenCanvas(img.width, img.height);
        self.offCTX = self.offCan.getContext('2d');
        self.dynamic = false
      	self.open = true
      }
      // The 'screen' option causes way-too-many user prompts to select a screen.
      // The only cure I can think of is to keep a pool of screen source proxies and not destroy them.
      // Best if the pool can live in the HydraStage so we only get pestered once.
      // Maybe someday soon.
		} else if (this.kind === 'screen') {
    Screen()
      .then(function (response) {
        self.src = response.video
      	self.offCan = new OffscreenCanvas(vid.videoWidth, vid.videoHeight);
        self.offCTX = self.offCan.getContext('2d');
        self.dynamic = true;
        self.open = true;
        //  console.log("received screen input")
      })
      .catch(err => console.log('could not get screen', err))
 
		}
	}

	sendFrame() {
		if (!this.open) return;
		if ((!this.dynamic) && this.updates > 0) return;

		this.offCTX.drawImage(this.src, 0, 0,  this.offCan.width, this.offCan.height);
		let imgBM = this.offCan.transferToImageBitmap();
		this.bgWorker.proxyFrameUpdate(this.sourceX, Comlink.transfer(imgBM, [imgBM]));
		this.updates++;
	}

} // end SourceProxy class




	// Represents the "Main Thread" side of a BGRworker instance.
	// While BGSynths can cause other BGSynths to come into being, all of them must be children
	// of a main thread BGSynth. We want to avoid forwarding from one worker to another worker and then to main.
	// Protocol is to first create the BGSynth object synchronously and then call openWorker
	// on that when ready to use.
	// Things really start happening after you call setSketch. Or you can call the async function openBackgroundHydra.
	class BGSynth {

	constructor(drawToCanvas, useWGSL = false, directToCanvas = false) {
		this.useWGSL = useWGSL;
		this.frameTime = 25;
		this.canvas = drawToCanvas;
		this.directToCanvas = directToCanvas;
		this.mouseData = {x: 0, y:0};
		
		this.trackMouse = this.trackMouse.bind(this);
		document.addEventListener('mousemove', this.trackMouse);

		this.activeSourceProxies = [];
	}

	destroy() {
		this.activeSourceProxies = [];
		this.destroyed = true;
		this.bgWorker.destroy();
	}

	trackMouse(event) {
	  this.mouseData.x = event.clientX;
    this.mouseData.y = event.clientY;
	}

	async openWorker() {

		let BGRWorker = Comlink.wrap(new Worker(new URL('./BGRworker.js', import.meta.url), { type: 'module'}));
		if (this.directToCanvas) {
				let offscreen = this.canvas;
				this.bgWorker = await new BGRWorker(Comlink.transfer(offscreen, [offscreen]), this.useWGSL);
		} else {
				this.bgWorker = await new BGRWorker(null, this.useWGSL);
		}
		await this.bgWorker.openHydra();
    await this.bgWorker.registerCallback("frame", Comlink.proxy(this.frameReadyFromWorker.bind(this)));
    await this.bgWorker.registerCallback("proxy", Comlink.proxy(this.requestProxySource.bind(this)));

    
    if (!this.directToCanvas) {
			this.bmr = this.canvas.getContext("bitmaprenderer");
	  }

		setTimeout ((dT)=>{
			this.bgWorker.tick(this.frameTime, this.mouseData);
		}, this.frameTime * 2);
	}

// Called when a resize of the localHydra stage causes the localHydra stage to be discarded and recreated.
	changeDestinationCanvas(drawTo) {
		this.canvas = drawTo;
	}

	// called from worker when a new frame is ready.
	// If we are rending to an offscreen canvas, the frame is undefineed
	// but we still need to schedule the next cycle.
	frameReadyFromWorker(frame) {
		if (this.destroyed) return;

		if (frame) {
		if (!this.bmr) {
			this.bmr = this.canvas.getContext("bitmaprenderer");
		}
			 this.bmr.transferFromImageBitmap(frame);
		}
		this.tickSourceProxies();
		setTimeout ((dT)=>{
			this.bgWorker.tick(this.frameTime, this.mouseData);
		}, this.frameTime);
	}

	async hush() {
		await this.bgWorker.hush();
	}

	async setSketch(text, hush) {
		this.activeSourceProxies = [];
		if (hush) {
			await this.bgWorker.hush();
		}
		this.bgWorker.setSketch(text);
	}


	// called from worker when it requests an webcam, video, or image source
	// that can only be provided by main.
	requestProxySource(kind, sourceX, mediaAddr, params) {
		let prx = new SourceProxy(kind, this.bgWorker, sourceX, mediaAddr, params);
  	this.activeSourceProxies.push(prx);
	}

	tickSourceProxies() {
		for (let i = 0; i < this.activeSourceProxies.length; ++i) {
			this.activeSourceProxies[i].sendFrame();
		}
	}
} // end BGSynth class.


async function openBackgroundHydra(drawToCanvas, text, hush) {
	let bgh = new BGSynth(drawToCanvas, false, false);
	await bgh.openWorker();
	bgh.setSketch(text, hush);
	return bgh;
}

export {BGSynth, openBackgroundHydra}