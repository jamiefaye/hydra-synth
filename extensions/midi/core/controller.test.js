import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Controller } from './controller.js'
import { ec4, generic, xl3, resolveControl } from './profiles.js'
import { connectVirtual } from '../adapters/virtual.js'

const cc = (ch, n, v) => [0xB0 | (ch - 1), n, v]

test('ec4 profile addresses encoders by group and number', () => {
  assert.deepEqual(ec4.encoder(1, 1), { number: 0, channel: 1 })
  assert.deepEqual(ec4.encoder(4, 16), { number: 63, channel: 1 })
  assert.deepEqual(ec4.push(2, 3), { note: 18, channel: 1 })
  assert.deepEqual(resolveControl(ec4, [3, 1]), { number: 32, channel: 1 })
  assert.deepEqual(resolveControl(ec4, 5), { number: 5, channel: 1 })
  assert.throws(() => resolveControl(ec4, 'gain'), /unknown control name/)
  assert.throws(() => resolveControl(null, [1, 1]), /need a profile/)
})

test('controller with profile: names, [group, n] ids, device defaults', () => {
  const c = new Controller({ profile: ec4, steps: 10 })
  c.names({ gain: [1, 1], rot: [1, 2] })
  const gain = c.cc('gain', 0, 2, 1)
  const rot = c.cc([1, 2], { min: 0, max: 360, wrap: true })
  const push = c.note('gain', { toggle: true })
  assert.equal(c.state.defaults.mode, 'r2')
  c.handleMessage(cc(1, 0, 65)); assert.equal(gain().toFixed(1), '1.2')
  c.handleMessage(cc(2, 0, 65)); assert.equal(gain().toFixed(1), '1.2')   // wrong channel ignored
  c.handleMessage(cc(1, 1, 63)); assert.equal(rot(), 324)
  c.handleMessage([0x90, 0, 100]); assert.equal(push(), 1)
})

test('generic profile: plain CC numbers, absolute, any channel', () => {
  const c = new Controller({ profile: generic })
  const f = c.cc(7, 0, 10)
  c.handleMessage(cc(9, 7, 127)); assert.equal(f(), 10)
})

test('feedback goes out through the transport and refresh resends everything', () => {
  const c = new Controller({ profile: ec4, steps: 4 })
  const t = connectVirtual(c)
  const f = c.cc([1, 1], 0, 1, 0)
  const g = c.cc([1, 2], 0, 1, 0.5)
  t.sent.length = 0
  c.handleMessage(cc(1, 0, 65))
  assert.deepEqual(t.sent, [[0xB0, 0, 32]])                 // pos 0.25 -> 32
  f.set(1)
  assert.deepEqual(t.sent.at(-1), [0xB0, 0, 127])
  t.sent.length = 0
  c.refresh()
  assert.deepEqual(t.sent.sort((a, b) => a[1] - b[1]), [[0xB0, 0, 127], [0xB0, 1, 64]])
  const quiet = new Controller({ profile: ec4, feedback: false })
  const tq = connectVirtual(quiet)
  quiet.cc([1, 1], 0, 1, 0); quiet.handleMessage(cc(1, 0, 65))
  assert.equal(tq.sent.length, 0)
})

test('no profile: numeric ids still work, [group, n] does not', () => {
  const c = new Controller({ mode: 'abs' })
  const f = c.cc(3, 0, 1)
  c.handleMessage(cc(5, 3, 127)); assert.equal(f(), 1)
  assert.throws(() => c.cc([1, 1], 0, 1), /need a profile/)
})

test('undefined options do not erase defaults (regression: NaN steps)', () => {
  const c = new Controller({ mode: undefined, steps: undefined, profile: ec4 })
  const f = c.cc(5, { min: 0, max: 1, init: 0, curve: undefined })
  c.handleMessage(cc(1, 5, 65))
  assert.equal(c.state.defaults.steps, 64)
  assert.ok(Math.abs(f() - 1 / 64) < 1e-9)
})

test('alias: one control on two encoders, both turn it and both displays follow', () => {
  const c = new Controller({ profile: ec4, steps: 4 })
  const t = connectVirtual(c)
  const gain = c.cc([1, 1], { min: 0, max: 1, init: 0, fine: 2 })
  const play = c.alias([7, 1], [1, 1])
  assert.equal(play.number, 96)
  t.sent.length = 0
  c.handleMessage(cc(1, 0, 65)); assert.equal(gain(), 0.25); assert.equal(play(), 0.25)
  assert.deepEqual(t.sent.sort((a, b) => a[1] - b[1]), [[0xB0, 0, 32], [0xB0, 96, 32]])
  t.sent.length = 0
  c.handleMessage(cc(1, 96, 65)); assert.equal(gain(), 0.5)
  assert.deepEqual(t.sent.sort((a, b) => a[1] - b[1]), [[0xB0, 0, 64], [0xB0, 96, 64]])
  // the alias's push is the fine push too
  c.handleMessage([0x90, 96, 100]); c.handleMessage(cc(1, 0, 65)); c.handleMessage([0x80, 96, 0])
  assert.equal(gain(), 0.625)
  // snapshot has one entry, refresh reaches both places, a taken cc is refused
  assert.deepEqual(Object.keys(c.snapshot()), ['1:0'])
  t.sent.length = 0; c.refresh()
  assert.deepEqual(t.sent.map(m => m[1]).sort((a, b) => a - b), [0, 96])
  c.cc([1, 2], 0, 1, 0)
  assert.throws(() => c.alias([1, 2], [1, 1]), /already has a control/)
  assert.throws(() => c.alias([7, 3], [4, 9]), /no control/)
})

test('ec4 display: labels follow registrations, go out on connect and group change, only for the group on screen', async () => {
  const { ec4Tools } = await import('../adapters/sysex.js')
  const { parm } = await import('./profiles.js')
  const c = new Controller({ profile: parm, feedback: false })
  const ec4 = ec4Tools(c)
  const t = connectVirtual(c); t.sysex = true
  c.cc([1, 1], { min: 0, max: 1, init: 0, label: 'FREQ' })
  c.cc([2, 1], { min: 0, max: 1, init: 0, label: 'ROT' })
  let rebuilds = 0; c.onLabels(() => rebuilds++)
  c.cc([1, 1], { min: 0, max: 1, init: 0, label: 'FREQ' }) // same label again: no rebuild
  c.cc([1, 1], { min: 0, max: 1, init: 0, label: 'FRQ2' }) // a new label: one
  assert.equal(rebuilds, 1)
  ec4.display.names(3, ['HAND'])                         // set by hand, in the same burst
  await new Promise(r => setTimeout(r, 5))               // the registration burst has settled
  assert.equal(ec4.display.labels.get(14, 1)[0], 'FRQ2'); assert.equal(ec4.display.labels.get(14, 2)[0], 'ROT ')
  assert.equal(ec4.display.labels.get(14, 3)[0], 'HAND')  // the rebuild from controls leaves it alone
  assert.equal(t.sent.length, 0)                         // nothing on screen yet: where is unknown
  // the device answers the query: setup 14 group 2 -> group 2's names go out
  c.handleMessage([0xF0, 0, 0, 0, 0x4E, 0x2C, 0x1B, 0x4E, 0x28, 0x1D, 0x4E, 0x24, 0x11, 0xF7])
  assert.equal(t.sent.length, 1)
  assert.equal(String.fromCharCode(...[13, 16, 19].map(i => (t.sent[0][i + 1] & 0x0f) << 4 | (t.sent[0][i + 2] & 0x0f))), 'ROT')
  // a group with no labels sends nothing; names() for a group not on screen is kept, not sent
  t.sent.length = 0
  c.handleMessage([0xF0, 0, 0, 0, 0x4E, 0x2C, 0x1B, 0x4E, 0x28, 0x1D, 0x4E, 0x24, 0x14, 0xF7])
  assert.equal(t.sent.length, 0)
  assert.equal(ec4.display.names(1, ['A']), false)
  assert.equal(ec4.display.labels.get(14, 1)[0], 'A   ')
  // remote select: the write follows after the device has had a moment to switch
  assert.equal(ec4.select(1), true); assert.equal(t.sent.length, 1)     // the select itself
  await new Promise(r => setTimeout(r, 120))
  assert.equal(t.sent.length, 2)
  assert.equal((t.sent[1][14] & 0x0f) << 4 | (t.sent[1][15] & 0x0f), 'A'.charCodeAt(0))
  // whole screen and hide, clear puts blanks back
  t.sent.length = 0
  assert.equal(ec4.display.text('HI'), true); assert.equal(ec4.display.hide(), true)
  assert.equal(t.sent[0][9], 0x13); assert.equal(t.sent[1][9], 0x15)
  ec4.display.clear(1)
  assert.equal(ec4.display.labels.get(14, 1), null); assert.equal(t.sent[2][9], 0x10)
  // without sysex on the transport nothing is sent and nothing throws
  t.sysex = false
  assert.equal(ec4.display.names(1, ['B']), false); assert.equal(ec4.display.text('x'), false)
})

test('xl3 profile: rows are groups, cc by column, and locate is the inverse', () => {
  assert.deepEqual(xl3.encoder(1, 1), { number: 13, channel: 1 })
  assert.deepEqual(xl3.encoder(3, 8), { number: 36, channel: 1 })
  assert.deepEqual(xl3.encoder(4, 1), { number: 5, channel: 1 })
  assert.deepEqual(xl3.encoder(6, 8), { number: 52, channel: 1 })
  for (let g = 1; g <= 6; g++) for (let n = 1; n <= 8; n++) assert.deepEqual(xl3.locate(xl3.encoder(g, n).number, 1), [g, n])
  assert.equal(xl3.locate(53, 1), null)
  assert.equal(xl3.locate(13, 2), null)
  assert.throws(() => xl3.push(1, 1), /no encoder push/)
  assert.ok(xl3.match.test('LCXL3 1 MIDI Out') && !xl3.match.test('LCXL3 1 DAW Out'))
})
