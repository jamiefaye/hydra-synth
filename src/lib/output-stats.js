/**
 * Measuring an output: a luminance histogram and the few numbers a feedback loop is tuned by.
 *
 *   o0.measure()                          // start (o0.measure(false) stops); options below
 *   o0.stats.gain                         // this frame's mean light over the last measured frame's: the loop gain, measured
 *   osc(() => 10 * o0.stats.mean).out(o1) // readable from any parameter function, like a.fft
 *
 * What is measured is the light an output shows: rgb x alpha (alpha clamped to 0..1), as the blit to the canvas
 * shows it. Same API on both backends. WebGPU counts every `step`-th pixel in a compute pass and reads the counts
 * back without waiting (they arrive a frame or two late). WebGL has no compute: the output is drawn down to a
 * small grid (64 x 36 by default) and that is read and counted in JS, a sample of a couple of thousand pixels.
 *
 * stats: { enabled, bins (Float32Array, fractions summing to 1), max, mean, chroma, black, rail, gain, gainSmooth,
 *          chromaGain, count, frame }
 *   bins    luminance 0..max in equal steps, the last bin also holding everything above max
 *   mean    mean luminance; chroma: mean of (brightest channel - dimmest)
 *   black   fraction of pixels under `floor`; rail: fraction at or over `railAt`
 *   gain    mean / previous mean (1 when there is no light to compare); gainSmooth: the same, eased
 */

export const STATS_DEFAULTS = { bins: 64, max: 1, floor: 2 / 255, railAt: 0.98, step: 1, every: 1, grid: [64, 36], ease: 0.2 }
export const LUMA = [0.299, 0.587, 0.114]
export const SUM_SCALE = 512      // fixed point for the sums kept in u32 on the GPU
export const LUM_CEILING = 4      // luminance is clamped here before it is summed
export const EXTRA = 5            // after the bins: sumLum, sumChroma, black, rail, count

export function makeStats (opts = {}, isFloat = false) {
  const o = Object.assign({}, STATS_DEFAULTS, Object.fromEntries(Object.entries(opts || {}).filter(([, v]) => v !== undefined)))
  if (opts.max === undefined && isFloat) o.max = 2   // float outputs carry light past 1: show the headroom
  if (opts.railAt === undefined) o.railAt = 0.98 * o.max
  o.bins = Math.max(2, Math.min(1024, Math.round(o.bins)))
  return {
    enabled: true, options: o, bins: new Float32Array(o.bins), max: o.max,
    mean: 0, chroma: 0, black: 0, rail: 0, gain: 1, gainSmooth: 1, chromaGain: 1, count: 0, frame: 0
  }
}

/** Raw counts -> stats. counts: bins then sumLum, sumChroma (both x SUM_SCALE), black, rail, count. */
export function finishStats (stats, counts) {
  const n = stats.options.bins, count = counts[n + 4]
  if (!count) return stats
  const prevMean = stats.mean, prevChroma = stats.chroma
  for (let i = 0; i < n; i++) stats.bins[i] = counts[i] / count
  stats.mean = counts[n] / SUM_SCALE / count
  stats.chroma = counts[n + 1] / SUM_SCALE / count
  stats.black = counts[n + 2] / count
  stats.rail = counts[n + 3] / count
  stats.count = count
  stats.gain = (stats.frame > 0 && prevMean > 1e-4) ? stats.mean / prevMean : 1
  stats.chromaGain = (stats.frame > 0 && prevChroma > 1e-4) ? stats.chroma / prevChroma : 1
  stats.gainSmooth += (stats.gain - stats.gainSmooth) * stats.options.ease
  stats.frame++
  return stats
}

/** Count rgba samples (Float32Array or Uint8Array scaled by `scale`) on the CPU: the WebGL path and the tests. */
export function countSamples (stats, data, scale = 1) {
  const o = stats.options, n = o.bins, counts = new Float64Array(n + EXTRA)
  for (let i = 0; i + 3 < data.length; i += 4) {
    const a = Math.min(Math.max(data[i + 3] * scale, 0), 1)
    const r = data[i] * scale * a, g = data[i + 1] * scale * a, b = data[i + 2] * scale * a
    const lum = Math.min(Math.max(LUMA[0] * r + LUMA[1] * g + LUMA[2] * b, 0), LUM_CEILING)
    counts[Math.min(n - 1, Math.floor(lum / o.max * n))]++
    counts[n] += lum * SUM_SCALE
    counts[n + 1] += Math.min(Math.max(Math.max(r, g, b) - Math.min(r, g, b), 0), LUM_CEILING) * SUM_SCALE
    if (lum < o.floor) counts[n + 2]++
    if (lum >= o.railAt) counts[n + 3]++
    counts[n + 4]++
  }
  return counts
}

/**
 * WebGL: draw the output down to a small grid and count that. Called by the frame loop after the outputs
 * have drawn. The grid is the output's own kind (half float or uint8), so light past 1 is measured too.
 */
export function measureGl (output) {
  const stats = output.stats
  if (!stats || !stats.enabled || !output.regl) return
  stats._tick = (stats._tick || 0) + 1
  if (stats._tick % Math.max(1, stats.options.every)) return
  const regl = output.regl, [w, h] = stats.options.grid, isFloat = !!output.float
  let m = output._measure
  if (!m || m.regl !== regl || m.w !== w || m.h !== h || m.isFloat !== isFloat) {
    if (m && m.fbo) { try { m.fbo.destroy() } catch (e) { /* already gone with its regl */ } }
    m = output._measure = { regl, w, h, isFloat }
    m.fbo = regl.framebuffer({ color: regl.texture({ width: w, height: h, format: 'rgba', type: isFloat ? 'half float' : 'uint8', mag: 'nearest', min: 'nearest' }), depthStencil: false })
    m.draw = regl({
      frag: 'precision highp float; uniform sampler2D tex; varying vec2 uv; void main () { gl_FragColor = texture2D(tex, uv); }',
      vert: 'precision highp float; attribute vec2 position; varying vec2 uv; void main () { uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }',
      attributes: { position: [[-1, -1], [3, -1], [-1, 3]] },
      uniforms: { tex: regl.prop('tex') },
      count: 3, depth: { enable: false }, blend: { enable: false }, framebuffer: m.fbo
    })
    m.bytes = new Uint8Array(w * h * 4); m.floats = new Float32Array(w * h * 4)
  }
  m.draw({ tex: output.getCurrent() })
  if (!isFloat) {
    regl.read({ framebuffer: m.fbo, data: m.bytes })
    finishStats(stats, countSamples(stats, m.bytes, 1 / 255))
    return
  }
  // half float: regl.read only knows uint8 and float, so read by hand (bound by hand: regl binds lazily)
  const gl = regl._gl
  gl.bindFramebuffer(gl.FRAMEBUFFER, m.fbo._framebuffer.framebuffer)
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, m.floats)
  const ok = gl.getError() === gl.NO_ERROR
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); regl._refresh()
  if (ok) finishStats(stats, countSamples(stats, m.floats, 1))
}

/** The method both kinds of output get. */
export function measureMethod (opts) {
  if (opts === false) { if (this.stats) this.stats.enabled = false; return this }
  this.stats = makeStats(opts === true ? {} : opts, !!this.float || /16float/.test(this._textureDescriptor ? this._textureDescriptor.format : ''))
  return this
}
