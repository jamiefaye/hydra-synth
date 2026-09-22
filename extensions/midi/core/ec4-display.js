/**
 * Faderfox EC4 OLED over sysex, live. These are the "special fixed commands" Ableton's
 * Faderfox Universal 2 script uses to put track and device names on the display: nothing
 * is stored and the device is not in Receive; it shows the text until it redraws that part
 * of the screen from its setup memory. No MIDI here, only bytes and a labels model.
 *
 * Verified on firmware 2.x, 2026-09-22:
 *   names   replaces the 16 four-character encoder names of the group on screen, but only
 *           where the stored name is '----' (a stored name wins: manual, "Ableton Live
 *           Setups"). Survives encoder turns; a setup/group change or a power cycle redraws
 *           the stored names, so a host re-sends on every group change.
 *   screen  4 rows x 20 characters of free text over the whole display until hidden.
 * Source: faderfox.de/settings/Faderfox_Universal_2.zip (faderfox_display_element.py, consts.py).
 *
 * Bytes: F0 00 00 00 4E 2C 1B | 4E 22 cmd | 4A 2h 1l (char offset) | 4D 2h 1l per char | F7
 *   cmd 10 = names (offset 0..63); 13 = write screen text (offset 0..79), followed by 14 = show it;
 *   15 = hide the screen text (no data)
 */

export const EC4_HEAD = [0xF0, 0x00, 0x00, 0x00, 0x4E, 0x2C, 0x1B]
export const NAME_WIDTH = 4
export const NAMES_PER_GROUP = 16
export const ROW_WIDTH = 20
export const ROWS = 4
export const BLANK_NAME = '----'

const nib = (v) => [0x20 | ((v >> 4) & 0x0f), 0x10 | (v & 0x0f)]
const chars = (text) => Array.from(text, (c) => [0x4D, ...nib(c.charCodeAt(0))]).flat()

/** Printable ASCII only, padded or cut to width. */
export function fit (text, width) {
  const s = String(text ?? '').replace(/[^\x20-\x7e]/g, ' ')
  return s.length >= width ? s.slice(0, width) : s.padEnd(width, ' ')
}

/**
 * Sixteen names from an array (index 0 = encoder 1) or a { encoder: name } map (1-based).
 * Missing entries are '----', the blank the device shows itself.
 */
export function normalizeNames (names) {
  const out = Array(NAMES_PER_GROUP).fill(BLANK_NAME)
  const put = (i, n) => { if (i >= 0 && i < NAMES_PER_GROUP && n != null) out[i] = fit(n, NAME_WIDTH) }
  if (Array.isArray(names)) names.forEach((n, i) => put(i, n))
  else if (names && typeof names === 'object') for (const [e, n] of Object.entries(names)) put(Number(e) - 1, n)
  return out
}

/** Name write for the group on screen: all 16 names, from encoder 1. */
export function namesBytes (names) {
  return [...EC4_HEAD, 0x4E, 0x22, 0x10, 0x4A, ...nib(0), ...chars(normalizeNames(names).join('')), 0xF7]
}

/** Name write that puts the device's own blanks back. */
export function clearNamesBytes () { return namesBytes([]) }

/** Whole-screen text: a string with newlines or an array of rows, up to 4 x 20; shown until hidden. */
export function screenBytes (rows) {
  const list = Array.isArray(rows) ? rows : String(rows ?? '').split('\n')
  const text = Array.from({ length: ROWS }, (_, i) => fit(list[i], ROW_WIDTH)).join('')
  return [...EC4_HEAD, 0x4E, 0x22, 0x13, 0x4A, ...nib(0), ...chars(text), 0x4E, 0x22, 0x14, 0xF7]
}

/** Take the screen text down and show the normal view again. */
export function hideScreenBytes () { return [...EC4_HEAD, 0x4E, 0x22, 0x15, 0xF7] }

/** Group and setup select as the device speaks them (1-based in, 0-based nibbles on the wire). */
export const selectBytes = (setup, group) => [...EC4_HEAD, 0x4E, 0x28, 0x10 | (setup - 1), 0x4E, 0x24, 0x10 | (group - 1), 0xF7]
export const QUERY_BYTES = [0xF0, 0x00, 0x00, 0x00, 0x4E, 0x20, 0x10, 0xF7]
export const parseSelect = (b) => (b.length === 14 && EC4_HEAD.every((v, i) => b[i] === v) && b[7] === 0x4E && b[8] === 0x28 && b[10] === 0x4E && b[11] === 0x24)
  ? { setup: (b[9] & 15) + 1, group: (b[12] & 15) + 1 } : null

/**
 * What every group should show: setup -> group -> 16 names. The device only keeps what is
 * on screen, so a host keeps this and re-sends from it.
 */
export class Ec4Labels {
  constructor () { this.map = new Map() }
  static key (setup, group) { return `${setup}:${group}` }

  /** Replace (array) or merge ({ encoder: name }) the names of one group. */
  set (setup, group, names) {
    const k = Ec4Labels.key(setup, group)
    if (Array.isArray(names) || !names) { this.map.set(k, normalizeNames(names)); return this }
    const cur = this.map.get(k) || Array(NAMES_PER_GROUP).fill(BLANK_NAME)
    const add = normalizeNames(names)
    for (const [e, n] of Object.entries(names)) { const i = Number(e) - 1; if (i >= 0 && i < NAMES_PER_GROUP && n != null) cur[i] = add[i] }
    this.map.set(k, cur)
    return this
  }

  get (setup, group) { return this.map.get(Ec4Labels.key(setup, group)) || null }
  clear (setup, group) {
    if (setup === undefined) this.map.clear()
    else if (group === undefined) for (const k of [...this.map.keys()]) { if (k.startsWith(`${setup}:`)) this.map.delete(k) }
    else this.map.delete(Ec4Labels.key(setup, group))
    return this
  }

  /** Groups that have names in a setup, ascending. */
  groups (setup) {
    return [...this.map.keys()].filter(k => k.startsWith(`${setup}:`)).map(k => Number(k.split(':')[1])).sort((a, b) => a - b)
  }
}

/**
 * Labels from a controller's registered controls: a control's `label` option, else the
 * profile name that resolves to it, on every encoder it sits on (aliases included).
 * profile.locate(number, channel) -> [group, n] says where a CC lives on the surface.
 */
export function labelsFromControls (controller, setup) {
  const labels = new Ec4Labels()
  const profile = controller.profile
  if (!profile || !profile.locate) return labels
  const byKey = new Map()   // 'channel:number' -> profile name
  for (const [name, id] of Object.entries(profile.names || {})) {
    try {
      const at = Array.isArray(id) ? profile.encoder(id[0], id[1]) : (typeof id === 'number' ? { number: id, channel: profile.channel } : null)
      if (at) byKey.set(`${at.channel ?? '*'}:${at.number}`, name)
    } catch (e) { /* a name that does not resolve is not a label */ }
  }
  for (const rec of controller.state.controls.values()) {
    for (const a of rec.aliases || []) {
      const at = profile.locate(a.number, a.channel)
      if (!at) continue
      const label = rec.config.label ?? byKey.get(`${a.channel ?? '*'}:${a.number}`) ?? byKey.get(`*:${a.number}`)
      if (label == null) continue
      labels.set(setup, at[0], { [at[1]]: label })
    }
  }
  return labels
}
