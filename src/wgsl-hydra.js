import {FBOToCanvas} from "./FBOToCanvas.js";

const oneShot = false;


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
     output.position = vec4<f32>( positions[vertexIndex], 0.0, 1);
     output.texcoord = positions[vertexIndex] / 2 + 0.5; // positions are -1 to 1, texcoords are 0 
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

	  this.time = 0.0;
	  this.mousePos = {x: 0, y: 0};
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

			// setup the WebGPU context this Hydra will use.
      this.format = navigator.gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: this.format,
        alphaMode: "opaque",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
      });

		// ------------------------------------------------------------------------------
		// create shared bind group layout for time, resolution, mouse.
		this.sharedBindGroupLayout = this.device.createBindGroupLayout({
			label: "sharedBindGroupLayout",
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
	}


		// ------------------------------------------------------------------------------
		// set up a output render chain for a given channel number, uniforms list, and fragment shader string
		//
  async setupHydraChain(chan, uniforms, shader) {
			this.fragmentShaderSource[chan] = vertexPrefix + fragPrefix + shader.frag; //  + this.fragPrefix


      // Step 5: Create fragment shader module
      this.fragmentShaderModule[chan] = this.device.createShaderModule({ label: "wgslsfrag", code: this.fragmentShaderSource[chan] });

		// Create BindGroupLayouts for our each of our BindGroups

		// We then use those BindGroupLayouts to concoct a Pipeline Layout we can give the Pipeline proper.
   	   this.pipelineLayout[chan] = this.device.createPipelineLayout({
          bindGroupLayouts: [this.sharedBindGroupLayout],
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
	}

		// ------------------------------------------------------------------------------
		// animate function
		//
		async requestAnimationFrame() {

		// Create a master command encoder.
    const commandEncoder = this.device.createCommandEncoder();

		// Setup the universal uniforms
		this.timeUniformValues[0] = this.time += 0.025;
   	this.device.queue.writeBuffer(this.timeUniformBuffer, 0, this.timeUniformValues);

		this.resolutionUniformValues[0] = this.canvas.width;
		this.resolutionUniformValues[1] = this.canvas.width;
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

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(this.pipeline[chan]);
  		passEncoder.setBindGroup(0, this.sharedBindGroup);
      passEncoder.draw(6);  // call our vertex shader 6 times to make a box.
      passEncoder.end();
   } // end "chan" loop.
   // Do all the channels now.
    this.device.queue.submit([commandEncoder.finish()]);

    await this.device.queue.onSubmittedWorkDone();
    await this.fboRenderer.refreshCanvas(this.channelTexInfo[0].textures[this.fboPingPong]);

    // Flip the ping-pong always as an integer.
    this.fboPingPong = this.fboPingPong === 0 ? 1 : 0;
	}
};

export {wgslHydra}