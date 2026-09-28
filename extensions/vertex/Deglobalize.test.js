import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Deglobalize } from './Deglobalize.js'

const D = (t) => Deglobalize(t, '_h')

test('references to the watched globals read through the prefix', () => {
  assert.equal(D('osc(() => time * 0.1).out()'), 'osc(() => _h.time * 0.1).out()')
  assert.equal(D('speed = 0.5'), '_h.speed = 0.5')
  assert.equal(D('osc(10).out(o0, cube(0.5).rotateY(() => time))'), 'osc(10).out(o0, cube(0.5).rotateY(() => _h.time))')
})

test('declarations, parameters, keys, member names and labels are not references', () => {
  assert.equal(D('let time = 5\nosc(time).out()'), 'let time = 5\nosc(time).out()')            // the sketch's own time: nothing rewritten
  assert.equal(D('const o = { time: 1, bpm: 2 }\nosc(() => time).out()'), 'const o = { time: 1, bpm: 2 }\nosc(() => _h.time).out()')
  assert.equal(D('foo.speed = 3\nosc(() => speed).out()'), 'foo.speed = 3\nosc(() => _h.speed).out()')
  assert.equal(D('osc(10).rotate((speed) => speed * time).out()'), 'osc(10).rotate((speed) => speed * _h.time).out()')
  assert.equal(D('function fps () { return 1 }\nosc(fps()).out()'), 'function fps () { return 1 }\nosc(fps()).out()')   // as written
  assert.equal(D('const o = { time }'), 'const o = { time: _h.time }')
  assert.equal(D('const { time } = obj\nosc(time).out()'), 'const { time } = obj\nosc(time).out()')   // destructured: the sketch's own
})

test('nothing to rewrite: the text comes back as written, comments and all', () => {
  assert.equal(Deglobalize('// a comment 2024\nosc(10).out()', '_h'), '// a comment 2024\nosc(10).out()')
  assert.equal(Deglobalize('osc(10).out() // trailing', '_h'), 'osc(10).out() // trailing')
})

test('a rewrite keeps every line where it was, comments and spacing included', () => {
  const src = '// a sketch\nosc(10,   () => time * 0.1) // fast\n  .rotate(() => speed)\n  .out()   // done\nbpm = 120'
  const out = Deglobalize(src, '_h')
  assert.equal(out, '// a sketch\nosc(10,   () => _h.time * 0.1) // fast\n  .rotate(() => _h.speed)\n  .out()   // done\n_h.bpm = 120')
  assert.equal(out.split('\n').length, src.split('\n').length)
  // an error on line 4 of the eval is an error on line 4 of the sketch
  src.split('\n').forEach((line, i) => { if (!/time|speed|bpm/.test(line)) assert.equal(out.split('\n')[i], line) })
})

test('text that will not parse comes back unchanged for the eval to report', () => {
  assert.equal(Deglobalize('osc(10).out(', '_h'), 'osc(10).out(')
})
