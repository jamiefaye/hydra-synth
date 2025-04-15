import {FBOToCanvas} from "./FBOToCanvas.js";
import {FBO4ToCanvas} from "./FBO4ToCanvas.js";
const oneShot = false;
let fired = false;

// ------------------------------------------------------------------------------
// standard prefix strings for all shaders
//
const vertexPrefix = `
	 struct VertexOutput {
  	@builtin(position) position : vec4f,
  	@location(0) texcoord : vec2f,
	 };
`;

const fragPrefix = `
   @group(0) @binding(0) var<uniform> time: f32;
   @group(0) @binding(1) var<uniform> resolution: vec2<f32>;
   @group(0) @binding(2) var<uniform> mouse: vec2<f32>;
`;

// ------------------------------------------------------------------------------
// standard vertex shader that sends position and uv for a quad
// 
 const vertexShaderCode = vertexPrefix + `
    @vertex
    fn main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
      var positions = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0),

        vec2<f32>(1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, 1.0)
      );

     var output : VertexOutput;
     output.position = vec4<f32>( positions[vertexIndex], 0.0, 1.0);
     output.texcoord = positions[vertexIndex] / 2.0 + 0.5; // positions are -1 to 1, texcoords are 0 
     return output;
    }
`;

// Per channel data for a channel render-pass.
class RenderPassEntry {
	constructor(chan) {
		this.chan = chan;
	  this.channelTexInfo = [];
		this.reset();
	}

	reset() {

		this.pingPongs = 0;

	  this.fragmentShaderSource = undefined;
	  this.fragmentShaderModule = undefined
	  this.pipelineLayout = undefined;
	  this.pipeline = undefined;

		this.uniformList = undefined;
		this.channelUniforms = []; // all listEntries
	  this.textureUniforms = []; // all uniformTextureListEntries
	  this.valueUniforms = [];	 // all uniformValueListEntries
	  this.bindGroupHeader = undefined;
	  this.bindGroupLayout = undefined;

		this.hasValueUniforms = false;
	  this.structString = undefined;
	  this.valueStructView = undefined;
	  this.structUniformBuffer = undefined;
		}
};

// ------------------------------------------------------------------------------
// wgslHydra manages a set of N "channels", each one driving a given output channel.
// 
class wgslHydra {
	constructor (canvas, numChannels = 4) {
		this.canvas = canvas;
	  this.context = this.canvas.getContext("webgpu");

	  this.aspect = this.canvas.width / this.canvas.height;

	  this.numChannels =  numChannels ? numChannels : 4;

		this.renderPassInfo = new Array(numChannels);
		for (let i = 0; i < numChannels; ++i) this.renderPassInfo[i] = new RenderPassEntry(i);

	  this.time = 0.0;
	  this.mousePos = {x: 0, y: 0};
	  this.showQuad = false;
	  this.outChannel = 0;

	}

  flipPingPongForChannel(chan) {
 		let rpe = this.renderPassInfo[chan]
		let x = rpe.pingPongs === 0 ? 1 : 0;
		rpe.pingPongs = x;
  }

	getCurrentTextureViewForChannel(chan) {
		let rpe = this.renderPassInfo[chan];
		let p = rpe.pingPongs;
		return rpe.channelTexInfo.views[p];
	}

	getCurrentTextureForChannel(chan) {
		let rpe = this.renderPassInfo[chan];
		let p = rpe.pingPongs;
		return rpe.channelTexInfo.textures[p];
	}

	getOppositeTextureViewForChannel(chan) {
		let rpe = this.renderPassInfo[chan];
		let p = rpe.pingPongs;
		let x = p === 0 ? 1 : 0;
		return rpe.channelTexInfo.views[x];
	}

	async setupHydra() {
	      // Step 1: Check for WebGPU support
      if (!navigator.gpu) {
        console.error("WebGPU is not supported on this browser.");
        return;
      }

      // Step 2: Request GPU adapter and device
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.error("Failed to get GPU adapter.");
        return;
      }

      const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');
			this.device = await adapter.requestDevice({
    		requiredFeatures: hasBGRA8unormStorage ? ['bgra8unorm-storage'] : [],
  		});

			// The fboRenderer is used to copy the results of our efforts to the final display canvas.
			this.fboRenderer = new FBOToCanvas(this.canvas, this.device);
			this.fbo4Renderer = new FBO4ToCanvas(this.canvas, this.device);

			// setup the WebGPU context this Hydra will use.
      this.format = navigator.gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: this.format,
        alphaMode: "opaque",   //premultiplied / opaque
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
      });

    this.dummyTexture = await this.device.createTexture({
    size: [320, 240],
    format: this.format, // was "rgba8unorm"
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST,
  });

		// ------------------------------------------------------------------------------
		// create shared bind group layout for time, resolution, mouse.
		this.sharedBindGroupLayout = this.device.createBindGroupLayout({
			label: "",
  		entries: [
    	{
      	binding: 0, // Binding index for time.
     	  visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
      	buffer: { type: "uniform" }, // Resource type
    	},
    	{
      	binding: 1, // Binding index "resolution"
     	  visibility: GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
      	buffer: { type: "uniform" }, // Resource type
    	},
    	{
      	binding: 2, // Binding index "mouse"
     	  visibility: GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
      	buffer: { type: "uniform" }, // Resource type
    	},
  		],
		});

// Create the shared uniform buffer for time
		this.timeUniformBuffer = this.device.createBuffer({
  			label: "time uniform buffer",
  			size: 4, // 32-bit float is 4 bytes
  			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		// Create a typed array to hold the float value for time
		this.timeUniformValues = new Float32Array(1); // Array of 1 float

// Create the shared uniform buffer for resolution
		this.resolutionUniformBuffer = this.device.createBuffer({
  			label: "resolution uniform buffer",
  			size: 8, // 2 x 32-bit float
  			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		this.resolutionUniformValues = new Float32Array(2);

// Create the shared uniform buffer for mouse
		this.mouseUniformBuffer = this.device.createBuffer({
  			label: "mouse uniform buffer",
  			size: 8, // 2 x 32-bit float
  			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		this.mouseUniformValues = new Float32Array(2); // Array of 2 float

		this.sharedBindGroup = this.device.createBindGroup({
			 label: "shared bind group",
  	   layout: this.sharedBindGroupLayout,
  		 entries: [
    	{
      binding: 0,
      resource: { buffer: this.timeUniformBuffer }, // Resource for the binding
    	},
 			{
			binding: 1,
      resource: { buffer: this.resolutionUniformBuffer }, // Resource for the binding
			},
      {
      binding: 2,
      resource: { buffer: this.mouseUniformBuffer }, // Resource for the binding
    	}
     ],
		});

    this.destTextureDescriptor = {
        size: {
            width: this.canvas.width,
            height: this.canvas.height
        },
        mipLevelCount: 1,
        format: this.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
    };

		// ------------------------------------------------------------------------------
		// Setup dest FBO and views for each channel:
		//
		
		for (let chan = 0; chan < this.numChannels; ++chan) {
			let rpe = this.renderPassInfo[chan];
	  	rpe.destTexture = new Array(2);
	  	rpe.destTextureView = new Array(2);
	  	for (let i = 0; i < 2; ++i) {
 	 			rpe.destTexture[i] = this.device.createTexture(this.destTextureDescriptor);
 	 			rpe.destTextureView[i] = rpe.destTexture[i].createView();
 	 		}
 	 		rpe.channelTexInfo = {textures: rpe.destTexture, views: rpe.destTextureView};
	 }
	// create a vertex shader for all
	 this.vertexShaderModule = this.device.createShaderModule({ label: "wgslvertex", code: vertexShaderCode });

	// Setup the renderer that goes from an fbo to final screen.
	 await this.fboRenderer.initializeFBOdrawing();
	 await this.fbo4Renderer.initializeFBOdrawing();
	}


		// ------------------------------------------------------------------------------
		// set up a output render chain for a given channel number, uniforms list, and fragment shader string
		//
  async setupHydraChain(chan, uniforms, shader) {
			const rpe = this.renderPassInfo[chan];
			rpe.reset();
  		rpe.uniformList = uniforms;
			this.generateUniformDeclarations(chan); // bindGroupHeader[chan]
			rpe.fragmentShaderSource = vertexPrefix + fragPrefix + rpe.bindGroupHeader +  shader.frag; //  + this.fragPrefix
			
			//console.log(this.fragmentShaderSource[chan]);

      // Step 5: Create fragment shader module
      rpe.fragmentShaderModule = this.device.createShaderModule({ label: "wgslsfrag", code: rpe.fragmentShaderSource });

		// Create BindGroupLayouts for our each of our BindGroups

		// We then use those BindGroupLayouts to concoct a Pipeline Layout we can give the Pipeline proper.
   	   rpe.pipelineLayout = this.device.createPipelineLayout({
          bindGroupLayouts: [this.sharedBindGroupLayout, rpe.bindGroupLayout],
      });

      // Step 6: Set up the render pipeline for this channel
      	rpe.pipeline = this.device.createRenderPipeline({
       	label: 'pipeline ' + chan,
        vertex: {
          module: this.vertexShaderModule,
          entryPoint: "main",
        },
        fragment: {
          module: rpe.fragmentShaderModule,
          entryPoint: "main",
          targets: [{ format: this.format }],
        },
        primitive: {
          topology: "triangle-list",
        },
        layout: rpe.pipelineLayout
      });

			this.createSamplerOrBuffersForChan(chan);
	}

		// ------------------------------------------------------------------------------
		// animate function
		//
		async requestAnimationFrame() {
			if(oneShot) {
				 if(fired) return;
			   console.log("One Shot is set for requestAnimationFrame");
				 fired = true;
			}
		// Create a master command encoder.
    const commandEncoder = this.device.createCommandEncoder();

		// Setup the universal uniforms
		this.timeUniformValues[0] = this.time += 0.025;
   	this.device.queue.writeBuffer(this.timeUniformBuffer, 0, this.timeUniformValues);

		this.resolutionUniformValues[0] = this.canvas.width;
		this.resolutionUniformValues[1] = this.canvas.height;
		this.device.queue.writeBuffer(this.resolutionUniformBuffer, 0, this.resolutionUniformValues);

		this.mouseUniformValues[0] = this.mousePos.x;
		this.mouseUniformValues[1] = this.mousePos.y;
		this.device.queue.writeBuffer(this.mouseUniformBuffer, 0, this.mouseUniformValues);


		// For each active channel...
    for (let chan = 0; chan < this.numChannels; ++chan) {
 			const rpe = this.renderPassInfo[chan];
			if (!rpe.pipeline) continue;
		  this.flipPingPongForChannel(chan);
      const renderPassDescriptor = {
      	label: "renderPassDescriptor",
        colorAttachments: [{
          label: "canvas textureView attachment " + chan,
          view: this.getCurrentTextureViewForChannel(chan),
          clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        }],
      };

			// Set the user defined uniforms for this channel.
			//
			let ubgData = await this.fillBindGroup(chan);
		  let ubg = await this.device.createBindGroup(ubgData);

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(rpe.pipeline);
  		passEncoder.setBindGroup(0, this.sharedBindGroup);
  		passEncoder.setBindGroup(1, ubg);
      passEncoder.draw(6);  // call our vertex shader 6 times to make a box.
      passEncoder.end();
   } // end "chan" loop.
   // Do all the channels now.
    this.device.queue.submit([commandEncoder.finish()]);

    await this.device.queue.onSubmittedWorkDone();
    
    if (this.showQuad) {
			await this.fbo4Renderer.refreshCanvases(
				this.getCurrentTextureForChannel(0),
		  	this.getCurrentTextureForChannel(1),			
		  	this.getCurrentTextureForChannel(2),
		  	this.getCurrentTextureForChannel(3)
			);
    	}
    else {
    	await this.fboRenderer.refreshCanvas(this.getCurrentTextureForChannel(this.outChannel));
		}
	}

	generateUniformDeclarations(chan) {
		const rpe = this.renderPassInfo[chan];
		let uniInfo = rpe.uniformList;

		let bindGroupEntry = "";
		let i = 1;
		let ui = 0;

		rpe.channelUniforms = [];

		Object.keys(uniInfo).forEach(key => {
  			if (key === 'prevBuffer') return;
  			let uniEntry;
  			if (key.startsWith("tex")) {
  				// constructor(chan, index, name, valCallback)
  				uniEntry = new uniformTextureListEntry(chan, i, key, uniInfo[key]);
  				rpe.textureUniforms.push(uniEntry);
  				  			i += uniEntry.indexesUsed;
  			}
  			else {
  				uniEntry = new uniformValueListEntry(chan, ui, key, uniInfo[key], uniInfo);
  				rpe.valueUniforms.push(uniEntry);
  				ui++;
  			}
  			rpe.channelUniforms.push(uniEntry);

  		})

 		let ourUniforms = rpe.channelUniforms;
 		let ourValues = rpe.valueUniforms;
		rpe.hasValueUniforms = ourValues.length > 0;
		let bindings = "";
		let bgLayoutentries = [];
	if (rpe.hasValueUniforms) {
    	// Create the binding struct for the uniform f32 values.
    		let struct = `struct UF {
`;
    		for(let j = 0; j < ourValues.length; ++j) {
    			struct = struct + ourValues[j].getStructLineItem();
    		}
    		struct = struct + `};
    @group(1) @binding(0) var<uniform> uf : UF;
`;
    		rpe.structString = struct;
    		bindings = struct;
    		bgLayoutentries = [{
    			binding: 0,
    			visibility: GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
    			buffer: { type: "uniform" } // Resource type
        }];
	} // We had value uniforms

		let ourTextureUniforms = rpe.textureUniforms;
		for(let j = 0; j < ourTextureUniforms.length; ++ j) { // textureUniforms
 			let aUnif = ourTextureUniforms[j];
 			let bgs = aUnif.bindGroupString()
 			bindings = bindings + bgs;
 			bgLayoutentries.push(...aUnif.getBindGroupLayoutEntries());
 		}

		rpe.bindGroupLayout = this.device.createBindGroupLayout({
			label: "bg layout " + chan,
  		entries: bgLayoutentries
  	});
		rpe.bindGroupHeader = bindings;
	}

// called once since we can reuse samplers between frames.
	createSamplerOrBuffersForChan(chan) {
		const rpe = this.renderPassInfo[chan];
		// First handle the struct with the non-texture stuff
		if (rpe.hasValueUniforms) {
    		//rpe.structDefs = makeShaderDataDefinitions(rpe.structString);
    		rpe.valueStructView = new Float32Array(rpe.valueUniforms.length);
    		rpe.valueStructBuffer = this.device.createBuffer({
      		size: rpe.valueStructView.byteLength,
      		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    		});
		}
		// Now make samplers, etc.
		let ourUniforms = rpe.textureUniforms;
		for (let i = 0; i < ourUniforms.length; ++i)
				ourUniforms[i].createSamplerOrBuffers(this.device);
	
	}

	fillBindGroup(chan) {
		const rpe = this.renderPassInfo[chan];
		let allUniforms = rpe.channelUniforms;
		if (!allUniforms || allUniforms.length === 0) {
			return {label: "bg" + chan,
				layout: rpe.bindGroupLayout,
				entries: []
			};
		}

		let bga
		if (rpe.hasValueUniforms) {
			this.setAllValueUniformValues(chan, this.time);
			this.device.queue.writeBuffer(rpe.valueStructBuffer, 0, rpe.valueStructView);
			bga =[{binding: 0, resource: {buffer: rpe.valueStructBuffer}}];
		} else bga = [];

		let ourUniforms = rpe.textureUniforms;
		for (let i = 0; i < ourUniforms.length; ++i) {
			let aUniform = ourUniforms[i];
			bga.push(...aUniform.getBindGroupEntries(this, this.time));
		}
		let bgd = {
			label: "bg" + chan,
			layout: rpe.bindGroupLayout,
			entries: bga
		}
		return bgd;
 }


 	setAllValueUniformValues(chan, time) {
 		const rpe = this.renderPassInfo[chan];
 		let ourUniforms = rpe.valueUniforms;
 		for (let i = 0; i < ourUniforms.length; ++i) {
 			ourUniforms[i].setUniformValues(rpe, time);
 		}
 	}
}

// classes to represent uniforms. textures or f32 values.
class uniformTextureListEntry {
	constructor(chan, index, name, valCallback) {
		this.chan = chan;
		this.index = index;
		this.name = name;
		this.valCallback = valCallback;
		this.indexesUsed = 2;
	}

	indexesUsed() {
		return 2;
	}

	bindGroupString() {
				return `@group(1) @binding(${this.index}) var samp${this.name}: sampler;
 @group(1) @binding(${this.index + 1}) var ${this.name}:  texture_2d<f32>;
`;
		}

	getBindGroupLayoutEntries() {
				let samp =  {
				binding: this.index,
				visibility: GPUShaderStage.FRAGMENT,
					sampler: {
          	type: "filtering",
        	}
    		 };
    		 
    	 let text = {
       	binding: this.index + 1, // Binding index for texture.
     	  visibility: GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
      	texture: {
          sampleType: "float",
          viewDimension: "2d",
          multisampled: false,
         },
    		}
				return [samp, text];
		}

	createSamplerOrBuffers(device) {
			this.sampler = device.createSampler();
			return this.sampler;
	}
	
	getBindGroupEntries(renderer) {
		this.cbValue = this.valCallback();
		if (!this.cbValue) {
			this.cbValue = renderer.dummyTexture.createView();
		}
		return [
			{binding: this.index, resource: this.sampler},
			{binding: this.index+1, resource: this.cbValue}
		];
	}
}


class uniformValueListEntry {
	constructor(chan, index, name, valCallback) {
		this.chan = chan;
		this.index = index;
		this.name = name;
		this.valCallback = valCallback;
		this.indexesUsed = 0;
	}



	getBindGroupLayoutEntries() {
    return [{
			binding: this.index,
			visibility: GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
			buffer: { type: "uniform" } // Resource type
    }]
	}


  getStructLineItem() {
		return `${this.name} : f32,
`;
  }


	setUniformValues(rpe, time) {
		let argsToCB = {time: time, bpm: 120};
	  this.cbValue = this.valCallback(undefined, argsToCB);
	  if (!this.cbValue || this.cbValue === NaN) {
	  	this.cbValue = 0.0;
	   }
		rpe.valueStructView[this.index] = this.cbValue;
  }
}

export {wgslHydra}