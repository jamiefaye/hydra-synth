/**
 * Frame ring helpers shared by the WebGL and WebGPU outputs.
 *
 * An output keeps `depth` frame buffers in a ring (2 = classic ping-pong). Each frame it
 * advances `index` and renders into ring[index]; ring[index - k] is the frame k frames ago,
 * valid for k = 1 .. depth - 1. src(o0.delay(k)) samples that frame; k may be a function
 * (e.g. a MIDI control) and is resolved every frame.
 */

export const MIN_DEPTH = 2
export const MAX_DEPTH = 256

export function normalizeDepth (depth) {
  const d = Math.round(Number(depth) || MIN_DEPTH)
  if (d < MIN_DEPTH || d > MAX_DEPTH) throw new Error(`frame ring depth ${depth} out of range ${MIN_DEPTH}..${MAX_DEPTH}`)
  return d
}

/** Ring slot for "k frames ago", clamped to the frames the ring actually holds. */
export function delayedIndex (index, depth, delay) {
  let k = typeof delay === 'function' ? delay() : delay
  k = Math.round(Number(k) || 1)
  if (k < 1) k = 1
  if (k > depth - 1) k = depth - 1
  return ((index - k) % depth + depth) % depth
}

/**
 * A texture-source proxy: anything that takes s0/o0 (src, blend, modulate, ...) accepts it.
 * `getTexture()` is what format-arguments calls each frame.
 */
export function makeDelayProxy (output, delay) {
  const proxy = {
    type: 'delay',
    output,
    delay,
    id: output.id,
    label: `${output.label || 'o' + output.id}.delay(${typeof delay === 'function' ? 'fn' : delay})`,
    getTexture: () => output.getTexture(delay),
    getCurrent: () => output.getTexture(delay)
  }
  return proxy
}
