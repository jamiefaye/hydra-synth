import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Controller } from './controller.js'
import { Device } from './device.js'
import { ec4, xl3, xl3daw, nano } from './profiles.js'
import { nanoTools } from '../adapters/nano.js'
import { sceneDump, sceneIn, SCENE_BYTES, LED_MODE } from './nano-sysex.js'
import { connectVirtual } from '../adapters/virtual.js'

const XL3_HEAD = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x15]

test('two devices on the same channel and number do not collide, and feedback goes to the right box', () => {
  const midi = new Controller({ profile: ec4, feedback: true })
  const xl = midi.add(xl3, { pace: 0 })
  const tEc4 = connectVirtual(midi)             // the legacy call: the default device
  const tXl = connectVirtual(xl, { name: 'xl' })
  assert.equal(midi.default.profile.name, ec4.name)
  assert.equal(midi.device('xl3'), xl)
  const a = midi.cc([1, 14], 0, 1, 0.2)         // EC4 group 1 encoder 14 = CC 13 on channel 1
  const b = xl.cc([1, 1], 0, 1, 0.8)            // XL3 encoder 1 = CC 13 on channel 1 too
  assert.equal(a(), 0.2); assert.equal(b(), 0.8)
  midi.handleMessage([0xB0, 13, 65])            // an EC4 detent up
  assert.ok(a() > 0.2); assert.equal(b(), 0.8)
  xl.handleMessage([0xB0, 13, 127])             // the XL3 fader-style absolute value
  assert.equal(b(), 1); assert.ok(a() < 0.3)
  midi.handleMessage([0xB0, 13, 0], { device: 'xl3' })   // routed by name from the controller
  assert.equal(b(), 0)
  // feedback: each device's transport heard only its own controls (values echoed as the same CC)
  assert.ok(tEc4.sent.every(m => m[1] === 13 && m[0] === 0xB0))
  assert.ok(tXl.sent.every(m => m[1] === 13 && m[0] === 0xB0))
  assert.ok(tXl.sent.some(m => m[2] === 127))
  assert.equal(midi.inputs.length, 2)
  // events say which device
  const seen = []; midi.onEvent(ev => seen.push(ev.device))
  midi.handleMessage([0xB0, 13, 63]); xl.handleMessage([0xB0, 13, 64])
  assert.deepEqual(seen, ['faderfox-ec4', 'xl3'])
})

test('the default device keeps the controller\'s old face: state, profile, transport, snapshot', () => {
  const midi = new Controller({ profile: ec4 })
  connectVirtual(midi)
  midi.cc([1, 1], 0, 10, 5)
  assert.equal(midi.state, midi.default.state)
  assert.equal(midi.profile.name, ec4.name)
  assert.equal(midi.transport.name, 'virtual')
  assert.deepEqual(midi.snapshot(), { '1:0': 5 })
  midi.restore({ '1:0': 7 })
  assert.equal(midi.state.controls.get('1:0').pos, 0.7)
  assert.ok(midi.default instanceof Device)
})

test('xl3daw: greets the unit on attach, turns the rows relative, and releases on close', () => {
  const midi = new Controller({ profile: ec4 })
  const xl = midi.add(xl3daw, { pace: 0 })
  const t = connectVirtual(xl, { name: 'daw' })
  assert.deepEqual(t.sent[0], [...XL3_HEAD, 0x02, 0x7F, 0xF7])
  assert.deepEqual(t.sent.slice(1, 5), [[0xB6, 69, 127], [0xB6, 72, 127], [0xB6, 73, 127], [0xB6, 71, 127]])
  assert.equal(t.sent.length, 5 + 40)           // then every LED off
  assert.ok(t.sent.slice(5).every(m => m[0] === 0xB0 && m[2] === 0))
  const rot = xl.cc([1, 1], { min: 0, max: 6.28, init: 3.14 })
  xl.handleMessage([0xBF, 77, 66])              // +2 steps on channel 16
  assert.ok(rot() > 3.14)
  xl.handleMessage([0xBF, 77, 62])              // -2 steps
  assert.ok(Math.abs(rot() - 3.14) < 1e-9)
  // no value is written to a DAW-mode encoder: only the greeting went out
  assert.equal(t.sent.length, 45)
  xl.close()
  assert.deepEqual(t.sent.at(-1), [...XL3_HEAD, 0x02, 0x00, 0xF7])
})

test('xl3daw: touch and buttons arrive as notes, faders take soft pickup', () => {
  const midi = new Controller({ profile: ec4 })
  const xl = midi.add(xl3daw, { pace: 0 })
  connectVirtual(xl)
  const touch = xl.note([1, 3])                 // encoder 3, top row: touch on channel 15
  xl.handleMessage([0xBE, 79, 127]); assert.equal(touch(), 1)
  xl.handleMessage([0xBE, 79, 0]); assert.equal(touch(), 0)
  const b = xl.note([5, 2], { toggle: true })   // upper button 2 = CC 38 on channel 1, as a note
  xl.handleMessage([0xB0, 38, 127]); xl.handleMessage([0xB0, 38, 0]); assert.equal(b(), 1)
  xl.handleMessage([0xB0, 38, 127]); xl.handleMessage([0xB0, 38, 0]); assert.equal(b(), 0)
  const f = xl.cc([4, 1], 0, 1, 0.5)            // fader 1: bounded row, so soft pickup by default
  assert.equal(f.config.pickup, 'soft'); assert.equal(f.config.mode, 'abs')
  xl.handleMessage([0xBF, 5, 10]); assert.equal(f(), 0.5)
  xl.handleMessage([0xBF, 5, 100]); assert.ok(f() > 0.7)
})

test('xl3daw: colour, lamp, text and page become the right frames, addressed by the custom-mode number', () => {
  const midi = new Controller({ profile: ec4 })
  const xl = midi.add(xl3daw, { pace: 0 })
  const t = connectVirtual(xl)
  const n0 = t.sent.length
  xl.colour([2, 1], 21)                         // middle row encoder 1: CC 21 on channel 1, green
  assert.deepEqual(t.sent[n0], [0xB0, 21, 21])
  xl.lamp([6, 8], 1); xl.lamp([6, 7], 0)
  assert.deepEqual(t.sent[n0 + 1], [0xB0, 52, 3]); assert.deepEqual(t.sent[n0 + 2], [0xB0, 51, 0])
  xl.text([1, 1], ['osc1', '10.0', 'frequency'])
  const cfg = t.sent[n0 + 3]; const l1 = t.sent[n0 + 4]
  assert.deepEqual(cfg, [...XL3_HEAD, 0x04, 13, 0x62, 0xF7])
  assert.deepEqual(l1, [...XL3_HEAD, 0x06, 13, 0, ...Array.from('osc1', c => c.charCodeAt(0)), 0xF7])
  assert.equal(t.sent.length, n0 + 7)           // no show for a control page: it shows when the knob turns
  const n1 = t.sent.length
  xl.screen(['hydra parm', 'hello'])
  assert.deepEqual(t.sent.at(-1), [...XL3_HEAD, 0x04, 0x35, 0x7F, 0xF7])   // the static page is shown at once
  assert.ok(t.sent.length > n1)
  // a label on registration writes the control's page, a colour option paints it
  const before = t.sent.length
  xl.cc([3, 4], { min: 0, max: 1, label: 'blnd', colour: 45 })
  assert.ok(t.sent.slice(before).some(m => m[6] === 0x06 && m[7] === 32))
  assert.ok(t.sent.slice(before).some(m => m[0] === 0xB0 && m[1] === 32 && m[2] === 45))
  xl.colour([6, 6], 21); xl.lamp([6, 6], 0.2); xl.lamp([6, 6], 1)   // a green button: dim green, then full green
  assert.deepEqual(t.sent.slice(-2), [[0xB0, 50, 23], [0xB0, 50, 21]])
})

test('pacing: a paced device schedules its frames apart and coalesces a repeated key', async () => {
  const midi = new Controller({ profile: ec4 })
  const xl = midi.add(xl3, { pace: 20 })
  const t = connectVirtual(xl)
  const k = xl.cc([1, 1], 0, 1, 0)
  // twenty value changes in a burst: what fits the scheduling window goes out spaced, the rest
  // coalesces to the latest, so a fast twist never backs the device up by more than the window
  for (let v = 1; v <= 20; v++) xl.handleMessage([0xB0, 13, v * 5])
  assert.equal(k.pos, 100 / 127)
  xl.lamp([5, 1], 1); xl.lamp([5, 2], 1); xl.lamp([5, 3], 1)
  await new Promise(r => setTimeout(r, 30))
  const echoes = t.sent.filter(m => m[1] === 13)
  assert.ok(echoes.length < 10, `coalesced to ${echoes.length}`)
  await new Promise(r => setTimeout(r, 200))
  assert.equal(t.sent.filter(m => m[1] === 13).at(-1)[2], 100)
  assert.equal(t.sent.filter(m => m[1] >= 37 && m[1] <= 39).length, 3)
  // every frame after the first carries a timestamp a pace later than the one before
  const ats = t.at.slice(1)
  for (let i = 1; i < ats.length; i++) assert.ok(ats[i] - ats[i - 1] >= 19.9, `spaced: ${ats[i] - ats[i - 1]}`)
  // a long burst beyond the window is held back and still goes out
  for (let n = 1; n <= 8; n++) { xl.lamp([5, n], 0.5); xl.lamp([6, n], 0.5) }
  const before = t.sent.length
  await new Promise(r => setTimeout(r, 400))
  assert.ok(t.sent.length >= before + 10, `drained: ${t.sent.length - before}`)
})

test('xl3 custom mode: buttons are notes and a lamp is a value', () => {
  const midi = new Controller({ profile: xl3 })
  midi.default.opts.pace = 0
  const t = connectVirtual(midi)
  const b = midi.note([5, 1])
  midi.handleMessage([0xB0, 37, 127]); assert.equal(b(), 1)
  midi.handleMessage([0xB0, 37, 0]); assert.equal(b(), 0)
  midi.lamp([6, 1], 0.5)
  assert.deepEqual(t.sent.at(-1), [0xB0, 45, 64])
  assert.throws(() => midi.note([1, 1]), /no encoder push/)
})

test('pages: a knob on another page keeps its value, and switching pages re-sends the live page', () => {
  const midi = new Controller({ profile: ec4 })
  const xl = midi.add(xl3daw, { pace: 0 })
  const t = connectVirtual(xl)
  const a = xl.cc([1, 1], { min: 0, max: 1, init: 0.2, label: 'aa', colour: 5 })
  const b = xl.cc([1, 1], { min: 0, max: 1, init: 0.8, label: 'bb', colour: 21, page: 2 })
  assert.equal(xl.pages, 2); assert.equal(a.page, 1); assert.equal(b.page, 2)
  xl.handleMessage([0xBF, 77, 66])              // the live page's knob moves
  assert.ok(a() > 0.2); assert.equal(b(), 0.8)
  const n0 = t.sent.length
  xl.setPage(2)
  assert.equal(xl.page, 2); assert.equal(xl.state.controls.get('16:77').config.label, 'bb')
  // the switch painted green and wrote the name of page 2's knob
  assert.ok(t.sent.slice(n0).some(m => m[0] === 0xB0 && m[1] === 13 && m[2] === 21))
  assert.ok(t.sent.slice(n0).some(m => m[6] === 0x06 && m[7] === 13 && String.fromCharCode(m[9], m[10]) === 'bb'))
  xl.handleMessage([0xBF, 77, 62])              // now the knob is b's
  assert.ok(b() < 0.8); assert.ok(a() > 0.2)
  xl.setPage(3)                                 // an empty page: the knob goes dark
  assert.ok(t.sent.slice(-8).some(m => m[0] === 0xB0 && m[1] === 13 && m[2] === 0))
  const heard = []; xl.onPage(p => heard.push(p)); xl.setPage(1); assert.deepEqual(heard, [1])
})

test('nano: buttons are notes, faders and knobs take soft pickup, lamps go on the learned channel', () => {
  const midi = new Controller({ profile: nano })
  const t = connectVirtual(midi)
  assert.deepEqual(nano.encoder(2, 1), { number: 0, channel: null }); assert.deepEqual(nano.encoder(1, 8), { number: 23, channel: null })
  assert.deepEqual(nano.locate(46), [6, 3]); assert.deepEqual(nano.locate(62), [7, 3]); assert.equal(nano.locate(9), null)
  const s1 = midi.note([3, 1], { toggle: true })
  midi.handleMessage([0xB0, 32, 127]); midi.handleMessage([0xB0, 32, 0]); assert.equal(s1(), 1)
  const f = midi.cc([2, 1], 0, 1, 0.5)
  assert.equal(f.config.pickup, 'soft')
  midi.handleMessage([0xB0, 0, 5]); assert.equal(f(), 0.5)
  midi.handleMessage([0xB0, 0, 90]); assert.ok(f() > 0.6)
  assert.equal(t.sent.length, 0)                // nothing is written to a nano but lamps
  midi.default.nano = { channel: 2 }
  midi.lamp([5, 8], 1)
  assert.deepEqual(t.sent.at(-1), [0xB2, 71, 127])
  assert.throws(() => midi.note([1, 1]), /no push/)
})

test('nano handshake: inquiry, scene, LED mode flipped and acknowledged, restored on release', () => {
  const midi = new Controller({ profile: nano })
  const dev = midi.default
  const st = nanoTools(midi, dev)
  const t = connectVirtual(dev); t.sysex = true; dev.attachTransport(t)
  assert.deepEqual(t.sent.at(-1), [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]); assert.equal(st.step, 'inquiry')
  dev.handleMessage([0xF0, 0x7E, 0x03, 0x06, 0x02, 0x42, 0x13, 0x01, 0x00, 0x00, 0xF7])   // answers on channel 4
  assert.equal(st.channel, 3); assert.equal(st.step, 'scene'); assert.equal(t.sent.at(-1)[7], 0x1F)
  const scene = Array.from({ length: SCENE_BYTES }, (_, i) => i % 100); scene[0] = 3; scene[LED_MODE] = 0
  dev.lamp([3, 1], 1)                            // asked for before the mode is taken: remembered
  dev.handleMessage(sceneDump(3, scene))
  assert.equal(st.step, 'ack')
  const back = sceneIn(3, t.sent.at(-1)); assert.equal(back[LED_MODE], 1)
  dev.handleMessage([0xF0, 0x42, 0x43, 0x00, 0x01, 0x13, 0x00, 0x5F, 0x23, 0x00, 0xF7])
  assert.equal(st.taken, true); assert.equal(st.step, 'done')
  assert.deepEqual(t.sent.at(-1), [0xB3, 32, 127])   // the remembered lamp, on channel 4
  dev.close()
  const restored = sceneIn(3, t.sent.at(-1)); assert.equal(restored[LED_MODE], 0)
})
