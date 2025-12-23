# Hydra Vertex/3D Extension Reference

A comprehensive reference for the vertex shader extension that adds 3D geometry and vertex manipulation capabilities to Hydra.

## Installation

```javascript
import Hydra from 'hydra-synth'
import { install } from 'hydra-synth/extensions/vertex'

const hydra = new Hydra({ ... })
install(hydra)
```

After installation, all geometry functions, lighting functions, `VertexSource`, and the `v` varying proxy are available globally.

---

## Custom Geometry (VertexSource)

Create geometry programmatically from vertex arrays using `VertexSource`.

### Basic Usage

```javascript
// 2D vertices: flat array [x, y, x, y, ...]
const verts2D = [
  0, 0.5,       // vertex 0: top
  -0.5, -0.5,   // vertex 1: bottom-left
  0.5, -0.5    // vertex 2: bottom-right
]
const myTri = new VertexSource(verts2D)
osc(10).out(o0, myTri)
```

### 3D Geometry with Normals and UVs

```javascript
// 3D vertices: flat array [x, y, z, x, y, z, ...]
const verts3D = [
  0, 0.5, 0,      // top
  -0.5, -0.5, 0,  // bottom-left
  0.5, -0.5, 0   // bottom-right
]

const myGeo = new VertexSource(verts3D)
myGeo.is3D = true

// Normals: [nx, ny, nz, ...] - same count as vertices
myGeo.normals = [0,0,1, 0,0,1, 0,0,1]

// UVs: [u, v, ...] - 2 floats per vertex
myGeo.uvs = [0.5,1, 0,0, 1,0]

// Optional: vertex colors [r, g, b, a, ...]
myGeo.colors = [1,0,0,1, 0,1,0,1, 0,0,1,1]

// Optional: face IDs for per-face materials
myGeo.faceIds = [0, 0, 0]

solid(1,1,1).diffuse(0,1,0).out(o0, myGeo)
```

### VertexSource Properties

| Property | Type | Description |
|----------|------|-------------|
| `vertices` | Float32Array/Array | Flat vertex positions |
| `is3D` | boolean | Set true for 3D geometry (enables depth) |
| `normals` | Float32Array/Array | Per-vertex normals [nx,ny,nz,...] |
| `uvs` | Float32Array/Array | Texture coordinates [u,v,...] |
| `colors` | Float32Array/Array | Vertex colors [r,g,b,a,...] |
| `faceIds` | Float32Array/Array | Per-vertex face/material ID |
| `tangents` | Float32Array/Array | Tangent vectors [tx,ty,tz,w,...] |

### Procedural Generation Example

```javascript
// Generate a star shape
function star(points = 5, outerR = 0.5, innerR = 0.25) {
  const verts = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    if (i > 0) {
      // Triangle from center to edge
      verts.push(0, 0)  // center
      const prevAngle = ((i - 1) * Math.PI) / points - Math.PI / 2
      const prevR = (i - 1) % 2 === 0 ? outerR : innerR
      verts.push(Math.cos(prevAngle) * prevR, Math.sin(prevAngle) * prevR)
      verts.push(Math.cos(angle) * r, Math.sin(angle) * r)
    }
  }
  // Close the shape
  const lastAngle = ((points * 2 - 1) * Math.PI) / points - Math.PI / 2
  const lastR = innerR
  verts.push(0, 0)
  verts.push(Math.cos(lastAngle) * lastR, Math.sin(lastAngle) * lastR)
  verts.push(Math.cos(-Math.PI / 2) * outerR, Math.sin(-Math.PI / 2) * outerR)

  return new VertexSource(verts)
}

osc(10).out(o0, star(5, 0.5, 0.2).rotate(() => time))
```

### Building from Arrays

```javascript
// Helper to create geometry from separate x, y, z arrays
function fromArrays(xArr, yArr, zArr = null) {
  const verts = []
  for (let i = 0; i < xArr.length; i++) {
    verts.push(xArr[i], yArr[i])
    if (zArr) verts.push(zArr[i])
  }
  const vs = new VertexSource(verts)
  if (zArr) vs.is3D = true
  return vs
}

// Example: triangle from coordinate arrays
const xs = [0, -0.5, 0.5]
const ys = [0.5, -0.5, -0.5]
osc(10).out(o0, fromArrays(xs, ys))
```

---

## 2D Geometry Primitives

### tri(size, centerX, centerY)

Creates an equilateral triangle.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| size | number | 1.0 | Triangle height |
| centerX | number | 0 | X position of center |
| centerY | number | 0 | Y position of center |

```javascript
// Basic triangle
osc(10).out(o0, tri())

// Small triangle offset to the right
osc(10).out(o0, tri(0.3, 0.5, 0))

// Animated size
osc(10).out(o0, tri(() => 0.5 + Math.sin(time) * 0.3))
```

---

### quad(width, height, centerX, centerY)

Creates a rectangle (two triangles).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| width | number | 1.0 | Rectangle width |
| height | number | 1.0 | Rectangle height |
| centerX | number | 0 | X position of center |
| centerY | number | 0 | Y position of center |

```javascript
// Square
osc(10).out(o0, quad())

// Wide rectangle
osc(10).out(o0, quad(1.5, 0.3))

// Multiple quads using grid
osc(10).out(o0, quad(0.2, 0.2).grid(4, 4, 1, 0.3))
```

---

### poly(sides, radius, centerX, centerY)

Creates a regular polygon.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sides | number | required | Number of sides (3+) |
| radius | number | 1.0 | Distance from center to vertices |
| centerX | number | 0 | X position of center |
| centerY | number | 0 | Y position of center |

```javascript
// Pentagon
osc(10).out(o0, poly(5))

// Hexagon
osc(10).out(o0, poly(6, 0.5))

// Octagon with rotation
osc(10).out(o0, poly(8, 0.4).rotate(() => time * 0.2))
```

---

### circle(radius, centerX, centerY, segments)

Creates a circle (polygon approximation).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| radius | number | 1.0 | Circle radius |
| centerX | number | 0 | X position of center |
| centerY | number | 0 | Y position of center |
| segments | number | 32 | Number of segments (smoothness) |

```javascript
// Basic circle
osc(10).out(o0, circle())

// Small, smooth circle
osc(10).out(o0, circle(0.3, 0, 0, 64))

// Low-poly circle (visible edges)
osc(10).out(o0, circle(0.5, 0, 0, 8))
```

---

### line(x1, y1, x2, y2, thickness)

Creates a line as a thin quad.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| x1 | number | required | Start X coordinate |
| y1 | number | required | Start Y coordinate |
| x2 | number | required | End X coordinate |
| y2 | number | required | End Y coordinate |
| thickness | number | 0.02 | Line thickness |

```javascript
// Diagonal line
osc(10).out(o0, line(-0.5, -0.5, 0.5, 0.5))

// Thick horizontal line
osc(10).out(o0, line(-0.8, 0, 0.8, 0, 0.1))

// Multiple lines
osc(10).out(o0, line(-0.5, 0, 0.5, 0, 0.02).repeat(1, 5, 0.2))
```

---

### ring(outerRadius, innerRadius, centerX, centerY, segments)

Creates an annulus (ring with hole).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| outerRadius | number | 1.0 | Outer edge radius |
| innerRadius | number | 0.5 | Inner hole radius |
| centerX | number | 0 | X position of center |
| centerY | number | 0 | Y position of center |
| segments | number | 32 | Number of segments |

```javascript
// Basic ring
osc(10).out(o0, ring())

// Thin ring
osc(10).out(o0, ring(0.5, 0.45))

// Thick ring with rotation
osc(10).out(o0, ring(0.6, 0.2).rotate(() => time))
```

---

## 3D Geometry Primitives

All 3D primitives include per-vertex normals and UV coordinates for lighting and texturing.

### sphere(radius, segments, rings)

Creates a UV sphere with normals.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| radius | number | 0.5 | Sphere radius |
| segments | number | 32 | Longitude divisions |
| rings | number | 16 | Latitude divisions |

```javascript
// Basic sphere
osc(10).out(o0, sphere())

// Large, detailed sphere
osc(10).out(o0, sphere(0.8, 64, 32))

// Low-poly sphere
osc(10).out(o0, sphere(0.5, 8, 4))

// Rotating sphere with lighting
solid(0.8, 0.2, 0.2)
  .diffuse(1, 1, 1)
  .out(o0, sphere().rotateY(() => time * 0.5))
```

---

### cube(size)

Creates a cube with 6 faces. Each face has a unique `faceId` (0-5) for per-face materials.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| size | number | 0.5 | Half-extent in each axis |

**Face IDs:**
| ID | Face |
|----|------|
| 0 | Front (+Z) |
| 1 | Back (-Z) |
| 2 | Top (+Y) |
| 3 | Bottom (-Y) |
| 4 | Right (+X) |
| 5 | Left (-X) |

```javascript
// Basic cube
osc(10).out(o0, cube())

// Rotating cube
osc(10).out(o0, cube(0.3).rotateX(() => time * 0.3).rotateY(() => time * 0.5))

// Per-face coloring using faceId
solid(1, 0, 0).glsl(`
  float id = v.faceId;
  vec3 colors[6] = vec3[](
    vec3(1,0,0), vec3(0,1,0), vec3(0,0,1),
    vec3(1,1,0), vec3(1,0,1), vec3(0,1,1)
  );
  return vec4(colors[int(id)], 1.0);
`).out(o0, cube().rotateX(() => time * 0.3).rotateY(() => time * 0.5))
```

---

### plane(width, height, subdivisionsX, subdivisionsY)

Creates a subdivided plane facing +Y.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| width | number | 1 | Plane width |
| height | number | 1 | Plane height (depth in Z) |
| subdivisionsX | number | 1 | Subdivisions in X |
| subdivisionsY | number | 1 | Subdivisions in Y |

```javascript
// Basic plane
osc(10).out(o0, plane())

// Subdivided plane (for displacement)
osc(10).out(o0, plane(2, 2, 10, 10).rotateX(-0.5))

// Floor plane
solid(0.3, 0.3, 0.3)
  .diffuse(0, 1, 0)
  .out(o0, plane(2, 2).rotateX(-1.57))
```

---

### torus(radius, tubeRadius, radialSegments, tubularSegments)

Creates a donut shape.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| radius | number | 0.4 | Distance from center to tube center |
| tubeRadius | number | 0.15 | Thickness of the tube |
| radialSegments | number | 32 | Segments around the ring |
| tubularSegments | number | 16 | Segments around the tube |

```javascript
// Basic torus
osc(10).out(o0, torus())

// Thin ring torus
osc(10).out(o0, torus(0.5, 0.05))

// Rotating torus with lighting
solid(0.2, 0.5, 0.8)
  .diffuse(1, 1, 0)
  .specular(1, 1, 0, 32)
  .out(o0, torus().rotateX(() => time * 0.3).rotateY(() => time * 0.5))
```

---

### cylinder(radius, height, radialSegments, heightSegments, caps)

Creates a cylinder with optional end caps.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| radius | number | 0.3 | Cylinder radius |
| height | number | 1 | Cylinder height |
| radialSegments | number | 32 | Segments around circumference |
| heightSegments | number | 1 | Segments along height |
| caps | boolean | true | Include top/bottom caps |

```javascript
// Basic cylinder
osc(10).out(o0, cylinder())

// Tall, thin cylinder without caps
osc(10).out(o0, cylinder(0.1, 1.5, 16, 1, false))

// Rotating cylinder
osc(10).out(o0, cylinder(0.2, 0.6).rotateX(() => time * 0.5))
```

---

### cone(radius, height, radialSegments, caps)

Creates a cone with optional base cap.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| radius | number | 0.3 | Base radius |
| height | number | 1 | Cone height |
| radialSegments | number | 32 | Segments around base |
| caps | boolean | true | Include base cap |

```javascript
// Basic cone
osc(10).out(o0, cone())

// Pointed cone without cap
osc(10).out(o0, cone(0.4, 0.8, 16, false))

// Rotating cone
osc(10).out(o0, cone(0.25, 0.5).rotateZ(() => time * 0.3))
```

---

## Model Loading

### loadObj(url, options)

Loads an OBJ model from a URL.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| url | string | required | URL to OBJ file |
| options.swapYZ | boolean | false | Swap Y/Z axes (for Blender exports) |
| options.up | string | undefined | Orientation: 'y', '-y', 'z', '-z', 'x', '-x' |

Returns: `Promise<VertexSource>`

```javascript
// Load and display model
loadObj('model.obj').then(model => {
  osc(10).out(o0, model)
})

// Load with Y/Z swap for Blender exports
loadObj('blender-model.obj', { swapYZ: true }).then(model => {
  solid(0.5, 0.5, 0.5).diffuse(0, 1, 0).out(o0, model)
})
```

---

### loadGlb(url, options)

Loads a GLB/glTF model from a URL with optional texture extraction.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| url | string | required | URL to GLB file |
| options.extractTextures | boolean | true | Extract embedded textures |
| options.meshIndex | number | 0 | Which mesh to load |
| options.primitiveIndex | number | undefined | Which primitive (all if undefined) |
| options.up | string | undefined | Orientation correction |

Returns: `Promise<VertexSource>`

The returned VertexSource includes:
- `model.texture` - First embedded texture (HTMLImageElement)
- `model.textures` - Array of all embedded textures

```javascript
// Load GLB model
loadGlb('character.glb').then(model => {
  osc(10).out(o0, model)
})

// Load and use embedded texture
loadGlb('textured-model.glb').then(model => {
  if (model.texture) {
    s0.init({ src: model.texture })
    src(s0).out(o0, model)
  }
})

// Load animated model
loadGlb('animated.glb').then(model => {
  const animated = model.animate('Walk', () => time)
  solid(0.8, 0.8, 0.8).diffuse(0, 1, 0).out(o0, animated)
})
```

---

### parseObj(objText, options)

Parses OBJ text directly (for inline models or pre-fetched data).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| objText | string | required | OBJ file contents |
| options.swapYZ | boolean | false | Swap Y/Z axes |

Returns: `VertexSource`

---

### parseGlb(arrayBuffer, options)

Parses GLB binary data directly.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| arrayBuffer | ArrayBuffer | required | GLB binary data |
| options.meshIndex | number | 0 | Which mesh to load |
| options.primitiveIndex | number | undefined | Which primitive |

Returns: `VertexSource`

---

## Chainable Transforms

These transforms are applied in the vertex shader and can use dynamic values (functions).

### rotate(angle)

2D rotation around Z axis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| angle | number/function | 0 | Rotation in radians |

```javascript
// Static rotation
osc(10).out(o0, tri().rotate(0.5))

// Animated rotation
osc(10).out(o0, tri().rotate(() => time))
```

---

### rotateX(angle)

Rotation around X axis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| angle | number/function | 0 | Rotation in radians |

```javascript
osc(10).out(o0, sphere().rotateX(() => time * 0.5))
```

---

### rotateY(angle)

Rotation around Y axis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| angle | number/function | 0 | Rotation in radians |

```javascript
osc(10).out(o0, cube().rotateY(() => time * 0.3))
```

---

### rotateZ(angle)

Rotation around Z axis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| angle | number/function | 0 | Rotation in radians |

```javascript
osc(10).out(o0, quad().rotateZ(() => time))
```

---

### scale(x, y, z)

Non-uniform scaling.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| x | number/function | 1 | Scale in X |
| y | number/function | x | Scale in Y (defaults to x) |
| z | number/function | x | Scale in Z (defaults to x) |

```javascript
// Uniform scale
osc(10).out(o0, sphere().scale(0.5))

// Non-uniform scale (stretch)
osc(10).out(o0, sphere().scale(1, 0.5, 1))

// Animated breathing effect
osc(10).out(o0, sphere().scale(() => 0.5 + Math.sin(time * 2) * 0.1))
```

---

### offset(x, y, z) / translate(x, y, z)

Translation (move position). `translate` is an alias for `offset`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| x | number/function | 0 | Translation in X |
| y | number/function | 0 | Translation in Y |
| z | number/function | 0 | Translation in Z |

```javascript
// Static offset
osc(10).out(o0, sphere().offset(0.5, 0, 0))

// Orbiting motion
osc(10).out(o0, sphere(0.2).offset(
  () => Math.cos(time) * 0.5,
  () => Math.sin(time) * 0.5,
  0
))
```

---

### perspective(fov, near, far)

Applies perspective projection.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| fov | number/function | 45 | Field of view in degrees |
| near | number/function | 0.1 | Near clipping plane |
| far | number/function | 100 | Far clipping plane |

```javascript
// Add perspective to 3D scene
osc(10).out(o0, cube().rotateY(() => time).perspective(60))

// Dynamic FOV
osc(10).out(o0, sphere().perspective(() => 45 + Math.sin(time) * 20))
```

---

## Immediate Transforms

These transforms modify the vertex array immediately (CPU-side) before rendering.

### mirror(axis)

Mirrors geometry along an axis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| axis | string | 'x' | 'x', 'y', or 'xy' |

- `'x'`: Flip across Y axis (mirror horizontally)
- `'y'`: Flip across X axis (mirror vertically)
- `'xy'`: Create 4 copies (original + x-mirror + y-mirror + xy-mirror)

```javascript
// Horizontal mirror (2 copies)
osc(10).out(o0, tri(0.3, 0.3, 0).mirror('x'))

// Vertical mirror
osc(10).out(o0, tri(0.3, 0, 0.3).mirror('y'))

// Four-way symmetry
osc(10).out(o0, tri(0.2, 0.2, 0.2).mirror('xy'))
```

---

### repeat(nx, ny, spacing)

Repeats geometry in a 2D grid.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| nx | number | 2 | Copies in X direction |
| ny | number | 1 | Copies in Y direction |
| spacing | number | 0.5 | Distance between copies |

```javascript
// Horizontal row
osc(10).out(o0, tri(0.15).repeat(5, 1, 0.3))

// 2D grid
osc(10).out(o0, circle(0.1).repeat(4, 4, 0.25))
```

---

### grid(nx, ny, nz, spacing)

Creates a 3D grid of instances. Assigns `faceId` to each instance (0 to nx*ny*nz-1).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| nx | number | 2 | Copies in X |
| ny | number | 2 | Copies in Y |
| nz | number | 1 | Copies in Z |
| spacing | number/object | 1.0 | Distance between copies |

Spacing can be a number (uniform) or object `{ x, y, z }` for non-uniform spacing.

```javascript
// 2D grid of spheres
osc(10).out(o0, sphere(0.1, 8, 4).grid(3, 3, 1, 0.4))

// 3D grid of cubes
osc(10).out(o0, cube(0.05).grid(3, 3, 3, 0.2).rotateY(() => time * 0.2))

// Non-uniform spacing
osc(10).out(o0, sphere(0.1).grid(4, 2, 1, { x: 0.3, y: 0.5, z: 0 }))

// Color by instance using faceId
solid(1, 0, 0).glsl(`
  float id = v.faceId;
  return vec4(
    sin(id * 0.5),
    cos(id * 0.7),
    sin(id * 1.1),
    1.0
  );
`).out(o0, sphere(0.08).grid(5, 5, 1, 0.25))
```

---

### scatter(count, range, seed)

Randomly scatters instances. Assigns `faceId` to each instance (0 to count-1).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| count | number | 10 | Number of instances |
| range | object | {x:2, y:2, z:0} | Spread range in each axis |
| seed | number | 0 | Random seed for reproducibility |

```javascript
// Random scatter of spheres
osc(10).out(o0, sphere(0.05).scatter(20))

// 3D scatter
osc(10).out(o0, cube(0.03).scatter(50, { x: 1.5, y: 1.5, z: 1.5 }))

// Reproducible scatter (same seed = same positions)
osc(10).out(o0, tri(0.05).scatter(30, { x: 2, y: 2, z: 0 }, 42))
```

---

## Animation

### animate(clipName, timeFunc)

Animates a skinned model (from GLB with skeletal animation).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| clipName | string | null | Animation clip name (first if null) |
| timeFunc | function | () => 0 | Function returning current time in seconds |

Returns: New `VertexSource` with animation state.

```javascript
loadGlb('character.glb').then(model => {
  // List available animations
  console.log(model.getAnimations())
  // [{name: 'Walk', duration: 1.5}, {name: 'Run', duration: 0.8}]

  // Animate with 'Walk' clip
  const animated = model.animate('Walk', () => time)
  solid(0.8, 0.8, 0.8).diffuse(0, 1, 0).out(o0, animated)
})
```

---

### getAnimations()

Lists available animation clips in a loaded GLB model.

Returns: `Array<{ name: string, duration: number }>`

```javascript
loadGlb('character.glb').then(model => {
  const anims = model.getAnimations()
  anims.forEach(a => console.log(`${a.name}: ${a.duration}s`))
})
```

---

## Lighting Functions

Lighting functions use vertex normals and view direction. They work best with 3D geometry that has proper normals.

### diffuse(lx, ly, lz, ambient)

Lambertian diffuse lighting.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| lx | number | 0 | Light direction X |
| ly | number | 1 | Light direction Y |
| lz | number | 0 | Light direction Z |
| ambient | number | 0.2 | Minimum light level (0-1) |

```javascript
// Light from above
solid(0.8, 0.2, 0.2).diffuse(0, 1, 0).out(o0, sphere())

// Light from front-right
solid(0.2, 0.5, 0.8).diffuse(1, 0.5, 1, 0.1).out(o0, sphere())

// Animated light direction
solid(0.5, 0.5, 0.5).diffuse(
  () => Math.cos(time),
  1,
  () => Math.sin(time)
).out(o0, sphere())
```

---

### specular(lx, ly, lz, shininess, intensity)

Blinn-Phong specular highlights.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| lx | number | 0 | Light direction X |
| ly | number | 1 | Light direction Y |
| lz | number | 0 | Light direction Z |
| shininess | number | 32 | Highlight sharpness (higher = sharper) |
| intensity | number | 1 | Highlight brightness |

```javascript
// Shiny sphere
solid(0.2, 0.2, 0.8)
  .diffuse(1, 1, 1)
  .specular(1, 1, 1, 64, 0.8)
  .out(o0, sphere())

// Metallic look (high shininess)
solid(0.8, 0.8, 0.8)
  .specular(0, 1, 0, 128, 1)
  .out(o0, sphere())
```

---

### fresnel(power, intensity)

Rim lighting effect (brighter at edges).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| power | number | 2 | Falloff exponent |
| intensity | number | 1 | Effect strength |

```javascript
// Rim light effect
solid(0.1, 0.1, 0.3)
  .fresnel(2, 1)
  .out(o0, sphere())

// Combined with diffuse
solid(0.3, 0.1, 0.1)
  .diffuse(0, 1, 0)
  .fresnel(3, 0.5)
  .out(o0, sphere())
```

---

### halfLambert(lx, ly, lz)

Soft diffuse lighting (Valve's Half-Lambert technique). No harsh shadows.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| lx | number | 0 | Light direction X |
| ly | number | 1 | Light direction Y |
| lz | number | 0 | Light direction Z |

```javascript
// Soft cartoon-style lighting
solid(0.8, 0.5, 0.2).halfLambert(1, 1, 0).out(o0, sphere())
```

---

## Varying Proxy (v)

The `v` object provides access to vertex shader outputs in fragment shaders. Use with `.glsl()` for custom effects.

### Available Varyings

| Property | Type | Description |
|----------|------|-------------|
| `v.position` | vec3 | World position after transforms |
| `v.normal` | vec3 | Model-space normal (raw) |
| `v.worldNormal` | vec3 | World-space normal (after rotation) |
| `v.tangent` | vec3 | Tangent vector (for normal mapping) |
| `v.bitangent` | vec3 | Bitangent vector |
| `v.viewDir` | vec3 | Direction from vertex to camera |
| `v.color` | vec4 | Vertex color (RGBA) |
| `v.depth` | float | Normalized depth (0=camera, 1=far) |
| `v.uv` | vec2 | Texture coordinates |
| `v.faceId` | float | Face/instance ID |

### Component Access

All vec3/vec4 properties support swizzling:
- `v.position.x`, `v.position.y`, `v.position.z`
- `v.position.xy`, `v.position.xyz`
- `v.color.r`, `v.color.rgb`, `v.color.rgba`

### Examples

```javascript
// Color by world position
solid(1, 1, 1).glsl(`
  return vec4(v.position.xyz * 0.5 + 0.5, 1.0);
`).out(o0, sphere())

// Custom normal-based coloring
solid(1, 1, 1).glsl(`
  vec3 n = normalize(v.worldNormal.xyz);
  return vec4(n * 0.5 + 0.5, 1.0);
`).out(o0, sphere())

// Depth-based fog
solid(0.8, 0.2, 0.2).glsl(`
  float fog = v.depth;
  return mix(_c0, vec4(0.5, 0.5, 0.5, 1.0), fog);
`).out(o0, sphere().offset(0, 0, -1))

// Fresnel effect using viewDir
solid(0.1, 0.1, 0.3).glsl(`
  vec3 n = normalize(v.worldNormal.xyz);
  vec3 view = normalize(v.viewDir.xyz);
  float fresnel = pow(1.0 - abs(dot(n, view)), 3.0);
  return mix(_c0, vec4(1.0), fresnel);
`).out(o0, sphere())

// Per-face coloring on cube
solid(1, 0, 0).glsl(`
  int id = int(v.faceId);
  vec3 colors[6] = vec3[](
    vec3(1,0,0), vec3(0,1,0), vec3(0,0,1),
    vec3(1,1,0), vec3(1,0,1), vec3(0,1,1)
  );
  return vec4(colors[id], 1.0);
`).out(o0, cube().rotateX(() => time * 0.3).rotateY(() => time * 0.5))
```

---

## Output Configuration

The `.out()` method accepts an optional configuration object for advanced rendering control.

### Syntax

```javascript
source.out(output?, geometry?, config?)

// Config object
{
  level: number,      // Layer level (0=clear, 1+=composite)
  blend: string,      // Blend mode
  primitive: string,  // Draw primitive type
  enabled: boolean    // Enable/disable
}
```

### Blend Modes

| Mode | Description |
|------|-------------|
| `'normal'` | Standard alpha blending (default) |
| `'add'` | Additive blending (glow effects) |
| `'multiply'` | Multiplicative blending |
| `'screen'` | Screen blending |

### Layered Rendering

Use `level` to composite multiple geometries:

```javascript
// Level 0 clears, subsequent levels composite
osc(10).out(o0, sphere(0.3), { level: 0 })
osc(20).out(o0, cube(0.15).offset(0.3, 0, 0), { level: 1 })
osc(30).out(o0, tri(0.2).offset(-0.3, 0, 0), { level: 2, blend: 'add' })
```

### Examples

```javascript
// Additive glow
solid(1, 0.5, 0).out(o0, sphere(0.3), { level: 0 })
solid(1, 0.8, 0.5).out(o0, sphere(0.35), { level: 1, blend: 'add' })

// Multiple layers
osc(10).out(o0, quad(), { level: 0 })  // Background
solid(1, 0, 0).out(o0, sphere(0.2).offset(-0.3, 0, 0), { level: 1 })
solid(0, 1, 0).out(o0, sphere(0.2).offset(0.3, 0, 0), { level: 2 })
```

---

## Utility Functions (GLSL)

These functions are available in custom `.glsl()` shaders:

| Function | Description |
|----------|-------------|
| `_luminance(vec3 rgb)` | Convert RGB to luminance (float) |
| `_noise(vec3 v)` | 3D Simplex noise (-1 to 1) |
| `_rgbToHsv(vec3 rgb)` | RGB to HSV conversion |
| `_hsvToRgb(vec3 hsv)` | HSV to RGB conversion |

```javascript
// Use noise for variation
solid(1, 1, 1).glsl(`
  float n = _noise(v.position.xyz * 5.0 + time);
  return vec4(vec3(n * 0.5 + 0.5), 1.0);
`).out(o0, sphere())
```

---

## Easing Functions

Available as `easing.functionName(t)` where t is 0-1.

| Function | Description |
|----------|-------------|
| `linear` | Linear (no easing) |
| `easeInQuad`, `easeOutQuad`, `easeInOutQuad` | Quadratic |
| `easeInCubic`, `easeOutCubic`, `easeInOutCubic` | Cubic |
| `easeInQuart`, `easeOutQuart`, `easeInOutQuart` | Quartic |
| `easeInQuint`, `easeOutQuint`, `easeInOutQuint` | Quintic |
| `sin` | Sinusoidal |

```javascript
// Smooth animation
const t = (time % 2) / 2  // 0 to 1 over 2 seconds
const smooth = easing.easeInOutCubic(t)
osc(10).out(o0, sphere().offset(smooth - 0.5, 0, 0))
```

---

## Complete Examples

### Rotating Lit Sphere

```javascript
solid(0.8, 0.2, 0.2)
  .diffuse(1, 1, 1, 0.2)
  .specular(1, 1, 1, 64, 0.5)
  .fresnel(2, 0.3)
  .out(o0, sphere().rotateY(() => time * 0.5))
```

### Grid of Colored Cubes

```javascript
solid(1, 1, 1).glsl(`
  float id = v.faceId;
  float hue = id * 0.1;
  vec3 rgb = _hsvToRgb(vec3(hue, 0.8, 0.9));
  return vec4(rgb, 1.0);
`).diffuse(1, 1, 0, 0.3)
  .out(o0, cube(0.08).grid(4, 4, 1, 0.3).rotateY(() => time * 0.2))
```

### Layered Scene

```javascript
// Background
gradient(0).out(o0, quad(), { level: 0 })

// Main sphere
solid(0.8, 0.3, 0.2)
  .diffuse(1, 1, 1)
  .out(o0, sphere(0.3).rotateY(() => time * 0.3), { level: 1 })

// Orbiting smaller spheres
solid(0.2, 0.5, 0.8)
  .out(o0, sphere(0.1).offset(
    () => Math.cos(time) * 0.5,
    0,
    () => Math.sin(time) * 0.5
  ), { level: 2, blend: 'add' })
```

### Animated Character

```javascript
loadGlb('character.glb').then(model => {
  const anims = model.getAnimations()
  console.log('Available:', anims.map(a => a.name))

  const animated = model.animate('Walk', () => time)

  solid(0.9, 0.9, 0.9)
    .diffuse(1, 1, 0, 0.3)
    .out(o0, animated.scale(0.5).rotateY(() => time * 0.2))
})
```

---

## Tips and Best Practices

1. **Performance**: Use lower segment counts for many instances
   ```javascript
   sphere(0.1, 8, 4).grid(10, 10, 1, 0.15)  // Low-poly for many copies
   ```

2. **Lighting**: Always use 3D primitives with normals for lighting functions

3. **Transform Order**: Transforms are applied in order - rotate before translate for orbits
   ```javascript
   sphere().rotateY(() => time).offset(0.5, 0, 0)  // Orbits origin
   sphere().offset(0.5, 0, 0).rotateY(() => time)  // Rotates in place
   ```

4. **Dynamic Values**: Use arrow functions for animated parameters
   ```javascript
   sphere().scale(() => 0.5 + Math.sin(time) * 0.2)
   ```

5. **faceId**: Use for per-instance variation in grids/scatters
   ```javascript
   sphere().grid(5, 5, 1, 0.3)  // Each instance has unique faceId
   ```

6. **Depth**: Enable depth testing is automatic for 3D - objects further away render behind closer ones

---

## Version

Extension Version: 0.1.0
