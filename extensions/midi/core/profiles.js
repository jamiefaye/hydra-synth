/**
 * Device profiles: how a physical controller's encoders map to channel / CC / note,
 * plus per-device defaults. Pure data + small helpers, no transport.
 *
 * A profile:
 *   name      display name
 *   match     RegExp against port names (used by adapters to pick the device for feedback)
 *   mode      default encoder mode for this device ('r2', 'abs', ...)
 *   channel   default channel, or null for any
 *   encoder(group, n)  -> { number, channel }   1-based group and encoder
 *   push(group, n)     -> { note, channel }     the encoder's push, when set to send a note
 *   locate(number, channel) -> [group, n] | null   the inverse, for display labels
 *   setup     the EC4 setup this layout lives in (labels go there)
 *   names     { alias: [group, n] }  user-defined names for encoders
 *   layout    rows of the surface for a panel and for parm: [{ group, kind, count, label, closed, mode, fill, role }]
 *             role 'pages' = a button row that selects a page each; 'pageStep' with step [prev, next] = two buttons that step
 *             kind 'endless' (the host can set where it stands: a relative encoder, or an absolute one the
 *             device takes a written value for; closed = 0..127 is the whole range), 'bounded' (a pot or
 *             fader: the hand alone sets it, so the host does pickup), 'button'
 *   pace      ms between feedback messages (a device that drops a burst)
 *   translate(bytes) -> bytes | null   rewrite an incoming message before the value model sees it
 *   feedback  { value, colour, lamp, text, page } hooks, see core/device.js
 *   connect(device) / release(device) -> frames sent when the ports open / on close
 */

// group g, encoder n -> CC (g-1)*16 + (n-1) on one channel, and back
const byOffset = (channel) => ({
  encoder: (group, n) => ({ number: (group - 1) * 16 + (n - 1), channel }),
  push: (group, n) => ({ note: (group - 1) * 16 + (n - 1), channel }),
  locate: (number, ch) => (number >= 0 && number < 128 && (ch == null || ch === channel)) ? [Math.floor(number / 16) + 1, (number % 16) + 1] : null
})

// Faderfox EC4 as programmed in setup SE01 (Sep 2026): groups GR01..GR04 as CCr2 on channel 1,
// numbered by group offset (encoder n of group g = CC (g-1)*16 + n-1). Push type Note sends the same number.
export const ec4 = {
  name: 'Faderfox EC4',
  match: /faderfox|ec4/i,
  mode: 'r2',
  channel: 1,
  setup: 1,
  groups: 16,
  encodersPerGroup: 16,
  ...byOffset(1),
  layout: [1, 2, 3, 4].map(r => ({ group: null, row: r, kind: 'endless', count: 4, label: `encoders, row ${r}` })),
  names: {}
}

// Faderfox EC4 setup 14 "PARM" (Sep 2026, dev/parming-ec4-labels.json): groups PRM1..PRM8 as CCr2 on
// channel 14, numbered by group offset, push = Note of the same number. Every encoder name is '----' so a
// page labels the OLED live (midi.ec4.display); groups 9..16 are as the device had them.
export const parm = {
  name: 'Faderfox EC4 PARM (setup 14)',
  match: /faderfox|ec4/i,
  mode: 'r2',
  channel: 14,
  setup: 14,
  groups: 8,
  encodersPerGroup: 16,
  ...byOffset(14),
  layout: [1, 2, 3, 4].map(r => ({ group: null, row: r, kind: 'endless', count: 4, label: `encoders, row ${r}` })),
  names: {}
}

// Anything that sends plain CCs: number = the CC itself, group ignored
export const generic = {
  name: 'Generic CC controller',
  match: null,
  mode: 'abs',
  channel: null,
  encoder: (group, n) => ({ number: n, channel: null }),
  push: (group, n) => ({ note: n, channel: null }),
  names: {}
}

// Novation Launch Control XL 3. Two personalities, one at a time (verified on the unit 2026-09-24):
//   xl3     the factory custom mode on the "LCXL3 n MIDI" port pair: everything a 7-bit CC on channel 1,
//           encoders 13..36 by row, faders 5..12, buttons 37..44 / 45..52 (127 down, 0 up). A CC written
//           to an encoder sets its value (the single LED shows it as brightness), colours are fixed by the
//           mode, no text.
//   xl3daw  DAW mode on the "LCXL3 n DAW" port pair: the host greets it with a sysex and switches the
//           encoders relative; they report CC 77..100 on channel 16 as 64 +- step, faders CC 5..12 on
//           channel 16, activity as CC on channel 15 (127 as a knob or fader starts moving, 0 when it rests:
//           Ableton calls it touch, but it wants a tiny twist, the encoders do not sense a finger), buttons
//           CC 37..52 on channel 1. Any palette colour per
//           LED (a CC on channel 1, number = the custom-mode number), a text page per control on the
//           OLED (shown when it turns) and a static page, no written values.
// Feedback to the XL3 is paced: sixteen CCs back to back dropped one.
const XL3_ROWS = [
  { kind: 'endless', first: 13, label: 'encoders, top row' },
  { kind: 'endless', first: 21, label: 'encoders, middle row' },
  { kind: 'endless', first: 29, label: 'encoders, bottom row' },
  { kind: 'bounded', first: 5, label: 'faders' },
  { kind: 'button', first: 37, label: 'buttons, upper row' },
  { kind: 'button', first: 45, label: 'buttons, lower row', role: 'pages' }
]
const XL3_HEAD = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x15]
const xl3Row = (number) => XL3_ROWS.findIndex(r => number >= r.first && number < r.first + 8)
const xl3Layout = (closed) => XL3_ROWS.map((r, i) => ({ group: i + 1, kind: r.kind, count: 8, label: r.label, closed: r.kind === 'endless' ? closed : undefined, role: r.role }))
// a button press arrives as a CC 127 / 0: the value model wants a note
const xl3Buttons = (bytes) => {
  if (!bytes || (bytes[0] & 0xF0) !== 0xB0) return bytes
  const number = bytes[1]
  if (number < 37 || number > 52) return bytes
  return [(bytes[2] ? 0x90 : 0x80) | (bytes[0] & 0x0F), number, bytes[2] ? 100 : 0]
}
// the OLED: config F0 .. 04 target cfg F7 (cfg 0x61 two lines, 0x62 three, 0x7F show now, 0x00 cancel),
// text F0 .. 06 target field ascii F7; targets are the custom-mode numbers, 0x35 the static screen
const xl3Ascii = (s) => Array.from(String(s ?? '').replace(/[^\x20-\x7e]/g, ' ').slice(0, 16), c => c.charCodeAt(0))
const xl3TextFrames = (target, lines, opts = {}) => {
  const out = [[...XL3_HEAD, 0x04, target, lines.length > 2 ? 0x62 : 0x61, 0xF7]]
  lines.slice(0, 3).forEach((l, i) => out.push([...XL3_HEAD, 0x06, target, i, ...xl3Ascii(l), 0xF7]))
  if (opts.show !== false) out.push([...XL3_HEAD, 0x04, target, 0x7F, 0xF7])
  return out
}

export const xl3 = {
  name: 'Novation Launch Control XL 3 (custom mode)',
  id: 'xl3',
  match: /LCXL3 \d+ MIDI/i,
  mode: 'abs',
  channel: 1,
  pace: 20,
  groups: XL3_ROWS.length,
  encodersPerGroup: 8,
  layout: xl3Layout(true),
  encoder: (group, n) => ({ number: XL3_ROWS[group - 1].first + (n - 1), channel: 1 }),
  push: (group, n) => {
    if (group < 5) throw new Error('midi: the Launch Control XL 3 has no encoder push; its buttons are groups 5 and 6')
    return { note: XL3_ROWS[group - 1].first + (n - 1), channel: 1 }
  },
  locate: (number, ch) => {
    if (ch != null && ch !== 1) return null
    const g = xl3Row(number)
    return g < 0 ? null : [g + 1, number - XL3_ROWS[g].first + 1]
  },
  translate: xl3Buttons,
  feedback: {
    // value: the default echo, the device takes it
    lamp: (at, level) => [0xB0, at.number, Math.round(level * 127) & 0x7f]
  },
  names: {}
}

export const xl3daw = {
  name: 'Novation Launch Control XL 3 (DAW mode)',
  id: 'xl3daw',
  match: /LCXL3 \d+ DAW/i,
  mode: 'r2',
  channel: 16,
  pace: 20,
  groups: XL3_ROWS.length,
  encodersPerGroup: 8,
  layout: xl3Layout(false).map(r => (r.kind === 'bounded' ? { ...r, mode: 'abs' } : r)),
  // encoders report on 77..100 (the custom-mode number + 64), faders and buttons on their custom-mode numbers
  encoder: (group, n) => {
    const number = XL3_ROWS[group - 1].first + (n - 1)
    if (group <= 3) return { number: number + 64, channel: 16 }
    if (group === 4) return { number, channel: 16 }
    return { number, channel: 1 }
  },
  // a knob's activity marker (the 'touch' on channel 15) is its push; buttons are their own notes
  push: (group, n) => {
    const number = XL3_ROWS[group - 1].first + (n - 1)
    return group <= 4 ? { note: number, channel: 15 } : { note: number, channel: 1 }
  },
  locate: (number, ch) => {
    if (ch === 16 || ch == null) {
      if (number >= 77 && number <= 100) { const g = xl3Row(number - 64); return [g + 1, number - 64 - XL3_ROWS[g].first + 1] }
      if (number >= 5 && number <= 12) return [4, number - 4]
      if (ch === 16) return null
    }
    if (ch === 1 || ch == null) { const g = xl3Row(number); return g >= 4 ? [g + 1, number - XL3_ROWS[g].first + 1] : null }
    return null
  },
  translate: (bytes) => {
    if (!bytes || (bytes[0] & 0xF0) !== 0xB0) return bytes
    const ch = (bytes[0] & 0x0F) + 1
    if (ch === 15) {   // activity ('touch'): note on/off on channel 15, numbered as in the custom mode
      const number = bytes[1] >= 77 ? bytes[1] - 64 : bytes[1]
      return [(bytes[2] ? 0x90 : 0x80) | 14, number, bytes[2] ? 100 : 0]
    }
    return ch === 1 ? xl3Buttons(bytes) : bytes
  },
  // the custom-mode number is what colours and display pages are addressed by
  target: (at) => (at.channel === 16 && at.number >= 77 ? at.number - 64 : at.number),
  feedback: {
    value: false,
    colour: (at, index) => [0xB0, xl3daw.target(at), index & 0x7f],
    // a lamp level in the button's own hue: the palette's families run light, full, mid, dim (core/palette.js)
    lamp: (at, level) => {
      const base = at.colour === undefined ? 3 : at.colour
      const family = base >= 4 && base < 60 ? base - base % 4 : null
      const index = level <= 0 ? 0 : (family !== null ? family + (level > 0.66 ? 1 : level > 0.33 ? 2 : 3) : (level > 0.5 ? base : 1))
      return [0xB0, xl3daw.target(at), index & 0x7f]
    },
    text: (at, lines, opts) => xl3TextFrames(xl3daw.target(at), lines, Object.assign({ show: false }, opts)),
    page: (lines, opts) => xl3TextFrames(0x35, lines, opts)
  },
  connect: () => [
    [...XL3_HEAD, 0x02, 0x7F, 0xF7],                       // DAW mode on
    [0xB6, 69, 127], [0xB6, 72, 127], [0xB6, 73, 127],     // the three encoder rows relative
    [0xB6, 71, 127],                                       // activity ('touch') messages on
    // every LED off: the unit keeps whatever the last host left lit, and a dark knob means 'not a knob'
    ...[...Array(24)].map((_, i) => [0xB0, 13 + i, 0]), ...[...Array(16)].map((_, i) => [0xB0, 37 + i, 0])
  ],
  release: () => [[...XL3_HEAD, 0x02, 0x00, 0xF7]],
  names: {}
}


// Korg nanoKONTROL2 in its factory scene (verified by lightherder, src/midi.rs): everything a 7-bit CC on the
// global channel (1 from the factory; the handshake in adapters/nano.js learns it), faders 0..7, knobs 16..23,
// S 32..39, M 48..55, R 64..71 (127 down, 0 up), transport 41 play 42 stop 43 rewind 44 forward 45 record
// 46 cycle 58/59 track, markers 60 set 61 prev 62 next. Every continuous control is bounded (a pot or a
// fader: the hand sets where it stands), so the host does pickup, and nothing can be written to it but
// lamps, which answer only once the LED mode is External (the handshake). Rows as on the panel, knobs
// above faders, which is also the order parm fills them in (`fill`).
const NANO_ROWS = [
  { kind: 'bounded', first: 16, count: 8, label: 'knobs', fill: 1 },
  { kind: 'bounded', first: 0, count: 8, label: 'faders', fill: 2 },
  { kind: 'button', first: 32, count: 8, label: 'S buttons' },
  { kind: 'button', first: 48, count: 8, label: 'M buttons' },
  { kind: 'button', first: 64, count: 8, label: 'R buttons' },
  { kind: 'button', numbers: [58, 59, 46, 43, 44, 42, 41, 45], count: 8, label: 'transport: track <, track >, cycle, rewind, forward, stop, play, record', role: 'pageStep', step: [1, 2] },
  { kind: 'button', numbers: [60, 61, 62], count: 3, label: 'marker: set, <, >' }
]
const nanoNumber = (row, n) => (row.numbers ? row.numbers[n - 1] : row.first + (n - 1))
const nanoRowOf = (number) => NANO_ROWS.findIndex(r => (r.numbers ? r.numbers.includes(number) : number >= r.first && number < r.first + r.count))
export const nano = {
  name: 'Korg nanoKONTROL2',
  id: 'nano',
  match: /nanoKONTROL/i,
  mode: 'abs',
  channel: null,     // the value model takes any channel; lamps go on the learned global channel
  groups: NANO_ROWS.length,
  encodersPerGroup: 8,
  layout: NANO_ROWS.map((r, i) => ({ group: i + 1, kind: r.kind, count: r.count, label: r.label, fill: r.fill, role: r.role, step: r.step })),
  encoder: (group, n) => {
    const row = NANO_ROWS[group - 1]
    if (!row || n < 1 || n > row.count) throw new Error(`midi: no nanoKONTROL2 control at [${group}, ${n}]`)
    return { number: nanoNumber(row, n), channel: null }
  },
  push: (group, n) => {
    const row = NANO_ROWS[group - 1]
    if (!row || row.kind !== 'button') throw new Error('midi: the nanoKONTROL2 has no push on its knobs and faders; its buttons are groups 3 to 7')
    return { note: nanoNumber(row, n), channel: null }
  },
  locate: (number) => {
    const g = nanoRowOf(number)
    if (g < 0) return null
    const row = NANO_ROWS[g]
    return [g + 1, row.numbers ? row.numbers.indexOf(number) + 1 : number - row.first + 1]
  },
  translate: (bytes) => {
    if (!bytes || (bytes[0] & 0xF0) !== 0xB0) return bytes
    const g = nanoRowOf(bytes[1])
    if (g < 0 || NANO_ROWS[g].kind !== 'button') return bytes
    return [(bytes[2] ? 0x90 : 0x80) | (bytes[0] & 0x0F), bytes[1], bytes[2] ? 100 : 0]
  },
  feedback: {
    value: false,
    // a lamp is the button's own number, 127 or 0, on the global channel the handshake learned
    lamp: (at, level, device) => [0xB0 | (((device && device.nano && device.nano.channel) || 0) & 0x0F), at.number & 0x7F, level > 0 ? 127 : 0]
  },
  names: {}
}

export const profiles = { ec4, parm, generic, xl3, xl3daw, nano }

/**
 * Resolve what a sketch passed as a control id against a profile.
 *   number            -> as is
 *   [group, n]        -> profile.encoder(group, n)
 *   'name'            -> profile.names[name] then as above
 * Returns { number, channel } (channel may be null).
 */
export function resolveControl (profile, id) {
  if (typeof id === 'number') return { number: id, channel: profile ? profile.channel : null }
  if (Array.isArray(id) && id.length === 2) {
    if (!profile || !profile.encoder) throw new Error(`midi: [group, encoder] ids need a profile (use(profile))`)
    return profile.encoder(id[0], id[1])
  }
  if (typeof id === 'string') {
    if (!profile || !profile.names || !(id in profile.names)) throw new Error(`midi: unknown control name "${id}"`)
    return resolveControl(profile, profile.names[id])
  }
  throw new Error(`midi: bad control id ${JSON.stringify(id)}`)
}

export function resolvePush (profile, id) {
  if (typeof id === 'number') return { note: id, channel: profile ? profile.channel : null }
  if (Array.isArray(id) && id.length === 2) {
    if (!profile || !profile.push) throw new Error(`midi: [group, encoder] ids need a profile (use(profile))`)
    return profile.push(id[0], id[1])
  }
  if (typeof id === 'string') {
    if (!profile || !profile.names || !(id in profile.names)) throw new Error(`midi: unknown control name "${id}"`)
    return resolvePush(profile, profile.names[id])
  }
  throw new Error(`midi: bad control id ${JSON.stringify(id)}`)
}
