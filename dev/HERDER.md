# The Herder

A video-feedback instrument in Hydra, after Dave Blair's [Light Herder](https://www.thelightherder.com/): cameras pointed at the
monitors they draw to, a beam splitter between two monitors, switchers that mix what the cameras
see, and one seed, the only light the rig did not make. Everything here is a model of that rig,
played from a Faderfox EC4 or from the virtual panel on the page.

Page: `dev/herder.html` in the hyv checkout (`npm run dev`, then http://localhost:8000/dev/herder.html),
or the static build (`npm run build:herder`) on https://www.fentonia.com/herder/herder.html.

## The rig

Two loops, A and B. Each is a camera looking at its own output through glass: it sees the
monitor directly and a second monitor in the reflection, half each on Blair's rig, a knob here.
What the camera sees is scaled, turned, tilted, delayed, blurred and gained, then written back
to the same output. That is the loop: pull the camera back a little each pass and the picture
walks inward, turn it and it spirals, tilt it and it keystones.

- **o0** loop A, **o1** loop B, **o2** the seed, **o3** the program (A crossfaded with B).
- **The glass** (RIG): how much of the reflected monitor each camera sees, and at what distance.
- **The links** (RIG): switcher A can show camera B some of loop A, and the other way round.
- **The seed** (SEED): osc, noise, voronoi, the webcam, a screen, a video or image URL, or your own
  Hydra chain. It enters each loop at its own level, crossfaded, or keyed per pixel by luminance.
- **The void** (SWCH Void): a camera aimed past the monitor sees an unlit room. On, a receding or
  turning loop walks into black. Off, the picture wraps round like Hydra's `src()`, for comparison.

Every knob is per pass, so it compounds: a hue drift of a few hundredths a frame walks the loop
through the spectrum in a second. Small moves.

## Playing it

The instrument settles or runs away on **gain**. Just under 1 a loop fades unless the seed feeds it;
just over 1 it grows into fractals; well over it floods to white. The playable band is narrow, so
GAIN has a fine push. The second control that matters is **ZOOM**: below 1 recedes, above 1 tunnels.
Then **ROT** for spirals, the **seed level** for how much fresh light comes in, and **XFAD** to
choose what the room sees.

A first piece, three lines: seed on, gain to 1.02, zoom to 0.98, and wait. Then turn ROT.

## The surface

Sixteen encoders in groups; the page shows all groups as the virtual panel. Label case says what
your finger does:

- `UPPER` a knob you turn. Its push is the fine push (a tenth of a step) where the knob has one.
- `Capitalised` a switch you turn: one detent flips it.
- `lowercase` a push-only button.

### CAMA, CAMB: the cameras

| encoder | knob | what it does |
|---|---|---|
| 1 | GAIN | loop gain, the camera's exposure: a gain about black, 0.8 to 1.25. At 1 an echo comes back as bright as it left; above 1 the loop climbs to white. Fine push. |
| 2 | ZOOM | magnification per pass, 0.5 to 2, unity mid-travel. A lens zoom, not a dolly. |
| 3 | ROT | roll per pass, in radians, wraps. |
| 4, 5 | X, Y | camera off the monitor's axis. |
| 6 | BLUR | lens focus. 0 is sharp; sampling still softens a fraction of a texel. |
| 7 | DLAY | frame delay after the camera, 1 to 29. Higher lags and breathes. |
| 8 | PRST | persistence: how much of the frame PDLY frames back is blended in. |
| 9, 10 | PTCH, YAW | camera pitch and yaw. The monitor keystones and, with Void on, its far edge goes black. |
| 11 | LENS | camera distance for the perspective, 1 wide to 6 long. How strong pitch and yaw keystone. |
| 12 | PDLY | PRST's delay. 1 smears along the motion like a slow shutter, 15 echoes. |
| 16 | home | push: the camera square on again (zoom, roll, x, y, pitch, yaw back). Gain, blur, delay and lens stay. |

### SWCH: the switchers

| encoder | control | what it does |
|---|---|---|
| 1 | XFAD | program crossfade, 0 loop A to 1 loop B. |
| 2 | PERI | period in seconds for rhythmic reversal of the crossfade; 0 off. |
| 3 | Rvrs | swap which output each loop reads as itself. |
| 4, 5 | Frza, Frzb | freeze a loop on its last frame. |
| 6 | Grid | show all the outputs. |
| 7 | Void | black beyond the monitor (on) or wrap (off). |
| 8 | GLID | glide: seconds an opened patch takes to arrive; 0 at once. Switches never glide. |
| 9 | rec | push: record a gesture; push again and it loops (the `g` key). |
| 10 | clr | push: stop all automation (the `G` key). |
| 16 | view | push: toggle the grid view. |

### MONS: the monitors

Four monitors, A direct, A mirror, B direct, B mirror: HUE, SAT, BRT, CON each, ahead of the
cameras. The front panel of Blair's monitors. Inside the loop, so these compound too.

There are two colour paths, and `c` flips between them (the header says which; a patch records it as `colour`).
*matrix*, the default, is described next. *chain* is Hydra's own `hue().saturate().brightness().contrast()`: its HSV hue
holds the brightest channel and full saturation, so turning a colour sheds luminance, and a loop tuned on it can run at a
higher GAIN than the matrix allows, which keeps luminance. Patches saved before the matrix existed open on the chain, so
they look as they were tuned.

The four knobs of a monitor are composed into one colour matrix and applied in a single multiply (`colormat()`).
HUE turns the chroma plane and SAT scales it, in NTSC luma/chroma as on lightherder; BRT lifts; CON is a gain about
mid-grey. It behaves on light past white, which the loops now carry, and with the knobs at rest it is exactly the
identity, so a monitor at rest costs the loop nothing. Code can go past the knobs: `herder.colourOf(hue, sat, brt, con)`
gives the twelve numbers, and any twelve will do.

### SEED

Loops are letters and seeds are numbers, everywhere: S2A is seed 2 into loop A. Two seeds into two loops
is a 2 x 2 matrix, rows the loops and columns the seeds, and it sits as a block at the top left of the
group with each seed's own knobs to its right:

```
S1A   S2A  | FRQ1 KAL1     loop A takes seed 1 and seed 2          seed 1: frequency, kaleid
S1B   S2B  | FRQ2 KAL2     loop B takes seed 1 and seed 2          seed 2: frequency, kaleid
Knd1  Cam1   Knd2 Cam2     what each seed is and, if a camera, which one
cuta  cutb   cutx SDLY     the cuts; the delay both seeds share
```

| encoder | control | what it does |
|---|---|---|
| 1, 2 | S1A, S2A | loop A: how much of seed 1, of seed 2. |
| 5, 6 | S1B, S2B | loop B: how much of seed 1, of seed 2. |
| 3, 4 | FRQ1, KAL1 | seed 1: frequency or scale; kaleidoscope sides, below 2 off. |
| 7, 8 | FRQ2, KAL2 | seed 2: the same. |
| 9 | Knd1 | seed 1: 0 osc, 1 noise, 2 voronoi, 3 cam, 4 screen, 5 sketch (the editor's seed 1 text). |
| 11 | Knd2 | seed 2: 0 seed 1 again (it costs nothing, and S2B then feeds loop B from seed 1), then 1 osc, 2 noise, 3 voronoi, 4 cam, 5 screen, 6 sketch (the editor's seed 2 text). View `5` shows it. |
| 10, 12 | Cam1, Cam2 | which camera a seed looks through when its kind is cam: 0 the first the browser lists, 1 the second (where Cam2 starts), so two cameras can feed the two seeds. The header names them beside each seed's selector. |
| 13, 14 | cuta, cutb | hold: cut a loop's own seed in whole (seed 1 into A, seed 2 into B), the switcher's foot pedal. Release and the level knob stands again; what was dropped in echoes round. |
| 15 | cutx | hold: throw the program crossfade to its other end. |
| 16 | SDLY | seed delay in frames before the seeds enter the loops. |

Patches saved under the earlier names (LEVA, LEVB, SFRQ, SKAL, FRQB, KALB, Kind, KndB, ATOB, BTOA, `code`,
`codeB`) still open.

### RIG: the glass and the cabling

| encoder | control | what it does |
|---|---|---|
| 1, 3 | MIRA, MIRB | beam splitter: how much of the mirrored monitor each camera sees. |
| 2, 4 | MZMA, MZMB | mirror zoom: the reflected monitor's optical distance. |
| 5, 6 | ATOB, BTOA | cross-links: how much of the other loop each camera sees. |
| 7, 8 | KEYA, KEYB | luma key for the seed entering A, B. Above 0 the seed is keyed per pixel, not crossfaded. |

### PLAY: what a set rides

Aliases of knobs that live elsewhere. Turn either, both displays follow, and a push on the alias
is the fine push for its home knob.

Row 1: GNA ZMA RTA S1A (loop A's gain, zoom, rotation, seed level). Row 2: the same for B.
Row 3: XFAD PERI SDLY Void. Row 4: KAL1, then three knobs of PLAY's own: RBTH and ZBTH turn and zoom
both cameras at once, on top of each one's ROT and ZOOM, and Cntr sends camera B the other way (it turns
against A and pulls back as A pushes in).

## Keys and the page

| key | does |
|---|---|
| 0 1 2 3 4 | view: grid, loop A, loop B, seed, program |
| s | next seed kind |
| e | the editor: a seed chain (seed mode) or any code (roughshod; `b` rebuilds the loops) |
| b | rebuild the loops |
| r | reset every knob |
| d | dump the whole state as JSON to the console and clipboard |
| w | write a patch: the same JSON to a file (a save dialog in Chrome, a download elsewhere) |
| g | record a gesture; `g` again and it loops, as a macro in the first free slot (see Automation) |
| G | stop all automation; the macros keep their slots |
| c | the monitors' colour path: matrix or chain (see MONS) |
| m | the macro manager |
| option-1 .. option-0 | run or stop macro slots 1 to 10; with shift, restart from the top |
| 5 | view: seed 2 |
| o | open a patch; dropping the file on the page does the same. Knobs, seed and sketch code come back and the EC4's displays follow; the picture regrows from the seed |
| h | hide the HUD |
| p | the controls in a window of their own (close it, or `p` again, to bring them back) |

A patch holds every knob by label (`groups`), seed 1's kind and url, the view, the editor's three texts
(`code1`, `code2`, and `codeRaw`, which is restored but never run by opening a file), recorded gestures
(`gestures`) and a running sequence (`sequence`, `loop`). Nothing is saved on its own: a reload starts from
the defaults, so write a patch (`w`) to keep a state.

**Patches may be partial.** Only what a file names changes; everything else stays as it is. Cut a dump
down to the part you want and open it over whatever is playing:

```json
{ "groups": { "CAMA": { "ZOOM": 0.97, "ROT": 0.1 }, "MONS": { "3HUE": -0.1 } } }
```

Knobs go by their labels, as in the dump's `groups`. `seed`, `code` and `view` are each optional too.
`"reset": true` puts every knob at its default first, so the file opens over the defaults rather than
over what is playing (`r` then `o` does the same by hand). Opening a patch never stops the picture: whatever in the file can be used is used, a value past a
knob's range goes to the end of the range, and anything that cannot be used (an unknown label, a seed
kind that does not exist) is skipped and named in the header, which the audience does not see with the
HUD hidden (`h`) or the controls in their own window (`p`). The raw `snapshot` is used only by a file with no `groups`.

URL parameters: `mode=gpu|gl` (WebGPU is the default), `seed=osc|noise|voronoi|cam|screen|video|image|sketch`,
`url=` for a video or image seed, `panel=window`, `h=1` to start with the HUD hidden, `res=WxH` for the
loops' resolution. The resolution is fixed for the run, by default the display's device pixels (3840x2160
on a 4K screen); the window shows it letterboxed and resizing does not disturb the loops. The HUD shows
the resolution and the frame rate; if it drops below 60, `res=1920x1080`.

The editor's seed mode takes a Hydra chain, e.g. `osc(12, 0.05, 1).kaleid(5)`; a trailing `.out()`
is ignored. Roughshod mode runs whatever you type with the whole synth in reach.

## Automation

Besides your hands, macros move knobs, and an opened patch may glide in. Your hands always win: turn a
knob that a gesture or a glide is moving and it drops out, so you play over the machine by touching
what you want back.

**Macros.** Sixteen slots, any number running at once, three kinds:

- *gesture*: press `g` (or the `rec` push), turn knobs, press it again. The moves loop at the length you
  played them, in the first free slot. To choose the slot, end the recording with option-n (or MACR push n)
  instead: it goes into slot n, replacing what was there. Record again for another, with its own length, so they drift
  against each other.
- *sequence*: partial patches applied one after another, each then waiting its `wait` seconds (default 1);
  `"loop": true` starts over. Each step may glide.
- *code*: the body of a generator, plain JavaScript with all of Hydra and `herder` in reach. `yield 2`
  waits two seconds, a bare `yield` one frame; it ends when it returns, or starts over if told to. A
  macro can read knobs, so it can answer what you or another macro are doing. A mistake in one stops
  that macro and shows in the manager; nothing else notices.

```js
while (true) {                                   // a slow wander of camera A, for ever
  herder.glideTo('CAMA.ROT', Math.random() * 6.28, 6)
  if (herder.k['SWCH.XFAD']() > 0.5) herder.apply({ glide: 3, groups: { RIG: { MIRA: Math.random() } } })
  yield 6
}
```

**Running them.** Option-1 to option-0 run or stop slots 1 to 10, shift-option-number restarts one from
the top; the pushes of the EC4's MACR group (GR08) do the same for all sixteen; `G` (or `clr`) stops
everything and leaves the slots as they are. `m` opens the manager: every slot with its name, kind and
state, run/stop, restart, delete, rename, and a text box. `edit` puts any macro in the box as text: code as
code, a gesture or a sequence as JSON (a gesture's events are `[milliseconds, knob, value]`, one to a line,
so a take can be read, trimmed and retimed by hand); `put in slot and run` takes either back. Choosing a slot loads what it holds, unless the box has typing
that has not been put anywhere (then it is kept, and `put` replaces the slot); an empty slot leaves the text,
which is how a macro is copied. It is a window of its
own, or a box over the picture if pop-ups are blocked.

**Glides.** With GLID above 0 an opened patch arrives over that many seconds instead of at once; a
file's own `"glide": 4` wins over the knob. Rotation takes the short way round, zoom and gain move in
ratio, switches jump.

**In a patch.** `macros` holds the slots: `{ "slot": 3, "name": "wander", "kind": "code", "code": "...",
"loop": false, "running": true }`, or `"kind": "sequence", "steps": [...]`, or `"kind": "gesture",
"len": ..., "events": [...]`. Opening a patch replaces the slots it names and leaves the others;
`"macros": []` empties them all. A file's bare `sequence` or `gestures` (the earlier form) takes free slots.

```json
{ "macros": [ { "slot": 1, "name": "breathe", "kind": "sequence", "loop": true, "steps": [
  { "wait": 8, "glide": 6, "groups": { "CAMA": { "ZOOM": 0.97, "ROT": 0.1 } } },
  { "wait": 8, "glide": 6, "groups": { "CAMA": { "ZOOM": 1.04, "ROT": 6.18 } } }
] } ] }
```

**From code.** `herder` is the page's own mechanism, there for a seed sketch, a macro or roughshod code:
`herder.k['CAMA.ZOOM']()` reads a knob (a seed can: `osc(() => herder.k['CAMA.ZOOM']() * 20)`);
`herder.set('CAMA.ZOOM', 1.1)` moves one as the machine does, while `herder.k['CAMA.ZOOM'].set(1.1)`
moves it as a hand would (it ends gestures on that knob and is recorded); `herder.apply(patch)`,
`herder.glideTo(knob, value, seconds)`, `herder.macro(description)`, `herder.toggle(slot)`,
`herder.remove(slot)`, `herder.macros()`, `herder.record()`, `herder.loop()`, `herder.stop()`,
`herder.state()`; `herder.knobs` is every knob by group and label, `herder.out` the outputs by role
(a, b, seed1, seed2, program).

## The EC4

Click a group's title on screen (GR01 CAMA ...) and the EC4 jumps to that group, no GROUP key needed; the
title of the group the EC4 is on is lit, and it follows the EC4's own GROUP key too. This rides on sysex
(EC4 firmware 2.x; Chrome asks once for MIDI with sysex). Without it the knobs work as before and the
click says why nothing moved.

Setup 1 `HERD` carries the seven groups above: `dev/herder-ec4-labels.json` is the layout and
`node extensions/midi/tools/ec4-label.js apply <backup.syx> <out.syx> dev/herder-ec4-labels.json`
writes it over a backup of the device. Send the image with the Faderfox web editor (Load file,
Send to EC4, USB only, device idle in Func > Setup > Receive) and select setup 1. All encoders are
CCr2 on channel 1, numbered by group: encoder n of group g sends CC (g-1)*16 + (n-1); the push
sends a note of the same number. Chrome asks once for Web MIDI on the page's origin.

Without an EC4 the virtual panel does the same job: drag up or down, wheel, click is a push, shift
is fine. It sends the same bytes the device would.

## Recording and projecting

Full screen is Ctrl+Cmd+F on the Mac; `h` hides the HUD; `p` puts the controls on the other screen.
A hidden tab stops rendering (browsers pause animation frames), so keep the page visible.

## Where it differs from Blair's rig

The loops run in half-float frames (`?float=0` for 8-bit): light past white and faint trails survive
from one pass to the next, and after the gain a knee bends anything over white onto twice white
instead of clipping it. That is lightherder's amplifier rail; on Blair's rig the camera's highlight
roll-off and the panel's ceiling do the job. At 4K the thirty-frame rings take about 6 GB this way.

The rig itself: https://www.thelightherder.com/ . A faithful software copy in Rust, which this
borrows its grammar from: https://github.com/bddap-bot/lightherder .

The glass ratio, the cross-links and the keys are knobs here; on the rig the glass is fixed and the
switchers do the mixing. Pitch and yaw exist here and on no rig. PRST is a parallel tap none of the
rigs has. The seed is a Hydra chain rather than an HDMI input. Blair's cameras slide on a shaft,
which is zoom and lens moving together; here they are two knobs.
