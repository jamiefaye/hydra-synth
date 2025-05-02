import * as Comlink from "comlink";
import HydraSynth from "./../hydra-synth.js";

const GeneratorFunction = function* () {}.constructor;

class BGRWorker {
  constructor(useWGSL=false, useAudio = false) {
    if (!(typeof self !== "undefined" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope")) {
    	this.isWebWorker = false;
		} else {
    	this.isWebWorker = true;
		}

		this.directToCanvas = false;
		this.useWGSL = useWGSL;
		this.useAudio = useAudio;
  }


  setTransferCanvas(can) {
  	this.can = can;
  	this.directToCanvas = true;
  }


	destroy() {
		if (this._h) {
			this._h._destroy();
		}
	}


  registerCallback(name, cb) {
		if (name === 'frame') {
			this.frameCB = cb;
		} else if (name === 'proxy') {
			this.proxyCB = cb;
		} else if (name === 'setaudio') {
			this.audioCB = cb;
		}
	}


	async openHydra() {
			if (this.h === undefined) {
			if (!this.directToCanvas) {
				this.can = new OffscreenCanvas(1280, 720);
		  }
		  this.hs = new HydraSynth({useWGSL: this.useWGSL, webWorker: this, makeGlobal: false, canvas: this.can,  autoLoop: false, detectAudio: this.useAudio, enableStreamCapture: false });
		  if (this.hs.wgslPromise) await this.hs.wgslPromise;
    	this.h = this.hs.synth;

    	console.log("BGHydraSynth created: " + this.hs);
    }
	}


	async setResolution(width, height) {
		this.h.setResolution(width, height);
	}

  async setSketch(inStr) {
  	if (!this.hs) return;
  	return this.hs.eval(inStr);
}


  async hush() {
  	 if (!this.h) return;
  	 this.h.hush();
  }


	async tick(dt, mouseData, fftData) {
		if (this.h) {
				if (mouseData && this.isWebWorker) {
					this.h.mouse.x = mouseData.x;
					this.h.mouse.y = mouseData.y;
				}
				if (this.h.a && fftData) {
					this.h.a.fft = fftData;
				}
				//this.h.time+= (dt / 1000.0);
				if (this.isWebWorker && this.directToCanvas) {
					// direct to canvas sends nothing back via the frameCB.
					// It just signals the next frame was processed.
					await this.h.tick(dt);
					if (this.frameCB) this.frameCB();
				} else {
				 this.h.tick(dt);
				if (this.frameCB) {
					let fr = this.can.transferToImageBitmap();
					if (this.isWebWorker) {
						this.frameCB(Comlink.transfer(fr, [fr]));
					} else {
						this.frameCB(fr);
					}
				}
			}
		}
	}


	getFrameData() {
		let img = this.can.transferToImageBitmap();
		return img;
	}


	async openSourceProxy(kind, sourceX, mediaAddr, params) {
		// Forward open proxy request via proxy callback to the HydraStage
		if (this.proxyCB) {
			this.proxyCB(kind, sourceX, mediaAddr, params);
		} else {
			console.log("No proxy callback registered.");
		}
	}


	async proxyFrameUpdate(sourceX, img) {
		let h = this.h;
		if (h) {
			let sName = 's' + sourceX;
			let st = h[sName];
			st.injectImage(img);
		} else {
			console.log("No hydra to update in BGRWorker");
		}
	}


	async openAudioProxy() {
		if (this.proxyCB) {
			this.proxyCB("audio", 0, 0, {});
		} else {
			console.log("No proxy callback registered.");
		}
	}


	async setAudioValue(what, toValue) {
		if (this.audioCB) {
			this.audioCB(what, toValue);
		} else {
			console.log("No audio proxy callback registered.");
		}
	}
}


Comlink.expose(BGRWorker);
