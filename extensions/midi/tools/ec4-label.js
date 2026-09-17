#!/usr/bin/env node
/**
 * Label and configure Faderfox EC4 encoders in a .syx backup, offline.
 *
 *   node ec4-label.js show  backup.syx [--setup 1] [--group 1]
 *   node ec4-label.js label backup.syx out.syx --setup 1 --group 1 1=GAIN 2=ROT 3=ZOOM ...
 *   node ec4-label.js apply backup.syx out.syx labels.json
 *
 * labels.json: { "setupName": {"1": "HERD"}, "groupName": {"1": {"1": "CAM"}},
 *                "encoders": {"1": {"1": {"1": "GAIN", "2": {"name": "ROT", "type": "CCR2", "mode": "Acc1"}}}} }
 *                (setup -> group -> encoder -> name or settings)
 * Then load out.syx in the Faderfox editor (Load file) and Send to EC4, or send it with
 * midi.ec4.send() from a sketch. Only whole images can be sent; the file is always complete.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { parseDump, encodeDump } from '../core/ec4-sysex.js'

const [cmd, inFile, ...rest] = process.argv.slice(2)
const opt = (name, def) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : def }

if (!cmd || !inFile) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0].split('\n').slice(1).map(l => l.replace(/^ \* ?/, '')).join('\n'))
  process.exit(1)
}

const img = parseDump(readFileSync(inFile))
console.error(`read ${inFile}: firmware ${img.version}, ${img.pages} pages`)

if (cmd === 'show') {
  const s = Number(opt('--setup', 1)), g = opt('--group')
  if (g) console.log(img.describeGroup(s, Number(g)))
  else {
    for (let i = 1; i <= 16; i++) console.log(`setup ${String(i).padStart(2)} "${img.getSetupName(i)}"  groups: ${Array.from({ length: 16 }, (_, k) => img.getGroupName(i, k + 1)).join(' ')}`)
  }
} else if (cmd === 'label') {
  const outFile = rest[0]
  const s = Number(opt('--setup', 1)), g = Number(opt('--group', 1))
  const map = {}
  for (const a of rest.slice(1)) { const m = /^(\d+)=(.*)$/.exec(a); if (m) map[m[1]] = m[2] }
  img.labelGroup(s, g, map)
  writeFileSync(outFile, encodeDump(img))
  console.error(`wrote ${outFile}`); console.log(img.describeGroup(s, g))
} else if (cmd === 'apply') {
  const outFile = rest[0]
  const spec = JSON.parse(readFileSync(rest[1], 'utf8'))
  for (const [s, name] of Object.entries(spec.setupName || {})) img.setSetupName(Number(s), name)
  for (const [s, groups] of Object.entries(spec.groupName || {})) for (const [g, name] of Object.entries(groups)) img.setGroupName(Number(s), Number(g), name)
  for (const [s, groups] of Object.entries(spec.encoders || {})) for (const [g, map] of Object.entries(groups)) img.labelGroup(Number(s), Number(g), map)
  writeFileSync(outFile, encodeDump(img))
  console.error(`wrote ${outFile}`)
} else {
  console.error(`unknown command ${cmd}`); process.exit(1)
}
