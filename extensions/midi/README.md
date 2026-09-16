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

## Options

`install(hydra, options)`:

- `mode` default encoder mode (`'r2'`)
- `channel` MIDI channel 1 to 16, or `null` for any (default)
- `steps` detents from min to max for relative modes (64)
- `log` start with learn logging on (false)
- `inputFilter` only listen to inputs whose name contains this string, or matches this RegExp
- `makeGlobal` expose `window.midi` (true)

`midi.cc(number, {min, max, init, mode, channel, steps})` per-control overrides.
The returned function has `.set(v)`, `.reset()` and `.v` (current value).

`midi.note(number, {toggle, velocity, channel})` for encoder pushes or buttons.
Set the EC4's Push behaviour to `Note` to get a note on the encoder's own number.

`midi.snapshot()` and `midi.restore(obj)` save and reload every control value, handy
for scene changes or InAct recordings.

## Development

```
npm test                 # node --test extensions/midi
npm run build:midi       # dist/extensions/midi
```
