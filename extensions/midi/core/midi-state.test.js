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

test('log curve: each detent multiplies by a constant ratio', () => {
  const m = new MidiState({ mode: 'r2', steps: 10 })
  const f = m.cc(5, { min: 0.1, max: 100, init: 1, curve: 'log', snap: false })   // init sits between grid lines
  assert.ok(Math.abs(f() - 1) < 1e-9)
  m.handleMessage(cc(1, 5, 65))
  const r1 = f() / 1
  m.handleMessage(cc(1, 5, 65))
  const r2 = f() / (1 * r1)
  assert.ok(Math.abs(r1 - r2) < 1e-9)              // constant ratio per step
  assert.ok(Math.abs(r1 - Math.pow(1000, 0.1)) < 1e-9)
  for (let i = 0; i < 30; i++) m.handleMessage(cc(1, 5, 65))
  assert.ok(Math.abs(f() - 100) < 1e-9)            // clamps at max
  f.set(0.1); assert.ok(Math.abs(f() - 0.1) < 1e-9)
  assert.throws(() => m.cc(6, { min: 0, max: 1, curve: 'log' }), /log curve/)
})

test('wrap: rotation knob goes round instead of clamping', () => {
  const m = new MidiState({ mode: 'r2', steps: 4 })
  const f = m.cc(7, { min: 0, max: 360, init: 270, wrap: true })
  m.handleMessage(cc(1, 7, 65)); assert.equal(Math.round(f()), 0)     // 270 + 90 wraps to 0
  m.handleMessage(cc(1, 7, 63)); assert.equal(Math.round(f()), 270)
  m.handleMessage(cc(1, 7, 62)); assert.equal(Math.round(f()), 90)    // -180 from 270
})

test('open: no rails, the range only sets the detent size', () => {
  const m = new MidiState({ mode: 'r2', steps: 4 })
  const lin = m.cc(8, { min: 0, max: 2, init: 1, open: true })
  for (let i = 0; i < 6; i++) m.handleMessage(cc(1, 8, 65))
  assert.equal(lin(), 4)                                     // 1 + 6 * 0.5, past max
  for (let i = 0; i < 12; i++) m.handleMessage(cc(1, 8, 63))
  assert.equal(lin(), -2)                                    // and past min
  assert.equal(lin.set(10), 10)                              // set is not clipped either
  const log = m.cc(9, { min: 1, max: 16, init: 4, curve: 'log', open: true })
  for (let i = 0; i < 8; i++) m.handleMessage(cc(1, 9, 65))
  assert.equal(Math.round(log()), 1024)                      // each detent doubles, on past 16
  for (let i = 0; i < 20; i++) m.handleMessage(cc(1, 9, 63))
  assert.ok(log() > 0 && log() < 0.5)                        // down toward 0, never reaching it
  const up = m.cc(10, { min: 1, max: 8, init: 1, open: 'up' })
  m.handleMessage(cc(1, 10, 63)); assert.equal(up(), 1)      // floor kept
  for (let i = 0; i < 8; i++) m.handleMessage(cc(1, 10, 65))
  assert.equal(up(), 15)                                     // ceiling gone
})

test('fine: step divides while the encoder push note is held', () => {
  const m = new MidiState({ mode: 'r2', steps: 10 })
  const f = m.cc(8, { min: 0, max: 1, init: 0, fine: 10 })
  m.handleMessage(cc(1, 8, 65)); assert.equal(f().toFixed(2), '0.10')
  m.handleMessage(noteOn(1, 8))                       // push held (EC4 Note push = same number)
  m.handleMessage(cc(1, 8, 65)); assert.equal(f().toFixed(2), '0.11')
  assert.equal(m.lastEvent.fine, true)
  m.handleMessage(noteOff(1, 8))
  m.handleMessage(cc(1, 8, 65)); assert.equal(f().toFixed(2), '0.20')   // a coarse detent goes to the next coarse line
  // custom fine note (e.g. a dedicated shift button)
  const g = m.cc(9, { min: 0, max: 1, init: 0, fine: 4, fineNote: 100 })
  m.handleMessage(noteOn(1, 100)); m.handleMessage(cc(1, 9, 65)); assert.equal(g().toFixed(3), '0.025')
})

test('snap: detents land on the grid, so round values are hit exactly', () => {
  const m = new MidiState({ mode: 'r2' })
  // herder's ZOOM: unity is a grid line, the starting value is not
  const zoom = m.cc(2, { min: 0.5, max: 2, init: 1.02, curve: 'log', steps: 300, fine: 10 })
  m.handleMessage(cc(1, 2, 63)); assert.ok(zoom() < 1.02 && zoom() > 1.015)   // first detent: to the next line down, less than a detent
  for (let i = 0; i < 4; i++) m.handleMessage(cc(1, 2, 63))
  assert.equal(zoom(), 1)
  // rotation in degrees: whole degrees coarse, tenths fine, zero by turning either way
  const rot = m.cc(3, { min: 0, max: 360, init: 1.5, wrap: true, steps: 360, fine: 10 })
  m.handleMessage(cc(1, 3, 65)); assert.equal(rot(), 2)
  m.handleMessage(cc(1, 3, 62)); assert.equal(rot(), 0)
  m.handleMessage(cc(1, 3, 63)); assert.equal(rot(), 359)
  m.handleMessage(noteOn(1, 3)); m.handleMessage(cc(1, 3, 65)); assert.equal(rot().toFixed(3), '359.100')
  m.handleMessage(noteOff(1, 3)); m.handleMessage(cc(1, 3, 65)); assert.equal(rot(), 0)
  // a value set from outside stays as set until the knob is turned
  rot.set(12.34); assert.ok(Math.abs(rot() - 12.34) < 1e-9)
  // snap: false keeps the offset
  const free = m.cc(4, { min: 0, max: 1, init: 0.005, steps: 10, snap: false })
  m.handleMessage(cc(1, 4, 65)); assert.equal(free().toFixed(3), '0.105')
})

test('set/restore emit set events and positions() reports 0..1', () => {
  const m = new MidiState({ mode: 'r2', steps: 10 })
  const f = m.cc(3, 10, 20, 10)
  const seen = []
  m.onEvent(ev => seen.push(ev))
  f.set(15)
  assert.equal(seen.at(-1).type, 'set'); assert.equal(seen.at(-1).pos, 0.5); assert.equal(seen.at(-1).after, 15)
  m.handleMessage(cc(4, 3, 65))                        // moved from channel 4
  assert.equal(m.positions()[0].channel, 4)            // feedback goes back to where it came from
  assert.equal(m.positions()[0].pos.toFixed(1), '0.6')
  m.restore({ '*:3': 20 })
  assert.equal(seen.at(-1).type, 'set'); assert.equal(seen.at(-1).pos, 1)
  assert.equal(describeEvent(seen.at(-1)), 'set ch 4 cc 3 -> 20.000')
})

test('soft pickup: a fader is ignored until it crosses the value, then followed', () => {
  const st = new MidiState({ mode: 'abs', channel: 1 })
  const fn = st.cc(5, { min: 0, max: 1, init: 0.5, pickup: 'soft' })
  assert.equal(fn.caught, false)
  const abs = (v) => st.handleMessage([0xB0, 5, v])
  let ev = abs(10)                                   // fader at the bottom: nothing moves
  assert.equal(ev.caught, false); assert.equal(fn(), 0.5); assert.equal(ev.phys, 10 / 127)
  abs(40)
  assert.equal(fn(), 0.5)
  ev = abs(70)                                       // crossed the value on the way up
  assert.equal(ev.caught, true); assert.ok(Math.abs(fn() - 70 / 127) < 1e-9)
  abs(20)                                            // followed from now on
  assert.ok(Math.abs(fn() - 20 / 127) < 1e-9)
  fn.set(0.9)                                        // a value from outside lets go again
  assert.equal(fn.caught, false)
  abs(30); assert.equal(fn(), 0.9)
  abs(115); assert.equal(fn.caught, true)            // landed within a step of it
  assert.equal(st.positions()[0].caught, true)
})

test('distance pickup: the value moves by how far the fader moved and never jumps', () => {
  const st = new MidiState({ mode: 'abs', channel: 1 })
  const fn = st.cc(6, { min: 0, max: 10, init: 5, pickup: 'distance' })
  const abs = (v) => st.handleMessage([0xB0, 6, v])
  abs(0)                                             // first message only says where the fader is
  assert.equal(fn(), 5)
  abs(127)                                           // a whole travel: a whole range, clamped
  assert.equal(fn(), 10)
  abs(0)
  assert.equal(fn(), 0)
  st.cc(7, { min: 0, max: 10, init: 5, pickup: 'distance', pickupScale: 0.5 })
  const g = st.controls.get('1:7')
  st.handleMessage([0xB0, 7, 64]); st.handleMessage([0xB0, 7, 127])
  assert.ok(Math.abs((5 + 0.5 * (63 / 127) * 10) - (g.pos * 10)) < 1e-9)
})

test('jump pickup is the default for absolute controls and rejects unknown modes', () => {
  const st = new MidiState({ mode: 'abs', channel: 1 })
  const fn = st.cc(8, 0, 1, 0.5)
  assert.equal(fn.caught, true)
  st.handleMessage([0xB0, 8, 0]); assert.equal(fn(), 0)
  assert.throws(() => st.cc(9, { pickup: 'magnet' }), /unknown pickup/)
})
