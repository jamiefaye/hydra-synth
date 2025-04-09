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
  return this.fbos[this.pingPongIndex]
}

getTexture() {
   var index = this.pingPongIndex ? 0 : 1
  return this.fbos[index]
}

init () {
//  console.log('clearing')

  return this
}


async render(passes) {
  let pass = passes[0]
  //console.log('pass', pass, this.pingPongIndex)
  var self = this
  
  
	// Set up the specific uniforms for this channel
  var uniforms = Object.assign(pass.uniforms, { prevBuffer:  () =>  {
             //var index = this.pingPongIndex ? 0 : 1
          //   var index = self.pingPong[(passIndex+1)%2]
          //  console.log('ping pong', self.pingPongIndex)
          return self.fbos[self.pingPongIndex]
       }
    })
 // Present the pass fragment to the wgsl-hydra instance for this channel.
 // Setup the tick handler
 		this.hydraChan = await this.wgslHydra.setupHydraChain(this.chanNum,[] , pass);
 /*
 	self.draw = self.regl({
    	frag: pass.frag,
    	vert: self.vert,
    	attributes: self.attributes,
    	uniforms: uniforms,
    	count: 3,
    	framebuffer: () => {
      	self.pingPongIndex = self.pingPongIndex ? 0 : 1
      	return self.fbos[self.pingPongIndex]
    }
  })
  */
}


	tick(props) {
//  console.log(props)
//  this.draw(props)
	}
}

export {OutputWgsl};
