# Hydra Renderer Interface Proposal

**Authors:** Jamie Faye Fenton, with input from Claude
**Date:** December 2024
**Status:** Draft for Discussion
**Target Reviewers:** Olivia Jack, Maximillian Ascari

---

## Summary

This proposal introduces a **Renderer Interface** abstraction that allows Hydra to support multiple rendering backends (WebGL1, WebGL2, WebGPU) as swappable plugins. This enables:

1. **WebGL2 support** without forking or major surgery to core Hydra
2. **WebGPU as a first-class citizen** rather than a bolted-on extension
3. **Future-proofing** as graphics APIs evolve
4. **Cleaner architecture** with separated concerns

---

## Problem Statement

### Current State

Hydra currently has rendering code tightly coupled to regl (WebGL1):

```
src/hydra-synth.js  →  src/output.js  →  regl
```

The vertex extension adds WebGPU support, but as a replacement rather than a plugin:

```
extensions/vertex/createHydra.js  →  wgsl/wgsl-hydra.js  →  WebGPU
                                 →  output.js  →  regl (WebGL1)
```

This has led to:
- ~70% code duplication between `hydra-synth.js` and `createHydra.js`
- Parallel implementations that can drift out of sync
- No clean path for adding WebGL2

### Goals

1. Define a stable **Renderer Interface** that all backends implement
2. Keep **Hydra core** (synthesis graph, transforms, eval) renderer-agnostic
3. Allow renderers to be **selected at runtime** or **bundled separately**
4. Provide **clear guidance** for implementing new renderers (e.g., WebGL2)

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Hydra Core                       │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │  Synthesis  │ │  Transform  │ │    Sources    │  │
│  │   Graph     │ │  Generator  │ │   (s0-s3)     │  │
│  └─────────────┘ └─────────────┘ └───────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │    Eval     │ │    Tick     │ │  Shader Expr  │  │
│  │  Sandbox    │ │    Loop     │ │   Compiler    │  │
│  └─────────────┘ └─────────────┘ └───────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │ Renderer Interface │
              │    (abstract)      │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐
│   WebGL1      │ │  WebGL2   │ │    WebGPU     │
│  (regl)       │ │  (new)    │ │   (wgsl)      │
│               │ │           │ │               │
│ GLSL ES 1.0   │ │ GLSL ES   │ │    WGSL       │
│               │ │   3.0     │ │               │
└───────────────┘ └───────────┘ └───────────────┘
```

---

## Renderer Interface Specification

```javascript
/**
 * Abstract Renderer Interface
 * All rendering backends must implement these methods.
 */
class RendererInterface {

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Initialize the renderer with a canvas
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Object} options - Renderer-specific options
   * @returns {Promise<void>}
   */
  async init(canvas, options = {}) {}

  /**
   * Clean up all resources
   */
  destroy() {}

  // ============================================================
  // Output Management
  // ============================================================

  /**
   * Create an output buffer (o0, o1, o2, o3)
   * @param {number} index - Output index (0-3)
   * @param {Object} options - { width, height, wrap, filter }
   * @returns {OutputBuffer}
   */
  createOutput(index, options = {}) {}

  /**
   * Resize all outputs
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {}

  // ============================================================
  // Shader Compilation
  // ============================================================

  /**
   * Compile a fragment shader pass
   * @param {string} glslSource - GLSL ES 1.0 source (canonical format)
   * @param {Object} uniforms - Uniform definitions
   * @returns {CompiledPass} - Renderer-specific compiled shader
   */
  compilePass(glslSource, uniforms = {}) {}

  /**
   * Compile a vertex shader (for 3D geometry)
   * @param {string} glslSource - GLSL vertex shader source
   * @param {Object} attributes - Attribute definitions
   * @returns {CompiledVertexShader}
   */
  compileVertexShader(glslSource, attributes = {}) {}

  // ============================================================
  // Rendering
  // ============================================================

  /**
   * Render passes to an output
   * @param {OutputBuffer} output - Target output
   * @param {Array<CompiledPass>} passes - Shader passes to execute
   * @param {Object} uniforms - Runtime uniform values
   */
  render(output, passes, uniforms) {}

  /**
   * Render with custom geometry (sprites/3D)
   * @param {OutputBuffer} output
   * @param {CompiledPass} pass
   * @param {Object} geometry - { vertices, uvs, normals, indices }
   * @param {Object} options - { blendMode, depth, instances }
   */
  renderGeometry(output, pass, geometry, options = {}) {}

  /**
   * Copy output to canvas for display
   * @param {OutputBuffer} output - Source output
   */
  renderToScreen(output) {}

  // ============================================================
  // Textures
  // ============================================================

  /**
   * Create a texture from various sources
   * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source
   * @returns {Texture}
   */
  createTexture(source) {}

  /**
   * Update texture contents
   * @param {Texture} texture
   * @param {*} source
   */
  updateTexture(texture, source) {}

  // ============================================================
  // Capabilities Query
  // ============================================================

  /**
   * Get renderer capabilities
   * @returns {Object} - {
   *   name: 'webgl1' | 'webgl2' | 'webgpu',
   *   glslVersion: '100' | '300 es' | 'wgsl',
   *   instancing: boolean,
   *   computeShaders: boolean,
   *   floatTextures: boolean,
   *   maxTextureSize: number,
   *   ...
   * }
   */
  get capabilities() {}
}
```

---

## Shader Language Strategy

Hydra's transform generator produces GLSL ES 1.0 as the canonical shader format. Each renderer handles translation:

| Renderer | Input | Translation |
|----------|-------|-------------|
| WebGL1 | GLSL ES 1.0 | None (native) |
| WebGL2 | GLSL ES 1.0 | Minimal upgrades (version, precision) |
| WebGPU | GLSL ES 1.0 | Full transpilation to WGSL |

The **shader-expr** module already handles GLSL-to-WGSL translation for shader expressions. This can be extended for full shader transpilation, or we can use existing tools (glslang, naga).

### Shader Expression Support

The existing `shader-expr` module provides:
- JavaScript expression → AST parsing
- `emitGLSL(ast)` → GLSL code
- `emitWGSL(ast)` → WGSL code

This pattern extends naturally to full shaders.

---

## Implementation Plan

### Scope of Initial PR to hydra-synth

**The PR to Olivia's hydra-synth repo will contain ONLY:**
- The Renderer Interface abstraction
- A WebGL1 renderer wrapping existing regl code
- Hooks for future renderer plugins

**NOT included in the initial PR:**
- WebGPU renderer (stays in Jamie's vertex extension repo)
- 3D/Vertex shader features (stays in Jamie's vertex extension repo)
- WebGL2 renderer (Max's separate contribution)

This keeps the PR focused, non-breaking, and easy to review. The architecture enables future renderers without requiring them upfront.

---

### Phase 1: Define Interface (Initial PR)

1. Create `src/renderer/RendererInterface.js` with the abstract interface
2. Document all methods with JSDoc
3. Add capability constants and types
4. Include hooks for geometry/vertex rendering (for future use)

### Phase 2: Wrap Existing WebGL1 Renderer (Initial PR)

1. Create `src/renderer/WebGL1Renderer.js`
2. Wrap existing `output.js` and regl code
3. Implement the interface methods
4. Verify all existing Hydra functionality works unchanged
5. This is a **refactor with no user-visible changes**

### Phase 3: WebGL2 Renderer (Max's contribution - separate PR)

1. Create `src/renderer/WebGL2Renderer.js`
2. Use raw WebGL2 or a lightweight wrapper (twgl.js)
3. Implement the interface
4. Add WebGL2-specific features as capability extensions

### Phase 4: WebGPU Renderer (Jamie's repo, future PR if desired)

1. Refactor existing `wgsl-hydra.js` and `outputWgsl.js` to implement interface
2. Keep in vertex extension repo: `extensions/vertex/renderer/WebGPURenderer.js`
3. Can be submitted as PR to hydra-synth when/if requested
4. Includes 3D geometry, instancing, and vertex shader features

---

## Example: Renderer Selection

```javascript
import Hydra from 'hydra-synth'

// Auto-detect best available renderer
const hydra = await Hydra.create({
  canvas: document.querySelector('canvas'),
  renderer: 'auto'  // tries: webgpu → webgl2 → webgl1
})

// Or specify explicitly
const hydra = await Hydra.create({
  renderer: 'webgpu',
  // WebGPU-specific options
  powerPreference: 'high-performance'
})

// Query capabilities
console.log(hydra.renderer.capabilities)
// { name: 'webgpu', instancing: true, computeShaders: true, ... }
```

---

## Example: Implementing a New Renderer

```javascript
import { RendererInterface } from 'hydra-synth/renderer'

class WebGL2Renderer extends RendererInterface {
  async init(canvas, options = {}) {
    this.gl = canvas.getContext('webgl2', {
      antialias: options.antialias ?? true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false
    })
    if (!this.gl) {
      throw new Error('WebGL2 not supported')
    }
    // Initialize resources...
  }

  compilePass(glslSource, uniforms) {
    // Upgrade GLSL ES 1.0 → 3.0
    const upgraded = this.upgradeShader(glslSource)
    // Compile with WebGL2...
  }

  get capabilities() {
    return {
      name: 'webgl2',
      glslVersion: '300 es',
      instancing: true,
      computeShaders: false,
      floatTextures: true,
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE)
    }
  }

  // ... implement remaining methods
}
```

---

## Benefits

### For Olivia / Hydra Core
- Cleaner separation of concerns
- Easier to maintain and test
- Future-proof architecture

### For Max / WebGL2
- Clear interface to implement against
- Working examples (WebGL1, WebGPU)
- Can use native WebGL2 or any wrapper

### For Jamie / WebGPU
- WebGPU becomes a first-class plugin
- No more "replace Hydra" pattern
- Sustainable long-term

### For Users
- Runtime renderer selection
- Graceful fallback
- Consistent API regardless of backend

---

## Open Questions

1. **Shader transpilation**: Build into Hydra or require pre-transpiled shaders?
2. **Feature parity**: Which features are renderer-specific vs. universal?
3. **Bundle strategy**: One bundle with all renderers or separate bundles?
4. **Migration path**: How to maintain backward compatibility during transition?

---

## Next Steps

1. **Review this proposal** - Olivia, Max, and community feedback
2. **Jamie submits PR to hydra-synth** containing:
   - `src/renderer/RendererInterface.js` - The abstract interface
   - `src/renderer/WebGL1Renderer.js` - Wraps existing regl code
   - Updates to `hydra-synth.js` to use the interface
   - All existing tests pass, no user-visible changes
3. **Max implements WebGL2Renderer** using the interface as a guide
4. **Jamie maintains WebGPU in vertex extension**, can PR later if desired
5. Iterate based on findings

### What Jamie Will Test Before PR

To ensure the interface is complete, Jamie will:
1. Verify WebGL1 wrapper passes all existing Hydra tests
2. Verify WebGPU renderer in vertex extension can implement the same interface
3. Document any interface gaps discovered during WebGPU implementation

This proves the interface works for both backends without including WebGPU in the PR.

---

## References

- [regl documentation](https://github.com/regl-project/regl)
- [WebGPU specification](https://www.w3.org/TR/webgpu/)
- [hydra-synth repository](https://github.com/hydra-synth/hydra-synth)
- [Vertex extension (WebGPU implementation)](https://github.com/jamiefaye/hydra-synth/tree/extensions)
