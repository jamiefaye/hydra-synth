// Tiling of N outputs onto one canvas ("render all" mode, i.e. render() with no argument).
//
// Layout conventions, shared by the WebGL and WebGPU presenters:
//   - cells are counted with x from the left and y from the top
//   - order 'column' (default) fills top-to-bottom then left-to-right, which is what
//     hydra's original 2x2 did: o0 top-left, o1 bottom-left, o2 top-right, o3 bottom-right
//   - order 'row' fills left-to-right then top-to-bottom
//   - fit (default true) letterboxes each cell so an output keeps the canvas aspect
//     ratio; a square grid needs no letterboxing so 2x2 renders exactly as before
//   - cells beyond the output count, and letterbox bars, are black

export function computeGridLayout (count, opts = {}) {
  let cols = opts.cols
  let rows = opts.rows
  if (!cols && !rows) {
    cols = Math.ceil(Math.sqrt(count))
    rows = Math.ceil(count / cols)
  } else if (!rows) {
    rows = Math.ceil(count / cols)
  } else if (!cols) {
    cols = Math.ceil(count / rows)
  }
  cols = Math.max(1, cols)
  rows = Math.max(1, rows)
  const fit = opts.fit === false
    ? [1, 1]
    : [Math.min(1, cols / rows), Math.min(1, rows / cols)]
  return {
    cols,
    rows,
    fit,
    rowMajor: opts.order === 'row'
  }
}

// Uniform values for one frame of the grid shader, for either backend.
export function gridUniformValues (layout) {
  return {
    grid: [layout.cols, layout.rows],
    fit: layout.fit,
    rowMajor: layout.rowMajor ? 1.0 : 0.0
  }
}

// regl props for a frame: textures plus layout uniforms.
export function gridRenderProps (outputs, layout, resolution) {
  const props = Object.assign({ resolution }, gridUniformValues(layout))
  outputs.forEach((o, i) => { props[`tex${i}`] = o.getCurrent() })
  return props
}

const range = (n) => Array.from({ length: n }, (_, i) => i)

// ---------------------------------------------------------------- GLSL (regl)

export function gridVertGlsl (precision) {
  return `
  precision ${precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`
}

// opaque: the canvas gets rgb x a over black at alpha 1 (the vertex extension: alpha is how much of a pixel is shown)
export function gridFragGlsl (count, precision, opaque = false) {
  const decls = range(count).map(i => `uniform sampler2D tex${i};`).join('\n  ')
  const chain = range(count)
    .map(i => `${i ? 'else ' : ''}if (idx == ${i}) gl_FragColor = texture2D(tex${i}, local);`)
    .join('\n    ')
  return `
  precision ${precision} float;
  varying vec2 uv;
  uniform vec2 grid;       // (cols, rows)
  uniform vec2 fit;        // fraction of each cell used, to keep the output aspect
  uniform float rowMajor;  // 1.0 = left-to-right then down, 0.0 = top-to-bottom then right
  ${decls}

  void main () {
    vec2 st = vec2(1.0 - uv.x, uv.y);   // x from left, y from top
    vec2 cell = floor(st * grid);
    int cx = int(cell.x);
    int cy = int(cell.y);
    int idx = rowMajor > 0.5 ? cx + cy * int(grid.x) : cy + cx * int(grid.y);
    vec2 local = (fract(st * grid) - 0.5) / fit + 0.5;
    if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    ${chain}
    else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);${opaque ? '\n    gl_FragColor = vec4(gl_FragColor.rgb * clamp(gl_FragColor.a, 0.0, 1.0), 1.0);' : ''}
  }`
}

// Regl uniform declarations for the grid command (props looked up per frame).
export function gridReglUniforms (regl, count) {
  const uniforms = {
    grid: regl.prop('grid'),
    fit: regl.prop('fit'),
    rowMajor: regl.prop('rowMajor')
  }
  range(count).forEach(i => { uniforms[`tex${i}`] = regl.prop(`tex${i}`) })
  return uniforms
}

// ---------------------------------------------------------------- WGSL (WebGPU)

// Bind group 0: binding 0 sampler, bindings 1..count textures, binding count+1 layout uniforms.
export const GRID_WGSL_UNIFORM_BYTES = 32

export function gridWgsl (count) {
  const texDecls = range(count)
    .map(i => `@group(0) @binding(${i + 1}) var tex${i}: texture_2d<f32>;`)
    .join('\n')
  const chain = range(count)
    .map(i => `${i ? 'else ' : ''}if (idx == ${i}) { let c = textureSampleLevel(tex${i}, samp, local, 0.0); return vec4f(c.rgb * clamp(c.a, 0.0, 1.0), 1.0); }`)   // rgb x a over black, as the single-output blit
    .join('\n    ')
  const prefix = `
struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) texcoord : vec2f,
};
struct GridUniforms {
  grid : vec2<f32>,
  fit : vec2<f32>,
  rowMajor : f32,
  pad0 : f32,
  pad1 : f32,
  pad2 : f32,
};
@group(0) @binding(0) var samp: sampler;
${texDecls}
@group(0) @binding(${count + 1}) var<uniform> gridU: GridUniforms;
`
  const vertex = prefix + `
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
  output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
  output.texcoord = positions[vertexIndex] / 2.0 + 0.5;
  return output;
}`
  const fragment = prefix + `
@fragment
fn main(ourIn: VertexOutput) -> @location(0) vec4<f32> {
  let uv = ourIn.texcoord;                       // (0,0) is bottom-left on screen
  let cols = i32(gridU.grid.x);
  let rows = i32(gridU.grid.y);
  let cell = floor(uv * gridU.grid);
  let cx = i32(cell.x);
  let cyTop = rows - 1 - i32(cell.y);            // count rows from the top, like WebGL
  var idx : i32;
  if (gridU.rowMajor > 0.5) { idx = cx + cyTop * cols; } else { idx = cyTop + cx * rows; }
  let local = (fract(uv * gridU.grid) - 0.5) / gridU.fit + 0.5;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) {
    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
  }
  ${chain}
  return vec4<f32>(0.0, 0.0, 0.0, 1.0);
}`
  return { vertex, fragment, uniformBinding: count + 1 }
}

export function gridWgslUniformArray (layout) {
  return new Float32Array([
    layout.cols, layout.rows,
    layout.fit[0], layout.fit[1],
    layout.rowMajor ? 1.0 : 0.0, 0, 0, 0
  ])
}
