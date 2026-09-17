# Hydra MIDI Extension

MIDI controllers as Hydra parameters, written for the Faderfox EC4 but usable with any
controller that sends control change or note messages.

```javascript
// On hydra.ojack.xyz
const m = await import('https://www.fentonia.com/hydra-extensions/midi/index.js')
await m.install()

osc(midi.cc(16, 5, 60, 10), 0.1, midi.cc(17, 0, 2)).out(o0)
```

`midi.cc(number, min, max, init)` returns a function that Hydra evaluates every frame,
so it goes anywhere a number goes. With a relative encoder the value lives in the browser,
so a knob moves the parameter by how far it turned and never jumps to where the knob
happens to sit. Re-evaluating the sketch keeps the current values.

## Addressing knobs by group, number or name

With the EC4 profile (the default) a control id can be a CC number, a `[group, encoder]`
pair, or a name you assign:

```javascript
midi.cc([1, 3], 0, 1)                 // group 1, encoder 3 (CC 2 on channel 1)
midi.names({ gain: [1, 1], rot: [1, 2] })
osc().contrast(midi.cc('gain', 0.5, 2, 1)).rotate(midi.cc('rot', { min: 0, max: 6.283, wrap: true })).out(o0)
midi.note('gain', { toggle: true })   // the encoder's push (EC4 push type Note)
```

`install(hydra, { profile: generic })` for a plain absolute-CC box, or `profile: null` for
raw numbers only. Profiles live in `core/profiles.js`; the EC4 one encodes setup SE01 as
programmed in September 2026 (groups by CC offset, channel 1, CCr2).

## Labelling and configuring the EC4 from code

The EC4's setups travel as a SysEx image (format from Faderfox, via the MIT
faderfox-editor). `core/ec4-sysex.js` parses and encodes it and edits names, types,
channels, numbers, modes and push settings. The device only takes a complete image and
the transfer is started by hand on the device, so the flow is receive, edit, send.

Offline, on a backup file (safest; then Load file + Send in the Faderfox editor):

```
node extensions/midi/tools/ec4-label.js show  backup.syx --setup 1 --group 1
node extensions/midi/tools/ec4-label.js label backup.syx out.syx --setup 1 --group 1 1=GAIN 2=ROT 3=ZOOM
node extensions/midi/tools/ec4-label.js apply backup.syx out.syx labels.json
```

From a sketch, with SysEx access (`install(hydra, { sysex: true })`, a second browser prompt):

```javascript
await midi.ec4.receive()          // then on the EC4: Func > Setup > Send, hold "Send all setups"
midi.names({ gain: [1, 1], rot: [1, 2], zoom: [1, 3] })
midi.ec4.labelFromNames(1)        // setup 1: names become the encoder labels
midi.ec4.label(1, 2, { 1: { name: 'BLND', type: 'CCR2', mode: 'Acc1' } })
midi.ec4.send()                   // EC4 in Func > Setup > Receive first; overwrites all 16 setups
```

Names are 4 characters from `0-9 A-Z a-z space . / -`. Keep a `.syx` backup before the first
send; `midi.ec4.toBytes()` gives you one to save.

## Virtual control surface (no hardware)

`ui/panel.js` mounts a panel of draggable numbers, one cell per encoder, for any number of
groups. Drag up or down to turn, wheel for single detents, click for the push, hold shift
while dragging for fine. It synthesises the bytes the device would send and feeds them to
the controller, so everything behaves as with hardware, and it mirrors real knob moves.

```javascript
import { mountPanel } from 'hydra-synth/extensions/midi/ui/panel.js'
mountPanel(document.getElementById('panel'), midi, {
  groups: [{ group: 1, title: 'LOPA', labels: ['GAIN', 'BRT', ...], descs: { GAIN: 'loop gain' } }]
})
```

## Layout

```
core/midi-state.js    value model: decode, curves, wrap, fine, snapshots   (no deps)
core/profiles.js      device layouts and id resolution                    (no deps)
core/controller.js    Controller = state + profile + feedback + transport (no deps)
core/ec4-sysex.js     EC4 setup image: parse/encode dumps, edit names and settings (no deps)
adapters/web-midi.js  browser ports          adapters/virtual.js  tests, bridges
adapters/sysex.js     midi.ec4: receive / label / send   tools/ec4-label.js  offline CLI
index.js              Hydra glue only: install() -> window.midi, hydra.synth.midi
package.json          standalone metadata; `core/` and `adapters/` lift out unchanged
```

A node transport is a few dozen lines against `easymidi` or `@julusian/midi`: open ports,
call `controller.handleMessage(bytes)` on input, and pass `{ send }` to
`controller.attachTransport()`.

## Finding your CC numbers

```javascript
midi.learn()      // prints every incoming message: "ch 1 cc 16 = 65  (unassigned)"
midi.learn(false)
```

## Encoder modes

Match the `Type` set on the EC4 for the encoder (Edit mode, ENC 9/10):

| mode    | EC4 type | wire format                                   |
|---------|----------|-----------------------------------------------|
| `r2`    | CCr2     | 65 = up, 63 = down (default)                  |
| `r1`    | CCr1     | 127 = up, 1 = down                            |
| `abs`   | CCAb     | 0..127 absolute                               |
| `abs14` | CCah     | 14 bit, MSB on cc n, LSB on cc n + 32         |

Set the default at install time, or per control:

```javascript
await m.install(hydra, { mode: 'r1', steps: 100 })
midi.cc(5, { min: 0, max: 1, mode: 'abs' })
```

`steps` is how many encoder detents cover min to max in relative modes (default 64).
The EC4's acceleration (Mode 0 to 3) sends larger steps when turned fast and is handled.

## Fine control, curves and rotation

```javascript
const rot   = midi.cc(2, { min: 0, max: 6.283, wrap: true, fine: 10 })       // turns forever; push+turn = 1/10 step
const scale = midi.cc(3, { min: 0.05, max: 20, init: 1, curve: 'log' })      // constant ratio per detent
const x     = midi.cc(4, { min: -1, max: 1, init: 0, steps: 200, fine: 20 }) // slow and finer
```

- `steps` detents from min to max (default 64). Resolution is not quantised: any float step works.
- `fine` divides the step while the encoder's push note is held. Set the EC4 push
  behaviour to `Note` so the push sends a note on the encoder's own number. `fineNote`
  picks a different note, e.g. one button as a shift for every knob.
- `curve` is `'linear'` (default), `'log'` (min and max above 0; each detent multiplies), or `'exp'`.
- `wrap` makes the range circular instead of clamped, for angles.
- The EC4's own acceleration (Acc1 to Acc3) sends bigger steps when turned fast and is honoured,
  so slow turns are fine and flicks are coarse without any code.

## Display feedback

Relative encoders have no position, so the EC4 display would show nothing useful. With
`feedback: true` (the default) every change, `set()`, `restore()` or re-eval sends the control's
0..127 position back on the same CC, and the EC4 bar and number follow the sketch. Feedback goes
to outputs matching `outputFilter` (default: names containing "Faderfox" or "EC4"). `midi.refresh()`
resends everything, and is called automatically when ports connect.

## Options

`install(hydra, options)`:

- `mode` default encoder mode (`'r2'`)
- `channel` MIDI channel 1 to 16, or `null` for any (default)
- `steps` detents from min to max for relative modes (64)
- `log` start with learn logging on (false)
- `inputFilter` only listen to inputs whose name contains this string, or matches this RegExp
- `feedback` send values back to the controller display (true)
- `outputFilter` which outputs get feedback (`/faderfox|ec4/i`); `null` for all
- `makeGlobal` expose `window.midi` (true)

`midi.cc(number, {min, max, init, mode, channel, steps, curve, wrap, fine, fineNote})` per-control overrides.
The returned function has `.set(v)`, `.reset()` and `.v` (current value).

`midi.note(number, {toggle, velocity, channel})` for encoder pushes or buttons.
Set the EC4's Push behaviour to `Note` to get a note on the encoder's own number.

`midi.snapshot()` and `midi.restore(obj)` save and reload every control value, handy
for scene changes or InAct recordings.

## Development

```
npm test                 # node --test extensions/midi/core/*.test.js
npm run build:midi       # dist/extensions/midi
```
