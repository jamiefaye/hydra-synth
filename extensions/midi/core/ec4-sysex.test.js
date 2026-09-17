import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Ec4Image, encodeDump, parseDump, normalizeName, MEMORY_SIZE } from './ec4-sysex.js'

test('names are 4 chars from the EC4 character set', () => {
  assert.equal(normalizeName('GAIN'), 'GAIN')
  assert.equal(normalizeName('rot'), 'rot ')
  assert.equal(normalizeName('x/y-.'), 'x/y-')
  assert.throws(() => normalizeName('bad!'), /only 0-9/)
})

test('blank image has default names and factory-like encoders', () => {
  const img = Ec4Image.blank()
  assert.equal(img.getSetupName(1), 'SE01')
  assert.equal(img.getGroupName(3, 12), 'GR12')
  const e = img.getEncoder(1, 1, 5)
  assert.equal(e.name, 'EC05'); assert.equal(e.type, 'CCab'); assert.equal(e.number, 4); assert.equal(e.upper, 127)
})

test('encoder settings round-trip through the bit fields', () => {
  const img = Ec4Image.blank()
  img.setEncoder(1, 2, 3, { type: 'CCR2', channel: 7, number: 18, mode: 'Acc1', scale: '+-63', lower: 5, upper: 4095, name: 'ROT', link: true,
    push: { type: 'Note', channel: 7, number: 18, mode: 1, display: 1, lower: 0, upper: 127, link: 0 } })
  const e = img.getEncoder(1, 2, 3)
  assert.equal(e.type, 'CCR2'); assert.equal(e.channel, 7); assert.equal(e.number, 18); assert.equal(e.link, true)
  assert.equal(e.mode, 'Acc1'); assert.equal(e.scale, '+-63'); assert.equal(e.lower, 5); assert.equal(e.upper, 4095)
  assert.equal(e.name, 'ROT '); assert.equal(e.push.type, 'Note'); assert.equal(e.push.channel, 7); assert.equal(e.push.number, 18)
  assert.equal(e.push.mode, 1); assert.equal(e.push.display, 1); assert.equal(e.push.upper, 127)
  // neighbours untouched
  assert.equal(img.getEncoder(1, 2, 2).name, 'EC02'); assert.equal(img.getEncoder(1, 2, 4).type, 'CCab')
  assert.throws(() => img.setEncoder(1, 1, 1, { type: 'CCXX' }), /type "CCXX"/)
  assert.throws(() => img.getEncoder(0, 1, 1), /out of range/)
})

test('labelGroup accepts names or settings per encoder', () => {
  const img = Ec4Image.blank()
  img.labelGroup(1, 1, { 1: 'GAIN', 2: { name: 'ROT', type: 'CCR2' } })
  assert.equal(img.getEncoderName(1, 1, 1), 'GAIN')
  assert.equal(img.getEncoder(1, 1, 2).type, 'CCR2')
  assert.match(img.describeGroup(1, 1), /1 "GAIN" CCab ch1 #0 Acc0/)
})

test('encode -> parse round-trips the whole image with valid CRCs', () => {
  const img = Ec4Image.blank()
  img.setSetupName(2, 'HERD').setGroupName(2, 1, 'CAM').setEncoder(2, 1, 1, { type: 'CCR2', name: 'ZOOM' })
  for (let i = 0; i < MEMORY_SIZE; i += 97) img.data[i] ^= (i * 31) & 0xff   // scribble to exercise every nibble
  const bytes = encodeDump(img, { version: [2, 4] })
  assert.equal(bytes[0], 0xf0); assert.equal(bytes.at(-1), 0xf7)
  assert.equal(bytes.length, 16 + (MEMORY_SIZE / 64) * (6 + 64 * 3 + 6 + 30) + 4)
  const back = parseDump(bytes)
  assert.deepEqual(Array.from(back.data), Array.from(img.data))
  assert.equal(back.version, 2.4); assert.equal(back.pages, MEMORY_SIZE / 64)
  assert.equal(back.getSetupName(2), 'HERD')
  // corrupt one data nibble in the setup-names page (non-zero data) -> CRC failure
  const namesPage = Math.floor((0x1bc0 - 0x0b00) / 64)
  const pageStart = 16 + namesPage * (6 + 64 * 3 + 6 + 30)
  const bad = Uint8Array.from(bytes); bad[pageStart + 6 + 1] ^= 0x01
  assert.throws(() => parseDump(bad), /CRC/)
  assert.throws(() => parseDump(Uint8Array.from([0xf0, 0, 0, 0, 0x41, 0x20, 0x12, 0x4f, 0x20, 0x12, 0xf7])), /device id 2/)
})
