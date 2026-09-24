/**
 * Novation's 128-entry LED palette, as the Launchpad X programmer's reference manual (page 12,
 * "Colour palette") prints it, sampled from the chart on 2026-09-24. One 7-bit value picks an entry;
 * the Launch Control XL 3 takes it as a CC value on channel 1 in DAW mode, the Launchpads as a note
 * velocity. Entry 0 is off on a device (the chart draws it grey), 1..3 grey to white, 4..59 fourteen
 * hue families of four in the order light, full, mid, dim, 60..127 assorted shades with no structure.
 *
 *   palette[5]                 '#ff6161' (red, full)
 *   hue(RED, LEVEL.dim)        7
 *   nearest('#00ff00')         21
 *   level(index)               0..3 within a family, null outside 4..63
 */
export const palette = [
  '#616161', '#b3b3b3', '#dddddd', '#ffffff', '#ffb3b3', '#ff6161', '#dd6161', '#b36161',   // 0..7
  '#fff3d5', '#ffb361', '#dd8c61', '#b37661', '#ffeea1', '#ffff61', '#dddd61', '#b3b361',   // 8..15
  '#ddffa1', '#c2ff61', '#a1dd61', '#81b361', '#c2ffb3', '#61ff61', '#61dd61', '#61b361',   // 16..23
  '#c2ffc2', '#61ff8c', '#61dd76', '#61b36b', '#c2ffcc', '#61ffcc', '#61dda1', '#61b381',   // 24..31
  '#c2fff3', '#61ffe9', '#61ddc2', '#61b396', '#c2f3ff', '#61eeff', '#61c7dd', '#61a1b3',   // 32..39
  '#c2ddff', '#61c7ff', '#61a1dd', '#6181b3', '#a18cff', '#6161ff', '#6161dd', '#6161b3',   // 40..47
  '#ccb3ff', '#a161ff', '#8161dd', '#7661b3', '#ffb3ff', '#ff61ff', '#dd61dd', '#b361b3',   // 48..55
  '#ffb3d5', '#ff61c2', '#dd61a1', '#b3618c', '#ff7661', '#e9b361', '#ddc261', '#a1a161',   // 56..63
  '#61b361', '#61b38c', '#618cd5', '#6161ff', '#61b3b3', '#8c61f3', '#ccb3c2', '#8c7681',   // 64..71
  '#ff6161', '#f3ffa1', '#eefc61', '#ccff61', '#76dd61', '#61ffcc', '#61e9ff', '#61a1ff',   // 72..79
  '#8c61ff', '#cc61fc', '#ee8cdd', '#a17661', '#ffa161', '#ddf961', '#d5ff8c', '#61ff61',   // 80..87
  '#b3ffa1', '#ccfcd5', '#b3fff6', '#cce4ff', '#a1c2f6', '#d5c2f9', '#f98cff', '#ff61cc',   // 88..95
  '#ffc261', '#f3ee61', '#e4ff61', '#ddcc61', '#b3a161', '#61ba76', '#76c28c', '#8181a1',   // 96..103
  '#818ccc', '#ccaa81', '#dd6161', '#f9b3a1', '#f9ba76', '#fff38c', '#e9f9a1', '#d5ee76',   // 104..111
  '#8181a1', '#f9f9d5', '#ddfce4', '#e9e9ff', '#e4d5ff', '#b3b3b3', '#d5d5d5', '#f9ffff',   // 112..119
  '#e96161', '#aa6161', '#81f661', '#61b361', '#f3ee61', '#b3a161', '#eec261', '#c27661'   // 120..127
]

/** The fourteen hue families of the structured block, by the index of their light entry. */
export const families = {
  red: 4, orange: 8, yellow: 12, lime: 16, green: 20, spring: 24, turquoise: 28, cyan: 32,
  sky: 36, blue: 40, indigo: 44, purple: 48, magenta: 52, pink: 56
}
export const LEVEL = { light: 0, full: 1, mid: 2, dim: 3 }
export const OFF = 0
export const WHITE = 3

/** Entry for a family (a name from `families` or its light index) at a level 0..3. */
export function hue (family, lvl = LEVEL.full) {
  const base = typeof family === 'string' ? families[family] : family
  if (base === undefined || base < 4 || base > 56 || base % 4) throw new Error(`palette.hue: unknown family ${family}`)
  return base + Math.max(0, Math.min(3, lvl | 0))
}

/** Level 0..3 of an index in the structured block, or null. */
export function level (index) { return index >= 4 && index < 60 ? index % 4 : null }

/** Four entries of the family an index belongs to (light, full, mid, dim), for showing a value as a level; null outside the block. */
export function family (index) { return index >= 4 && index < 60 ? [0, 1, 2, 3].map(l => index - index % 4 + l) : null }

const rgbOf = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const rgbs = palette.map(rgbOf)

/** The palette index nearest a CSS hex colour (plain RGB distance), never 0 unless asked for black. */
export function nearest (hex) {
  const [r, g, b] = rgbOf(hex.startsWith('#') ? hex : '#' + hex)
  if (r + g + b === 0) return OFF
  let best = 1, bestD = Infinity
  for (let i = 1; i < 128; i++) {
    const [pr, pg, pb] = rgbs[i]; const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2
    if (d < bestD) { bestD = d; best = i }
  }
  return best
}

// What Ableton Live 12's Launch Control XL 3 script calls its colours (its `Rgb`), for cross-reference
export const ableton = { off: 0, white: 3, whiteHalf: 1, green: 21, greenHalf: 27, red: 5, redHalf: 7, blue: 41, blueHalf: 43, orange: 96, orangeHalf: 83, yellow: 97, purple: 53, turquoise: 39, darkBlue: 47 }
