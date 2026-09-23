import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Deglobalize } from './Deglobalize.js'

const D = (t) => Deglobalize(t, '_h').replace(/\s+/g, ' ').trim()

test('references to the watched globals read through the prefix', () => {
  assert.equal(D('osc(() => time * 0.1).out()'), 'osc(() => _h.time * 0.1).out();')
  assert.equal(D('speed = 0.5'), '_h.speed = 0.5;')
  assert.equal(D('osc(10).out(o0, cube(0.5).rotateY(() => time))'), 'osc(10).out(o0, cube(0.5).rotateY(() => _h.time));')
})

test('declarations, parameters, keys, member names and labels are not references', () => {
  assert.equal(D('let time = 5\nosc(time).out()'), 'let time = 5 osc(time).out()')            // the sketch's own time: nothing rewritten, text as written
  assert.equal(D('const o = { time: 1, bpm: 2 }\nosc(() => time).out()'), 'const o = { time: 1, bpm: 2 }; osc(() => _h.time).out();')
  assert.equal(D('foo.speed = 3\nosc(() => speed).out()'), 'foo.speed = 3; osc(() => _h.speed).out();')
  assert.equal(D('osc(10).rotate((speed) => speed * time).out()'), 'osc(10).rotate(speed => speed * _h.time).out();')
  assert.equal(D('function fps () { return 1 }\nosc(fps()).out()'), 'function fps () { return 1 } osc(fps()).out()')   // as written
  assert.equal(D('const o = { time }'), 'const o = { time: _h.time };')
  assert.equal(D('const { time } = obj\nosc(time).out()'), 'const { time } = obj osc(time).out()')   // destructured: the sketch's own, as written
})

test('nothing to rewrite: the text comes back as written, comments and all', () => {
  assert.equal(Deglobalize('// a comment 2024\nosc(10).out()', '_h'), '// a comment 2024\nosc(10).out()')
  assert.equal(Deglobalize('osc(10).out() // trailing', '_h'), 'osc(10).out() // trailing')
})

test('text that will not parse comes back unchanged for the eval to report', () => {
  assert.equal(Deglobalize('osc(10).out(', '_h'), 'osc(10).out(')
})
