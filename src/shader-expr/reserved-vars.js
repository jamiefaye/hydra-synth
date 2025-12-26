// Reserved shader expression variables and their mappings
// These variables can be used in string expressions and will be replaced with GLSL equivalents

export const RESERVED_VARS = {
  // Fragment-level (per-pixel)
  '_st': { level: 'fragment', glsl: 'st' },
  '_c0': { level: 'fragment', glsl: '_c0' },

  // Instance-level (per-instance, same for all vertices of an instance) - requires vertex extension with GPU instancing
  '_ix': { level: 'instance', glsl: 'v_instanceId' },

  // Vertex-level (interpolated to fragment) - requires vertex extension
  '_v': { level: 'vertex', glsl: 'v_', isPrefix: true },

  // Uniform-level (per-frame, available everywhere)
  'time': { level: 'uniform', glsl: 'time' },
  'resolution': { level: 'uniform', glsl: 'resolution' },
  'mouse': { level: 'uniform', glsl: 'mouse' }
}

// Vertex varying sub-properties (used with _v prefix)
export const VERTEX_VARYINGS = {
  'position': 'v_position',
  'normal': 'v_normal',
  'worldNormal': 'v_worldNormal',
  'tangent': 'v_tangent',
  'bitangent': 'v_bitangent',
  'viewDir': 'v_viewDir',
  'depth': 'v_depth',
  'uv': 'uv',
  'faceId': 'v_faceId',
  'color': 'v_color',
  'instanceId': 'v_instanceId'
}

// Level hierarchy - higher number = more specific execution context
export const LEVEL_PRIORITY = {
  'uniform': 0,   // runs once per frame
  'instance': 1,  // runs per instance (GPU instancing)
  'vertex': 2,    // runs per vertex, interpolated to fragment
  'fragment': 3   // runs per pixel
}

// Math functions allowed in expressions (maps to GLSL builtins)
export const MATH_FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'pow', 'exp', 'exp2', 'log', 'log2', 'sqrt', 'inversesqrt',
  'abs', 'sign', 'floor', 'ceil', 'fract', 'mod',
  'min', 'max', 'clamp', 'mix', 'step', 'smoothstep',
  'length', 'distance', 'dot', 'cross', 'normalize',
  'radians', 'degrees'
])

// Vector constructors allowed
export const VECTOR_CONSTRUCTORS = new Set([
  'vec2', 'vec3', 'vec4',
  'ivec2', 'ivec3', 'ivec4',
  'mat2', 'mat3', 'mat4'
])
