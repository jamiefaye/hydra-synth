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

// Trail length expression: small during cruise, longer during hyperspace
const trailLen = "1.0 + 12.0 * (" + speedUp + " - " + speedDown + ")"

// Radial angle: atan2(y, x) + 90° so +Y points toward center
const radialAngle = "atan(instanceOffset.y, instanceOffset.x) + 1.5708"

// Stars as quads - thin, stretched into trails during hyperspace
// Order matters: scale first (in local coords), then rotate to point at center
solid(1, 1, 1)
  .out(o0,
    quad(0.003, 0.01)             // thin base shape
      .instances(starPositions)
      .translate(0, 0, zExpr)
      .scale(1, trailLen, 1)      // stretch into trail (local Y)
      .rotateZ(radialAngle)       // then rotate to point toward center
      .perspective(60)
  , 1)

// === Alternative: Trail geometry (thin quad along Z) ===
// Uncomment below and comment out the quad version above
/*
// Thin quad along Z axis (2 triangles)
const t = 0.003  // half-thickness
const trailVerts = new Float32Array([
  -t, 0, 0,   t, 0, 0,   t, 0, 1,   // tri 1
  -t, 0, 0,   t, 0, 1,  -t, 0, 1    // tri 2
])
const starTrails = new VertexSource(trailVerts)
  .instances(starPositions)

solid(1, 1, 1)
  .brightness(brightExpr)
  .out(o0,
    starTrails
      .translate(0, 0, zExpr)
      .scale(1, 1, stretchExpr)
      .perspective(60)
  , 1)
*/
