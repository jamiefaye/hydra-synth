// Hyperspace Starfield Demo
// 3D starfield with acceleration into hyperspace, looping journey
//
// Usage on hydra.ojack.xyz:
// const ext = await import('https://www.fentonia.com/hydra-extensions/vertex-webgpu/index.js')
// await ext.replaceHydra()
// Then paste this code

// === Configuration ===
const STAR_COUNT = 600
const FIELD_WIDTH = 5
const FIELD_DEPTH = 10

// === Generate random star positions ===
const starPositions = new Float32Array(STAR_COUNT * 3)
for (let i = 0; i < STAR_COUNT; i++) {
  // Cylindrical distribution (denser toward center)
  const angle = Math.random() * Math.PI * 2
  const radius = Math.pow(Math.random(), 0.5) * FIELD_WIDTH / 2
  starPositions[i * 3]     = Math.cos(angle) * radius
  starPositions[i * 3 + 1] = Math.sin(angle) * radius
  starPositions[i * 3 + 2] = Math.random() * FIELD_DEPTH
}

// === Hyperspace cycle timing ===
// 16-second cycle:
//   0-4s:  cruise (speed=1)
//   4-6s:  accelerate
//   6-10s: hyperspace (speed=9)
//   10-12s: decelerate
//   12-16s: cruise in "new" starfield

// Speed ramps up and down with smoothstep
// speed = 1 + 8 * (rampUp - rampDown)
const speedUp = "smoothstep(4.0, 6.0, mod(time, 16.0))"
const speedDown = "smoothstep(10.0, 12.0, mod(time, 16.0))"

// === Shader expressions ===

// Z position: loops with time, offset by instance index
// floor(time/16) shifts pattern for "different starfield" after each jump
const zExpr = "mod(_ix * 0.5 + floor(time / 16.0) * 7.0 + time * (1.0 + 8.0 * (" + speedUp + " - " + speedDown + ")), 10.0) - 5.0"

// Trail stretch during hyperspace (for line geometry)
const stretchExpr = "0.02 + 0.4 * (" + speedUp + " - " + speedDown + ")"

// Star brightness: fade with distance, boost during hyperspace
const brightExpr = "0.5 + 0.5 * (" + speedUp + " - " + speedDown + ")"

// === Render ===

// Background: dark blue, brightens during hyperspace
solid(0.0, 0.0, 0.05)
  .brightness("0.3 * (" + speedUp + " - " + speedDown + ")")
  .out(o0)

// Stars as small quads with instancing
// For trails: switch to line geometry (see below)
solid(1, 1, 1)
  .brightness(brightExpr)
  .out(o0,
    quad(0.006, 0.006)
      .instances(starPositions)
      .translate(0, 0, zExpr)
      .perspective(60)
  , 1)

// === Alternative: Line geometry for trails ===
// Uncomment below and comment out the quad version above
/*
// Line: 2 vertices stretched along Z
const lineVerts = [0, 0, 0,  0, 0, 1]
const starLines = new VertexSource(lineVerts)
  .instances(starPositions)

solid(1, 1, 1)
  .brightness(brightExpr)
  .out(o0,
    starLines
      .translate(0, 0, zExpr)
      .scale(0.003, 0.003, stretchExpr)
      .perspective(60)
  , 1)
*/
