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
| 6 | Grid | show all four outputs. |
| 7 | Void | black beyond the monitor (on) or wrap (off). |
| 16 | view | push: toggle the grid view. |

### MONS: the monitors

Four monitors, A direct, A mirror, B direct, B mirror: HUE, SAT, BRT, CON each, ahead of the
cameras. The front panel of Blair's monitors. Inside the loop, so these compound too.

### SEED

| encoder | control | what it does |
|---|---|---|
| 1, 2 | LEVA, LEVB | how much of the seed enters loop A, loop B. |
| 3 | SFRQ | seed frequency or scale. |
| 4 | SKAL | kaleidoscope sides on the seed; below 2 off. Starts off. |
| 5 | SDLY | seed delay in frames before it enters the loops. |
| 6 | Kind | the seed: 0 osc, 1 noise, 2 voronoi, 3 cam, 4 screen, 5 sketch. |

### RIG: the glass and the cabling

| encoder | control | what it does |
|---|---|---|
| 1, 3 | MIRA, MIRB | beam splitter: how much of the mirrored monitor each camera sees. |
| 2, 4 | MZMA, MZMB | mirror zoom: the reflected monitor's optical distance. |
| 5, 6 | AtoB, BtoA | cross-links: how much of the other loop each camera sees. |
| 7, 8 | KEYA, KEYB | luma key for the seed entering A, B. Above 0 the seed is keyed per pixel, not crossfaded. |

### PLAY: what a set rides

Aliases of knobs that live elsewhere. Turn either, both displays follow, and a push on the alias
is the fine push for its home knob.

Row 1: GNA ZMA RTA LVA (loop A's gain, zoom, rotation, seed level). Row 2: the same for B.
Row 3: XFAD PERI SDLY Void. Row 4: SKAL.

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
| o | open a patch; dropping the file on the page does the same. Knobs, seed and sketch code come back and the EC4's displays follow; the picture regrows from the seed |
| h | hide the HUD |
| p | the controls in a window of their own (close it, or `p` again, to bring them back) |

URL parameters: `mode=gpu|gl` (WebGPU is the default), `seed=osc|noise|voronoi|cam|screen|video|image|sketch`,
`url=` for a video or image seed, `panel=window`, `h=1` to start with the HUD hidden, `res=WxH` for the
loops' resolution. The resolution is fixed for the run, by default the display's device pixels (3840x2160
on a 4K screen); the window shows it letterboxed and resizing does not disturb the loops. The HUD shows
the resolution and the frame rate; if it drops below 60, `res=1920x1080`.

The editor's seed mode takes a Hydra chain, e.g. `osc(12, 0.05, 1).kaleid(5)`; a trailing `.out()`
is ignored. Roughshod mode runs whatever you type with the whole synth in reach.

## The EC4

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
