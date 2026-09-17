/**
 * MIDI extension for Hydra: Hydra glue around a transport-agnostic controller core.
 *
 *   core/midi-state.js   value model (relative/absolute decode, curves, wrap, fine, snapshots)
 *   core/profiles.js     device layouts (Faderfox EC4 as programmed, generic CC)
 *   core/controller.js   Controller = state + profile + feedback + transport interface
 *   adapters/web-midi.js browser ports          adapters/virtual.js  tests / bridges
 *   index.js             this file: install(hydra) -> window.midi and hydra.synth.midi
 *
 * Everything under core/ and adapters/ has no Hydra or browser dependency and can be
 * lifted out as a package unchanged; only this file knows about Hydra.
 *
 * Usage on hydra.ojack.xyz:
 *   const m = await import('https://www.fentonia.com/hydra-extensions/midi/index.js')
 *   await m.install()                          // EC4 profile, exposes window.midi
 *   osc(midi.cc([1, 1], 5, 60, 10)).out(o0)    // group 1 encoder 1: 5..60, starts at 10
 *   midi.names({ gain: [1, 2] }); osc().contrast(midi.cc('gain', 0.5, 2, 1)).out(o0)
 *
 * API on midi: cc(id, min, max, init | opts), note(id, opts), use(profile, extra), names(map),
 *   learn(on), last, snapshot(), restore(obj), refresh(), inputs, outputs, ready, state, profile.
 *   id = CC number | [group, encoder] | 'name'.
 *
 * Encoder modes: 'r1' (EC4 CCr1: 1 down / 127 up), 'r2' (EC4 CCr2: 63 down / 65 up),
 * 'abs' (0..127), 'abs14' (EC4 CCah, MSB on n and LSB on n+32). Per-control options:
 * mode, channel, steps, curve 'linear'|'log'|'exp', wrap, fine, fineNote.
 */

import { Controller } from './core/controller.js'
import { MidiState, describeEvent, MODES, CURVES } from './core/midi-state.js'
import { profiles, ec4, generic } from './core/profiles.js'
import { connectWebMidi } from './adapters/web-midi.js'
import { connectVirtual } from './adapters/virtual.js'

export const VERSION = '0.2.0'
export { Controller, MidiState, describeEvent, MODES, CURVES, profiles, ec4, generic, connectWebMidi, connectVirtual }

let _midi = null

/**
 * install(hydra, options)
 *   profile      device profile (default: ec4); pass generic for plain absolute CC boxes, or null
 *   mode/channel/steps/feedback/log   Controller options (profile supplies mode/channel defaults)
 *   inputFilter/outputFilter          port name filters for the Web MIDI adapter
 *   makeGlobal   expose window.midi (default true)
 */
export async function install (hydra = null, options = {}) {
  if (_midi) return _midi
  const opts = Object.assign({ profile: ec4, makeGlobal: true }, options)

  const midi = new Controller({
    mode: opts.mode, channel: opts.channel, steps: opts.steps,
    feedback: opts.feedback, log: opts.log, profile: opts.profile
  })
  midi.handleMessageRaw = midi.handleMessage.bind(midi)
  midi.uninstall = () => {
    midi.close()
    if (typeof window !== 'undefined' && window.midi === midi) delete window.midi
    _midi = null
  }

  const _hydra = hydra || (typeof window !== 'undefined' ? window.hydraSynth : null)
  if (_hydra && _hydra.synth) _hydra.synth.midi = midi
  if (opts.makeGlobal && typeof window !== 'undefined') window.midi = midi

  midi.ready = connectWebMidi(midi, { inputFilter: opts.inputFilter, outputFilter: opts.outputFilter })
  _midi = midi
  return midi
}

export function uninstall () {
  if (_midi) _midi.uninstall()
}
