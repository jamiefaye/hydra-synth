import {Webcam} from './lib/webcam.js'
import Screen from './lib/screenmedia.js'

class HydraSourceWGSL {
  constructor ({ hs, width, height, chanNum, pb, label = ""}) {
    this.label = label
    this.hs = hs
    this.src = null
    this.dynamic = true
    this.width = width
    this.height = height
    this.chanNum = chanNum;
    this.pb = pb;
    this.lastTexture;
    this.oneShotDone = false;
  }

  init (opts, params) {
    if ('src' in opts) {
      this.src = opts.src
      this.tex = this.makeTexture(this.width, this.height);
    }
    if ('dynamic' in opts) this.dynamic = opts.dynamic
  }

  makeTexture(width, height) {
  	let tex = this.hs.device.createTexture({
    size: [width, height, 1],
    format: this.hs.format, // was "rgba8unorm"
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  	return tex;
  }

  initCam (index, params) {
    const self = this
    Webcam(index)
      .then(response => {
        self.src = response.video
        self.dynamic = true
        self.tex = self.makeTexture(self.src.videoWidth, self.src.videoHeight);
       // self.tex = self.regl.texture({ data: self.src, ...params })
      })
      .catch(err => console.log('could not get camera', err))
  }

  initVideo (url = '', params) {
    // const self = this
    const vid = document.createElement('video')
    vid.crossOrigin = 'anonymous'
    vid.autoplay = true
    vid.loop = true
    vid.muted = true // mute in order to load without user interaction
    const onload = vid.addEventListener('loadeddata', () => {
      this.src = vid
      vid.play()
      // this.tex = this.regl.texture({ data: this.src, ...params})
      this.tex = this.makeTexture(this.src.videoWidth, this.src.videoHeight);
      this.dynamic = true
    })
    vid.src = url
  }

  initImage (url = '', params) {
  	this.oneShotDone = false;
    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      this.src = img
      this.dynamic = false
      this.tex = this.makeTexture(this.src.width, this.src.height);
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
          self.tex = self.regl.texture({ data: self.src, ...params})
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
    this.src = null
    //if (this.regl) this.tex = this.regl.texture({ shape: [ 1, 1 ] })
  }

  tick (time) {
  	
  	if (this.src !== null && this.dynamic === true) {
      if (this.src.videoWidth && this.src.videoWidth !== this.tex.width) {
        console.log(
          this.src.videoWidth,
          this.src.videoHeight,
          this.tex.width,
          this.tex.height
        )
        //this.tex.resize(this.src.videoWidth, this.src.videoHeight)
      }
    }
    this.updateTexture();
  }

 /*
    //  console.log(this.src, this.tex.width, this.tex.height)

      if (this.src.width && this.src.width !== this.tex.width) {
        this.tex.resize(this.src.width, this.src.height)
      }

      this.tex.subimage(this.src)
    }
    
    */

 updateTexture() {
 	
 	  if (!this.src) return;
 	   	  let w = this.width;
 	     	let h = this.height;
 	     	if (this.src.videoWidth) {
 	     		w = this.src.videoWidth;
 	     		h= this.src.videoHeight;
 	     	}
 	  if (!this.dynamic) {
 	   if(!this.oneShotDone) {
 	  	// non-dynamic textures only need to be copied-in once.
 
 	  	 	this.hs.device.queue.copyExternalImageToTexture(
    			{ source: this.src, flipY: true},
    			{ texture: this.tex },
    			[ w, h ],
  			);
  			this.oneShotDone = true;
		 }
  		return;
 	  }

    		// return this.hs.device.importExternalTexture({source: this.src});
    this.hs.device.queue.copyExternalImageToTexture(
    		{ source: this.src, flipY: true },
    		{ texture: this.tex },
    		[ w, h ],
  		);
    }

  getTexture () {
  	if (!this.tex) return undefined;
  	if (this.lastTexture !== this.tex || !this.lastTextureView) {
  		// this.lastTexture = this.tex;
  		 this.lastTextureView = this.tex.createView();
  	}
  	if (this.lastTextureView) return this.lastTextureView;
    return undefined;
  }

}

export {HydraSourceWGSL}
