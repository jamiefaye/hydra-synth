import { computeGridLayout, gridWgsl, gridWgslUniformArray, GRID_WGSL_UNIFORM_BYTES } from '../../../src/lib/grid-layout.js'

// Draws N output textures tiled onto the browser canvas ("render all" mode).
// Replaces the fixed 2x2 FBO4ToCanvas; the layout comes from grid-layout.js.
class FBOGridToCanvas {

  constructor (canvas, device, count = 4, layout = null) {
    this.canvas = canvas
    this.device = device
    this.count = count
    this.layout = layout || computeGridLayout(count)
    this.context = this.canvas.getContext('webgpu')
    this.aspect = this.canvas.width / this.canvas.height
  }

  async setupFromScratch () {
    if (!navigator.gpu) {
      console.error('WebGPU is not supported on this browser.')
      return
    }
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      console.error('Failed to get GPU adapter.')
      return
    }
    this.device = await adapter.requestDevice()
  }

  async initializeFBOdrawing () {
    if (!this.device) await this.setupFromScratch()

    const format = navigator.gpu.getPreferredCanvasFormat()
    this.context.configure({ device: this.device, format, alphaMode: 'opaque' })

    const { vertex, fragment, uniformBinding } = gridWgsl(this.count)
    const vertexShaderModule = this.device.createShaderModule({ label: 'vertFBOGrid', code: vertex })
    const fragmentShaderModule = this.device.createShaderModule({ label: 'fragFBOGrid', code: fragment })

    const entries = [{
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: { type: 'filtering' }
    }]
    for (let i = 0; i < this.count; i++) {
      entries.push({
        binding: i + 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: 'float', viewDimension: '2d', multisampled: false }
      })
    }
    entries.push({
      binding: uniformBinding,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: 'uniform' }
    })
    this.uniformBinding = uniformBinding

    this.textureBindGroupLayout = this.device.createBindGroupLayout({
      label: 'FBOGridBindGroupLayout',
      entries
    })

    this.pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.textureBindGroupLayout]
    })

    this.pipeline = this.device.createRenderPipeline({
      label: 'FBOGridRenderPipeline',
      vertex: { module: vertexShaderModule, entryPoint: 'main' },
      fragment: { module: fragmentShaderModule, entryPoint: 'main', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
      layout: this.pipelineLayout
    })

    this.sampler = this.device.createSampler()
    this.uniformBuffer = this.device.createBuffer({
      label: 'FBOGridUniforms',
      size: GRID_WGSL_UNIFORM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    this.setLayout(this.layout)
  }

  // layout: result of computeGridLayout(); takes effect on the next refresh.
  setLayout (layout) {
    this.layout = layout
    if (this.uniformBuffer) {
      this.device.queue.writeBuffer(this.uniformBuffer, 0, gridWgslUniformArray(layout))
    }
  }

  // textures: array of GPUTexture, one per output, in output order.
  refreshCanvases (textures) {
    if (!textures || textures.length < this.count || textures.some(t => !t)) return

    const entries = [{ binding: 0, resource: this.sampler }]
    for (let i = 0; i < this.count; i++) {
      entries.push({ binding: i + 1, resource: textures[i].createView() })
    }
    entries.push({ binding: this.uniformBinding, resource: { buffer: this.uniformBuffer } })

    this.textureBindGroup = this.device.createBindGroup({
      label: 'FBOGrid texture bind group',
      layout: this.textureBindGroupLayout,
      entries
    })

    const canvasTextureView = this.context.getCurrentTexture().createView()
    this.renderPassDescriptor = {
      label: 'FBOGridRenderPassDescriptor',
      colorAttachments: [{
        view: canvasTextureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    }

    const commandEncoder = this.device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor)
    passEncoder.setPipeline(this.pipeline)
    passEncoder.setBindGroup(0, this.textureBindGroup)
    passEncoder.draw(6)
    passEncoder.end()
    this.device.queue.submit([commandEncoder.finish()])
  }
}

export { FBOGridToCanvas }
