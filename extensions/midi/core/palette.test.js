import { test } from 'node:test'
import assert from 'node:assert/strict'
import { palette, families, LEVEL, hue, level, family, nearest, ableton } from './palette.js'

test('palette has 128 entries and the anchors the chart shows', () => {
  assert.equal(palette.length, 128)
  assert.equal(palette[3], '#ffffff')
  assert.equal(palette[5], '#ff6161')
  assert.equal(palette[21], '#61ff61')
  assert.equal(palette[45], '#6161ff')
  assert.ok(palette.every(h => /^#[0-9a-f]{6}$/.test(h)))
})

test('families are four levels light, full, mid, dim', () => {
  assert.equal(hue('red'), 5)
  assert.equal(hue('red', LEVEL.dim), 7)
  assert.equal(hue(families.green, LEVEL.light), 20)
  assert.deepEqual(family(22), [20, 21, 22, 23])
  assert.equal(level(7), 3)
  assert.equal(level(96), null)
  assert.throws(() => hue('mauve'), /unknown family/)
  // the full entry of each family is the most saturated of its four
  for (const base of Object.values(families)) {
    const sat = (h) => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return Math.max(r, g, b) - Math.min(r, g, b) }
    assert.ok(sat(palette[base + 1]) >= sat(palette[base]), `family ${base}`)
  }
})

test('nearest finds the obvious entries', () => {
  assert.equal(nearest('#000000'), 0)
  assert.equal(nearest('#ffffff'), 3)
  assert.equal(nearest('#ff6161'), 5)
  assert.equal(nearest('61ff61'), 21)
  assert.equal(nearest(palette[ableton.purple]), ableton.purple)
})
