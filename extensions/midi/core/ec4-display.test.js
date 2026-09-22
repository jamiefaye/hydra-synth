import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fit, normalizeNames, namesBytes, clearNamesBytes, screenBytes, hideScreenBytes, selectBytes, parseSelect, Ec4Labels, labelsFromControls, EC4_HEAD } from './ec4-display.js'
import { Controller } from './controller.js'
import { parm, ec4 } from './profiles.js'

const hex = (b) => b.map(x => x.toString(16).padStart(2, '0')).join(' ')

test('fit pads, cuts and keeps to printable ASCII', () => {
  assert.equal(fit('GAIN', 4), 'GAIN'); assert.equal(fit('ab', 4), 'ab  '); assert.equal(fit('FREQUENCY', 4), 'FREQ')
  assert.equal(fit('aéb\n', 4), 'a b ')
  assert.equal(fit(undefined, 3), '   ')
})

test('normalizeNames: array or 1-based map, holes are the device blank', () => {
  const a = normalizeNames(['LIVE', 'OLED'])
  assert.equal(a.length, 16); assert.equal(a[0], 'LIVE'); assert.equal(a[2], '----'); assert.equal(a[15], '----')
  const m = normalizeNames({ 3: 'X', 16: 'END', 17: 'no' })
  assert.equal(m[2], 'X   '); assert.equal(m[15], 'END '); assert.equal(m[0], '----')
})

test('names write is the Live script message: header, cmd 10, offset 0, 64 chars as 4D nibbles', () => {
  const b = namesBytes(['LIVE'])
  assert.equal(b.length, 7 + 3 + 3 + 64 * 3 + 1)
  assert.equal(hex(b.slice(0, 13)), 'f0 00 00 00 4e 2c 1b 4e 22 10 4a 20 10')
  assert.equal(hex(b.slice(13, 19)), '4d 24 1c 4d 24 19')   // 'L' = 0x4C, 'I' = 0x49
  assert.equal(hex(b.slice(25, 28)), '4d 22 1d')            // encoder 2 starts with '-'
  assert.equal(b.at(-1), 0xf7)
  assert.deepEqual(clearNamesBytes().slice(13, 16), [0x4d, 0x22, 0x1d])
})

test('screen write covers 4 x 20 and hide is the bare command', () => {
  const b = screenBytes('HELLO\nWORLD')
  assert.equal(b.length, 7 + 3 + 3 + 80 * 3 + 3 + 1)
  assert.equal(hex(b.slice(-4)), '4e 22 14 f7')           // write, then show
  assert.equal(hex(b.slice(7, 13)), '4e 22 13 4a 20 10')
  assert.equal(hex(b.slice(13, 16)), '4d 24 18')             // 'H'
  assert.equal(hex(b.slice(13 + 20 * 3, 16 + 20 * 3)), '4d 25 17')   // row 2 starts with 'W'
  assert.equal(hex(b.slice(13 + 40 * 3, 16 + 40 * 3)), '4d 22 10')   // row 3 blank
  assert.equal(hex(screenBytes(['a', 'b', 'c', 'd', 'e']).slice(13 + 60 * 3, 16 + 60 * 3)), '4d 26 14')   // row 4 'd', row 5 dropped
  assert.equal(hex(hideScreenBytes()), hex([...EC4_HEAD, 0x4e, 0x22, 0x15, 0xf7]))
})

test('select bytes and parse are inverses, 1-based', () => {
  const b = selectBytes(14, 3)
  assert.equal(hex(b.slice(7)), '4e 28 1d 4e 24 12 f7')
  assert.deepEqual(parseSelect(b), { setup: 14, group: 3 })
  assert.equal(parseSelect([0xf0, 0, 0, 0, 0x4e, 0x2c, 0x1b, 0xf7]), null)   // the ack
})

test('Ec4Labels: replace with an array, merge with a map, clear by setup', () => {
  const l = new Ec4Labels()
  l.set(14, 1, ['A', 'B']).set(14, 1, { 3: 'C' }).set(14, 2, { 16: 'Z' }).set(1, 5, ['H'])
  assert.deepEqual(l.get(14, 1).slice(0, 4), ['A   ', 'B   ', 'C   ', '----'])
  assert.deepEqual(l.groups(14), [1, 2]); assert.deepEqual(l.groups(1), [5])
  l.set(14, 1, ['ONLY'])
  assert.equal(l.get(14, 1)[1], '----')
  l.clear(14)
  assert.equal(l.get(14, 1), null); assert.equal(l.get(1, 5)[0], 'H   ')
  l.clear(); assert.equal(l.get(1, 5), null)
})

test('labelsFromControls: label option, profile name fallback, aliases, foreign channels ignored', () => {
  const c = new Controller({ profile: parm })
  c.names({ gain: [2, 1], rot: [2, 2] })
  c.cc([1, 1], { min: 0, max: 1, init: 0, label: 'FREQ' })
  c.cc([1, 16], { min: 0, max: 1, init: 0, label: 'LASTONE' })
  c.cc('gain', 0, 1, 0)                         // no label: the profile name
  c.cc('rot', { min: 0, max: 1, init: 0, label: 'ROT' })
  c.alias([3, 4], [1, 1])                       // FREQ appears on group 3 too
  c.cc(7, { min: 0, max: 1, init: 0, channel: 2, label: 'NOPE' })   // not this device's channel
  const l = labelsFromControls(c, 14)
  assert.deepEqual(l.groups(14), [1, 2, 3])
  assert.equal(l.get(14, 1)[0], 'FREQ'); assert.equal(l.get(14, 1)[15], 'LAST'); assert.equal(l.get(14, 1)[1], '----')
  assert.equal(l.get(14, 2)[0], 'gain'); assert.equal(l.get(14, 2)[1], 'ROT ')
  assert.equal(l.get(14, 3)[3], 'FREQ')
  assert.deepEqual(labelsFromControls(new Controller({ mode: 'abs' }), 1).groups(1), [])
  assert.deepEqual(ec4.locate(63, 1), [4, 16]); assert.equal(ec4.locate(63, 14), null)
})
