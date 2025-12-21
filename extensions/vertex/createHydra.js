/**
 * Hydra Factory with WebGL + WebGPU support
 *
 * This factory creates Hydra instances that work with both rendering backends.
 * For WebGL, it uses vanilla hydra-synth. For WebGPU, it initializes the WGSL pipeline.
 */

// WebGPU imports (from extension's wgsl folder)
import { wgslHydra } from './wgsl/wgsl-hydra.js'
import { OutputWgsl } from './wgsl/outputWgsl.js'

// Extension-specific imports
import { Deglobalize } from './Deglobalize.js'

// We need these from hydra-synth for initialization
import Output from '../../src/output.js'
import Source from './hydra-source.js'  // Extended version with WGSL support
import MouseTools from '../../src/lib/mouse.js'
import Audio from '../../src/lib/audio.js'
import VidRecorder from '../../src/lib/video-recorder.js'
import ArrayUtils from '../../src/lib/array-utils.js'
import Generator from '../../src/generator-factory.js'
import regl from 'regl'

// GeneratorFunction constructor for yield support in sketches
const GeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor

// RAF loop - use a simple implementation
function createLoop(fn) {
  let running = false
  let lastTime = performance.now()
  let rafId = null

  function tick() {
    if (!running) return
    const now = performance.now()
    const dt = now - lastTime
    lastTime = now
    fn(dt)
    rafId = requestAnimationFrame(tick)
  }

  return {
    start() {
      if (running) return this
      running = true
      lastTime = performance.now()
      rafId = requestAnimationFrame(tick)
      return this
    },
    stop() {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      return this
    }
  }
}

// Mouse singleton
let Mouse
if (typeof window !== 'undefined') {
  Mouse = MouseTools()
} else {
  Mouse = { x: 0, y: 0 }
}

/**
 * Create a Hydra instance with optional WebGPU support
 */
export async function createHydra({
  pb = null,
  width = 1280,
  height = 720,
  numSources = 4,
  numOutputs = 4,
  makeGlobal = true,
  autoLoop = true,
  detectAudio = true,
  enableStreamCapture = true,
  useWGSL = false,
  canvas,
  precision,
  extendTransforms = {},
  gpuDevice = null,
  preserveDrawingBuffer = false
} = {}) {

  // Create the hydra instance object
  const hydra = {
    pb,
    width,
    height,
    renderAll: false,
    detectAudio,
    useWGSL,
    preserveDrawingBuffer,
    gpuDevice,
    numOutputs,
    o: [],
    s: [],
    synth: {
      time: 0,
      bpm: 30,
      width,
      height,
      fps: undefined,
      stats: { fps: 0 },
      speed: 1,
      mouse: Mouse,
      isWGSL: useWGSL
    },
    timeSinceLastUpdate: 0,
    _time: 0
  }

  ArrayUtils.init()

  // Determine precision
  const precisionOptions = ['lowp', 'mediump', 'highp']
  if (precision && precisionOptions.includes(precision.toLowerCase())) {
    hydra.precision = precision.toLowerCase()
  } else {
    const isIOS = typeof navigator !== 'undefined' &&
      ((/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !window.MSStream)
    hydra.precision = isIOS ? 'highp' : 'mediump'
  }

  hydra.extendTransforms = extendTransforms

  // Initialize canvas
  if (canvas) {
    hydra.canvas = canvas
    // Update dimensions from canvas if not explicitly provided or if canvas has different size
    if (canvas.width && canvas.height) {
      hydra.width = canvas.width
      hydra.height = canvas.height
      hydra.synth.width = canvas.width
      hydra.synth.height = canvas.height
    }
  } else if (typeof document !== 'undefined') {
    // Ensure body fills viewport
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.width = '100vw'
    document.body.style.height = '100vh'
    document.body.style.background = '#000'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.documentElement.style.width = '100%'
    document.documentElement.style.height = '100%'

    // Hide any existing app div
    const appDiv = document.getElementById('app')
    if (appDiv) appDiv.style.display = 'none'

    hydra.canvas = document.createElement('canvas')
    hydra.canvas.style.position = 'fixed'
    hydra.canvas.style.top = '0'
    hydra.canvas.style.left = '0'
    hydra.canvas.style.width = '100%'
    hydra.canvas.style.height = '100%'
    hydra.canvas.style.display = 'block'
    hydra.canvas.style.imageRendering = 'pixelated'
    document.body.appendChild(hydra.canvas)

    // Use actual display size for canvas dimensions
    const rect = hydra.canvas.getBoundingClientRect()
    const displayWidth = Math.round(rect.width * (window.devicePixelRatio || 1))
    const displayHeight = Math.round(rect.height * (window.devicePixelRatio || 1))
    hydra.canvas.width = displayWidth || width
    hydra.canvas.height = displayHeight || height
    hydra.width = hydra.canvas.width
    hydra.height = hydra.canvas.height
    hydra.synth.width = hydra.canvas.width
    hydra.synth.height = hydra.canvas.height
  }

  // Bind methods to synth
  hydra.synth.render = hydra._render = function(output) {
    if (output) {
      hydra.output = output
      hydra.isRenderingAll = false
    } else {
      hydra.isRenderingAll = true
    }
  }.bind(hydra)

  hydra.synth.setResolution = hydra.setResolution = function(w, h) {
    // Guard against invalid dimensions
    if (!w || !h || w <= 0 || h <= 0) {
      console.warn(`[hydra] setResolution called with invalid dimensions: ${w}x${h}`)
      return
    }
    hydra.canvas.width = w
    hydra.canvas.height = h
    hydra.width = w
    hydra.height = h
    hydra.synth.width = w
    hydra.synth.height = h
    if (hydra.wgslHydra) {
      hydra.wgslHydra.resizeOutputsTo(w, h)
    }
    hydra.o.forEach(o => o.resize && o.resize(w, h))
  }.bind(hydra)

  hydra.synth.hush = hydra.hush = function() {
    hydra.s.forEach(source => source.clear && source.clear())
    hydra.o.forEach(output => {
      if (output.clearSprites) output.clearSprites()
    })
    hydra.synth.render(hydra.o[0])
    // Reset user callbacks (matches fork behavior)
    hydra.synth.update = (dt) => {}
    hydra.synth.afterUpdate = (dt) => {}
  }.bind(hydra)

  hydra.synth.update = (dt) => {}
  hydra.synth.afterUpdate = (dt) => {}
  hydra.synth.tick = hydra.tick = createTick(hydra)

  // Initialize based on mode
  if (useWGSL) {
    // WebGPU mode
    hydra.wgslHydra = new wgslHydra(hydra, hydra.canvas, numOutputs, gpuDevice)

    // Initialize outputs
    hydra.o = Array(numOutputs).fill().map((_, index) => {
      const o = new OutputWgsl({
        wgslHydra: hydra.wgslHydra,
        hydraSynth: hydra,
        width: hydra.width,
        height: hydra.height,
        chanNum: index,
        label: `o${index}`
      })
      o.id = index
      o.precision = hydra.precision
      hydra.synth['o' + index] = o
      return o
    })
    hydra.output = hydra.o[0]

    // Setup WebGPU
    await hydra.wgslHydra.setupHydra()

    // Initialize sources
    initSources(hydra, numSources)

    // Generate transforms
    hydra.generator = new Generator({
      defaultOutput: hydra.o[0],
      defaultUniforms: hydra.o[0].uniforms || {},
      extendTransforms: hydra.extendTransforms,
      changeListener: ({ type, method, synth }) => {
        if (type === 'add') {
          hydra.synth[method] = synth.generators[method]
          // Expose new methods on window if makeGlobal
          if (makeGlobal && typeof window !== 'undefined') {
            window[method] = synth.generators[method]
          }
        }
      }
    })
    // Set isWGSL so GlslSource knows to generate WGSL shaders
    hydra.generator.isWGSL = true

    // Expose setFunction for extensions
    hydra.synth.setFunction = hydra.generator.setFunction.bind(hydra.generator)

  } else {
    // WebGL mode
    hydra.regl = regl({
      canvas: hydra.canvas,
      pixelRatio: 1,
      attributes: { preserveDrawingBuffer }
    })

    hydra.regl.clear({ color: [0, 0, 0, 1] })

    // Initialize outputs
    hydra.o = Array(numOutputs).fill().map((_, index) => {
      const o = new Output({
        regl: hydra.regl,
        width: hydra.width,
        height: hydra.height,
        precision: hydra.precision,
        label: `o${index}`
      })
      o.id = index
      hydra.synth['o' + index] = o
      return o
    })
    hydra.output = hydra.o[0]

    // Initialize sources
    initSources(hydra, numSources)

    // Generate transforms
    hydra.generator = new Generator({
      genWGSL: false,
      defaultOutput: hydra.o[0],
      defaultUniforms: hydra.o[0].uniforms,
      extendTransforms: hydra.extendTransforms,
      changeListener: ({ type, method, synth }) => {
        if (type === 'add') {
          hydra.synth[method] = synth.generators[method]
          // Expose new methods on window if makeGlobal
          if (makeGlobal && typeof window !== 'undefined') {
            window[method] = synth.generators[method]
          }
        }
      }
    })

    // Expose setFunction for extensions
    hydra.synth.setFunction = hydra.generator.setFunction.bind(hydra.generator)

    // Create renderAll for WebGL
    hydra.renderAll = hydra.regl({
      frag: `
        precision ${hydra.precision} float;
        varying vec2 uv;
        uniform sampler2D tex0;
        uniform sampler2D tex1;
        uniform sampler2D tex2;
        uniform sampler2D tex3;
        void main () {
          vec2 st = vec2(1.0 - uv.x, uv.y);
          st *= vec2(2);
          vec2 q = floor(st).xy * vec2(2.0, 1.0);
          int quad = int(q.x) + int(q.y);
          st.x += step(1., mod(st.y, 2.0));
          st.y += step(1., mod(st.x, 2.0));
          st = fract(st);
          if (quad == 0) {
            gl_FragColor = texture2D(tex0, st);
          } else if (quad == 1) {
            gl_FragColor = texture2D(tex1, st);
          } else if (quad == 2) {
            gl_FragColor = texture2D(tex2, st);
          } else {
            gl_FragColor = texture2D(tex3, st);
          }
        }
      `,
      vert: `
        precision ${hydra.precision} float;
        attribute vec2 position;
        varying vec2 uv;
        void main () {
          uv = position;
          gl_Position = vec4(2.0 * position - 1.0, 0, 1);
        }
      `,
      attributes: {
        position: [[-2, 0], [0, -2], [2, 2]]
      },
      uniforms: {
        tex0: () => hydra.o[0].getCurrent(),
        tex1: () => hydra.o[1].getCurrent(),
        tex2: () => hydra.o[2].getCurrent(),
        tex3: () => hydra.o[3].getCurrent()
      },
      count: 3,
      depth: { enable: false }
    })

    // Create renderFbo for single output to canvas
    hydra.renderFbo = hydra.regl({
      frag: `
        precision ${hydra.precision} float;
        varying vec2 uv;
        uniform sampler2D tex0;
        void main () {
          gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
        }
      `,
      vert: `
        precision ${hydra.precision} float;
        attribute vec2 position;
        varying vec2 uv;
        void main () {
          uv = position;
          gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
        }
      `,
      attributes: {
        position: [[-2, 0], [0, -2], [2, 2]]
      },
      uniforms: {
        tex0: hydra.regl.prop('tex0'),
        resolution: hydra.regl.prop('resolution')
      },
      count: 3,
      depth: { enable: false }
    })
  }

  // Generator function state for yield support
  hydra.generatorFunction = null
  hydra.generatorFunctionTimer = -1
  hydra.makeGlobal = makeGlobal

  // If makeGlobal is true, also expose synth properties on window for legacy compatibility
  if (makeGlobal && typeof window !== 'undefined') {
    const exposeGlobals = () => {
      Object.keys(hydra.synth).forEach(key => {
        window[key] = hydra.synth[key]
      })
    }
    exposeGlobals()
    // Re-expose after generator is set up (to catch osc, shape, etc.)
    hydra._exposeGlobals = exposeGlobals
  }

  /**
   * Evaluate sketch code with local bindings (no global pollution).
   * Uses Deglobalize to transform primitive refs like `time` to `_h.time`,
   * then creates a GeneratorFunction with all synth properties as local params.
   * Supports yield for timed sequencing.
   *
   * When makeGlobal is true, also updates window globals for legacy compatibility.
   */
  hydra.eval = async function(codeIn) {
    // Reset render target
    hydra.synth.render(hydra.o[0])

    // Transform primitive global refs to member expressions
    let code
    try {
      code = Deglobalize(codeIn, '_h')
    } catch (err) {
      console.warn('[hydra] Deglobalize error:', err)
      code = codeIn
    }

    // Build local bindings from synth object
    const h = hydra.synth
    const keys = Object.keys(h)
    const values = keys.map(k => h[k])

    // Add synth reference as 'h' and '_h' for deglobalized primitives
    keys.push('h')
    values.push(h)
    keys.push('_h')
    values.push(h)

    try {
      const fn = new GeneratorFunction(...keys, code)
      hydra.generatorFunction = fn(...values)
    } catch (err) {
      console.error('[hydra] Error compiling generator function:', err)
      hydra.generatorFunctionTimer = -1
      throw err
    }

    hydra.generatorFunctionTimer = -1

    try {
      const reply = hydra.generatorFunction.next()
      hydra._planNext(reply)
    } catch (err) {
      console.error('[hydra] Error calling initial generator function.next():', err)
      delete hydra.generatorFunction
      throw err
    }
  }

  /**
   * Called from tick() to step the generator if a yield timer has elapsed.
   */
  hydra.generatorTick = function() {
    if (!hydra.generatorFunction || hydra.generatorFunctionTimer === -1) return
    if (hydra.synth.time < hydra.generatorFunctionTimer) return

    const f = hydra.generatorFunction
    if (!f) {
      hydra.generatorFunctionTimer = -1
    } else {
      try {
        const reply = f.next()
        hydra._planNext(reply)
      } catch (err) {
        console.error('[hydra] Error calling generator function.next():', err)
        hydra.generatorFunctionTimer = -1
        delete hydra.generatorFunction
      }
    }
  }

  /**
   * Plan the next generator step based on yield value (wait time in seconds).
   */
  hydra._planNext = function(reply) {
    if (!reply) return

    if (!reply.done) {
      let waitTime = reply.value
      if (waitTime === undefined) {
        waitTime = 0.010
      }
      hydra.generatorFunctionTimer = hydra.synth.time + waitTime
    } else {
      delete hydra.generatorFunction
    }
  }

  /**
   * Teardown this hydra instance, stopping periodic activity and reclaiming memory.
   */
  hydra._destroy = function() {
    hydra.hush()
    if (hydra.looper) {
      hydra.looper.stop()
      delete hydra.looper
    }
    // WebGL cleanup
    if (hydra.regl) {
      hydra.regl.destroy()
      delete hydra.regl
    }
    // WebGPU cleanup
    if (hydra.wgslHydra) {
      // Clear all sprite chains to release GPU buffers
      for (let i = 0; i < hydra.wgslHydra.numChannels; i++) {
        hydra.wgslHydra.clearSpriteChains?.(i)
      }
      // Destroy output textures
      if (hydra.o) {
        hydra.o.forEach(output => {
          if (output.textures) {
            output.textures.forEach(tex => tex?.destroy?.())
          }
        })
      }
      // Destroy depth texture if exists
      if (hydra.wgslHydra.depthTexture) {
        hydra.wgslHydra.depthTexture.destroy()
        hydra.wgslHydra.depthTexture = null
      }
      delete hydra.wgslHydra
    }
    // Cleanup ResizeObserver
    if (hydra._vertexResizeObserver) {
      hydra._vertexResizeObserver.disconnect()
      delete hydra._vertexResizeObserver
    }
    // Audio cleanup
    if (hydra.synth && hydra.synth.a && hydra.synth.a.destroy) {
      hydra.synth.a.destroy()
    }
    delete hydra.generatorFunction
    hydra.generatorFunctionTimer = -1
  }

  // Audio detection
  if (detectAudio) {
    try {
      hydra.audio = new Audio({ numBins: 4 })
      hydra.synth.a = hydra.audio
      // Expose audio 'a' on window if makeGlobal
      if (makeGlobal && typeof window !== 'undefined') {
        window.a = hydra.audio
      }
    } catch (e) {
      console.warn('[hydra] Audio detection not available')
    }
  }

  // Start animation loop
  if (autoLoop) {
    hydra.looper = createLoop(hydra.tick).start()
  }

  // Set default render
  hydra.synth.render(hydra.o[0])

  return hydra
}

function initSources(hydra, numSources) {
  for (let i = 0; i < numSources; i++) {
    const s = new Source({
      regl: hydra.regl,  // undefined in WebGPU mode
      wgsl: hydra.wgslHydra,  // undefined in WebGL mode
      hydraSynth: hydra,
      pb: hydra.pb,
      width: hydra.width,
      height: hydra.height,
      chanNum: i,
      label: `s${i}`
    })
    hydra.synth['s' + i] = s
    hydra.s.push(s)
  }
}

function createTick(hydra) {
  return function tick(dt) {
    hydra.synth.time += dt * 0.001 * hydra.synth.speed
    hydra.synth.stats.fps = Math.round(1000 / dt)

    // Step generator function if yield timer elapsed
    if (hydra.generatorTick) hydra.generatorTick()

    if (hydra.synth.update) hydra.synth.update(dt)

    // Update sources
    hydra.s.forEach(source => source.tick && source.tick(hydra.synth.time))

    // Render
    if (hydra.useWGSL) {
      // WebGPU render
      hydra.wgslHydra.animate(hydra.synth.time, hydra.synth.mouse, hydra.synth.resolution, hydra.isRenderingAll)
    } else {
      // WebGL render
      hydra.o.forEach(o => o.tick && o.tick({
        time: hydra.synth.time,
        mouse: hydra.synth.mouse,
        bpm: hydra.synth.bpm,
        resolution: [hydra.canvas.width, hydra.canvas.height]
      }))

      if (hydra.isRenderingAll) {
        hydra.renderAll({
          tex0: hydra.o[0].getCurrent(),
          tex1: hydra.o[1].getCurrent(),
          tex2: hydra.o[2].getCurrent(),
          tex3: hydra.o[3].getCurrent(),
          resolution: [hydra.canvas.width, hydra.canvas.height]
        })
      } else {
        hydra.renderFbo({
          tex0: hydra.output.getCurrent(),
          resolution: [hydra.canvas.width, hydra.canvas.height]
        })
      }
    }

    if (hydra.synth.afterUpdate) hydra.synth.afterUpdate(dt)
  }
}

export default createHydra
