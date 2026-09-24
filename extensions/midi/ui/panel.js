/**
 * Virtual control surface: a panel of draggable numbers standing in for a controller.
 *
 * Two ways to draw it. `groups` (herder) draws the default device's encoder groups as 4 x 4
 * grids with fixed labels. `devices` draws every device of the controller that has a layout
 * (core/profiles.js) in its own shape: the XL3 as three rows of eight knobs, its faders and its
 * two button rows; labels, values, colours and pickup state come live from the device, so it is
 * the on-screen key to whatever parm (or a page) put on the knobs.
 *
 * Each cell is one control. Drag up/down (or wheel) turns it, click pushes it, shift while
 * dragging holds the push (fine mode). The panel synthesises the bytes the device would send
 * and feeds them to device.handleMessage(), so value model, curves, fine and feedback all
 * behave exactly as with hardware. Values shown are read back, so real moves are mirrored too.
 *
 *   import { mountPanel } from 'hydra-midi-controller/ui/panel'
 *   const panel = mountPanel(element, controller, {
 *     groups: [{ group: 1, title: 'LOPA', labels: [...16], descs: { GAIN: '...' } }, ...],   // herder; no labels = live ones
 *     devices: true,          // or ['xl3daw']: every device with a layout, live labels
 *     pixelsPerStep: 4,       // drag distance per detent
 *     mode: 'r2',             // bytes to synthesise for `groups`: 'r2' | 'r1' | 'abs'
 *     onCell: (info, event)   // hover ('enter' | 'leave') and 'click' on a cell: { device, group, n, number, channel, label }
 *   })
 *   panel.destroy()
 */

import { palette as PALETTE } from '../core/palette.js'

const CSS = `
.mp { display: flex; flex-wrap: wrap; gap: 10px; font-family: monospace; font-size: 11px; color: #ccc; user-select: none; }
.mp-group { background: rgba(0,0,0,0.6); border: 1px solid #333; padding: 4px 6px; }
.mp-title { color: #9cf; margin-bottom: 2px; }
.mp-grid { display: grid; grid-template-columns: repeat(4, auto); gap: 2px 10px; }
.mp-row { display: grid; gap: 2px 6px; margin-top: 3px; }
.mp-rowname { color: #777; font-size: 10px; margin-top: 4px; }
.mp-pages { color: #777; }
.mp-page { cursor: pointer; padding: 0 4px; color: #aaa; }
.mp-page.mp-page-live { color: #fd6; font-weight: bold; }
.mp-cell { position: relative; cursor: ns-resize; white-space: pre; padding: 1px 2px; border-radius: 2px; border-left: 3px solid transparent; }
.mp-cell:hover { background: #222; }
.mp-cell.mp-active { background: #443; }
.mp-cell.mp-pushed { outline: 1px solid #ff9; }
.mp-cell.mp-last { background: #353; }
.mp-cell.mp-dark { opacity: 0.45; }
.mp-cell.mp-button { cursor: pointer; }
.mp-cell.mp-fader { cursor: ns-resize; }
.mp-cell.mp-on { outline: 1px solid #9f9; }
.mp-label { color: #ff9; }
.mp-value { color: #eee; }
.mp-wait { color: #f66; }
.mp-bar { position: absolute; left: 2px; right: 2px; bottom: 0; height: 2px; background: #666; }
.mp-bar > i { display: block; height: 100%; background: #ff9; width: 0; }
.mp-bar > b { position: absolute; top: -2px; width: 2px; height: 6px; background: #f66; }
/* the roll-over belongs to the name, not the whole cell: the value is for dragging, and a tip over it is in the way */
.mp-label:hover ~ .mp-tip { display: block; }
.mp-label { cursor: help; }
.mp-cell.mp-active .mp-label:hover ~ .mp-tip { display: none; }   /* not while the knob is being dragged */
.mp-tip { display: none; position: absolute; left: 0; bottom: 1.8em; z-index: 5; width: 26em; white-space: normal;
  background: #1b1b1b; color: #eee; border: 1px solid #665; padding: 6px 9px; line-height: 1.35; cursor: default; box-shadow: 0 2px 10px rgba(0,0,0,0.6); }
.mp-tip-name { display: block; color: #fd6; font-weight: bold; font-size: 1.35em; letter-spacing: 0.04em; margin-bottom: 2px; }
.mp-tip-desc { display: block; color: #fff; font-size: 1.1em; margin-bottom: 5px; }
.mp-tip-how { display: block; color: #9cf; font-size: 0.92em; }
.mp-tip-tech { display: block; color: #777; font-size: 0.85em; }
`

const styled = new WeakSet()   // documents that carry the panel's style
function injectCss (doc) {
  if (!doc || styled.has(doc)) return
  const st = doc.createElement('style'); st.textContent = CSS; doc.head.appendChild(st)
  styled.add(doc)
}

const fmt = (v) => (v === null || v === undefined ? '  --  ' : (Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(3)).padStart(6))
const valueOf = (rec) => {
  const cfg = rec.config
  return cfg.curve === 'log' ? cfg.min * Math.pow(cfg.max / cfg.min, rec.pos) : (cfg.curve === 'exp' ? cfg.min + (cfg.max - cfg.min) * rec.pos * rec.pos : cfg.min + (cfg.max - cfg.min) * rec.pos)
}
const findControl = (state, channel, number) => state.controls.get(`${channel == null ? '*' : channel}:${number}`) || state.controls.get(`*:${number}`) || null

export function mountPanel (element, controller, options = {}) {
  const document = element.ownerDocument   // a popup window's document, when the panel lives there
  injectCss(document)
  const opts = Object.assign({ groups: [], devices: false, pixelsPerStep: 4, mode: 'r2', refreshMs: 100, onCell: null }, options)
  const root = document.createElement('div'); root.className = 'mp'
  element.appendChild(root)

  const cells = []
  const titles = new Map()
  const pagers = []
  const line = (tip, cls, text) => { if (!text) return; const el = document.createElement('span'); el.className = cls; el.textContent = text; tip.appendChild(el) }

  // bytes a turn on this device's control would send
  const bytesFor = (device, rec, channel, number, up) => {
    const ch = 0xB0 | (((channel || 1) - 1) & 0x0f)
    const mode = (rec && rec.config.mode) || (device ? device.state.defaults.mode : opts.mode)
    if (mode === 'r1') return [ch, number, up ? 127 : 1]
    if (mode === 'r2') return [ch, number, up ? 65 : 63]
    return null   // absolute: the cell keeps a position of its own, see wire()
  }

  /**
   * One cell. `target` says where it lives: { device (null = the controller's default), channel,
   * number, push: { note, channel } | null, kind: 'endless' | 'bounded' | 'button', label (fixed) }
   */
  const makeCell = (target, tipLines) => {
    const device = target.device || controller.default
    const feed = (bytes) => (target.device ? target.device.handleMessage(bytes) : controller.handleMessage(bytes))
    const cell = document.createElement('div'); cell.className = 'mp-cell' + (target.kind === 'button' ? ' mp-button' : target.kind === 'bounded' ? ' mp-fader' : '')
    const lab = document.createElement('span'); lab.className = 'mp-label'; lab.textContent = (target.label || '').padEnd(4) + ' '
    const val = document.createElement('span'); val.className = 'mp-value'; val.textContent = fmt(null)
    const bar = document.createElement('div'); bar.className = 'mp-bar'; const fill = document.createElement('i'); bar.appendChild(fill)
    const phys = document.createElement('b'); phys.style.display = 'none'; bar.appendChild(phys)
    const tip = document.createElement('div'); tip.className = 'mp-tip'
    for (const [cls, text] of tipLines) line(tip, cls, text)
    cell.appendChild(lab); cell.appendChild(val); cell.appendChild(bar); cell.appendChild(tip)
    const rec = { cell, lab, val, fill, phys, tip, target, device, pushed: false, position: 64 }
    cells.push(rec)

    const info = () => ({ device: device && device.id, group: target.group, n: target.n, number: target.number, channel: target.channel, label: rec.label || target.label, kind: target.kind })
    if (opts.onCell) {
      cell.addEventListener('pointerenter', () => opts.onCell(info(), 'enter'))
      cell.addEventListener('pointerleave', () => opts.onCell(info(), 'leave'))
    }

    const sendSteps = (steps) => {
      const up = steps > 0
      const ctl = findControl(device.state, target.channel, target.number)
      const rel = bytesFor(target.device, ctl, target.channel, target.number, up)
      if (rel) { for (let i = 0; i < Math.abs(steps); i++) feed(rel); return }
      // an absolute control: the cell stands somewhere, as a fader does, and a turn moves it
      rec.position = Math.max(0, Math.min(127, rec.position + steps * 2))
      feed([0xB0 | (((target.channel || 1) - 1) & 0x0f), target.number, rec.position])
    }
    const setPushed = (on) => {
      const push = target.push
      if (!push || rec.pushed === on) return
      rec.pushed = on
      cell.classList.toggle('mp-pushed', on)
      feed([(on ? 0x90 : 0x80) | (((push.channel || 1) - 1) & 0x0f), push.note, on ? 100 : 0])
    }

    const holdButton = target.kind === 'button' || /^[a-z]/.test(target.label || '')
    let drag = null
    cell.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      cell.setPointerCapture(e.pointerId)
      drag = { y: e.clientY, moved: 0, fine: e.shiftKey, pushedByShift: false }
      if (e.shiftKey && target.kind !== 'button') { setPushed(true); drag.pushedByShift = true }
      else if (holdButton) setPushed(true)   // a button is held for as long as the pointer is
      cell.classList.add('mp-active')
      e.preventDefault()
    })
    cell.addEventListener('pointermove', (e) => {
      if (!drag || target.kind === 'button') return
      const dy = drag.y - e.clientY
      const steps = Math.trunc(dy / opts.pixelsPerStep)
      if (steps !== 0) { sendSteps(steps); drag.y = e.clientY; drag.moved += Math.abs(steps) }
    })
    const endDrag = (e) => {
      if (!drag) return
      cell.classList.remove('mp-active')
      if (holdButton && !drag.pushedByShift) { setPushed(false); drag = null; if (opts.onCell) opts.onCell(info(), 'click'); return }
      const tap = drag.moved === 0 && !drag.pushedByShift
      if (drag.pushedByShift) setPushed(false)
      drag = null
      if (tap) {
        if (opts.onCell) opts.onCell(info(), 'click')
        if (target.push && !target.device) { setPushed(true); setTimeout(() => setPushed(false), 80) }   // click = a push (note on/off) on a knob with one
      }
    }
    cell.addEventListener('pointerup', endDrag)
    cell.addEventListener('pointercancel', endDrag)
    cell.addEventListener('wheel', (e) => {
      if (target.kind === 'button') return
      e.preventDefault()
      const steps = e.deltaY < 0 ? 1 : -1
      if (e.shiftKey && target.push) { setPushed(true); sendSteps(steps); setPushed(false) } else sendSteps(steps)
    }, { passive: false })
    return rec
  }

  // ---- herder's groups: the default device, fixed labels, 4 x 4
  const profile = controller.profile
  if (opts.groups.length && (!profile || !profile.encoder)) throw new Error('mountPanel: controller needs a profile with encoder(group, n)')
  for (const g of opts.groups) {
    const box = document.createElement('div'); box.className = 'mp-group'
    const title = document.createElement('div'); title.className = 'mp-title'; title.textContent = `GR${String(g.group).padStart(2, '0')} ${g.title || ''}`
    if (opts.onGroupClick) {
      title.style.cursor = 'pointer'
      title.title = 'click: put the controller on this group'
      title.addEventListener('click', () => opts.onGroupClick(g.group))
    }
    titles.set(g.group, title)
    box.appendChild(title)
    const grid = document.createElement('div'); grid.className = 'mp-grid'
    for (let n = 1; n <= 16; n++) {
      const label = (g.labels && g.labels[n - 1]) || `E${n}`
      const { number, channel } = profile.encoder(g.group, n)
      const push = profile.push ? profile.push(g.group, n) : null
      // label case is the convention: UPPER a knob, Capitalised a switch you turn, lowercase a push-only button
      const how = /^[a-z]/.test(label) ? 'push-only button: click' : (/^[A-Z][a-z]/.test(label) ? 'switch: turn to flip' : 'knob: drag up/down or wheel, shift = fine')
      // groups given with labels are fixed (herder); without, the labels come live from the controls (parm)
      const rec = makeCell({ device: null, group: g.group, n, channel, number, push, kind: 'endless', label: g.labels ? label : '', fixed: !!g.labels },
        [['mp-tip-name', label], ['mp-tip-desc', (g.descs && g.descs[label]) || ''], ['mp-tip-how', how], ['mp-tip-tech', `group ${g.group}, encoder ${n}, cc ${number} ch ${channel ?? 'any'}`]])
      grid.appendChild(rec.cell)
    }
    box.appendChild(grid)
    root.appendChild(box)
  }

  // ---- devices with a layout, in their own shape, labels live
  const wanted = opts.devices === true ? [...controller.devices.values()] : Array.isArray(opts.devices) ? opts.devices.map(id => controller.device(id)).filter(Boolean) : []
  for (const dev of wanted) {
    const rows = (dev.profile.layout || []).filter(r => r.group)
    if (!rows.length) continue
    if (!dev.inputs.length && !dev.state.controls.size) continue   // not plugged in and nothing on it
    const box = document.createElement('div'); box.className = 'mp-group mp-device'
    const title = document.createElement('div'); title.className = 'mp-title'; title.textContent = dev.profile.name || dev.id
    const pager = document.createElement('span'); pager.className = 'mp-pages'; title.appendChild(pager)
    // the pages of a device: the live one lit, click another to put it on the surface
    const drawPages = () => {
      pager.textContent = ''
      // pages that hold a control, and the live one
      let last = 1
      for (let p = 1; p <= dev.pages; p++) if (p === dev.page || dev.stateFor(p).controls.size) last = p
      if (last < 2) return
      pager.appendChild(document.createTextNode('   page '))
      for (let p = 1; p <= last; p++) {
        const b = document.createElement('span'); b.className = 'mp-page' + (p === dev.page ? ' mp-page-live' : ''); b.textContent = String(p)
        b.addEventListener('click', () => dev.setPage(p))
        pager.appendChild(b)
      }
    }
    drawPages()
    pagers.push(drawPages)
    box.appendChild(title)
    for (const r of rows) {
      const name = document.createElement('div'); name.className = 'mp-rowname'; name.textContent = r.label || `row ${r.group}`
      box.appendChild(name)
      const row = document.createElement('div'); row.className = 'mp-row'; row.style.gridTemplateColumns = `repeat(${r.count || 8}, auto)`
      for (let n = 1; n <= (r.count || 8); n++) {
        let push = null
        try { push = dev.profile.push ? dev.profile.push(r.group, n) : null } catch (e) { push = null }
        const at = r.kind === 'button' ? { number: push.note, channel: push.channel } : dev.profile.encoder(r.group, n)
        const how = r.kind === 'button' ? 'button: click (hold = held)' : r.kind === 'bounded' ? 'fader: drag up/down or wheel moves it; the value catches up when it crosses' : 'knob: drag up/down or wheel, shift = fine'
        const rec = makeCell({ device: dev, group: r.group, n, channel: at.channel, number: at.number, push: r.kind === 'button' ? push : (r.kind === 'endless' ? push : null), kind: r.kind, label: '' },
          [['mp-tip-name', ''], ['mp-tip-desc', ''], ['mp-tip-how', how], ['mp-tip-tech', `${dev.id}: ${r.label || 'row ' + r.group} ${n}, cc ${at.number} ch ${at.channel ?? 'any'}`]])
        row.appendChild(rec.cell)
      }
      box.appendChild(row)
    }
    root.appendChild(box)
  }

  // the cell of the last event lights for a moment: which knob just moved
  let lastCell = null
  const unEvent = controller.onEvent((ev) => {
    if (ev.number === undefined) return
    const hit = cells.find(c => (c.device && c.device.id) === ev.device && c.target.number === ev.number && (c.target.channel == null || ev.channel == null || c.target.channel === ev.channel)) ||
      cells.find(c => (c.device && c.device.id) === ev.device && c.target.push && c.target.push.note === ev.number && (c.target.push.channel == null || c.target.push.channel === ev.channel))
    if (!hit) return
    if (lastCell && lastCell !== hit) lastCell.cell.classList.remove('mp-last')
    lastCell = hit
    hit.cell.classList.add('mp-last')
    clearTimeout(hit.lastTimer); hit.lastTimer = setTimeout(() => hit.cell.classList.remove('mp-last'), 600)
  })

  const refresh = () => {
    for (const draw of pagers) draw()
    for (const c of cells) {
      const t = c.target
      const state = c.device.state
      if (t.kind === 'button') {
        const note = t.push && (state.notes.get(`${t.push.channel == null ? '*' : t.push.channel}:${t.push.note}`) || state.notes.get(`*:${t.push.note}`))
        const held = t.push && state.held.has(`${t.push.channel}:${t.push.note}`)
        c.cell.classList.toggle('mp-on', !!(held || (note && (note.toggled || note.held))))
        c.val.textContent = note ? (note.config.toggle ? (note.toggled ? '  on  ' : '  off ') : (held ? ' held ' : '      ')) : fmt(null)
        c.cell.classList.toggle('mp-dark', !note)
        continue
      }
      const rec = findControl(state, t.channel, t.number)
      const colour = c.device._colours && c.device._colours.get(`${t.channel}:${t.number}`)
      c.cell.style.borderLeftColor = colour ? PALETTE[colour] : 'transparent'
      if (!rec) { c.val.textContent = fmt(null); c.fill.style.width = '0'; c.phys.style.display = 'none'; c.cell.classList.add('mp-dark'); if (!t.fixed) { c.lab.textContent = '     '; c.label = '' } continue }
      c.cell.classList.remove('mp-dark')
      const label = t.fixed ? t.label : (rec.config.label && rec.config.label !== '----' ? rec.config.label : '')
      if (!t.fixed && label !== c.label) { c.label = label; c.lab.textContent = (label || '').padEnd(4) + ' '; const nm = c.tip.querySelector('.mp-tip-name'); if (nm) nm.textContent = label }
      c.val.textContent = fmt(valueOf(rec))
      c.fill.style.width = `${Math.round(Math.min(Math.max(rec.pos, 0), 1) * 100)}%`
      if (t.kind === 'bounded' || rec.config.pickup === 'soft') {
        const waiting = rec.config.pickup === 'soft' && !rec.caught
        c.val.classList.toggle('mp-wait', waiting)
        if (rec.phys !== undefined) { c.phys.style.display = 'block'; c.phys.style.left = `${Math.round(rec.phys * 100)}%` } else c.phys.style.display = 'none'
      }
    }
  }
  refresh()
  const timer = setInterval(refresh, opts.refreshMs)

  return {
    root,
    refresh,
    cells,
    /** Mark the group the controller is on (null = none). */
    setActiveGroup: (n) => { for (const [g, el] of titles) { el.style.color = g === n ? '#fd6' : ''; el.style.fontWeight = g === n ? 'bold' : '' } },
    destroy: () => { clearInterval(timer); unEvent(); root.remove() }
  }
}
