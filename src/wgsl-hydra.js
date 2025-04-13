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
        vec2<f32>(1.0, -1.0 ),

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


// ------------------------------------------------------------------------------
// wgslHydra manages a set of N "channels", each one driving a given output channel.
// 
class wgslHydra {
	constructor (canvas, numChannels = 4) {
		this.canvas = canvas;
	  this.context = this.canvas.getContext("webgpu");

	  this.aspect = this.canvas.width / this.canvas.height;


	  this.fboPingPong = 0;
	  this.numChannels =  numChannels ? numChannels : 4;

	  this.channelTexInfo = new Array(numChannels);
	  this.fragmentShaderSource = new Array(numChannels);
	  this.fragmentShaderModule = new Array(numChannels);
	  this.pipelineLayout = new Array(numChannels);
	  this.pipeline = new Array(numChannels);

	  this.uniformList = new Array(numChannels);
	  this.channelUniforms =  new Array(numChannels);
	  this.bindGroupHeader = new Array(numChannels);
	  this.bindGroupLayout = new Array(numChannels);
	  this.time = 0.0;
	  this.mousePos = {x: 0, y: 0};
	  this.showQuad = false;
	  this.outChannel = 0;

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
        alphaMode: "opaque",
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
	  	let destTexture = new Array(2);
	  	let destTextureView = new Array(2);
	  	for (let i = 0; i < 2; ++i) {
 	 			destTexture[i] = this.device.createTexture(this.destTextureDescriptor);
 	 			destTextureView[i] = destTexture[i].createView();
 	 		}
 	 		this.channelTexInfo[chan] = {textures: destTexture, views: destTextureView};
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
  		this.uniformList[chan] = uniforms;
			this.generateUniformDeclarations(chan); // bindGroupHeader[chan]
			this.fragmentShaderSource[chan] = vertexPrefix + fragPrefix + this.bindGroupHeader[chan] +  shader.frag; //  + this.fragPrefix
			
			//console.log(this.fragmentShaderSource[chan]);

      // Step 5: Create fragment shader module
      this.fragmentShaderModule[chan] = this.device.createShaderModule({ label: "wgslsfrag", code: this.fragmentShaderSource[chan] });

		// Create BindGroupLayouts for our each of our BindGroups

		// We then use those BindGroupLayouts to concoct a Pipeline Layout we can give the Pipeline proper.
   	   this.pipelineLayout[chan] = this.device.createPipelineLayout({
          bindGroupLayouts: [this.sharedBindGroupLayout, this.bindGroupLayout[chan]],
      });

      // Step 6: Set up the render pipeline for this channel
      this.pipeline[chan] = this.device.createRenderPipeline({
       	label: 'pipeline ' + chan,
        vertex: {
          module: this.vertexShaderModule,
          entryPoint: "main",
        },
        fragment: {
          module: this.fragmentShaderModule[chan],
          entryPoint: "main",
          targets: [{ format: this.format }],
        },
        primitive: {
          topology: "triangle-list",
        },
        layout: this.pipelineLayout[chan]
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
			if (!this.pipeline[chan]) continue;

      const renderPassDescriptor = {
      	label: "renderPassDescriptor",
        colorAttachments: [{
          label: "canvas textureView attachment",
          view: this.channelTexInfo[chan].views[this.fboPingPong],
          clearValue: { r: 0.9, g: 0.9, b: 0.9, a: 1.0 },
          loadOp: "load",
          storeOp: "store",
        }],
      };

			// Set the user defined uniforms for this channel.
			//
			let ubgData = await this.fillBindGroup(chan);
		  let ubg = await this.device.createBindGroup(ubgData);
		  this.setAllUniformValues(this.device, chan, this.time);
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(this.pipeline[chan]);
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
			this.channelTexInfo[0].textures[this.fboPingPong],
			this.channelTexInfo[1].textures[this.fboPingPong],
			this.channelTexInfo[2].textures[this.fboPingPong],		
			this.channelTexInfo[3].textures[this.fboPingPong]
			);
    	}
    else {
    	await this.fboRenderer.refreshCanvas(this.channelTexInfo[this.outChannel].textures[this.fboPingPong]);
		}
    // Flip the ping-pong always as an integer.
    this.fboPingPong = this.fboPingPong === 0 ? 1 : 0;
	}

	generateUniformDeclarations(chan) {
		let uniInfo = this.uniformList[chan];
		let bgLayoutentries = [];
		let bindGroupEntry = "";
		let i = 0;

		this.channelUniforms[chan] = [];

		Object.keys(uniInfo).forEach(key => {
  			if (key === 'prevBuffer') return;
  			let uniEntry;
  			if (key.startsWith("tex")) {
  				// constructor(chan, index, name, valCallback)
  				uniEntry = new uniformTextureListEntry(chan, i, key, uniInfo[key]);
  			}
  			else {
  				uniEntry = new uniformValueListEntry(chan, i, key, uniInfo[key], uniInfo);
  			}
  			this.channelUniforms[chan].push(uniEntry);
  			i += uniEntry.indexesUsed;
  		})
 		let bindings = "";
 		let ourUniforms = this.channelUniforms[chan];
 		for(let j = 0; j < ourUniforms.length; ++ j) {
 			let aUnif = ourUniforms[j];
 			let bgs = aUnif.bindGroupString()
 			bindings = bindings + bgs;
 			bgLayoutentries.push(...aUnif.getBindGroupLayoutEntries());
 		}

		this.bindGroupLayout[chan] = this.device.createBindGroupLayout({
			label: "bg layout " + chan,
  		entries: bgLayoutentries
  	});
		this.bindGroupHeader[chan] = bindings;
	}

// called once since we can reuse samplers between frames.
	createSamplerOrBuffersForChan(chan) {
		let ourUniforms = this.channelUniforms[chan];
		for (let i = 0; i < ourUniforms.length; ++i)
				ourUniforms[i].createSamplerOrBuffers(this.device);
	}

	fillBindGroup(chan) {
		let ourUniforms = this.channelUniforms[chan];
		if (!ourUniforms || ourUniforms.length === 0) {
			return {label: "bg" + chan,
				layout: this.bindGroupLayout[chan],
				entries: []
			};
		}

		let bga =[];

		for (let i = 0; i < ourUniforms.length; ++i) {
			let aUniform = ourUniforms[i];
			bga.push(...aUniform.getBindGroupEntries(this, this.time));
		}
		let bgd = {
			label: "bg" + chan,
			layout: this.bindGroupLayout[chan],
			entries: bga
		}
		return bgd;
 }
 
 	setAllUniformValues(device, chan, time) {
 		let ourUniforms = this.channelUniforms[chan];
 		for (let i = 0; i < ourUniforms.length; ++i) {
 			ourUniforms[i].setUniformValues(device, time);
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
	
	setUniformValues(device, time) {

	}
}


class uniformValueListEntry {
	constructor(chan, index, name, valCallback) {
		this.chan = chan;
		this.index = index;
		this.name = name;
		this.valCallback = valCallback;
		this.indexesUsed = 1;
	}

	bindGroupString() {
			let bge =`@group(1) @binding(${this.index}) var<uniform> ${this.name}:  f32;
`;
			return bge;
		}

	getBindGroupLayoutEntries() {
    return [{
			binding: this.index,
			visibility: GPUShaderStage.FRAGMENT, // Shader stages where this binding is used
			buffer: { type: "uniform" } // Resource type
    }]
	}

	createSamplerOrBuffers(device) {
			// Create the shared uniform buffer
		this.uniformBuffer = device.createBuffer({
  			label: "value uniform buffer " + this.chan + " " + this.name,
  			size: 4, // 32-bit float is 4 bytes
  			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		// Create a typed array to hold the float value for time
		this.uniformValues = new Float32Array(1); // Array of 1 float
	}

	getBindGroupEntries(renderer) {
		return [
			{binding: this.index, resource: {buffer: this.uniformBuffer}}
		];
	}

	setUniformValues(device, time) {
		let argsToCB = {time: time, bpm: 120};
	  this.cbValue = this.valCallback(undefined, argsToCB);
		this.uniformValues[0] = this.cbValue;
   	device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformValues);
   //	console.log(this.cbValue);
  }
}

export {wgslHydra}