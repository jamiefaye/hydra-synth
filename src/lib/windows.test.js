import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeScreen, fingerprint, screenId, homeFor, placementOf, boxOf, centred, layoutStore, whereFor, screenAt } from './windows.js'

// a laptop (internal, primary) to the left of a projector
const laptop = describeScreen({ left: 0, top: 0, width: 1512, height: 982, availLeft: 0, availTop: 38, availWidth: 1512, availHeight: 944, devicePixelRatio: 2, isInternal: true, isPrimary: true, label: 'Built-in Retina Display' }, 0, true)
const projector = describeScreen({ left: 1512, top: 0, width: 1920, height: 1080, availLeft: 1512, availTop: 0, availWidth: 1920, availHeight: 1080, devicePixelRatio: 1, isInternal: false, isPrimary: false, label: 'EPSON' }, 1)
const rig = [laptop, projector]
// a desktop: two identical externals, the primary on the left
const ext = (i, primary) => describeScreen({ left: i * 2560, top: 0, width: 2560, height: 1440, availLeft: i * 2560, availTop: 25, availWidth: 2560, availHeight: 1415, devicePixelRatio: 1, isInternal: false, isPrimary: primary }, i)
const desk = [ext(0, true), ext(1, false)]

const mem = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) } }

test('describeScreen: window.screen (no left/top) is placed by its available area', () => {
  const s = describeScreen({ width: 1920, height: 1080, availLeft: 1312, availTop: 30, availWidth: 1920, availHeight: 973, isExtended: true }, 0, true)
  assert.equal(s.left, 1312); assert.equal(s.top, 30); assert.equal(s.dpr, 1); assert.equal(s.primary, true); assert.equal(s.internal, false)
  // a popup that landed on the unseen screen to the left is not inside it, so it is not remembered
  assert.equal(placementOf({ left: 562, top: 183, width: 700, height: 466 }, [s]), null)
  assert.equal(placementOf({ left: 1400, top: 183, width: 700, height: 466 }, [s]).x, 88)
})

test('fingerprint names the set, not the arrangement or the labels', () => {
  assert.equal(fingerprint(rig), '1512x982@2i+1920x1080@1')
  assert.equal(fingerprint([projector, laptop]), fingerprint(rig))
  const moved = rig.map(s => ({ ...s, left: s.left + 500, label: '' }))
  assert.equal(fingerprint(moved), fingerprint(rig))
  assert.notEqual(fingerprint([laptop]), fingerprint(rig))
  assert.equal(fingerprint([]), 'none')
})

test('screenId tells identical screens apart by position', () => {
  assert.equal(screenId(laptop, rig), '1512x982@2i')
  assert.equal(screenId(desk[0], desk), '2560x1440@1#0')
  assert.equal(screenId(desk[1], desk), '2560x1440@1#1')
})

test('homeFor: panel on the laptop, stage on the projector; desktop: stage on the non-primary', () => {
  assert.equal(homeFor('panel', rig), 0)
  assert.equal(homeFor('stage', rig), 1)
  assert.equal(homeFor('macros', rig), 0)
  assert.equal(homeFor('panel', desk), 0)
  assert.equal(homeFor('stage', desk), 1)
  assert.equal(homeFor('stage', [laptop]), 0)
  assert.equal(homeFor('stage', []), -1)
})

test('placements are screen + offset and round-trip; a missing screen gives null', () => {
  const box = { left: 1512 + 100, top: 50, width: 800, height: 600 }
  const p = placementOf(box, rig)
  assert.deepEqual(p, { screen: '1920x1080@1', x: 100, y: 50, w: 800, h: 600, fullscreen: false })
  const back = boxOf(p, rig)
  assert.equal(back.left, 1612); assert.equal(back.top, 50); assert.equal(back.width, 800); assert.equal(back.screen, projector)
  assert.equal(boxOf(p, [laptop]), null)
  // the projector moved to the other side: the window stays on it
  const swapped = [{ ...laptop, left: 1920, availLeft: 1920 }, { ...projector, left: 0, availLeft: 0 }]
  assert.equal(boxOf(p, swapped).left, 100)
})

test('boxOf keeps a window inside its screen when it would hang off', () => {
  const p = { screen: '1512x982@2i', x: 1400, y: 900, w: 800, h: 600 }
  const b = boxOf(p, rig)
  assert.equal(b.left + b.width, 1512)
  assert.equal(b.top + b.height, 38 + 944)
  const big = boxOf({ screen: '1512x982@2i', x: 0, y: 0, w: 5000, h: 5000 }, rig)
  assert.equal(big.width, 1512); assert.equal(big.height, 944)
})

test('centred and screenAt', () => {
  const c = centred(projector, 800, 600)
  assert.deepEqual([c.left, c.top, c.width, c.height], [1512 + 560, 240, 800, 600])
  assert.equal(screenAt(1600, 500, rig), projector)
  assert.equal(screenAt(-100, -100, rig), laptop)   // nearest when outside every screen
  // off every known screen: the nearest when the rig is known, nothing when only one screen is
  assert.equal(placementOf({ left: -900, top: 0, width: 800, height: 600 }, rig).screen, screenId(laptop, rig))
  assert.equal(placementOf({ left: -900, top: 0, width: 800, height: 600 }, [laptop]), null)
})

test('layoutStore keeps placements per fingerprint and forgets by rig, by name, or wholesale', () => {
  const st = layoutStore(mem(), 'test.windows')
  const fp = fingerprint(rig)
  st.set(fp, 'panel', { screen: 'a', x: 1, y: 2, w: 3, h: 4 })
  st.set(fp, 'stage', { screen: 'b', x: 0, y: 0, w: 9, h: 9 })
  st.set('other', 'panel', { screen: 'c', x: 0, y: 0, w: 1, h: 1 })
  assert.equal(st.get(fp, 'panel').screen, 'a')
  assert.equal(st.get('nope', 'panel'), null)
  st.forget(fp, 'stage'); assert.equal(st.get(fp, 'stage'), null); assert.equal(st.get(fp, 'panel').screen, 'a')
  st.forget(fp); assert.equal(st.get(fp, 'panel'), null); assert.equal(st.get('other', 'panel').screen, 'c')
  st.forget(); assert.deepEqual(st.all(), {})
  const broken = layoutStore({ getItem: () => '{not json', setItem () {}, removeItem () {} })
  assert.deepEqual(broken.all(), {})
})

test('whereFor: remembered on this rig, the home otherwise', () => {
  const store = layoutStore(mem())
  const first = whereFor('panel', { role: 'panel', width: 900, height: 700, screens: rig, store })
  assert.equal(first.remembered, false); assert.equal(first.screen, laptop); assert.equal(first.width, 900)
  const stage = whereFor('stage', { role: 'stage', width: 900, height: 700, screens: rig, store })
  assert.equal(stage.screen, projector)
  // the user dragged the panel onto the projector: that is where it goes next time on this rig
  store.set(fingerprint(rig), 'panel', placementOf({ left: 2000, top: 100, width: 640, height: 480 }, rig))
  const again = whereFor('panel', { role: 'panel', screens: rig, store })
  assert.equal(again.remembered, true); assert.equal(again.screen, projector); assert.equal(again.left, 2000)
  // on a different rig the memory does not apply
  const elsewhere = whereFor('panel', { role: 'panel', screens: desk, store })
  assert.equal(elsewhere.remembered, false); assert.equal(elsewhere.screen, desk[0])
})
