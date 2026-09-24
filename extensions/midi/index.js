/**
 * MIDI extension for Hydra: Hydra glue around a transport-agnostic controller core.
 *
 *   core/midi-state.js   value model (relative/absolute decode, curves, wrap, fine, snapshots)
 *   core/palette.js      Novation's 128-entry LED palette (XL3 DAW mode colours, Launchpads)
 *   core/profiles.js     device layouts (Faderfox EC4 setup 1 and 14 PARM, Launch Control XL 3 custom and DAW, nanoKONTROL2, generic CC)
 *   core/nano-sysex.js   the nanoKONTROL2 scene codec; adapters/nano.js the LED-mode handshake
 *   core/device.js       Device = one surface: profile + value model + ports + paced feedback
 *   core/ec4-display.js  live OLED writes (names, whole screen) and the labels model
 *   core/controller.js   Controller = the devices; its own cc/note/... are the default device's
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
 * API on midi: cc(id, min, max, init | opts), alias(id, ofId), note(id, opts), use(profile, extra), names(map),
 *   learn(on), last, snapshot(), restore(obj), refresh(), inputs, outputs, ready, state, profile.
 *   id = CC number | [group, encoder] | 'name'.
 *
 * Live OLED labels (EC4 firmware 2.x, install with { sysex: true }): an encoder registered with
 * a label, midi.cc([1, 3], { label: 'FREQ', ... }), gets that name on the display, and the names
 * go out again on connect and on every group change (the device forgets them). Only encoders
 * whose stored name is '----' take a written name; the PARM setup (profile parm, setup 14) is
 * all blanks for exactly this. midi.ec4.display.names(group, [...16]) sets a group by hand,
 * .text(rows) / .hide() take the whole 4x20 screen, .auto = false leaves refreshing to the page.
 *
 * Encoder modes: 'r1' (EC4 CCr1: 1 down / 127 up), 'r2' (EC4 CCr2: 63 down / 65 up),
 * 'abs' (0..127), 'abs14' (EC4 CCah, MSB on n and LSB on n+32). Per-control options:
 * mode, channel, steps, curve 'linear'|'log'|'exp', wrap, fine, fineNote.
 */

import { Controller } from './core/controller.js'
import { Device } from './core/device.js'
import { MidiState, describeEvent, MODES, CURVES } from './core/midi-state.js'
import { profiles, ec4, parm, generic, xl3, xl3daw, nano } from './core/profiles.js'
import { nanoTools } from './adapters/nano.js'
import * as palette from './core/palette.js'
import { connectWebMidi } from './adapters/web-midi.js'
import { connectVirtual } from './adapters/virtual.js'
import { ec4Tools } from './adapters/sysex.js'
import { Ec4Image, parseDump, encodeDump } from './core/ec4-sysex.js'
import { Ec4Labels, labelsFromControls, namesBytes, screenBytes, hideScreenBytes } from './core/ec4-display.js'

export const VERSION = '0.3.0'
export { Controller, Device, MidiState, describeEvent, MODES, CURVES, profiles, ec4, parm, generic, xl3, xl3daw, nano, nanoTools, connectWebMidi, connectVirtual, ec4Tools, Ec4Image, parseDump, encodeDump, Ec4Labels, labelsFromControls, namesBytes, screenBytes, hideScreenBytes, palette }

let _midi = null

/**
 * install(hydra, options)
 *   profile      device profile of the default device (default: ec4); generic for plain absolute CC boxes, or null
 *   devices      more devices, each a profile or { profile, id, match, pace, ... }: midi.device('xl3daw').cc(...)
 *   mode/channel/steps/feedback/log   Controller options (profile supplies mode/channel defaults)
 *   inputFilter/outputFilter          port name filters for the Web MIDI adapter
 *   sysex        request SysEx access too (separate browser prompt); enables midi.ec4.receive()/send()
 *   makeGlobal   expose window.midi (default true)
 *
 * midi.ec4: device configuration (see adapters/sysex.js and core/ec4-sysex.js):
 *   await midi.ec4.receive()                 // then on the EC4: Func > Setup > Send > hold "Send all setups"
 *   midi.ec4.label(1, 1, { 1: 'GAIN', 2: 'ROT' })  or  midi.ec4.labelFromNames(1)
 *   midi.ec4.send()                          // EC4 in Func > Setup > Receive first; overwrites all setups
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

  for (const d of opts.devices || []) { const { profile: p, ...o } = (d && d.profile) ? d : { profile: d }; midi.add(p, o) }
  for (const d of midi.devices.values()) if (d.profile.id === 'nano') nanoTools(midi, d)   // the LED-mode handshake
  midi.ec4 = ec4Tools(midi)
  midi.ready = connectWebMidi(midi, { inputFilter: opts.inputFilter, outputFilter: opts.outputFilter, sysex: opts.sysex })
  _midi = midi
  return midi
}

export function uninstall () {
  if (_midi) _midi.uninstall()
}
