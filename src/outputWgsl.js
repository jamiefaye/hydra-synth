//const transforms = require('./glsl-transforms.js')

class OutputWgsl {
  constructor ({wgslHydra, chanNum, label = "", width, height}) {
	this.wgslHydra = wgslHydra;
	this.chanNum = chanNum
  this.label = label 
  this.draw = () => {}

  this.init()
	// if we have individual ping-pong, 
}


 resize(width, height) {
  //this.fbos.forEach((fbo) => {
  //  fbo.resize(width, height)
  //})
}


// Can simplify:
getCurrent() {
	let tex = this.getCurrentTextureView();
	return tex;
}


getTexture() {
   let tex = this.getOppositeTextureView();
   return tex;
}


init () {
//  console.log('clearing')

  return this
}


async render(passes) {

  let pass = passes[0]
  //console.log('pass', pass, this.pingPongIndex)
  var self = this
  var uniforms = Object.assign(pass.uniforms, { prevBuffer:  () =>  {
             //var index = this.pingPongIndex ? 0 : 1
          //   var index = self.pingPong[(passIndex+1)%2]
          //  console.log('ping pong', self.pingPongIndex)
          return self.getCurrentTextureView();
       }
    })

 // Present the pass fragment to the wgslHydra renderer on behalf of this channel.
 		this.hydraChan = await this.wgslHydra.setupHydraChain(this.chanNum, uniforms, pass.frag);
}

	tick(props) {
		// console.log("tick called on OutputWgsl");
	}

  flipPingPong() {

		let x = this.pingPongs === 0 ? 1 : 0;
		this.pingPongs = x;
  }

  // This is called during setup and whenever canvas size changes
	createTexturesAndViews(device, destTextureDescriptor) {
		this.textures = new Array(2);
	  this.views = new Array(2);
	  for (let i = 0; i < 2; ++i) {
 	 			this.textures[i] = device.createTexture(destTextureDescriptor);
 	 			this.views[i] = this.textures[i].createView();
 	 	}
	}


	getCurrentTextureView() {
		let p = this.pingPongs;
		return this.views[p];
	}


	getCurrentTexture() {
		let p = this.pingPongs;
		return this.textures[p];
	}


	getOppositeTextureView() {
		let p = this.pingPongs;
		let x = p === 0 ? 1 : 0;
		return this.views[x];
	}
}

export {OutputWgsl};
