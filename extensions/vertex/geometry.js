// Geometry helper functions - return VertexSource for chainable transforms
import VertexSource from './vertex-source.js'

// Parse OBJ file text and return VertexSource
// Supports vertices (v), normals (vn), UVs (vt), faces (f), and materials (usemtl)
// Triangulates quads automatically, normalizes model to fit in a unit cube
// Options:
//   swapYZ: swap Y and Z axes (for Z-up exports like Blender). Default: false (Y-up, WebGL standard)
export function parseObj(objText, options = {}) {
  const { swapYZ = false } = options
  const vertices = []
  const colors = []  // Vertex colors (OBJ extension: v x y z r g b)
  const normals = []
  const uvs = []
  const faces = []

  // Material tracking for faceIds
  const materialNames = []
  const materialToId = new Map()
  let currentMaterial = null

  const lines = objText.split('\n')
  for (const line of lines) {
    const parts = line.trim().split(/\s+/)
    if (parts[0] === 'v') {
      const x = parseFloat(parts[1])
      const y = parseFloat(parts[2])
      const z = parseFloat(parts[3])
      // Swap Y and Z if needed (converts Z-up to Y-up)
      vertices.push(swapYZ ? [x, z, y] : [x, y, z])
      // OBJ extension: vertex colors as r g b after coordinates
      if (parts.length >= 7) {
        colors.push([parseFloat(parts[4]), parseFloat(parts[5]), parseFloat(parts[6])])
      }
    } else if (parts[0] === 'vn') {
      const x = parseFloat(parts[1])
      const y = parseFloat(parts[2])
      const z = parseFloat(parts[3])
      normals.push(swapYZ ? [x, z, y] : [x, y, z])
    } else if (parts[0] === 'vt') {
      uvs.push([parseFloat(parts[1]), parseFloat(parts[2])])
    } else if (parts[0] === 'usemtl') {
      // Track material for faceId assignment
      const matName = parts.slice(1).join(' ')
      if (!materialToId.has(matName)) {
        materialToId.set(matName, materialNames.length)
        materialNames.push(matName)
      }
      currentMaterial = materialToId.get(matName)
    } else if (parts[0] === 'f') {
      // Parse face indices - format can be v, v/vt, v/vt/vn, or v//vn
      const faceVerts = []
      const faceUVs = []
      const faceNormals = []
      for (let i = 1; i < parts.length; i++) {
        const indices = parts[i].split('/')
        faceVerts.push(parseInt(indices[0]) - 1)
        if (indices[1]) faceUVs.push(parseInt(indices[1]) - 1)
        if (indices[2]) faceNormals.push(parseInt(indices[2]) - 1)
      }
      faces.push({ verts: faceVerts, uvs: faceUVs, normals: faceNormals, material: currentMaterial })
    }
  }

  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  for (const v of vertices) {
    minX = Math.min(minX, v[0]); maxX = Math.max(maxX, v[0])
    minY = Math.min(minY, v[1]); maxY = Math.max(maxY, v[1])
    minZ = Math.min(minZ, v[2]); maxZ = Math.max(maxZ, v[2])
  }

  // Center and normalize to fit in unit cube
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const centerZ = (minZ + maxZ) / 2
  const rangeX = maxX - minX
  const rangeY = maxY - minY
  const rangeZ = maxZ - minZ
  const maxRange = Math.max(rangeX, rangeY, rangeZ)
  const scale = 1.0 / maxRange  // Fit largest dimension to 1.0

  // Build triangle list from faces (triangulate quads and n-gons)
  const verts = []
  const outNormals = []
  const outUVs = []
  const outFaceIds = []
  const outColors = []
  const hasNormals = normals.length > 0
  const hasExplicitUVs = uvs.length > 0
  const hasMaterials = materialNames.length > 0
  const hasColors = colors.length === vertices.length  // Must have color per vertex

  // Default per-face UVs for quads (when OBJ doesn't have vt coordinates)
  // Maps quad corners to (0,0), (1,0), (1,1), (0,1) so texture fills the face
  const defaultQuadUVs = [[0, 0], [1, 0], [1, 1], [0, 1]]
  // For triangles: (0,0), (1,0), (0.5,1)
  const defaultTriUVs = [[0, 0], [1, 0], [0.5, 1]]

  // Helper to add a vertex with its attributes
  const addVertex = (vertIdx, uv, normalIdx, materialId) => {
    const v = vertices[vertIdx]
    verts.push((v[0] - centerX) * scale)
    verts.push((v[1] - centerY) * scale)
    verts.push((v[2] - centerZ) * scale)
    if (hasNormals && normalIdx !== undefined) {
      const n = normals[normalIdx]
      outNormals.push(n[0], n[1], n[2])
    }
    // Always output UVs (explicit from file or generated per-face)
    outUVs.push(uv[0], uv[1])
    if (hasMaterials) {
      outFaceIds.push(materialId !== null ? materialId : 0)
    }
    if (hasColors) {
      const c = colors[vertIdx]
      outColors.push(c[0], c[1], c[2], 1.0)  // RGB + alpha=1
    }
  }

  for (const face of faces) {
    const fv = face.verts
    const fu = face.uvs
    const fn = face.normals
    const fm = face.material
    if (fv.length === 3) {
      // Triangle
      for (let i = 0; i < 3; i++) {
        const uv = hasExplicitUVs && fu[i] !== undefined ? uvs[fu[i]] : defaultTriUVs[i]
        addVertex(fv[i], uv, fn[i], fm)
      }
    } else if (fv.length >= 4) {
      // Fan triangulation for quads and n-gons
      for (let i = 1; i < fv.length - 1; i++) {
        // For quads, use default UVs if no explicit UVs
        const uv0 = hasExplicitUVs && fu[0] !== undefined ? uvs[fu[0]] : defaultQuadUVs[0]
        const uv1 = hasExplicitUVs && fu[i] !== undefined ? uvs[fu[i]] : defaultQuadUVs[i]
        const uv2 = hasExplicitUVs && fu[i + 1] !== undefined ? uvs[fu[i + 1]] : defaultQuadUVs[i + 1]
        addVertex(fv[0], uv0, fn[0], fm)
        addVertex(fv[i], uv1, fn[i], fm)
        addVertex(fv[i + 1], uv2, fn[i + 1], fm)
      }
    }
  }

  const vs = new VertexSource(verts)
  vs.is3D = true
  if (outNormals.length > 0) vs.normals = outNormals
  if (outUVs.length > 0) vs.uvs = outUVs
  if (outFaceIds.length > 0) {
    vs.faceIds = outFaceIds
    vs.materialNames = materialNames  // Expose material names for debugging/tooling
  }
  if (outColors.length > 0) vs.colors = outColors
  return vs
}

// Apply orientation correction to a VertexSource based on 'up' direction
// glTF spec is Y-up, so we rotate to match that from other conventions
function applyUpCorrection(vs, up) {
  const PI = Math.PI
  switch (up.toLowerCase()) {
    case 'y':
    case '+y':
      // Already Y-up, no correction needed
      return vs
    case '-y':
      // Upside down - rotate 180° around X
      return vs.rotateX(PI)
    case 'z':
    case '+z':
      // Z-up (Blender default) - rotate -90° around X
      return vs.rotateX(-PI / 2)
    case '-z':
      // Negative Z-up - rotate 90° around X
      return vs.rotateX(PI / 2)
    case 'x':
    case '+x':
      // X-up - rotate 90° around Z
      return vs.rotateZ(PI / 2)
    case '-x':
      // Negative X-up - rotate -90° around Z
      return vs.rotateZ(-PI / 2)
    default:
      console.warn(`Unknown 'up' value: ${up}, using default Y-up`)
      return vs
  }
}

// Load OBJ file from URL and return Promise<VertexSource>
// Options:
//   swapYZ: swap Y and Z axes (for Z-up exports like Blender). Default: false (Y-up, WebGL standard)
//   up: orientation correction - 'y' (default), '-y' (flip), 'z' (Blender), '-z', 'x', '-x'
//       Note: 'up' is applied after swapYZ if both are specified
export async function loadObj(url, options = {}) {
  const { up = 'y', ...parseOptions } = options
  const startTime = performance.now()
  console.log(`[hydra-vertex] Loading OBJ: ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load OBJ from ${url}: ${response.status} ${response.statusText}`)
  }
  const text = await response.text()
  let model = parseObj(text, parseOptions)

  // Apply orientation correction based on 'up' option
  model = applyUpCorrection(model, up)

  const elapsed = (performance.now() - startTime).toFixed(0)
  const vertCount = model.vertices ? model.vertices.length / 3 : 0
  console.log(`[hydra-vertex] ✓ OBJ loaded: ${vertCount} vertices in ${elapsed}ms`)

  return model
}

// ============================================================================
// GLB/glTF Loader
// ============================================================================

// Parse GLB binary file and return VertexSource
// GLB format: 12-byte header + JSON chunk + BIN chunk
// Options:
//   meshIndex: which mesh to load (default 0)
//   primitiveIndex: which primitive to load (default: all primitives combined)
export function parseGlb(arrayBuffer, options = {}) {
  const { meshIndex = 0, primitiveIndex } = options  // primitiveIndex undefined = load all
  const view = new DataView(arrayBuffer)

  // Parse GLB header (12 bytes)
  const magic = view.getUint32(0, true)
  if (magic !== 0x46546C67) { // "glTF" in little-endian
    throw new Error('Invalid GLB file: bad magic number')
  }
  const version = view.getUint32(4, true)
  if (version !== 2) {
    throw new Error(`Unsupported glTF version: ${version}`)
  }
  // const length = view.getUint32(8, true)

  // Parse chunks
  let jsonChunk = null
  let binChunk = null
  let offset = 12

  while (offset < arrayBuffer.byteLength) {
    const chunkLength = view.getUint32(offset, true)
    const chunkType = view.getUint32(offset + 4, true)
    const chunkData = new Uint8Array(arrayBuffer, offset + 8, chunkLength)

    if (chunkType === 0x4E4F534A) { // JSON
      const decoder = new TextDecoder('utf-8')
      jsonChunk = JSON.parse(decoder.decode(chunkData))
    } else if (chunkType === 0x004E4942) { // BIN
      binChunk = chunkData.buffer.slice(chunkData.byteOffset, chunkData.byteOffset + chunkData.byteLength)
    }

    offset += 8 + chunkLength
    // Align to 4-byte boundary
    if (offset % 4 !== 0) offset += 4 - (offset % 4)
  }

  if (!jsonChunk) throw new Error('GLB missing JSON chunk')

  return extractMeshFromGltf(jsonChunk, binChunk, meshIndex, primitiveIndex)
}

// Extract mesh data from glTF JSON and binary buffer
// Combines all primitives in the mesh into a single VertexSource
function extractMeshFromGltf(gltf, binBuffer, meshIndex, primitiveIndex) {
  const mesh = gltf.meshes?.[meshIndex]
  if (!mesh) throw new Error(`Mesh ${meshIndex} not found`)

  // Helper to read accessor data
  const readAccessor = (accessorIndex) => {
    const accessor = gltf.accessors[accessorIndex]
    const bufferView = gltf.bufferViews[accessor.bufferView]
    const componentType = accessor.componentType
    const count = accessor.count
    const type = accessor.type

    // Component counts for each type
    const typeComponents = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }
    const components = typeComponents[type] || 1

    // Get the right typed array constructor
    const TypedArray = {
      5120: Int8Array,    // BYTE
      5121: Uint8Array,   // UNSIGNED_BYTE
      5122: Int16Array,   // SHORT
      5123: Uint16Array,  // UNSIGNED_SHORT
      5125: Uint32Array,  // UNSIGNED_INT
      5126: Float32Array  // FLOAT
    }[componentType]

    if (!TypedArray) throw new Error(`Unsupported component type: ${componentType}`)

    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0)
    const byteStride = bufferView.byteStride || 0

    // If tightly packed, read directly
    if (byteStride === 0 || byteStride === components * TypedArray.BYTES_PER_ELEMENT) {
      return new TypedArray(binBuffer, byteOffset, count * components)
    }

    // Otherwise, handle stride
    const result = new TypedArray(count * components)
    const srcView = new DataView(binBuffer)
    for (let i = 0; i < count; i++) {
      const srcOffset = byteOffset + i * byteStride
      for (let j = 0; j < components; j++) {
        if (TypedArray === Float32Array) {
          result[i * components + j] = srcView.getFloat32(srcOffset + j * 4, true)
        } else if (TypedArray === Uint16Array) {
          result[i * components + j] = srcView.getUint16(srcOffset + j * 2, true)
        } else if (TypedArray === Uint32Array) {
          result[i * components + j] = srcView.getUint32(srcOffset + j * 4, true)
        }
      }
    }
    return result
  }

  // Determine which primitives to load
  const primitives = primitiveIndex !== undefined
    ? [mesh.primitives[primitiveIndex]]
    : mesh.primitives  // Load all primitives if no specific index given

  if (!primitives || primitives.length === 0) {
    throw new Error(`No primitives found in mesh ${meshIndex}`)
  }

  // Accumulate vertices from all primitives
  const verts = []
  const outNormals = []
  const outUVs = []
  const outTangents = []
  const outColors = []
  const outJoints = []
  const outWeights = []
  let hasAnyUVs = false
  let hasAnyNormals = false
  let hasAnyTangents = false
  let hasAnyColors = false
  let hasAnySkinning = false

  for (const primitive of primitives) {
    const positionAccessor = primitive.attributes.POSITION
    if (positionAccessor === undefined) continue  // Skip primitives without positions

    const positions = readAccessor(positionAccessor)
    const normals = primitive.attributes.NORMAL !== undefined
      ? readAccessor(primitive.attributes.NORMAL) : null
    const uvs = primitive.attributes.TEXCOORD_0 !== undefined
      ? readAccessor(primitive.attributes.TEXCOORD_0) : null
    // TANGENT is vec4: xyz = tangent direction, w = handedness for bitangent
    const tangents = primitive.attributes.TANGENT !== undefined
      ? readAccessor(primitive.attributes.TANGENT) : null
    // COLOR_0 can be vec3 (RGB) or vec4 (RGBA), we'll normalize to vec4
    const colors = primitive.attributes.COLOR_0 !== undefined
      ? readAccessor(primitive.attributes.COLOR_0) : null
    // Determine if colors are vec3 or vec4
    let colorStride = 0
    if (colors && primitive.attributes.COLOR_0 !== undefined) {
      const colorAccessor = gltf.accessors[primitive.attributes.COLOR_0]
      colorStride = colorAccessor.type === 'VEC4' ? 4 : 3
    }

    // Skinning data for animation
    const joints = primitive.attributes.JOINTS_0 !== undefined
      ? readAccessor(primitive.attributes.JOINTS_0) : null
    const weights = primitive.attributes.WEIGHTS_0 !== undefined
      ? readAccessor(primitive.attributes.WEIGHTS_0) : null

    if (normals) hasAnyNormals = true
    if (uvs) hasAnyUVs = true
    if (tangents) hasAnyTangents = true
    if (colors) hasAnyColors = true
    if (joints && weights) hasAnySkinning = true

    // Read indices if present
    const indices = primitive.indices !== undefined
      ? readAccessor(primitive.indices) : null

    const addVertex = (idx) => {
      verts.push(positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2])
      if (normals) {
        outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2])
      }
      if (uvs) {
        outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1])
      }
      if (tangents) {
        // vec4: xyz = tangent, w = handedness
        outTangents.push(tangents[idx * 4], tangents[idx * 4 + 1], tangents[idx * 4 + 2], tangents[idx * 4 + 3])
      }
      if (colors) {
        // Normalize to vec4 (RGBA), default alpha = 1.0
        if (colorStride === 4) {
          outColors.push(colors[idx * 4], colors[idx * 4 + 1], colors[idx * 4 + 2], colors[idx * 4 + 3])
        } else {
          outColors.push(colors[idx * 3], colors[idx * 3 + 1], colors[idx * 3 + 2], 1.0)
        }
      }
      if (joints && weights) {
        // 4 joint indices and 4 weights per vertex
        outJoints.push(joints[idx * 4], joints[idx * 4 + 1], joints[idx * 4 + 2], joints[idx * 4 + 3])
        outWeights.push(weights[idx * 4], weights[idx * 4 + 1], weights[idx * 4 + 2], weights[idx * 4 + 3])
      }
    }

    if (indices) {
      for (let i = 0; i < indices.length; i++) {
        addVertex(indices[i])
      }
    } else {
      const vertexCount = positions.length / 3
      for (let i = 0; i < vertexCount; i++) {
        addVertex(i)
      }
    }
  }

  if (verts.length === 0) {
    throw new Error('No vertex data found in mesh')
  }

  // Compute bounding box and normalize (but NOT for skinned meshes - skeleton defines scale)
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  for (let i = 0; i < verts.length; i += 3) {
    minX = Math.min(minX, verts[i]); maxX = Math.max(maxX, verts[i])
    minY = Math.min(minY, verts[i + 1]); maxY = Math.max(maxY, verts[i + 1])
    minZ = Math.min(minZ, verts[i + 2]); maxZ = Math.max(maxZ, verts[i + 2])
  }

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const centerZ = (minZ + maxZ) / 2
  const rangeX = maxX - minX
  const rangeY = maxY - minY
  const rangeZ = maxZ - minZ
  const maxRange = Math.max(rangeX, rangeY, rangeZ)
  const scale = maxRange > 0 ? 1.0 / maxRange : 1.0

  // Always normalize vertices
  for (let i = 0; i < verts.length; i += 3) {
    verts[i] = (verts[i] - centerX) * scale
    verts[i + 1] = (verts[i + 1] - centerY) * scale
    verts[i + 2] = (verts[i + 2] - centerZ) * scale
  }

  // Generate default UVs if model has none (spherical projection)
  if (!hasAnyUVs) {
    for (let i = 0; i < verts.length; i += 3) {
      const x = verts[i], y = verts[i + 1], z = verts[i + 2]
      // Spherical UV mapping
      const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI)
      const v = 0.5 + Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI
      outUVs.push(u, v)
    }
  }

  // Create VertexSource
  const vs = new VertexSource(verts)
  vs.is3D = true
  if (outNormals.length > 0) vs.normals = outNormals
  if (outUVs.length > 0) vs.uvs = outUVs
  if (outTangents.length > 0) vs.tangents = outTangents
  if (outColors.length > 0) vs.colors = outColors
  if (hasAnySkinning) {
    vs.joints = outJoints
    vs.weights = outWeights
  }

  // Store reference to gltf data for animation extraction
  vs._gltf = gltf
  vs._binBuffer = binBuffer

  // Store normalization params for skinning (need to denormalize before skinning, renormalize after)
  if (hasAnySkinning) {
    vs._normCenter = [centerX, centerY, centerZ]
    vs._normScale = scale
  }

  return vs
}

// Load GLB file from URL and return Promise<VertexSource>
// The returned VertexSource has a .texture property (Image) if the GLB has embedded textures
// Options:
//   meshIndex: which mesh to load (default 0)
//   primitiveIndex: which primitive to load (default: all primitives combined)
//   extractTextures: extract embedded textures (default: true)
//   up: orientation correction - 'y' (default), '-y' (flip), 'z' (Blender), '-z', 'x', '-x'
export async function loadGlb(url, options = {}) {
  const { extractTextures = true, up = 'y', ...parseOptions } = options
  const startTime = performance.now()
  console.log(`[hydra-vertex] Loading GLB: ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load GLB from ${url}: ${response.status} ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  if (arrayBuffer.byteLength < 12) {
    throw new Error(`Invalid GLB file from ${url}: file too small (${arrayBuffer.byteLength} bytes)`)
  }
  let model = parseGlb(arrayBuffer, parseOptions)

  // Attach embedded texture to model if available
  if (extractTextures) {
    const textures = await extractGlbTextures(arrayBuffer)
    model.texture = textures[0]?.image || null
    model.textures = textures.map(t => t.image)  // all textures if multiple
  }

  // Apply orientation correction based on 'up' option
  model = applyUpCorrection(model, up)

  const elapsed = (performance.now() - startTime).toFixed(0)
  const vertCount = model.vertices ? model.vertices.length / 3 : 0
  console.log(`[hydra-vertex] ✓ GLB loaded: ${vertCount} vertices in ${elapsed}ms`)

  return model
}

// Extract embedded images from GLB as Image objects
// Returns array of { image: HTMLImageElement, index: number }
export async function extractGlbTextures(arrayBuffer) {
  const view = new DataView(arrayBuffer)

  // Parse header
  const magic = view.getUint32(0, true)
  if (magic !== 0x46546C67) throw new Error('Invalid GLB')

  // Find JSON and BIN chunks
  let jsonChunk = null
  let binStart = 0
  let offset = 12

  while (offset < arrayBuffer.byteLength) {
    const chunkLength = view.getUint32(offset, true)
    const chunkType = view.getUint32(offset + 4, true)

    if (chunkType === 0x4E4F534A) { // JSON
      const chunkData = new Uint8Array(arrayBuffer, offset + 8, chunkLength)
      jsonChunk = JSON.parse(new TextDecoder().decode(chunkData))
    } else if (chunkType === 0x004E4942) { // BIN
      binStart = offset + 8
    }

    offset += 8 + chunkLength
    if (offset % 4 !== 0) offset += 4 - (offset % 4)
  }

  if (!jsonChunk || !jsonChunk.images) return []

  // Extract each image
  const textures = []
  for (let i = 0; i < jsonChunk.images.length; i++) {
    const imgDef = jsonChunk.images[i]
    if (imgDef.bufferView === undefined) continue

    const bv = jsonChunk.bufferViews[imgDef.bufferView]
    const imgBytes = new Uint8Array(arrayBuffer, binStart + (bv.byteOffset || 0), bv.byteLength)

    // Detect mime type from magic bytes if not specified
    let mimeType = imgDef.mimeType
    if (!mimeType) {
      if (imgBytes[0] === 0x89 && imgBytes[1] === 0x50) mimeType = 'image/png'
      else if (imgBytes[0] === 0xFF && imgBytes[1] === 0xD8) mimeType = 'image/jpeg'
      else mimeType = 'image/png'
    }

    // Create blob URL and load as Image
    const blob = new Blob([imgBytes], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = url
    })

    textures.push({ image: img, index: i, blobUrl: url })
  }

  return textures
}

// Create a sprite sheet canvas from multiple GLB files
// Returns { canvas, models, cols, rows }
export async function createGlbSpriteSheet(urls, options = {}) {
  const { cellSize = 256 } = options

  // Load all GLBs and extract textures
  const results = await Promise.all(urls.map(async (url) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const model = parseGlb(arrayBuffer, options)
    const textures = await extractGlbTextures(arrayBuffer)
    return { model, texture: textures[0]?.image || null }
  }))

  // Calculate grid size
  const count = results.length
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = cols * cellSize
  canvas.height = rows * cellSize
  const ctx = canvas.getContext('2d')

  // Draw textures into grid
  results.forEach((r, i) => {
    if (r.texture) {
      const col = i % cols
      const row = Math.floor(i / cols)
      ctx.drawImage(r.texture, col * cellSize, row * cellSize, cellSize, cellSize)
    }
  })

  // Assign faceIds to models for sprite picking
  const models = results.map((r, i) => {
    r.model.spriteIndex = i
    return r.model
  })

  return { canvas, models, cols, rows, cellSize }
}

// ============================================================================
// Animation Support
// ============================================================================

// Extract skeleton data from glTF
// Returns { joints: [...], inverseBindMatrices: [...] }
function extractSkeleton(gltf, binBuffer, skinIndex = 0) {
  if (!gltf.skins || !gltf.skins[skinIndex]) return null

  const skin = gltf.skins[skinIndex]
  const joints = skin.joints  // Array of node indices

  // Read inverse bind matrices
  let inverseBindMatrices = null
  if (skin.inverseBindMatrices !== undefined) {
    const accessor = gltf.accessors[skin.inverseBindMatrices]
    const bufferView = gltf.bufferViews[accessor.bufferView]
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0)

    // Create a properly aligned copy of the data
    const byteLength = accessor.count * 16 * 4  // 16 floats * 4 bytes
    const slice = binBuffer.slice(byteOffset, byteOffset + byteLength)
    inverseBindMatrices = new Float32Array(slice)
  }

  // Build joint info with hierarchy
  const jointData = joints.map((nodeIndex, i) => {
    const node = gltf.nodes[nodeIndex]
    return {
      index: i,
      nodeIndex: nodeIndex,
      name: node.name || `joint_${i}`,
      children: node.children || [],
      // Local transform (TRS)
      translation: node.translation || [0, 0, 0],
      rotation: node.rotation || [0, 0, 0, 1],  // quaternion
      scale: node.scale || [1, 1, 1],
      // Inverse bind matrix (16 floats)
      inverseBindMatrix: inverseBindMatrices
        ? Array.from(inverseBindMatrices.slice(i * 16, i * 16 + 16))
        : identityMatrix()
    }
  })

  return {
    joints: jointData,
    jointCount: joints.length,
    jointNodeIndices: joints
  }
}

// Extract animation clips from glTF
// Returns array of { name, duration, channels: [...] }
function extractAnimations(gltf, binBuffer) {
  if (!gltf.animations) return []

  const readAccessor = (accessorIndex) => {
    const accessor = gltf.accessors[accessorIndex]
    const bufferView = gltf.bufferViews[accessor.bufferView]
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0)
    return new Float32Array(binBuffer, byteOffset, accessor.count * (
      accessor.type === 'SCALAR' ? 1 :
      accessor.type === 'VEC3' ? 3 :
      accessor.type === 'VEC4' ? 4 : 1
    ))
  }

  return gltf.animations.map((anim, animIndex) => {
    const channels = anim.channels.map(channel => {
      const sampler = anim.samplers[channel.sampler]
      const times = readAccessor(sampler.input)
      const values = readAccessor(sampler.output)

      return {
        targetNode: channel.target.node,
        targetPath: channel.target.path,  // 'translation', 'rotation', 'scale'
        interpolation: sampler.interpolation || 'LINEAR',
        times: Array.from(times),
        values: Array.from(values)
      }
    })

    // Calculate duration from max time
    const duration = channels.reduce((max, ch) =>
      Math.max(max, ch.times[ch.times.length - 1] || 0), 0)

    return {
      name: anim.name || `animation_${animIndex}`,
      duration,
      channels
    }
  })
}

// Matrix math helpers
function identityMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

// Invert a 4x4 matrix (column-major)
function invertMatrix(m) {
  const inv = new Array(16)
  inv[0] = m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10]
  inv[4] = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10]
  inv[8] = m[4]*m[9]*m[15] - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9]
  inv[12] = -m[4]*m[9]*m[14] + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9]
  inv[1] = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10]
  inv[5] = m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10]
  inv[9] = -m[0]*m[9]*m[15] + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9]
  inv[13] = m[0]*m[9]*m[14] - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9]
  inv[2] = m[1]*m[6]*m[15] - m[1]*m[7]*m[14] - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7] - m[13]*m[3]*m[6]
  inv[6] = -m[0]*m[6]*m[15] + m[0]*m[7]*m[14] + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7] + m[12]*m[3]*m[6]
  inv[10] = m[0]*m[5]*m[15] - m[0]*m[7]*m[13] - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7] - m[12]*m[3]*m[5]
  inv[14] = -m[0]*m[5]*m[14] + m[0]*m[6]*m[13] + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6] + m[12]*m[2]*m[5]
  inv[3] = -m[1]*m[6]*m[11] + m[1]*m[7]*m[10] + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7] + m[9]*m[3]*m[6]
  inv[7] = m[0]*m[6]*m[11] - m[0]*m[7]*m[10] - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7] - m[8]*m[3]*m[6]
  inv[11] = -m[0]*m[5]*m[11] + m[0]*m[7]*m[9] + m[4]*m[1]*m[11] - m[4]*m[3]*m[9] - m[8]*m[1]*m[7] + m[8]*m[3]*m[5]
  inv[15] = m[0]*m[5]*m[10] - m[0]*m[6]*m[9] - m[4]*m[1]*m[10] + m[4]*m[2]*m[9] + m[8]*m[1]*m[6] - m[8]*m[2]*m[5]
  const det = m[0]*inv[0] + m[1]*inv[4] + m[2]*inv[8] + m[3]*inv[12]
  if (Math.abs(det) < 1e-10) return identityMatrix()
  const invDet = 1.0 / det
  return inv.map(v => v * invDet)
}

function multiplyMatrices(a, b) {
  // Column-major matrix multiplication (glTF standard)
  // C[col][row] = sum of A[k][row] * B[col][k]
  const result = new Array(16)
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      result[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3]
    }
  }
  return result
}

function trsToMatrix(t, r, s) {
  // Convert translation, rotation (quaternion), scale to 4x4 matrix (column-major)
  const [tx, ty, tz] = t
  const [qx, qy, qz, qw] = r
  const [sx, sy, sz] = s

  // Rotation matrix from quaternion - column major layout
  const xx = qx * qx, yy = qy * qy, zz = qz * qz
  const xy = qx * qy, xz = qx * qz, yz = qy * qz
  const wx = qw * qx, wy = qw * qy, wz = qw * qz

  // Column 0
  const m0 = (1 - 2 * (yy + zz)) * sx
  const m1 = 2 * (xy + wz) * sx
  const m2 = 2 * (xz - wy) * sx

  // Column 1
  const m4 = 2 * (xy - wz) * sy
  const m5 = (1 - 2 * (xx + zz)) * sy
  const m6 = 2 * (yz + wx) * sy

  // Column 2
  const m8 = 2 * (xz + wy) * sz
  const m9 = 2 * (yz - wx) * sz
  const m10 = (1 - 2 * (xx + yy)) * sz

  // Return in column-major order: col0, col1, col2, col3
  return [
    m0, m1, m2, 0,      // column 0
    m4, m5, m6, 0,      // column 1
    m8, m9, m10, 0,     // column 2
    tx, ty, tz, 1       // column 3 (translation)
  ]
}

function transformPoint(m, p) {
  const x = p[0], y = p[1], z = p[2]
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14]
  ]
}

function transformNormal(m, n) {
  // Transform normal (ignore translation, use inverse transpose for proper normals)
  // For uniform scale, we can just use the rotation part
  const x = n[0], y = n[1], z = n[2]
  const nx = m[0] * x + m[4] * y + m[8] * z
  const ny = m[1] * x + m[5] * y + m[9] * z
  const nz = m[2] * x + m[6] * y + m[10] * z
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
  return len > 0 ? [nx / len, ny / len, nz / len] : [0, 1, 0]
}

// Interpolate between keyframes
function sampleAnimation(channel, time) {
  const { times, values, targetPath, interpolation } = channel
  const componentCount = targetPath === 'rotation' ? 4 : 3

  // Clamp time to animation range
  if (time <= times[0]) {
    return values.slice(0, componentCount)
  }
  if (time >= times[times.length - 1]) {
    const start = (times.length - 1) * componentCount
    return values.slice(start, start + componentCount)
  }

  // Find surrounding keyframes
  let i = 0
  while (i < times.length - 1 && times[i + 1] < time) i++

  const t0 = times[i], t1 = times[i + 1]
  const alpha = (time - t0) / (t1 - t0)

  const v0Start = i * componentCount
  const v1Start = (i + 1) * componentCount

  if (interpolation === 'STEP') {
    return values.slice(v0Start, v0Start + componentCount)
  }

  // LINEAR interpolation
  if (targetPath === 'rotation') {
    // Spherical linear interpolation for quaternions
    return slerpQuat(
      values.slice(v0Start, v0Start + 4),
      values.slice(v1Start, v1Start + 4),
      alpha
    )
  } else {
    // Linear interpolation for translation/scale
    const result = []
    for (let j = 0; j < componentCount; j++) {
      result.push(values[v0Start + j] * (1 - alpha) + values[v1Start + j] * alpha)
    }
    return result
  }
}

// Quaternion spherical interpolation
function slerpQuat(q1, q2, t) {
  let dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3]

  // Handle negative dot (take shorter path)
  if (dot < 0) {
    q2 = [-q2[0], -q2[1], -q2[2], -q2[3]]
    dot = -dot
  }

  if (dot > 0.9995) {
    // Linear interpolation for very close quaternions
    const result = [
      q1[0] + t * (q2[0] - q1[0]),
      q1[1] + t * (q2[1] - q1[1]),
      q1[2] + t * (q2[2] - q1[2]),
      q1[3] + t * (q2[3] - q1[3])
    ]
    const len = Math.sqrt(result[0] ** 2 + result[1] ** 2 + result[2] ** 2 + result[3] ** 2)
    return result.map(v => v / len)
  }

  const theta0 = Math.acos(dot)
  const theta = theta0 * t
  const sinTheta = Math.sin(theta)
  const sinTheta0 = Math.sin(theta0)

  const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0
  const s1 = sinTheta / sinTheta0

  return [
    s0 * q1[0] + s1 * q2[0],
    s0 * q1[1] + s1 * q2[1],
    s0 * q1[2] + s1 * q2[2],
    s0 * q1[3] + s1 * q2[3]
  ]
}

// Compute skinning matrices for all joints at a given time
// normCenter/normScale: if provided, pre-transform matrices to work in normalized coordinate space
function computeSkinningMatrices(skeleton, animations, clipName, time, gltf, normCenter = null, normScale = 1) {
  if (!skeleton) return null

  const clip = animations.find(a => a.name === clipName) || animations[0]
  if (!clip) return null

  // Build node-to-joint mapping
  const nodeToJoint = new Map()
  skeleton.joints.forEach((joint, i) => {
    nodeToJoint.set(joint.nodeIndex, i)
  })

  // For each joint, sample the animation to get current local transform
  // Animation values REPLACE the node's default TRS (they're absolute, not deltas)
  const localTransforms = skeleton.joints.map((joint, jointIdx) => {
    // Start with node's default TRS
    let t = [...joint.translation]
    let r = [...joint.rotation]
    let s = [...joint.scale]

    // Apply animation channels - these REPLACE the base values
    let animated = false
    for (const channel of clip.channels) {
      if (channel.targetNode === joint.nodeIndex) {
        animated = true
        const sampled = sampleAnimation(channel, time)
        if (channel.targetPath === 'translation') t = sampled
        else if (channel.targetPath === 'rotation') r = sampled
        else if (channel.targetPath === 'scale') s = sampled
      }
    }

    return trsToMatrix(t, r, s)
  })

  // Compute world transforms by traversing hierarchy
  const worldTransforms = new Array(skeleton.joints.length)

  // Build parent map from gltf nodes
  const parentMap = new Map()
  gltf.nodes.forEach((node, nodeIdx) => {
    if (node.children) {
      node.children.forEach(childIdx => parentMap.set(childIdx, nodeIdx))
    }
  })

  // Compute world transform for each joint
  const computeWorld = (jointIndex) => {
    if (worldTransforms[jointIndex]) return worldTransforms[jointIndex]

    const joint = skeleton.joints[jointIndex]
    const parentNodeIndex = parentMap.get(joint.nodeIndex)

    if (parentNodeIndex !== undefined && nodeToJoint.has(parentNodeIndex)) {
      const parentJointIndex = nodeToJoint.get(parentNodeIndex)
      const parentWorld = computeWorld(parentJointIndex)
      worldTransforms[jointIndex] = multiplyMatrices(parentWorld, localTransforms[jointIndex])
    } else {
      worldTransforms[jointIndex] = localTransforms[jointIndex]
    }

    return worldTransforms[jointIndex]
  }

  // Standard glTF skinning: jointMatrix = globalTransform * inverseBindMatrix
  const rawMatrices = skeleton.joints.map((joint, i) => {
    const globalTransform = computeWorld(i)
    return multiplyMatrices(globalTransform, joint.inverseBindMatrix)
  })

  // If normCenter provided, pre-transform matrices to work in normalized coordinate space
  // Transform: N * jointMatrix * N^-1  where N = translate(-center) then scale(scale)
  if (normCenter) {
    const [cx, cy, cz] = normCenter
    const s = normScale
    const invS = 1 / s

    // N = translate(-center) then scale = scale * translate(-center)
    // N^-1 = translate(center) then scale(1/s) = scale(1/s) * translate(center)
    // For column-major 4x4: result = N * M * N^-1
    return rawMatrices.map(M => {
      // Step 1: M' = M * N^-1 = M * (scale(1/s) * translate(center))
      // This is: first translate by center, then scale by 1/s, then apply M
      // Step 2: result = N * M' = (scale(s) * translate(-center)) * M'

      // Compute M * N^-1 directly:
      // N^-1 translates by center then scales by 1/s
      // Column-major: N^-1[12..14] = [cx, cy, cz], and scale diagonal by 1/s
      const MN = [
        M[0] * invS, M[1] * invS, M[2] * invS, M[3],
        M[4] * invS, M[5] * invS, M[6] * invS, M[7],
        M[8] * invS, M[9] * invS, M[10] * invS, M[11],
        M[0] * cx + M[4] * cy + M[8] * cz + M[12],
        M[1] * cx + M[5] * cy + M[9] * cz + M[13],
        M[2] * cx + M[6] * cy + M[10] * cz + M[14],
        M[3] * cx + M[7] * cy + M[11] * cz + M[15]
      ]

      // Now compute N * MN where N = scale(s) * translate(-center)
      // N scales by s then translates by -center
      // Result[i] = s * MN[i] for position columns, translation adjusts
      return [
        s * MN[0], s * MN[1], s * MN[2], MN[3],
        s * MN[4], s * MN[5], s * MN[6], MN[7],
        s * MN[8], s * MN[9], s * MN[10], MN[11],
        s * MN[12] - cx * s, s * MN[13] - cy * s, s * MN[14] - cz * s, MN[15]
      ]
    })
  }

  return rawMatrices
}

// Export animation helpers for use by VertexSource
export { extractSkeleton as extractSkeletonFromGltf }
export { extractAnimations as extractAnimationsFromGltf }
export { computeSkinningMatrices, applySkinning }

// Apply skinning to vertices
// Matrices should already be pre-transformed for normalized coords (via computeSkinningMatrices)
function applySkinning(vertices, normals, joints, weights, skinningMatrices) {
  const vertexCount = vertices.length / 3
  const skinnedVerts = new Array(vertices.length)
  const skinnedNormals = normals ? new Array(normals.length) : null

  for (let v = 0; v < vertexCount; v++) {
    const vi = v * 3
    const ji = v * 4

    const pos = [vertices[vi], vertices[vi + 1], vertices[vi + 2]]
    const norm = normals ? [normals[vi], normals[vi + 1], normals[vi + 2]] : null

    // Blend up to 4 bone influences
    let skinnedPos = [0, 0, 0]
    let skinnedNorm = normals ? [0, 0, 0] : null

    for (let i = 0; i < 4; i++) {
      const jointIndex = joints[ji + i]
      const weight = weights[ji + i]

      if (weight > 0 && skinningMatrices[jointIndex]) {
        const mat = skinningMatrices[jointIndex]
        const transformedPos = transformPoint(mat, pos)

        skinnedPos[0] += transformedPos[0] * weight
        skinnedPos[1] += transformedPos[1] * weight
        skinnedPos[2] += transformedPos[2] * weight

        if (normals) {
          const transformedNorm = transformNormal(mat, norm)
          skinnedNorm[0] += transformedNorm[0] * weight
          skinnedNorm[1] += transformedNorm[1] * weight
          skinnedNorm[2] += transformedNorm[2] * weight
        }
      }
    }

    skinnedVerts[vi] = skinnedPos[0]
    skinnedVerts[vi + 1] = skinnedPos[1]
    skinnedVerts[vi + 2] = skinnedPos[2]

    if (normals) {
      // Normalize the normal vector
      const len = Math.sqrt(skinnedNorm[0] ** 2 + skinnedNorm[1] ** 2 + skinnedNorm[2] ** 2)
      skinnedNormals[vi] = len > 0 ? skinnedNorm[0] / len : 0
      skinnedNormals[vi + 1] = len > 0 ? skinnedNorm[1] / len : 1
      skinnedNormals[vi + 2] = len > 0 ? skinnedNorm[2] / len : 0
    }
  }

  return { vertices: skinnedVerts, normals: skinnedNormals }
}

// Equilateral triangle centered at (centerX, centerY) - 3D with z=0
export function tri(size = 1.0, centerX = 0, centerY = 0) {
  const h = size * Math.sqrt(3) / 2
  const verts = [
    centerX, centerY + h * 2/3, 0,
    centerX - size/2, centerY - h/3, 0,
    centerX + size/2, centerY - h/3, 0
  ]
  const vs = new VertexSource(verts)
  vs.is3D = true
  return vs
}

// Rectangle as two triangles (3D with z=0)
export function quad(width = 1.0, height = 1.0, centerX = 0, centerY = 0) {
  const hw = width / 2, hh = height / 2
  const verts = [
    // Triangle 1
    centerX - hw, centerY - hh, 0,
    centerX + hw, centerY - hh, 0,
    centerX + hw, centerY + hh, 0,
    // Triangle 2
    centerX - hw, centerY - hh, 0,
    centerX + hw, centerY + hh, 0,
    centerX - hw, centerY + hh, 0
  ]
  const vs = new VertexSource(verts)
  vs.is3D = true
  return vs
}

// Regular polygon with n sides (triangle fan from center) - 3D with z=0
export function poly(sides, radius = 1.0, centerX = 0, centerY = 0) {
  const verts = []
  for (let i = 0; i < sides; i++) {
    const a1 = (i / sides) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2
    verts.push(centerX, centerY, 0)
    verts.push(centerX + Math.cos(a1) * radius, centerY + Math.sin(a1) * radius, 0)
    verts.push(centerX + Math.cos(a2) * radius, centerY + Math.sin(a2) * radius, 0)
  }
  const vs = new VertexSource(verts)
  vs.is3D = true
  return vs
}

// Circle approximation (polygon with many sides)
export function circle(radius = 1.0, centerX = 0, centerY = 0, segments = 32) {
  return poly(segments, radius, centerX, centerY)
}

// Line as thin quad (for stroke-like rendering)
export function line(x1, y1, x2, y2, thickness = 0.02) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len * thickness / 2
  const ny = dx / len * thickness / 2
  const verts = [
    x1 + nx, y1 + ny,
    x1 - nx, y1 - ny,
    x2 - nx, y2 - ny,
    x1 + nx, y1 + ny,
    x2 - nx, y2 - ny,
    x2 + nx, y2 + ny
  ]
  return new VertexSource(verts)
}

// Ring (annulus) - outer circle minus inner circle
export function ring(outerRadius = 1.0, innerRadius = 0.5, centerX = 0, centerY = 0, segments = 32) {
  const verts = []
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2
    const a2 = ((i + 1) / segments) * Math.PI * 2
    const cos1 = Math.cos(a1), sin1 = Math.sin(a1)
    const cos2 = Math.cos(a2), sin2 = Math.sin(a2)
    // Two triangles per segment
    verts.push(centerX + cos1 * innerRadius, centerY + sin1 * innerRadius)
    verts.push(centerX + cos1 * outerRadius, centerY + sin1 * outerRadius)
    verts.push(centerX + cos2 * outerRadius, centerY + sin2 * outerRadius)
    verts.push(centerX + cos1 * innerRadius, centerY + sin1 * innerRadius)
    verts.push(centerX + cos2 * outerRadius, centerY + sin2 * outerRadius)
    verts.push(centerX + cos2 * innerRadius, centerY + sin2 * innerRadius)
  }
  return new VertexSource(verts)
}

// 3D Cube - 6 faces, 12 triangles
// Returns 3D vertices with per-face UVs and faceIds
// Face order: front, back, top, bottom, right, left (indices 0-5)
export function cube(size = 0.5) {
  const s = size
  // 8 corners of the cube
  const corners = [
    [-s, -s,  s],  // 0: front-bottom-left
    [ s, -s,  s],  // 1: front-bottom-right
    [ s,  s,  s],  // 2: front-top-right
    [-s,  s,  s],  // 3: front-top-left
    [-s, -s, -s],  // 4: back-bottom-left
    [ s, -s, -s],  // 5: back-bottom-right
    [ s,  s, -s],  // 6: back-top-right
    [-s,  s, -s],  // 7: back-top-left
  ]

  // 6 faces, each as 2 triangles (CCW winding for front-facing)
  // Each face has vertex indices and corresponding UVs
  const faces = [
    { indices: [0, 1, 2, 0, 2, 3], uvs: [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]] },  // front (0)
    { indices: [5, 4, 7, 5, 7, 6], uvs: [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]] },  // back (1)
    { indices: [3, 2, 6, 3, 6, 7], uvs: [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]] },  // top (2)
    { indices: [4, 5, 1, 4, 1, 0], uvs: [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]] },  // bottom (3)
    { indices: [1, 5, 6, 1, 6, 2], uvs: [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]] },  // right (4)
    { indices: [4, 0, 3, 4, 3, 7], uvs: [[0,0], [1,0], [1,1], [0,0], [1,1], [0,1]] },  // left (5)
  ]

  const verts = []
  const uvs = []
  const faceIds = []
  for (let faceIdx = 0; faceIdx < faces.length; faceIdx++) {
    const face = faces[faceIdx]
    for (let i = 0; i < face.indices.length; i++) {
      verts.push(...corners[face.indices[i]])
      uvs.push(...face.uvs[i])
      faceIds.push(faceIdx)  // Each vertex knows which face it belongs to
    }
  }

  const vs = new VertexSource(verts)
  vs.uvs = uvs  // Store UVs for later use
  vs.faceIds = faceIds  // Store face IDs for per-face materials
  vs.is3D = true
  return vs
}

// ============================================================================
// Procedural 3D Geometry
// ============================================================================

// Generate a UV sphere with normals
// segments: number of horizontal divisions (longitude)
// rings: number of vertical divisions (latitude)
export function sphere(radius = 0.5, segments = 32, rings = 16) {
  const verts = []
  const normals = []
  const uvs = []

  for (let ring = 0; ring <= rings; ring++) {
    const theta = (ring / rings) * Math.PI  // 0 to PI (top to bottom)
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let seg = 0; seg <= segments; seg++) {
      const phi = (seg / segments) * Math.PI * 2  // 0 to 2PI (around)
      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      // Normal is just the unit sphere position
      const nx = sinTheta * cosPhi
      const ny = cosTheta
      const nz = sinTheta * sinPhi

      // Position is normal * radius
      const x = nx * radius
      const y = ny * radius
      const z = nz * radius

      // UV coordinates
      const u = seg / segments
      const v = ring / rings

      verts.push(x, y, z)
      normals.push(nx, ny, nz)
      uvs.push(u, v)
    }
  }

  // Build triangle indices
  const outVerts = []
  const outNormals = []
  const outUVs = []

  const stride = segments + 1
  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const i0 = ring * stride + seg
      const i1 = i0 + 1
      const i2 = i0 + stride
      const i3 = i2 + 1

      // Two triangles per quad
      const indices = [i0, i2, i1, i1, i2, i3]
      for (const idx of indices) {
        outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2])
        outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2])
        outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1])
      }
    }
  }

  const vs = new VertexSource(outVerts)
  vs.normals = outNormals
  vs.uvs = outUVs
  vs.is3D = true
  return vs
}

// Generate a subdivided plane with normals (facing +Y by default)
// width, height: size of the plane
// subdivisionsX, subdivisionsY: number of subdivisions
export function plane(width = 1, height = 1, subdivisionsX = 1, subdivisionsY = 1) {
  const verts = []
  const normals = []
  const uvs = []

  const halfW = width / 2
  const halfH = height / 2

  for (let y = 0; y <= subdivisionsY; y++) {
    for (let x = 0; x <= subdivisionsX; x++) {
      const u = x / subdivisionsX
      const v = y / subdivisionsY
      const px = -halfW + u * width
      const pz = -halfH + v * height

      verts.push(px, 0, pz)
      normals.push(0, 1, 0)  // Facing up
      uvs.push(u, v)
    }
  }

  // Build triangles
  const outVerts = []
  const outNormals = []
  const outUVs = []

  const stride = subdivisionsX + 1
  for (let y = 0; y < subdivisionsY; y++) {
    for (let x = 0; x < subdivisionsX; x++) {
      const i0 = y * stride + x
      const i1 = i0 + 1
      const i2 = i0 + stride
      const i3 = i2 + 1

      // Two triangles per quad
      const indices = [i0, i2, i1, i1, i2, i3]
      for (const idx of indices) {
        outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2])
        outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2])
        outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1])
      }
    }
  }

  const vs = new VertexSource(outVerts)
  vs.normals = outNormals
  vs.uvs = outUVs
  vs.is3D = true
  return vs
}

// Generate a torus (donut) with normals
// radius: distance from center to tube center
// tubeRadius: radius of the tube
// radialSegments: segments around the ring
// tubularSegments: segments around the tube
export function torus(radius = 0.4, tubeRadius = 0.15, radialSegments = 32, tubularSegments = 16) {
  const verts = []
  const normals = []
  const uvs = []

  for (let i = 0; i <= radialSegments; i++) {
    const u = i / radialSegments
    const theta = u * Math.PI * 2

    for (let j = 0; j <= tubularSegments; j++) {
      const v = j / tubularSegments
      const phi = v * Math.PI * 2

      // Position on torus
      const x = (radius + tubeRadius * Math.cos(phi)) * Math.cos(theta)
      const y = tubeRadius * Math.sin(phi)
      const z = (radius + tubeRadius * Math.cos(phi)) * Math.sin(theta)

      // Normal: direction from ring center to surface
      const cx = radius * Math.cos(theta)  // center of tube ring
      const cz = radius * Math.sin(theta)
      const nx = x - cx
      const ny = y
      const nz = z - cz
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)

      verts.push(x, y, z)
      normals.push(nx / len, ny / len, nz / len)
      uvs.push(u, v)
    }
  }

  // Build triangles
  const outVerts = []
  const outNormals = []
  const outUVs = []

  const stride = tubularSegments + 1
  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < tubularSegments; j++) {
      const i0 = i * stride + j
      const i1 = i0 + 1
      const i2 = i0 + stride
      const i3 = i2 + 1

      // Two triangles per quad
      const indices = [i0, i1, i2, i1, i3, i2]
      for (const idx of indices) {
        outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2])
        outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2])
        outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1])
      }
    }
  }

  const vs = new VertexSource(outVerts)
  vs.normals = outNormals
  vs.uvs = outUVs
  vs.is3D = true
  return vs
}

// Generate a cylinder with normals
// radius: radius of the cylinder
// height: height of the cylinder
// radialSegments: segments around the circumference
// heightSegments: segments along the height
// caps: whether to include top and bottom caps (default true)
export function cylinder(radius = 0.3, height = 1, radialSegments = 32, heightSegments = 1, caps = true) {
  const verts = []
  const normals = []
  const uvs = []

  const halfHeight = height / 2

  // Generate the tube
  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments
    const py = -halfHeight + v * height

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments
      const theta = u * Math.PI * 2
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)

      verts.push(cosT * radius, py, sinT * radius)
      normals.push(cosT, 0, sinT)  // Outward normal
      uvs.push(u, v)
    }
  }

  // Build tube triangles
  const outVerts = []
  const outNormals = []
  const outUVs = []

  const stride = radialSegments + 1
  for (let y = 0; y < heightSegments; y++) {
    for (let i = 0; i < radialSegments; i++) {
      const i0 = y * stride + i
      const i1 = i0 + 1
      const i2 = i0 + stride
      const i3 = i2 + 1

      const indices = [i0, i2, i1, i1, i2, i3]
      for (const idx of indices) {
        outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2])
        outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2])
        outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1])
      }
    }
  }

  // Add caps
  if (caps) {
    // Top cap (y = halfHeight)
    for (let i = 0; i < radialSegments; i++) {
      const theta1 = (i / radialSegments) * Math.PI * 2
      const theta2 = ((i + 1) / radialSegments) * Math.PI * 2

      // Center vertex
      outVerts.push(0, halfHeight, 0)
      outNormals.push(0, 1, 0)
      outUVs.push(0.5, 0.5)

      // Edge vertices (CCW from above)
      outVerts.push(Math.cos(theta2) * radius, halfHeight, Math.sin(theta2) * radius)
      outNormals.push(0, 1, 0)
      outUVs.push(0.5 + Math.cos(theta2) * 0.5, 0.5 + Math.sin(theta2) * 0.5)

      outVerts.push(Math.cos(theta1) * radius, halfHeight, Math.sin(theta1) * radius)
      outNormals.push(0, 1, 0)
      outUVs.push(0.5 + Math.cos(theta1) * 0.5, 0.5 + Math.sin(theta1) * 0.5)
    }

    // Bottom cap (y = -halfHeight)
    for (let i = 0; i < radialSegments; i++) {
      const theta1 = (i / radialSegments) * Math.PI * 2
      const theta2 = ((i + 1) / radialSegments) * Math.PI * 2

      // Center vertex
      outVerts.push(0, -halfHeight, 0)
      outNormals.push(0, -1, 0)
      outUVs.push(0.5, 0.5)

      // Edge vertices (CCW from below)
      outVerts.push(Math.cos(theta1) * radius, -halfHeight, Math.sin(theta1) * radius)
      outNormals.push(0, -1, 0)
      outUVs.push(0.5 + Math.cos(theta1) * 0.5, 0.5 + Math.sin(theta1) * 0.5)

      outVerts.push(Math.cos(theta2) * radius, -halfHeight, Math.sin(theta2) * radius)
      outNormals.push(0, -1, 0)
      outUVs.push(0.5 + Math.cos(theta2) * 0.5, 0.5 + Math.sin(theta2) * 0.5)
    }
  }

  const vs = new VertexSource(outVerts)
  vs.normals = outNormals
  vs.uvs = outUVs
  vs.is3D = true
  return vs
}

// Generate a cone with normals
// radius: radius of the base
// height: height of the cone
// radialSegments: segments around the circumference
// caps: whether to include bottom cap (default true)
export function cone(radius = 0.3, height = 1, radialSegments = 32, caps = true) {
  const outVerts = []
  const outNormals = []
  const outUVs = []

  const halfHeight = height / 2
  const apex = halfHeight
  const base = -halfHeight

  // Calculate the normal slope for cone surface
  // Normal needs to point outward and up the slope
  const slopeAngle = Math.atan2(radius, height)
  const ny = Math.sin(slopeAngle)
  const nxz = Math.cos(slopeAngle)

  // Generate cone sides
  for (let i = 0; i < radialSegments; i++) {
    const theta1 = (i / radialSegments) * Math.PI * 2
    const theta2 = ((i + 1) / radialSegments) * Math.PI * 2
    const cosT1 = Math.cos(theta1), sinT1 = Math.sin(theta1)
    const cosT2 = Math.cos(theta2), sinT2 = Math.sin(theta2)

    // Triangle from apex to base edge
    // Apex
    outVerts.push(0, apex, 0)
    // Normal at apex: average of surrounding normals, pointing up/out
    const midTheta = (theta1 + theta2) / 2
    outNormals.push(Math.cos(midTheta) * nxz, ny, Math.sin(midTheta) * nxz)
    outUVs.push(0.5, 0)

    // Base edge 1
    outVerts.push(cosT1 * radius, base, sinT1 * radius)
    outNormals.push(cosT1 * nxz, ny, sinT1 * nxz)
    outUVs.push(i / radialSegments, 1)

    // Base edge 2
    outVerts.push(cosT2 * radius, base, sinT2 * radius)
    outNormals.push(cosT2 * nxz, ny, sinT2 * nxz)
    outUVs.push((i + 1) / radialSegments, 1)
  }

  // Add base cap
  if (caps) {
    for (let i = 0; i < radialSegments; i++) {
      const theta1 = (i / radialSegments) * Math.PI * 2
      const theta2 = ((i + 1) / radialSegments) * Math.PI * 2

      // Center vertex
      outVerts.push(0, base, 0)
      outNormals.push(0, -1, 0)
      outUVs.push(0.5, 0.5)

      // Edge vertices (CCW from below)
      outVerts.push(Math.cos(theta1) * radius, base, Math.sin(theta1) * radius)
      outNormals.push(0, -1, 0)
      outUVs.push(0.5 + Math.cos(theta1) * 0.5, 0.5 + Math.sin(theta1) * 0.5)

      outVerts.push(Math.cos(theta2) * radius, base, Math.sin(theta2) * radius)
      outNormals.push(0, -1, 0)
      outUVs.push(0.5 + Math.cos(theta2) * 0.5, 0.5 + Math.sin(theta2) * 0.5)
    }
  }

  const vs = new VertexSource(outVerts)
  vs.normals = outNormals
  vs.uvs = outUVs
  vs.is3D = true
  return vs
}

// ============================================================================
// Fragment/Explosion Utilities
// ============================================================================

// Seeded pseudo-random number generator (LCG)
function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

// Subdivide triangles with edges longer than maxEdgeLength
// Uses midpoint subdivision: splits each large triangle into up to 4 smaller triangles
// Options:
//   maxEdgeLength: maximum edge length before subdivision (default: 0.2)
//   maxIterations: maximum subdivision passes (default: 3)
// Returns object with subdivided vertices, uvs, normals, colors, faceIds (all as Float32Arrays)
export function subdivideTriangles(vertices, options = {}) {
  const {
    maxEdgeLength = 0.2,
    maxIterations = 3,
    uvs = null,
    normals = null,
    colors = null,
    faceIds = null
  } = options

  // Helper to compute edge length squared
  const edgeLengthSq = (v1, v2) => {
    const dx = v2[0] - v1[0]
    const dy = v2[1] - v1[1]
    const dz = v2[2] - v1[2]
    return dx * dx + dy * dy + dz * dz
  }

  // Helper to interpolate between two values
  const lerp = (a, b, t) => a + (b - a) * t

  // Helper to interpolate vec2
  const lerpVec2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]

  // Helper to interpolate vec3
  const lerpVec3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

  // Helper to interpolate vec4
  const lerpVec4 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)]

  // Helper to normalize vec3
  const normalize = (v) => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    if (len < 0.0001) return [0, 0, 1]
    return [v[0] / len, v[1] / len, v[2] / len]
  }

  const maxLenSq = maxEdgeLength * maxEdgeLength

  // Convert flat arrays to triangle arrays for easier processing
  let tris = []
  const triangleCount = Math.floor(vertices.length / 9)

  for (let i = 0; i < triangleCount; i++) {
    const base = i * 9
    const tri = {
      v: [
        [vertices[base], vertices[base + 1], vertices[base + 2]],
        [vertices[base + 3], vertices[base + 4], vertices[base + 5]],
        [vertices[base + 6], vertices[base + 7], vertices[base + 8]]
      ]
    }

    if (uvs && uvs.length >= (i + 1) * 6) {
      const uvBase = i * 6
      tri.uv = [
        [uvs[uvBase], uvs[uvBase + 1]],
        [uvs[uvBase + 2], uvs[uvBase + 3]],
        [uvs[uvBase + 4], uvs[uvBase + 5]]
      ]
    }

    if (normals && normals.length >= (i + 1) * 9) {
      const nBase = i * 9
      tri.n = [
        [normals[nBase], normals[nBase + 1], normals[nBase + 2]],
        [normals[nBase + 3], normals[nBase + 4], normals[nBase + 5]],
        [normals[nBase + 6], normals[nBase + 7], normals[nBase + 8]]
      ]
    }

    if (colors && colors.length >= (i + 1) * 12) {
      const cBase = i * 12
      tri.c = [
        [colors[cBase], colors[cBase + 1], colors[cBase + 2], colors[cBase + 3]],
        [colors[cBase + 4], colors[cBase + 5], colors[cBase + 6], colors[cBase + 7]],
        [colors[cBase + 8], colors[cBase + 9], colors[cBase + 10], colors[cBase + 11]]
      ]
    }

    if (faceIds && faceIds.length >= (i + 1) * 3) {
      tri.faceId = faceIds[i * 3]  // Same for all 3 vertices
    }

    tris.push(tri)
  }

  // Iteratively subdivide
  for (let iter = 0; iter < maxIterations; iter++) {
    const newTris = []
    let didSubdivide = false

    for (const tri of tris) {
      const [v0, v1, v2] = tri.v
      const e01 = edgeLengthSq(v0, v1)
      const e12 = edgeLengthSq(v1, v2)
      const e20 = edgeLengthSq(v2, v0)

      const split01 = e01 > maxLenSq
      const split12 = e12 > maxLenSq
      const split20 = e20 > maxLenSq

      if (!split01 && !split12 && !split20) {
        // No subdivision needed
        newTris.push(tri)
        continue
      }

      didSubdivide = true

      // Compute midpoints for edges that need splitting
      const m01 = split01 ? lerpVec3(v0, v1, 0.5) : null
      const m12 = split12 ? lerpVec3(v1, v2, 0.5) : null
      const m20 = split20 ? lerpVec3(v2, v0, 0.5) : null

      // Interpolate other attributes at midpoints
      const uv01 = tri.uv && split01 ? lerpVec2(tri.uv[0], tri.uv[1], 0.5) : null
      const uv12 = tri.uv && split12 ? lerpVec2(tri.uv[1], tri.uv[2], 0.5) : null
      const uv20 = tri.uv && split20 ? lerpVec2(tri.uv[2], tri.uv[0], 0.5) : null

      const n01 = tri.n && split01 ? normalize(lerpVec3(tri.n[0], tri.n[1], 0.5)) : null
      const n12 = tri.n && split12 ? normalize(lerpVec3(tri.n[1], tri.n[2], 0.5)) : null
      const n20 = tri.n && split20 ? normalize(lerpVec3(tri.n[2], tri.n[0], 0.5)) : null

      const c01 = tri.c && split01 ? lerpVec4(tri.c[0], tri.c[1], 0.5) : null
      const c12 = tri.c && split12 ? lerpVec4(tri.c[1], tri.c[2], 0.5) : null
      const c20 = tri.c && split20 ? lerpVec4(tri.c[2], tri.c[0], 0.5) : null

      // Helper to create a new triangle
      const makeTri = (verts, uvArr, nArr, cArr) => {
        const t = { v: verts }
        if (uvArr) t.uv = uvArr
        if (nArr) t.n = nArr
        if (cArr) t.c = cArr
        if (tri.faceId !== undefined) t.faceId = tri.faceId
        return t
      }

      // Split patterns based on which edges need subdivision
      const splitCount = (split01 ? 1 : 0) + (split12 ? 1 : 0) + (split20 ? 1 : 0)

      if (splitCount === 3) {
        // All edges split - 4 triangles
        newTris.push(makeTri(
          [v0, m01, m20],
          tri.uv ? [tri.uv[0], uv01, uv20] : null,
          tri.n ? [tri.n[0], n01, n20] : null,
          tri.c ? [tri.c[0], c01, c20] : null
        ))
        newTris.push(makeTri(
          [m01, v1, m12],
          tri.uv ? [uv01, tri.uv[1], uv12] : null,
          tri.n ? [n01, tri.n[1], n12] : null,
          tri.c ? [c01, tri.c[1], c12] : null
        ))
        newTris.push(makeTri(
          [m20, m12, v2],
          tri.uv ? [uv20, uv12, tri.uv[2]] : null,
          tri.n ? [n20, n12, tri.n[2]] : null,
          tri.c ? [c20, c12, tri.c[2]] : null
        ))
        newTris.push(makeTri(
          [m01, m12, m20],
          tri.uv ? [uv01, uv12, uv20] : null,
          tri.n ? [n01, n12, n20] : null,
          tri.c ? [c01, c12, c20] : null
        ))
      } else if (splitCount === 2) {
        // Two edges split - 3 triangles
        if (!split01) {
          // Split e12 and e20
          newTris.push(makeTri(
            [v0, v1, m12],
            tri.uv ? [tri.uv[0], tri.uv[1], uv12] : null,
            tri.n ? [tri.n[0], tri.n[1], n12] : null,
            tri.c ? [tri.c[0], tri.c[1], c12] : null
          ))
          newTris.push(makeTri(
            [v0, m12, m20],
            tri.uv ? [tri.uv[0], uv12, uv20] : null,
            tri.n ? [tri.n[0], n12, n20] : null,
            tri.c ? [tri.c[0], c12, c20] : null
          ))
          newTris.push(makeTri(
            [m20, m12, v2],
            tri.uv ? [uv20, uv12, tri.uv[2]] : null,
            tri.n ? [n20, n12, tri.n[2]] : null,
            tri.c ? [c20, c12, tri.c[2]] : null
          ))
        } else if (!split12) {
          // Split e01 and e20
          newTris.push(makeTri(
            [v0, m01, m20],
            tri.uv ? [tri.uv[0], uv01, uv20] : null,
            tri.n ? [tri.n[0], n01, n20] : null,
            tri.c ? [tri.c[0], c01, c20] : null
          ))
          newTris.push(makeTri(
            [m01, v1, m20],
            tri.uv ? [uv01, tri.uv[1], uv20] : null,
            tri.n ? [n01, tri.n[1], n20] : null,
            tri.c ? [c01, tri.c[1], c20] : null
          ))
          newTris.push(makeTri(
            [m20, v1, v2],
            tri.uv ? [uv20, tri.uv[1], tri.uv[2]] : null,
            tri.n ? [n20, tri.n[1], tri.n[2]] : null,
            tri.c ? [c20, tri.c[1], tri.c[2]] : null
          ))
        } else {
          // Split e01 and e12
          newTris.push(makeTri(
            [v0, m01, v2],
            tri.uv ? [tri.uv[0], uv01, tri.uv[2]] : null,
            tri.n ? [tri.n[0], n01, tri.n[2]] : null,
            tri.c ? [tri.c[0], c01, tri.c[2]] : null
          ))
          newTris.push(makeTri(
            [m01, v1, m12],
            tri.uv ? [uv01, tri.uv[1], uv12] : null,
            tri.n ? [n01, tri.n[1], n12] : null,
            tri.c ? [c01, tri.c[1], c12] : null
          ))
          newTris.push(makeTri(
            [m01, m12, v2],
            tri.uv ? [uv01, uv12, tri.uv[2]] : null,
            tri.n ? [n01, n12, tri.n[2]] : null,
            tri.c ? [c01, c12, tri.c[2]] : null
          ))
        }
      } else {
        // One edge split - 2 triangles
        if (split01) {
          newTris.push(makeTri(
            [v0, m01, v2],
            tri.uv ? [tri.uv[0], uv01, tri.uv[2]] : null,
            tri.n ? [tri.n[0], n01, tri.n[2]] : null,
            tri.c ? [tri.c[0], c01, tri.c[2]] : null
          ))
          newTris.push(makeTri(
            [m01, v1, v2],
            tri.uv ? [uv01, tri.uv[1], tri.uv[2]] : null,
            tri.n ? [n01, tri.n[1], tri.n[2]] : null,
            tri.c ? [c01, tri.c[1], tri.c[2]] : null
          ))
        } else if (split12) {
          newTris.push(makeTri(
            [v0, v1, m12],
            tri.uv ? [tri.uv[0], tri.uv[1], uv12] : null,
            tri.n ? [tri.n[0], tri.n[1], n12] : null,
            tri.c ? [tri.c[0], tri.c[1], c12] : null
          ))
          newTris.push(makeTri(
            [v0, m12, v2],
            tri.uv ? [tri.uv[0], uv12, tri.uv[2]] : null,
            tri.n ? [tri.n[0], n12, tri.n[2]] : null,
            tri.c ? [tri.c[0], c12, tri.c[2]] : null
          ))
        } else {
          newTris.push(makeTri(
            [v0, v1, m20],
            tri.uv ? [tri.uv[0], tri.uv[1], uv20] : null,
            tri.n ? [tri.n[0], tri.n[1], n20] : null,
            tri.c ? [tri.c[0], tri.c[1], c20] : null
          ))
          newTris.push(makeTri(
            [m20, v1, v2],
            tri.uv ? [uv20, tri.uv[1], tri.uv[2]] : null,
            tri.n ? [n20, tri.n[1], tri.n[2]] : null,
            tri.c ? [c20, tri.c[1], tri.c[2]] : null
          ))
        }
      }
    }

    tris = newTris

    // Early exit if no subdivisions occurred
    if (!didSubdivide) break
  }

  // Convert back to flat arrays
  const outVertices = new Float32Array(tris.length * 9)
  const outUvs = tris[0]?.uv ? new Float32Array(tris.length * 6) : null
  const outNormals = tris[0]?.n ? new Float32Array(tris.length * 9) : null
  const outColors = tris[0]?.c ? new Float32Array(tris.length * 12) : null
  const outFaceIds = tris[0]?.faceId !== undefined ? new Float32Array(tris.length * 3) : null

  for (let i = 0; i < tris.length; i++) {
    const tri = tris[i]
    const vBase = i * 9
    for (let j = 0; j < 3; j++) {
      outVertices[vBase + j * 3] = tri.v[j][0]
      outVertices[vBase + j * 3 + 1] = tri.v[j][1]
      outVertices[vBase + j * 3 + 2] = tri.v[j][2]
    }

    if (outUvs && tri.uv) {
      const uvBase = i * 6
      for (let j = 0; j < 3; j++) {
        outUvs[uvBase + j * 2] = tri.uv[j][0]
        outUvs[uvBase + j * 2 + 1] = tri.uv[j][1]
      }
    }

    if (outNormals && tri.n) {
      const nBase = i * 9
      for (let j = 0; j < 3; j++) {
        outNormals[nBase + j * 3] = tri.n[j][0]
        outNormals[nBase + j * 3 + 1] = tri.n[j][1]
        outNormals[nBase + j * 3 + 2] = tri.n[j][2]
      }
    }

    if (outColors && tri.c) {
      const cBase = i * 12
      for (let j = 0; j < 3; j++) {
        outColors[cBase + j * 4] = tri.c[j][0]
        outColors[cBase + j * 4 + 1] = tri.c[j][1]
        outColors[cBase + j * 4 + 2] = tri.c[j][2]
        outColors[cBase + j * 4 + 3] = tri.c[j][3]
      }
    }

    if (outFaceIds && tri.faceId !== undefined) {
      const fBase = i * 3
      outFaceIds[fBase] = tri.faceId
      outFaceIds[fBase + 1] = tri.faceId
      outFaceIds[fBase + 2] = tri.faceId
    }
  }

  return {
    vertices: outVertices,
    uvs: outUvs,
    normals: outNormals,
    colors: outColors,
    faceIds: outFaceIds,
    triangleCount: tris.length
  }
}

// Compute center of each triangle (3 vertices per triangle)
// Returns Float32Array of vec3 centers (one per triangle)
export function computeTriangleCenters(vertices) {
  const triangleCount = Math.floor(vertices.length / 9)  // 3 verts * 3 coords
  const centers = new Float32Array(triangleCount * 3)

  for (let i = 0; i < triangleCount; i++) {
    const base = i * 9
    const cx = (vertices[base] + vertices[base + 3] + vertices[base + 6]) / 3
    const cy = (vertices[base + 1] + vertices[base + 4] + vertices[base + 7]) / 3
    const cz = (vertices[base + 2] + vertices[base + 5] + vertices[base + 8]) / 3
    centers[i * 3] = cx
    centers[i * 3 + 1] = cy
    centers[i * 3 + 2] = cz
  }

  return centers
}

// Compute flat normal for each triangle (cross product of edges)
// Returns Float32Array of vec3 normals (one per triangle)
export function computeTriangleNormals(vertices) {
  const triangleCount = Math.floor(vertices.length / 9)
  const normals = new Float32Array(triangleCount * 3)

  for (let i = 0; i < triangleCount; i++) {
    const base = i * 9
    // Get triangle vertices
    const v0x = vertices[base], v0y = vertices[base + 1], v0z = vertices[base + 2]
    const v1x = vertices[base + 3], v1y = vertices[base + 4], v1z = vertices[base + 5]
    const v2x = vertices[base + 6], v2y = vertices[base + 7], v2z = vertices[base + 8]

    // Edge vectors
    const e1x = v1x - v0x, e1y = v1y - v0y, e1z = v1z - v0z
    const e2x = v2x - v0x, e2y = v2y - v0y, e2z = v2z - v0z

    // Cross product
    let nx = e1y * e2z - e1z * e2y
    let ny = e1z * e2x - e1x * e2z
    let nz = e1x * e2y - e1y * e2x

    // Normalize
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
    if (len > 0) {
      nx /= len
      ny /= len
      nz /= len
    } else {
      // Degenerate triangle, default to up
      nx = 0
      ny = 1
      nz = 0
    }

    normals[i * 3] = nx
    normals[i * 3 + 1] = ny
    normals[i * 3 + 2] = nz
  }

  return normals
}

// K-means++ clustering of triangle centers
// Returns Uint16Array of cluster assignments (one per triangle)
export function kMeansClustering(centers, k, seed = 0, maxIterations = 20) {
  const n = centers.length / 3  // Number of triangles
  if (k >= n) {
    // Each triangle is its own cluster
    return new Uint16Array(n).map((_, i) => i)
  }

  const rand = seededRandom(seed)
  const assignments = new Uint16Array(n)
  const centroids = new Float32Array(k * 3)

  // K-means++ initialization: pick first centroid randomly
  const first = Math.floor(rand() * n)
  centroids[0] = centers[first * 3]
  centroids[1] = centers[first * 3 + 1]
  centroids[2] = centers[first * 3 + 2]

  // Pick remaining centroids with probability proportional to distance squared
  for (let c = 1; c < k; c++) {
    // Compute distances to nearest centroid for each point
    const distances = new Float32Array(n)
    let totalDist = 0

    for (let i = 0; i < n; i++) {
      let minDist = Infinity
      const px = centers[i * 3], py = centers[i * 3 + 1], pz = centers[i * 3 + 2]

      for (let j = 0; j < c; j++) {
        const dx = px - centroids[j * 3]
        const dy = py - centroids[j * 3 + 1]
        const dz = pz - centroids[j * 3 + 2]
        const dist = dx * dx + dy * dy + dz * dz
        if (dist < minDist) minDist = dist
      }

      distances[i] = minDist
      totalDist += minDist
    }

    // Pick next centroid with probability proportional to distance squared
    let target = rand() * totalDist
    let selected = 0
    for (let i = 0; i < n; i++) {
      target -= distances[i]
      if (target <= 0) {
        selected = i
        break
      }
    }

    centroids[c * 3] = centers[selected * 3]
    centroids[c * 3 + 1] = centers[selected * 3 + 1]
    centroids[c * 3 + 2] = centers[selected * 3 + 2]
  }

  // K-means iterations
  const counts = new Uint32Array(k)
  const sums = new Float32Array(k * 3)

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign each point to nearest centroid
    for (let i = 0; i < n; i++) {
      let minDist = Infinity
      let bestC = 0
      const px = centers[i * 3], py = centers[i * 3 + 1], pz = centers[i * 3 + 2]

      for (let c = 0; c < k; c++) {
        const dx = px - centroids[c * 3]
        const dy = py - centroids[c * 3 + 1]
        const dz = pz - centroids[c * 3 + 2]
        const dist = dx * dx + dy * dy + dz * dz
        if (dist < minDist) {
          minDist = dist
          bestC = c
        }
      }

      assignments[i] = bestC
    }

    // Update centroids
    counts.fill(0)
    sums.fill(0)

    for (let i = 0; i < n; i++) {
      const c = assignments[i]
      counts[c]++
      sums[c * 3] += centers[i * 3]
      sums[c * 3 + 1] += centers[i * 3 + 1]
      sums[c * 3 + 2] += centers[i * 3 + 2]
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        centroids[c * 3] = sums[c * 3] / counts[c]
        centroids[c * 3 + 1] = sums[c * 3 + 1] / counts[c]
        centroids[c * 3 + 2] = sums[c * 3 + 2] / counts[c]
      }
    }
  }

  return assignments
}

// Random assignment of triangles to clusters
export function randomClustering(triangleCount, k, seed = 0) {
  const rand = seededRandom(seed)
  const assignments = new Uint16Array(triangleCount)
  for (let i = 0; i < triangleCount; i++) {
    assignments[i] = Math.floor(rand() * k)
  }
  return assignments
}

// Compute fragment data from triangle clustering
// Returns object with per-vertex fragment attributes
export function computeFragmentData(vertices, triangleAssignments, options = {}) {
  const { shockOrigin = [0, 0, 0] } = options
  const triangleCount = triangleAssignments.length
  const vertexCount = triangleCount * 3

  // Compute triangle centers and normals
  const triCenters = computeTriangleCenters(vertices)
  const triNormals = computeTriangleNormals(vertices)

  // Find unique fragment IDs and compute fragment data
  const fragmentIds = new Set(triangleAssignments)
  const fragmentCount = fragmentIds.size

  // Compute fragment centers (average of member triangle centers)
  const fragmentCenterSums = new Map()
  const fragmentNormalSums = new Map()
  const fragmentCounts = new Map()

  for (const fid of fragmentIds) {
    fragmentCenterSums.set(fid, [0, 0, 0])
    fragmentNormalSums.set(fid, [0, 0, 0])
    fragmentCounts.set(fid, 0)
  }

  for (let i = 0; i < triangleCount; i++) {
    const fid = triangleAssignments[i]
    const center = fragmentCenterSums.get(fid)
    const normal = fragmentNormalSums.get(fid)
    center[0] += triCenters[i * 3]
    center[1] += triCenters[i * 3 + 1]
    center[2] += triCenters[i * 3 + 2]
    normal[0] += triNormals[i * 3]
    normal[1] += triNormals[i * 3 + 1]
    normal[2] += triNormals[i * 3 + 2]
    fragmentCounts.set(fid, fragmentCounts.get(fid) + 1)
  }

  // Normalize fragment centers and normals
  const fragmentCenters = new Map()
  const fragmentNormals = new Map()

  for (const fid of fragmentIds) {
    const count = fragmentCounts.get(fid)
    const center = fragmentCenterSums.get(fid)
    fragmentCenters.set(fid, [center[0] / count, center[1] / count, center[2] / count])

    const normal = fragmentNormalSums.get(fid)
    const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2)
    if (len > 0) {
      fragmentNormals.set(fid, [normal[0] / len, normal[1] / len, normal[2] / len])
    } else {
      fragmentNormals.set(fid, [0, 1, 0])
    }
  }

  // Generate per-fragment seeds
  const rand = seededRandom(42)
  const fragmentSeeds = new Map()
  for (const fid of fragmentIds) {
    fragmentSeeds.set(fid, rand())
  }

  // Build per-vertex arrays
  const outFragmentCenters = new Float32Array(vertexCount * 3)
  const outFragmentNormals = new Float32Array(vertexCount * 3)
  const outFragmentSeeds = new Float32Array(vertexCount)
  const outFragmentDistances = new Float32Array(vertexCount)

  for (let tri = 0; tri < triangleCount; tri++) {
    const fid = triangleAssignments[tri]
    const center = fragmentCenters.get(fid)
    const normal = fragmentNormals.get(fid)
    const seed = fragmentSeeds.get(fid)

    // Distance from fragment center to shock origin
    const dx = center[0] - shockOrigin[0]
    const dy = center[1] - shockOrigin[1]
    const dz = center[2] - shockOrigin[2]
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Store for all 3 vertices of this triangle
    for (let v = 0; v < 3; v++) {
      const vi = tri * 3 + v
      outFragmentCenters[vi * 3] = center[0]
      outFragmentCenters[vi * 3 + 1] = center[1]
      outFragmentCenters[vi * 3 + 2] = center[2]
      outFragmentNormals[vi * 3] = normal[0]
      outFragmentNormals[vi * 3 + 1] = normal[1]
      outFragmentNormals[vi * 3 + 2] = normal[2]
      outFragmentSeeds[vi] = seed
      outFragmentDistances[vi] = distance
    }
  }

  return {
    fragmentCenters: outFragmentCenters,
    fragmentNormals: outFragmentNormals,
    fragmentSeeds: outFragmentSeeds,
    fragmentDistances: outFragmentDistances,
    fragmentCount
  }
}
