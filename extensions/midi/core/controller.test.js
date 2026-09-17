import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Controller } from './controller.js'
import { ec4, generic, resolveControl } from './profiles.js'
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
