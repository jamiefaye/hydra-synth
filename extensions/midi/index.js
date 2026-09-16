/**
 * MIDI extension for Hydra (Faderfox EC4 and any CC/note controller).
 *
 * Usage on hydra.ojack.xyz:
 *   const m = await import('https://www.fentonia.com/hydra-extensions/midi/index.js')
 *   await m.install()                       // exposes window.midi
 *   osc(midi.cc(16, 5, 60, 10)).out(o0)     // encoder cc16: 5..60, starts at 10
 *
 * Usage in a custom setup:
 *   import { install } from 'hydra-synth/extensions/midi'
 *   const midi = await install(hydra, { mode: 'r2', log: true })
 *
 * API (all on the object returned by install(), also window.midi when makeGlobal):
 *   midi.cc(number, min, max, init)   or   midi.cc(number, {min, max, init, mode, channel, steps})
 *       -> () => value ; also fn.set(v), fn.reset(), fn.v
 *   midi.note(number, {toggle, velocity, channel}) -> () => 0/1
 *   midi.learn()        log every incoming message to the console (midi.learn(false) to stop)
 *   midi.last           the most recent event
 *   midi.snapshot() / midi.restore(obj)
 *   midi.refresh()      resend every control value to the device display (feedback)
 *   midi.inputs         names of connected MIDI inputs (filled once midi.ready resolves)
 *   midi.ready          promise: Web MIDI access granted or refused; install() never blocks on it
 *   midi.state          the underlying MidiState
 *
 * Encoder modes: 'r1' (EC4 CCr1: 1 down / 127 up), 'r2' (EC4 CCr2: 63 down / 65 up, default),
 * 'abs' (0..127), 'abs14' (EC4 CCah, MSB on n and LSB on n+32).
 *
 * Per-control options: curve 'linear'|'log'|'exp', wrap (rotation), fine (step divisor while the
 * encoder's push note is held), fineNote (which note, default = the cc number), steps.
 *
 * Display feedback: with feedback enabled (default) every value change is sent back to the
 * controller as the same CC scaled 0..127, so a relative encoder's display shows the sketch value.
 */

import { MidiState, describeEvent, MODES } from './midi-state.js'

export const VERSION = '0.1.0'
export { MidiState, describeEvent, MODES }

let _midi = null

export async function install (hydra = null, options = {}) {
  if (_midi) return _midi

  const opts = Object.assign({
    mode: 'r2',
    channel: null,
    steps: 64,
    log: false,
    makeGlobal: true,
    inputFilter: null,  // string or RegExp matched against input names; null = all inputs
    feedback: true,     // send values back to the controller display (relative encoders need this)
    outputFilter: /faderfox|ec4/i   // which output(s) receive feedback; null = every output
  }, options)

  const state = new MidiState({ mode: opts.mode, channel: opts.channel, steps: opts.steps })
  let logging = !!opts.log
  const unlog = state.onEvent(ev => { if (logging) console.log('[midi]', describeEvent(ev)) })

  const midi = {
    state,
    cc: (...args) => state.cc(...args),
    note: (...args) => state.note(...args),
    snapshot: () => state.snapshot(),
    restore: (s) => state.restore(s),
    refresh: () => { for (const p of state.positions()) sendFeedback(p.channel, p.number, p.pos) },
    outputs: [],
    _outputs: [],
    learn: (on = true) => { logging = !!on; console.log(`[midi] learn ${logging ? 'on' : 'off'}`); return logging },
    get last () { return state.lastEvent },
    inputs: [],
    access: null,
    handleMessage: (data) => state.handleMessage(data),
    ready: null,             // promise resolved once Web MIDI access has been granted or refused
    onInputsChanged: null,   // optional callback (names) when inputs connect or disconnect
    uninstall: () => {
      unlog()
      if (midi.access) midi.access.onstatechange = null
      for (const input of midi._inputs) input.onmidimessage = null
      midi._outputs = []
      if (typeof window !== 'undefined' && window.midi === midi) delete window.midi
      _midi = null
    },
    _inputs: []
  }

  // Display feedback: echo each control's 0..1 position to the controller as the same CC
  const sendFeedback = (channel, number, pos) => {
    if (!opts.feedback || !midi._outputs.length) return
    const msg = [0xB0 | ((channel || 1) - 1), number & 0x7f, Math.round(pos * 127) & 0x7f]
    for (const out of midi._outputs) { try { out.send(msg) } catch (e) { /* port went away */ } }
  }
  midi.sendFeedback = sendFeedback
  state.onEvent(ev => {
    if (ev.registered && ev.pos !== undefined && (ev.type === 'cc' || ev.type === 'set')) sendFeedback(ev.channel, ev.number, ev.pos)
  })

  const _hydra = hydra || (typeof window !== 'undefined' ? window.hydraSynth : null)
  if (_hydra && _hydra.synth) _hydra.synth.midi = midi
  if (opts.makeGlobal && typeof window !== 'undefined') window.midi = midi

  // Web MIDI access is requested in the background so a permission prompt never
  // blocks the sketch: controls work (at their initial values) until access arrives.
  midi.ready = connect(midi, state, opts)
  _midi = midi
  return midi
}

async function connect (midi, state, opts) {
  if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
    console.warn('[midi] Web MIDI is not available in this browser; controls will keep their initial values')
    return midi
  }
  try {
    midi.access = await navigator.requestMIDIAccess({ sysex: false })
  } catch (e) {
    console.warn('[midi] MIDI access refused:', e.message)
    return midi
  }

  const matcher = (filter) => (name) => {
    if (!filter) return true
    if (filter instanceof RegExp) return filter.test(name)
    return name.toLowerCase().includes(String(filter).toLowerCase())
  }
  const matches = matcher(opts.inputFilter)
  const matchesOut = matcher(opts.outputFilter)

  const attach = () => {
    const found = [...midi.access.inputs.values()].filter(i => matches(i.name))
    const names = found.map(i => i.name)
    // statechange fires once per port; only rewire and log when the set of inputs changed
    if (names.join('|') === midi.inputs.join('|') && midi._inputs.length === found.length) return
    for (const input of midi._inputs) input.onmidimessage = null
    midi._inputs = found
    midi.inputs = names
    for (const input of found) input.onmidimessage = (msg) => state.handleMessage(msg.data)
    midi._outputs = opts.feedback ? [...midi.access.outputs.values()].filter(o => matchesOut(o.name)) : []
    midi.outputs = midi._outputs.map(o => o.name)
    console.log(`[midi] v${VERSION} listening on: ${names.length ? names.join(', ') : '(no inputs)'}` +
      (opts.feedback ? `; feedback to: ${midi.outputs.length ? midi.outputs.join(', ') : '(no outputs)'}` : ''))
    if (midi.onInputsChanged) midi.onInputsChanged(midi.inputs)
    midi.refresh()
  }
  attach()
  midi.access.onstatechange = attach
  return midi
}

export function uninstall () {
  if (_midi) _midi.uninstall()
}
