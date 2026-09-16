import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MidiState, decodeRelative, describeEvent } from './midi-state.js'

const cc = (ch, n, v) => [0xB0 | (ch - 1), n, v]
const noteOn = (ch, n, v = 100) => [0x90 | (ch - 1), n, v]
const noteOff = (ch, n) => [0x80 | (ch - 1), n, 0]

test('decodeRelative follows the EC4 editor overview', () => {
  // CCr1: 127 increment, 1 decrement; acceleration widens the step
  assert.equal(decodeRelative('r1', 127), 1)
  assert.equal(decodeRelative('r1', 1), -1)
  assert.equal(decodeRelative('r1', 126), 2)
  assert.equal(decodeRelative('r1', 3), -3)
  assert.equal(decodeRelative('r1', 0), 0)
  // CCr2: 65 increment, 63 decrement
  assert.equal(decodeRelative('r2', 65), 1)
  assert.equal(decodeRelative('r2', 63), -1)
  assert.equal(decodeRelative('r2', 68), 4)
  assert.equal(decodeRelative('r2', 64), 0)
})

test('relative r2 control accumulates and clamps', () => {
  const m = new MidiState({ mode: 'r2', steps: 10 })
  const f = m.cc(16, 0, 1, 0.5)
  assert.equal(f(), 0.5)
  m.handleMessage(cc(1, 16, 65))
  assert.equal(f().toFixed(2), '0.60')
  m.handleMessage(cc(1, 16, 62))          // -2 steps
  assert.equal(f().toFixed(2), '0.40')
  for (let i = 0; i < 20; i++) m.handleMessage(cc(1, 16, 63))
  assert.equal(f(), 0)                    // clamped at min
  for (let i = 0; i < 40; i++) m.handleMessage(cc(1, 16, 65))
  assert.equal(f(), 1)                    // clamped at max
})

test('relative r1 control with explicit mode and range', () => {
  const m = new MidiState()
  const f = m.cc(20, { min: 10, max: 60, init: 10, mode: 'r1', steps: 50 })
  m.handleMessage(cc(1, 20, 127))
  assert.equal(f(), 11)
  m.handleMessage(cc(1, 20, 1))
  assert.equal(f(), 10)
})

test('absolute 7 bit maps 0..127 onto min..max', () => {
  const m = new MidiState({ mode: 'abs' })
  const f = m.cc(7, -1, 1)
  m.handleMessage(cc(1, 7, 0)); assert.equal(f(), -1)
  m.handleMessage(cc(1, 7, 127)); assert.equal(f(), 1)
  m.handleMessage(cc(1, 7, 64)); assert.ok(Math.abs(f() - 0.0079) < 0.001)
})

test('absolute 14 bit combines MSB on n and LSB on n+32', () => {
  const m = new MidiState()
  const f = m.cc(5, { min: 0, max: 16383, mode: 'abs14' })
  m.handleMessage(cc(1, 5, 100))          // MSB alone applies coarse value
  assert.equal(Math.round(f()), 100 << 7)
  m.handleMessage(cc(1, 37, 3))           // LSB completes it
  assert.equal(Math.round(f()), (100 << 7) | 3)
  m.handleMessage(cc(1, 5, 127)); m.handleMessage(cc(1, 37, 127))
  assert.equal(Math.round(f()), 16383)    // full scale reaches max exactly
})

test('channel filtering: specific channel wins, null accepts any', () => {
  const m = new MidiState({ mode: 'r2', steps: 10 })
  const any = m.cc(1, 0, 1, 0)
  const ch5 = m.cc(1, { min: 0, max: 1, init: 0, channel: 5 })
  m.handleMessage(cc(5, 1, 65))
  assert.equal(ch5().toFixed(1), '0.1')
  assert.equal(any(), 0)
  m.handleMessage(cc(2, 1, 65))
  assert.equal(any().toFixed(1), '0.1')
  assert.equal(ch5().toFixed(1), '0.1')
})

test('re-registering keeps the live value across sketch re-eval', () => {
  const m = new MidiState({ mode: 'r2', steps: 10 })
  const f1 = m.cc(16, 0, 1, 0)
  m.handleMessage(cc(1, 16, 65)); m.handleMessage(cc(1, 16, 65))
  assert.equal(f1().toFixed(1), '0.2')
  const f2 = m.cc(16, 0, 1, 0)             // same call again, as after re-eval
  assert.equal(f2().toFixed(1), '0.2')
  const f3 = m.cc(16, 0, 10, 0)            // wider range: value kept, still in range
  assert.equal(f3().toFixed(1), '0.2')
  f3.set(42); assert.equal(f3(), 10)       // set clamps
  f3.reset(); assert.equal(f3(), 0)
})

test('notes: held, velocity and toggle', () => {
  const m = new MidiState()
  const held = m.note(60)
  const vel = m.note(61, { velocity: true })
  const tog = m.note(62, { toggle: true })
  m.handleMessage(noteOn(1, 60)); assert.equal(held(), 1)
  m.handleMessage(noteOff(1, 60)); assert.equal(held(), 0)
  m.handleMessage(noteOn(1, 61, 127)); assert.equal(vel(), 1)
  m.handleMessage([0x90, 61, 0]); assert.equal(vel(), 0)   // note-on with velocity 0 = off
  m.handleMessage(noteOn(1, 62)); m.handleMessage(noteOff(1, 62)); assert.equal(tog(), 1)
  m.handleMessage(noteOn(1, 62)); assert.equal(tog(), 0)
})

test('unassigned messages are reported for learn mode', () => {
  const m = new MidiState()
  const seen = []
  m.onEvent(ev => seen.push(describeEvent(ev)))
  m.handleMessage(cc(3, 99, 65))
  assert.equal(seen[0], 'ch 3 cc 99 = 65  (unassigned)')
  const f = m.cc(99, 0, 1, 0)
  m.handleMessage(cc(3, 99, 65))
  assert.match(seen[1], /^ch 3 cc 99 = 65  \(r2 \+1\) -> 0\.016/)
})

test('snapshot and restore', () => {
  const m = new MidiState({ mode: 'r2', steps: 4 })
  const a = m.cc(1, 0, 1, 0)
  const b = m.cc(2, { min: 0, max: 1, init: 0, channel: 2 })
  m.handleMessage(cc(1, 1, 65)); m.handleMessage(cc(2, 2, 66))
  const snap = m.snapshot()
  assert.deepEqual(snap, { '*:1': 0.25, '2:2': 0.5 })
  a.reset(); b.reset()
  m.restore(snap)
  assert.equal(a(), 0.25); assert.equal(b(), 0.5)
})
