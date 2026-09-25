// The vertex extension's functions as a table, the shape of src/glsl/glsl-functions.js
// (name, type, inputs) without shader bodies: for tools that read a sketch (hyg's parm, dice,
// morpher) rather than run it. Geometry primitives and the CPU layouts (repeat, grid, scatter)
// read their numbers once, when called: `live: false`. The chain transforms take a function
// (or a shader-expression string) and sample it every frame: live, as Hydra's own arguments are.
// Types are one per interchangeable set: the dice swaps a function for another of its type.

const f = (name, def) => ({ type: 'float', name, default: def })

export default [
  // geometry primitives (geometry.js): built when called
  { name: 'tri', type: 'geometry', live: false, inputs: [f('size', 1), f('centerX', 0), f('centerY', 0)] },
  { name: 'quad', type: 'geometry', live: false, inputs: [f('width', 1), f('height', 1), f('centerX', 0), f('centerY', 0)] },
  { name: 'poly', type: 'geometry', live: false, inputs: [f('sides', 6), f('radius', 1), f('centerX', 0), f('centerY', 0)] },
  { name: 'circle', type: 'geometry', live: false, inputs: [f('radius', 1), f('centerX', 0), f('centerY', 0), f('segments', 32)] },
  { name: 'line', type: 'geometry', live: false, inputs: [f('x1', 0), f('y1', 0), f('x2', 1), f('y2', 1), f('thickness', 0.02)] },
  { name: 'ring', type: 'geometry', live: false, inputs: [f('outerRadius', 1), f('innerRadius', 0.5), f('centerX', 0), f('centerY', 0), f('segments', 32)] },
  { name: 'cube', type: 'geometry', live: false, inputs: [f('size', 0.5)] },
  { name: 'sphere', type: 'geometry', live: false, inputs: [f('radius', 0.5), f('segments', 32), f('rings', 16)] },
  { name: 'plane', type: 'geometry', live: false, inputs: [f('width', 1), f('height', 1), f('subdivisionsX', 1), f('subdivisionsY', 1)] },
  { name: 'torus', type: 'geometry', live: false, inputs: [f('radius', 0.4), f('tubeRadius', 0.15), f('radialSegments', 32), f('tubularSegments', 16)] },
  { name: 'cylinder', type: 'geometry', live: false, inputs: [f('radius', 0.3), f('height', 1), f('radialSegments', 32), f('heightSegments', 1), { type: 'bool', name: 'caps', default: true }] },
  { name: 'cone', type: 'geometry', live: false, inputs: [f('radius', 0.3), f('height', 1), f('radialSegments', 32), { type: 'bool', name: 'caps', default: true }] },
  // chain transforms (vertex-source.js): uniforms, sampled every frame
  { name: 'rotate', type: 'vertexRotate', inputs: [f('angle', 0)] },
  { name: 'rotateX', type: 'vertexRotate', inputs: [f('angle', 0)] },
  { name: 'rotateY', type: 'vertexRotate', inputs: [f('angle', 0)] },
  { name: 'rotateZ', type: 'vertexRotate', inputs: [f('angle', 0)] },
  { name: 'scale', type: 'vertexScale', inputs: [f('x', 1), f('y', undefined), f('z', undefined)] },
  { name: 'offset', type: 'vertexMove', inputs: [f('x', 0), f('y', 0), f('z', 0)] },
  { name: 'translate', type: 'vertexMove', inputs: [f('x', 0), f('y', 0), f('z', 0)] },
  { name: 'perspective', type: 'vertexView', inputs: [f('fov', 45), f('near', 0.1), f('far', 100)] },
  // CPU layouts: the vertex array is rebuilt when called
  { name: 'repeat', type: 'vertexRepeat', live: false, inputs: [f('nx', 2), f('ny', 1), f('spacing', 0.5)] },
  { name: 'grid', type: 'vertexGrid', live: false, inputs: [f('nx', 2), f('ny', 2), f('nz', 1), f('spacing', 1)] },
  { name: 'scatter', type: 'vertexScatter', live: false, inputs: [f('count', 10), { type: 'object', name: 'range', default: { x: 2, y: 2, z: 0 } }, f('seed', 0)] },
]
