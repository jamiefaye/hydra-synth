/**
 * Korg nanoKONTROL2 over sysex: the handshake that lets a host light its buttons.
 *
 * The surface ships in LED Mode Internal, where a button lights only while it is held and
 * ignores the host. The one supported way to change that is Korg's editor, so a host does what
 * the editor does: ask the surface which channel it is on (a universal device inquiry, the only
 * message that needs no channel), ask for the scene it is playing, flip the LED-mode byte to
 * External, hand the scene back and wait for the acknowledgement. Nothing is written to flash,
 * so a replug is the surface as its owner set it; the host puts Internal back on the way out.
 * Ported from lightherder (src/lamps.rs), verified there against the device.
 *
 * Bytes: inquiry F0 7E 7F 06 01 F7, answered F0 7E 0c 06 02 42 13 01 .. (c = channel, 0-based)
 *   scene request  F0 42 4c 00 01 13 00 1F 10 00 F7
 *   scene, both ways  F0 42 4c 00 01 13 00 7F 7F 02 03 05 40 <388 packed bytes> F7  (339 decoded)
 *   acknowledgement   F0 42 4c 00 01 13 00 5F 23 00 F7   (24 in place of 23 = refused)
 * In a decoded scene byte 0 is the global channel and byte 2 the LED mode (0 internal, 1 external).
 * In External mode a lamp is a control change on the global channel, the button's own number,
 * 127 lit and 0 dark.
 */

export const KORG = 0x42
export const NANO_KONTROL2 = [0x13, 0x01]
export const INQUIRY = [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]
export const SCENE_BYTES = 339
export const GLOBAL_CHANNEL = 0
export const LED_MODE = 2
export const INTERNAL = 0
export const EXTERNAL = 1

/** The global channel (0-based) out of a device-inquiry reply from a nanoKONTROL2, else null. */
export function channelOf (frame) {
  if (!frame || frame.length < 8 || frame[0] !== 0xF0 || frame[1] !== 0x7E) return null
  if (frame[3] !== 0x06 || frame[4] !== 0x02 || frame[5] !== KORG || frame[6] !== NANO_KONTROL2[0] || frame[7] !== NANO_KONTROL2[1]) return null
  return frame[2] & 0x0F
}

const head = (channel) => [0xF0, KORG, 0x40 | (channel & 0x0F), 0x00, 0x01, 0x13, 0x00, 0x7F, 0x7F, 0x02, 0x03, 0x05, 0x40]

/** "Send me the scene you are playing." */
export function sceneRequest (channel) {
  return [0xF0, KORG, 0x40 | (channel & 0x0F), 0x00, 0x01, 0x13, 0x00, 0x1F, 0x10, 0x00, 0xF7]
}

/** Seven data bytes ride as eight: a byte of their top bits (least significant first), then the bodies. */
export function pack (data) {
  const out = []
  for (let i = 0; i < data.length; i += 7) {
    const group = data.slice(i, i + 7)
    out.push(group.reduce((top, byte, j) => top | ((byte >> 7) << j), 0))
    for (const byte of group) out.push(byte & 0x7F)
  }
  return out
}

export function unpack (wire) {
  const out = []
  for (let i = 0; i < wire.length; i += 8) {
    const top = wire[i]
    for (let j = 1; j < 8 && i + j < wire.length; j++) out.push((wire[i + j] & 0x7F) | (((top >> (j - 1)) & 1) << 7))
  }
  return out
}

export const packedLength = (len) => len + Math.ceil(len / 7)

/** The decoded scene inside a dump from the surface on `channel`, or null for any other frame. */
export function sceneIn (channel, frame) {
  const h = head(channel)
  if (!frame || frame.length !== h.length + packedLength(SCENE_BYTES) + 1 || frame[frame.length - 1] !== 0xF7) return null
  for (let i = 0; i < h.length; i++) if (frame[i] !== h[i]) return null
  const scene = unpack(frame.slice(h.length, frame.length - 1))
  return scene.length === SCENE_BYTES ? scene : null
}

/** A scene on its way back to the surface. */
export function sceneDump (channel, scene) {
  if (!scene || scene.length !== SCENE_BYTES) throw new Error(`nano: a scene is ${SCENE_BYTES} bytes`)
  return [...head(channel), ...pack(scene), 0xF7]
}

/** true for the surface's acknowledgement of a scene, false for its refusal, null for anything else. */
export function ackIn (channel, frame) {
  const h = [0xF0, KORG, 0x40 | (channel & 0x0F), 0x00, 0x01, 0x13, 0x00, 0x5F]
  if (!frame || frame.length !== 11 || frame[9] !== 0x00 || frame[10] !== 0xF7) return null
  for (let i = 0; i < h.length; i++) if (frame[i] !== h[i]) return null
  return frame[8] === 0x23 ? true : frame[8] === 0x24 ? false : null
}

/** A lamp on the surface in External mode: the button's own control number, lit or dark. */
export function lampBytes (channel, number, lit) {
  return [0xB0 | (channel & 0x0F), number & 0x7F, lit ? 127 : 0]
}
