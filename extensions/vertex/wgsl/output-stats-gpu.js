// WebGPU side of src/lib/output-stats.js: one compute dispatch per measured output, recorded into the frame's own
// command encoder; thousands of invocations bump atomic counters at once. The counts are copied to one of a few
// staging buffers and mapped without waiting, so they reach JS a frame or two late and never hold a frame up.
import { finishStats, LUMA, SUM_SCALE, LUM_CEILING, EXTRA } from '../../../src/lib/output-stats.js'

const WGSL = `
struct P { width: u32, height: u32, step: u32, bins: u32, maxv: f32, floorv: f32, railAt: f32, pad: f32 };
@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> H: array<atomic<u32>>;
@group(0) @binding(2) var<uniform> p: P;
@compute @workgroup_size(8, 8)
fn main (@builtin(global_invocation_id) id: vec3<u32>) {
  let xy = id.xy * p.step;
  if (xy.x >= p.width || xy.y >= p.height) { return; }
  let c = textureLoad(tex, vec2<i32>(xy), 0);
  let rgb = c.rgb * clamp(c.a, 0.0, 1.0);   // the light shown, as the blit to the canvas shows it
  let lum = clamp(dot(rgb, vec3<f32>(${LUMA.join(', ')})), 0.0, ${LUM_CEILING.toFixed(1)});
  let chroma = clamp(max(rgb.r, max(rgb.g, rgb.b)) - min(rgb.r, min(rgb.g, rgb.b)), 0.0, ${LUM_CEILING.toFixed(1)});
  let bin = min(p.bins - 1u, u32(lum / p.maxv * f32(p.bins)));
  atomicAdd(&H[bin], 1u);
  atomicAdd(&H[p.bins], u32(lum * ${SUM_SCALE.toFixed(1)}));
  atomicAdd(&H[p.bins + 1u], u32(chroma * ${SUM_SCALE.toFixed(1)}));
  if (lum < p.floorv) { atomicAdd(&H[p.bins + 2u], 1u); }
  if (lum >= p.railAt) { atomicAdd(&H[p.bins + 3u], 1u); }
  atomicAdd(&H[p.bins + 4u], 1u);
}`

const STAGING = 3

export class GpuStats {
  constructor (device) {
    this.device = device
    this.pipeline = device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code: WGSL }), entryPoint: 'main' } })
    this.per = new Map()   // output -> { bins, counts, params, staging: [{ buf, busy }] }
  }

  _for (out) {
    const n = out.stats.options.bins
    let r = this.per.get(out)
    if (r && r.bins === n) return r
    if (r) this._free(r)
    const size = (n + EXTRA) * 4
    r = {
      bins: n, size,
      counts: this.device.createBuffer({ size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
      params: this.device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
      staging: Array.from({ length: STAGING }, () => ({ buf: this.device.createBuffer({ size, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }), busy: false }))
    }
    this.per.set(out, r)
    return r
  }

  _free (r) { for (const b of [r.counts, r.params, ...r.staging.map(s => s.buf)]) { try { b.destroy() } catch (e) { /* gone */ } } }

  /** Record the measuring of every output that asked for it. Returns what read() needs after the submit. */
  encode (commandEncoder, outputs) {
    const pending = []
    for (const out of outputs) {
      const stats = out && out.stats
      if (!stats || !stats.enabled || !out.textures) continue
      stats._tick = (stats._tick || 0) + 1
      if (stats._tick % Math.max(1, stats.options.every)) continue
      const r = this._for(out), slot = r.staging.find(s => !s.busy)
      if (!slot) continue   // every staging buffer still on its way back: skip this frame rather than wait
      const tex = out.getCurrentTexture(), o = stats.options
      // keep the fixed-point sums inside a u32: at most about a million samples
      let step = Math.max(1, Math.round(o.step))
      while ((tex.width / step) * (tex.height / step) > (1 << 20)) step++
      const ab = new ArrayBuffer(32), u = new Uint32Array(ab), f = new Float32Array(ab)
      u[0] = tex.width; u[1] = tex.height; u[2] = step; u[3] = r.bins; f[4] = o.max; f[5] = o.floor; f[6] = o.railAt
      this.device.queue.writeBuffer(r.params, 0, ab)
      commandEncoder.clearBuffer(r.counts)
      const pass = commandEncoder.beginComputePass({ label: 'output stats' })
      pass.setPipeline(this.pipeline)
      pass.setBindGroup(0, this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: tex.createView() }, { binding: 1, resource: { buffer: r.counts } }, { binding: 2, resource: { buffer: r.params } }]
      }))
      pass.dispatchWorkgroups(Math.ceil(tex.width / step / 8), Math.ceil(tex.height / step / 8))
      pass.end()
      commandEncoder.copyBufferToBuffer(r.counts, 0, slot.buf, 0, r.size)
      slot.busy = true
      pending.push({ stats, slot, n: r.bins })
    }
    return pending
  }

  /** After queue.submit: map each staging buffer, not awaited by the frame. */
  read (pending) {
    for (const { stats, slot, n } of pending) {
      slot.buf.mapAsync(GPUMapMode.READ).then(() => {
        const counts = Array.from(new Uint32Array(slot.buf.getMappedRange(), 0, n + EXTRA))
        slot.buf.unmap(); slot.busy = false
        finishStats(stats, counts)
      }).catch(() => { slot.busy = false })
    }
  }
}
