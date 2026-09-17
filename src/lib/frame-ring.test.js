import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDepth, delayedIndex, makeDelayProxy } from './frame-ring.js'

test('depth is validated', () => {
  assert.equal(normalizeDepth(2), 2); assert.equal(normalizeDepth('30'), 30); assert.equal(normalizeDepth(undefined), 2)
  assert.throws(() => normalizeDepth(1), /out of range/); assert.throws(() => normalizeDepth(1000), /out of range/)
})

test('delayedIndex walks back around the ring and clamps', () => {
  assert.equal(delayedIndex(0, 2, 1), 1)        // ping-pong: the other buffer
  assert.equal(delayedIndex(1, 2, 1), 0)
  assert.equal(delayedIndex(5, 30, 3), 2)
  assert.equal(delayedIndex(1, 30, 3), 28)      // wraps
  assert.equal(delayedIndex(5, 30, 29), 6)      // oldest valid frame
  assert.equal(delayedIndex(5, 30, 99), 6)      // clamped to depth-1
  assert.equal(delayedIndex(5, 30, 0), 4)       // clamped up to 1
  assert.equal(delayedIndex(5, 30, () => 2.4), 3)   // function, rounded
})

test('delay proxy looks like a texture source', () => {
  const calls = []
  const out = { id: 3, label: 'o3', getTexture: (d) => { calls.push(d); return 'tex' + d } }
  const p = makeDelayProxy(out, 7)
  assert.equal(p.getTexture(), 'tex7'); assert.equal(p.getCurrent(), 'tex7'); assert.equal(p.id, 3)
  assert.match(p.label, /o3\.delay\(7\)/)
  const fn = () => 4
  makeDelayProxy(out, fn).getTexture()            // functions are passed through; the output resolves them per frame
  assert.deepEqual(calls, [7, 7, fn])
})
