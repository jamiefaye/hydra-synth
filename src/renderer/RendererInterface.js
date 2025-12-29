/**
 * Abstract Renderer Interface
 *
 * All rendering backends (WebGL1, WebGL2, WebGPU) must implement this interface.
 * This allows Hydra core to remain renderer-agnostic.
 */

export class RendererInterface {

  /**
   * Initialize the renderer with a canvas
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Object} options - Renderer options
   * @param {string} options.precision - Float precision ('lowp', 'mediump', 'highp')
   * @param {number} options.width - Initial width
   * @param {number} options.height - Initial height
   * @param {number} options.numOutputs - Number of output buffers (default 4)
   * @returns {void|Promise<void>} - May be sync (WebGL) or async (WebGPU)
   */
  init(canvas, options = {}) {
    throw new Error('RendererInterface.init() must be implemented')
  }

  /**
   * Clean up all resources
   */
  destroy() {
    throw new Error('RendererInterface.destroy() must be implemented')
  }

  /**
   * Resize all outputs and refresh context
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    throw new Error('RendererInterface.resize() must be implemented')
  }

  // ============================================================
  // Output Management
  // ============================================================

  /**
   * Create an output buffer (o0, o1, o2, o3)
   * @param {number} index - Output index
   * @param {Object} options - { width, height, label }
   * @returns {OutputBuffer} - Renderer-specific output buffer
   */
  createOutput(index, options = {}) {
    throw new Error('RendererInterface.createOutput() must be implemented')
  }

  /**
   * Get an output by index
   * @param {number} index
   * @returns {OutputBuffer}
   */
  getOutput(index) {
    throw new Error('RendererInterface.getOutput() must be implemented')
  }

  // ============================================================
  // Source Management
  // ============================================================

  /**
   * Create a source for external input (video, image, canvas)
   * @param {number} index - Source index
   * @param {Object} options - { width, height, label }
   * @returns {Source} - Renderer-specific source
   */
  createSource(index, options = {}) {
    throw new Error('RendererInterface.createSource() must be implemented')
  }

  // ============================================================
  // Rendering
  // ============================================================

  /**
   * Render a compiled pass to an output
   * Called by Output.render() internally
   * @param {OutputBuffer} output - Target output
   * @param {Object} pass - { frag, uniforms }
   */
  renderPass(output, pass) {
    throw new Error('RendererInterface.renderPass() must be implemented')
  }

  /**
   * Execute a tick on an output (runs the compiled draw command)
   * @param {OutputBuffer} output
   * @param {Object} props - { time, mouse, bpm, resolution }
   */
  tickOutput(output, props) {
    throw new Error('RendererInterface.tickOutput() must be implemented')
  }

  /**
   * Render a single output to the canvas
   * @param {OutputBuffer} output - Source output to display
   */
  renderToScreen(output) {
    throw new Error('RendererInterface.renderToScreen() must be implemented')
  }

  /**
   * Render all 4 outputs in a 2x2 grid to the canvas
   * @param {Array<OutputBuffer>} outputs - Array of 4 outputs
   */
  renderAllToScreen(outputs) {
    throw new Error('RendererInterface.renderAllToScreen() must be implemented')
  }

  // ============================================================
  // Capabilities & Info
  // ============================================================

  /**
   * Get renderer capabilities
   * @returns {Object} - {
   *   name: 'webgl1' | 'webgl2' | 'webgpu',
   *   glslVersion: string,
   *   instancing: boolean,
   *   floatTextures: boolean,
   *   maxTextureSize: number,
   *   ...
   * }
   */
  get capabilities() {
    throw new Error('RendererInterface.capabilities must be implemented')
  }

  /**
   * Get the underlying canvas
   * @returns {HTMLCanvasElement}
   */
  get canvas() {
    throw new Error('RendererInterface.canvas must be implemented')
  }

  /**
   * Get current width
   * @returns {number}
   */
  get width() {
    throw new Error('RendererInterface.width must be implemented')
  }

  /**
   * Get current height
   * @returns {number}
   */
  get height() {
    throw new Error('RendererInterface.height must be implemented')
  }

  // ============================================================
  // Extension Points (optional overrides)
  // ============================================================

  /**
   * Called before each frame
   * Override for custom pre-frame logic
   */
  beginFrame() {}

  /**
   * Called after each frame
   * Override for custom post-frame logic
   */
  endFrame() {}
}

export default RendererInterface
