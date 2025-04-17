import {Webcam} from './lib/webcam.js'
import Screen from './lib/screenmedia.js'

class HydraSource {
  constructor ({ regl, wgsl, hydraSynth, webWorker, proxy, width, height, chanNum, pb, label = ""}) {
    this.label = label;
    this.regl = regl;
    this.wgsl = wgsl;
    this.hydraSynth = hydraSynth;
    this.webWorker = webWorker;
    this.proxy = webWorker !== undefined;
    this.src = null;
    this.dynamic = true;
    this.width = width;
    this.height = height;
    this.chanNum = chanNum;

    this.pb = pb
    this.tex = this.makeTexture({width, height});
  }

  makeTexture(params) {
  	let width = params.width;
 	  let height = params.height;
  	if (!this.wgsl) {
  		return this.regl.texture({
      	shape: [ width, height ],
      	...params
    		});
  	} else {
 	  let tex = this.wgsl.device.createTexture({
    	size: [width, height, 1],
    	format: this.wgsl.format, // was "rgba8unorm"
    	usage:
      		GPUTextureUsage.TEXTURE_BINDING |
      		GPUTextureUsage.COPY_DST |
      		GPUTextureUsage.RENDER_ATTACHMENT,
  			});
  		this.lastTexture = undefined; // flush view cache if needed.
    	return tex;
  	}
  }

	activate(width, height) {
		this.offscreencanvas = new OffscreenCanvas(width, height); 
		this.bmr = this.offscreencanvas.getContext("bitmaprenderer");

		if (!this.wgsl) {
			 this.src = this.offscreencanvas;
			 this.tex = this.makeTexture({ data: this.src, dynamic: true, width: width, height: height})
		} else {
			this.tex = this.makeTexture({width: width, height : height});
		}
		console.log("activate complete");
	}

  initCam (index, params) {
  	if (this.webWorker) 
  		{
  			this.webWorker.openSourceProxy("webcam", this.chanNum, index, params);
  			return;
  		}
    const self = this
    Webcam(index)
      .then(response => {
        self.src = response.video
        self.dynamic = true
        self.width = self.src.videoWidth;
        self.height = self.src.videoHeight;
        self.tex = this.makeTexture({ width: self.width, height: self.height, data: self.src, ...params })
      })
      .catch(err => console.log('could not get camera', err))
  }

  initVideo (url = '', params) {
  	
  	if (this.webWorker) 
  	{
  			this.webWorker.openSourceProxy("video", this.chanNum, url, params);
  			return;
  	}
    // const self = this
    const vid = document.createElement('video')
    vid.crossOrigin = 'anonymous'
    vid.autoplay = true
    vid.loop = true
    vid.muted = true // mute in order to load without user interaction
    const onload = vid.addEventListener('loadeddata', () => {
      this.src = vid
      vid.play()
      self.tex = this.makeTexture({ width: self.width, height: self.height, data: self.src, ...params })
      this.dynamic = true
    })
    vid.src = url
  }

  initImage (url = '', params) {
  	if (this.webWorker) 
  	{
    	this.webWorker.openSourceProxy("image", this.chanNum, url, params); 	
  		return;
  	}
    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.src = url
    this.oneShotDone = false;
    img.onload = () => {
      this.src = img
      this.dynamic = false
       self.tex = this.makeTexture({ width: self.width, height: self.height, data: self.src, ...params })
    }
  }

  initStream (streamName, params) {
    //  console.log("initing stream!", streamName)
    let self = this
    if (streamName && this.pb) {
      this.pb.initSource(streamName)

      this.pb.on('got video', function (nick, video) {
        if (nick === streamName) {
          self.src = video
          self.dynamic = true
          self.tex = this.makeTexture({ width: self.width, height: self.height, data: self.src, ...params })
        }
      })
    }
  }

  // index only relevant in atom-hydra + desktop apps
  initScreen (index = 0, params) {
    const self = this
    Screen()
      .then(function (response) {
        self.src = response.video
        self.tex = self.regl.texture({ data: self.src, ...params})
        self.dynamic = true
        //  console.log("received screen input")
      })
      .catch(err => console.log('could not get screen', err))
  }

  resize (width, height) {
    this.width = width
    this.height = height
  }

  clear () {
    if (this.src && this.src.srcObject) {
      if (this.src.srcObject.getTracks) {
        this.src.srcObject.getTracks().forEach(track => track.stop())
      }
    }
    this.offscreencanvas = undefined;
		this.bmr = undefined;
    this.src = null
    this.tex = this.regl.texture({ shape: [ 1, 1 ] })
  }

  resizeTex(width, height) {
  	if (!this.wgsl) {
  		this.tex.resize(width, height)
  	} else {
			this.tex = this.makeTexture({width: width, height: height});
  	}
  		this.width = width;
  		this.height = height;
  }

  tick (time) {
    //  console.log(this.src, this.tex.width, this.tex.height)
    if (this.src !== null && this.dynamic === true) {
      if (this.src.videoWidth && this.src.videoWidth !== this.tex.width) {
        console.log(
          this.src.videoWidth,
          this.src.videoHeight,
          this.tex.width,
          this.tex.height
        )
        this.resizeTex(this.src.videoWidth, this.src.videoHeight)
      }

      if (this.src.width && this.src.width !== this.width) {
        this.resizeTex(this.src.width, this.src.height);
      }

			if (!this.wgsl) {
      	this.tex.subimage(this.src);
      } else {
      	this.updateTextureWGSL();
      }
    }
  }

 updateTextureWGSL() {
 	  if (!this.src) return;
 	  // Probably redundant.
 	  let w = this.width;
		let h = this.height;
		if (this.src.videoWidth) {
			w = this.src.videoWidth;
			h= this.src.videoHeight;
 	  }

 	  if (!this.dynamic) {
 	   if(!this.oneShotDone) {
 	  	// non-dynamic textures only need to be copied-in once.
 	  	 	this.wgsl.device.queue.copyExternalImageToTexture(
    			{ source: this.src, flipY: true},
    			{ texture: this.tex },
    			[ w, h ],
  			);
  			this.oneShotDone = true;
		 }
  		return;
 	  }
    // pull in the next texture;
    this.wgsl.device.queue.copyExternalImageToTexture(
    		{ source: this.src, flipY: true },
    		{ texture: this.tex },
    		[ w, h ],
  		);
    }

   getTexture () {
   	  if (this.proxy) return this.getProxiedTexture();
  		if (this.wgsl) return this.getTextureWGSL();
    	return this.tex
  	}

	// WGSL wants a "texture view", rather than a texture
	// To avoid creating a new view each frame, we do a simple cache.
   getTextureWGSL () {
  	if (!this.tex) return undefined;
  	if (this.lastTexture !== this.tex || !this.lastTextureView) {
  		// this.lastTexture = this.tex;
  		 this.lastTextureView = this.tex.createView();
  	}
  	if (this.lastTextureView) return this.lastTextureView;
    return undefined;
  }

	getProxiedTexture() {
		if (this.wgsl) {
			  	if (!this.offscreencanvas) {
			  		//this.activate(this.width, this.height);
						return this.tex.createView()
					}
			 	 this.wgsl.device.queue.copyExternalImageToTexture(
    			{ source: this.offscreencanvas, flipY: true},
    			{ texture: this.tex },
    			[ this.tex.width, this.tex.height ],
  			);
  			return this.getTextureWGSL();
		} else {
			//this.activate(img.width, img.height);
			//this.bmr.transferFromImageBitmap(img);
			return this.tex;
		}
	}

  injectImage(img) {
  	if (!this.offscreencanvas) {
			this.activate(img.width, img.height);
		}
 		let sizeWrong = (this.tex.width !== img.width) || (this.tex.height !== img.height);
 		if (sizeWrong) {
 				this.activate(img.width, img.height);
 		}
		this.bmr.transferFromImageBitmap(img);
	}
}

export default HydraSource
