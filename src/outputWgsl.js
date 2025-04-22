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

getCurrent() {
	let tex = this.wgslHydra.getCurrentTextureViewForChannel(this.chanNum);
	return tex;
}

getTexture() {
   let tex = this.wgslHydra.getOppositeTextureViewForChannel(this.chanNum);
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
          return self.fbos[self.pingPongIndex]
       }
    })

 // Present the pass fragment to the wgslHydra renderer on behalf of this channel.
 		this.hydraChan = await this.wgslHydra.setupHydraChain(this.chanNum, uniforms, pass.frag);
}


	tick(props) {
		console.log("tick called on OutputWgsl");
	}
}

export {OutputWgsl};
