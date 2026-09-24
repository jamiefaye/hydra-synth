import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pack, unpack, packedLength, sceneIn, sceneDump, ackIn, channelOf, sceneRequest, lampBytes, SCENE_BYTES, LED_MODE, EXTERNAL, INQUIRY } from './nano-sysex.js'

test('seven-bit packing round-trips a scene and takes 388 bytes on the wire', () => {
  const scene = Array.from({ length: SCENE_BYTES }, (_, i) => (i * 37 + 11) & 0xFF)
  const wire = pack(scene)
  assert.equal(wire.length, packedLength(SCENE_BYTES)); assert.equal(wire.length, 388)
  assert.ok(wire.every(b => b < 128))
  assert.deepEqual(unpack(wire), scene)
  assert.deepEqual(pack([0x80, 0x01]), [0x01, 0x00, 0x01])
})

test('a scene dump is recognised on its channel only, and comes back with the LED mode flipped', () => {
  const scene = Array.from({ length: SCENE_BYTES }, (_, i) => i & 0x7F)
  scene[0] = 3; scene[LED_MODE] = 0
  const frame = sceneDump(3, scene)
  assert.equal(frame[2], 0x43); assert.equal(frame.length, 13 + 388 + 1)
  assert.deepEqual(sceneIn(3, frame), scene)
  assert.equal(sceneIn(2, frame), null)
  const flipped = scene.slice(); flipped[LED_MODE] = EXTERNAL
  assert.deepEqual(sceneIn(3, sceneDump(3, flipped))[LED_MODE], 1)
  assert.throws(() => sceneDump(0, [1, 2, 3]), /339/)
})

test('inquiry reply, acknowledgement and lamps', () => {
  assert.equal(channelOf([0xF0, 0x7E, 0x05, 0x06, 0x02, 0x42, 0x13, 0x01, 0x00, 0x00, 0xF7]), 5)
  assert.equal(channelOf([0xF0, 0x7E, 0x05, 0x06, 0x02, 0x42, 0x11, 0x01, 0xF7]), null)
  assert.deepEqual(sceneRequest(0), [0xF0, 0x42, 0x40, 0x00, 0x01, 0x13, 0x00, 0x1F, 0x10, 0x00, 0xF7])
  assert.equal(ackIn(0, [0xF0, 0x42, 0x40, 0x00, 0x01, 0x13, 0x00, 0x5F, 0x23, 0x00, 0xF7]), true)
  assert.equal(ackIn(0, [0xF0, 0x42, 0x40, 0x00, 0x01, 0x13, 0x00, 0x5F, 0x24, 0x00, 0xF7]), false)
  assert.equal(ackIn(1, [0xF0, 0x42, 0x40, 0x00, 0x01, 0x13, 0x00, 0x5F, 0x23, 0x00, 0xF7]), null)
  assert.deepEqual(lampBytes(0, 32, true), [0xB0, 32, 127]); assert.deepEqual(lampBytes(2, 64, false), [0xB2, 64, 0])
  assert.equal(INQUIRY.length, 6)
})
