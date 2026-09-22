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

export const profiles = { ec4, parm, generic }

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
