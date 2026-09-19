/**
 * Virtual control surface: a panel of draggable numbers standing in for encoder groups.
 *
 * Each cell is one encoder of one group. Drag up/down (or wheel) turns it, click pushes it,
 * shift while dragging holds the push (fine mode). The panel synthesises the same MIDI
 * bytes the device would send and feeds them to controller.handleMessage(), so value
 * model, curves, fine and display feedback all behave exactly as with hardware. Values
 * shown are read back from the controller, so real-device moves are mirrored too.
 *
 *   import { mountPanel } from 'hydra-midi-controller/ui/panel'
 *   const panel = mountPanel(element, controller, {
 *     groups: [{ group: 1, title: 'LOPA', labels: [...16], descs: { GAIN: '...' } }, ...],
 *     pixelsPerStep: 4,       // drag distance per detent
 *     mode: 'r2'              // bytes to synthesise: 'r2' | 'r1' | 'abs'
 *   })
 *   panel.destroy()
 */

const CSS = `
.mp { display: flex; flex-wrap: wrap; gap: 10px; font-family: monospace; font-size: 11px; color: #ccc; user-select: none; }
.mp-group { background: rgba(0,0,0,0.6); border: 1px solid #333; padding: 4px 6px; }
.mp-title { color: #9cf; margin-bottom: 2px; }
.mp-grid { display: grid; grid-template-columns: repeat(4, auto); gap: 2px 10px; }
.mp-cell { position: relative; cursor: ns-resize; white-space: pre; padding: 1px 2px; border-radius: 2px; }
.mp-cell:hover { background: #222; }
.mp-cell.mp-active { background: #443; }
.mp-cell.mp-pushed { outline: 1px solid #ff9; }
.mp-label { color: #ff9; }
.mp-value { color: #eee; }
.mp-bar { position: absolute; left: 2px; right: 2px; bottom: 0; height: 2px; background: #666; }
.mp-bar > i { display: block; height: 100%; background: #ff9; width: 0; }
.mp-cell:hover .mp-tip { display: block; }
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

export function mountPanel (element, controller, options = {}) {
  const document = element.ownerDocument   // a popup window's document, when the panel lives there
  injectCss(document)
  const opts = Object.assign({ groups: [], pixelsPerStep: 4, mode: 'r2', refreshMs: 100 }, options)
  const profile = controller.profile
  if (!profile || !profile.encoder) throw new Error('mountPanel: controller needs a profile with encoder(group, n)')

  const root = document.createElement('div'); root.className = 'mp'
  element.appendChild(root)

  const cells = []
  const fmt = (v) => (v === null ? '  --  ' : (Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(3)).padStart(6))

  const bytesFor = (channel, number, up) => {
    const ch = 0xB0 | (((channel || 1) - 1) & 0x0f)
    if (opts.mode === 'r1') return [ch, number, up ? 127 : 1]
    return [ch, number, up ? 65 : 63]
  }
  const findControl = (channel, number) => {
    const st = controller.state
    return st.controls.get(`${channel == null ? '*' : channel}:${number}`) || st.controls.get(`*:${number}`) || null
  }

  const titles = new Map()
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
      const cell = document.createElement('div'); cell.className = 'mp-cell'
      const lab = document.createElement('span'); lab.className = 'mp-label'; lab.textContent = label.padEnd(4) + ' '
      const val = document.createElement('span'); val.className = 'mp-value'; val.textContent = fmt(null)
      const bar = document.createElement('div'); bar.className = 'mp-bar'; const fill = document.createElement('i'); bar.appendChild(fill)
      const tip = document.createElement('div'); tip.className = 'mp-tip'
      // label case is the convention: UPPER a knob, Capitalised a switch you turn, lowercase a push-only button
      const kind = /^[a-z]/.test(label) ? 'push-only button: click' : (/^[A-Z][a-z]/.test(label) ? 'switch: turn to flip' : 'knob: drag up/down or wheel, shift = fine')
      // the name and what it does lead; how to work it and where it lives on the wire follow, smaller and dimmer
      const line = (cls, text) => { if (!text) return; const el = document.createElement('span'); el.className = cls; el.textContent = text; tip.appendChild(el) }
      line('mp-tip-name', label)
      line('mp-tip-desc', (g.descs && g.descs[label]) || '')
      line('mp-tip-how', kind)
      line('mp-tip-tech', `group ${g.group}, encoder ${n}, cc ${number} ch ${channel ?? 'any'}`)
      cell.appendChild(lab); cell.appendChild(val); cell.appendChild(bar); cell.appendChild(tip)
      grid.appendChild(cell)
      const rec = { cell, val, fill, number, channel, push, pushed: false }
      cells.push(rec)

      const sendSteps = (steps) => {
        const up = steps > 0
        for (let i = 0; i < Math.abs(steps); i++) controller.handleMessage(bytesFor(channel, number, up))
      }
      const setPushed = (on) => {
        if (!push || rec.pushed === on) return
        rec.pushed = on
        cell.classList.toggle('mp-pushed', on)
        controller.handleMessage([(on ? 0x90 : 0x80) | (((push.channel || 1) - 1) & 0x0f), push.note, on ? 100 : 0])
      }

      const holdButton = /^[a-z]/.test(label)
      let drag = null
      cell.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return
        cell.setPointerCapture(e.pointerId)
        drag = { y: e.clientY, moved: 0, fine: e.shiftKey, pushedByShift: false }
        if (e.shiftKey) { setPushed(true); drag.pushedByShift = true }
        else if (holdButton) setPushed(true)   // a push-only button is held for as long as the pointer is
        cell.classList.add('mp-active')
        e.preventDefault()
      })
      cell.addEventListener('pointermove', (e) => {
        if (!drag) return
        const dy = drag.y - e.clientY
        const steps = Math.trunc(dy / opts.pixelsPerStep)
        if (steps !== 0) { sendSteps(steps); drag.y = e.clientY; drag.moved += Math.abs(steps) }
      })
      const endDrag = (e) => {
        if (!drag) return
        cell.classList.remove('mp-active')
        if (holdButton && !drag.pushedByShift) { setPushed(false); drag = null; return }
        const tap = drag.moved === 0 && !drag.pushedByShift
        if (drag.pushedByShift) setPushed(false)
        drag = null
        if (tap) { setPushed(true); setTimeout(() => setPushed(false), 80) }   // click = a push (note on/off)
      }
      cell.addEventListener('pointerup', endDrag)
      cell.addEventListener('pointercancel', endDrag)
      cell.addEventListener('wheel', (e) => {
        e.preventDefault()
        const steps = e.deltaY < 0 ? 1 : -1
        if (e.shiftKey) { setPushed(true); sendSteps(steps); setPushed(false) } else sendSteps(steps)
      }, { passive: false })
    }
    box.appendChild(grid)
    root.appendChild(box)
  }

  const refresh = () => {
    for (const c of cells) {
      const rec = findControl(c.channel, c.number)
      if (!rec) { c.val.textContent = fmt(null); c.fill.style.width = '0'; continue }
      const cfg = rec.config
      const v = cfg.curve === 'log' ? cfg.min * Math.pow(cfg.max / cfg.min, rec.pos) : (cfg.curve === 'exp' ? cfg.min + (cfg.max - cfg.min) * rec.pos * rec.pos : cfg.min + (cfg.max - cfg.min) * rec.pos)
      c.val.textContent = fmt(v)
      c.fill.style.width = `${Math.round(rec.pos * 100)}%`
    }
  }
  refresh()
  const timer = setInterval(refresh, opts.refreshMs)

  return {
    root,
    refresh,
    /** Mark the group the controller is on (null = none). */
    setActiveGroup: (n) => { for (const [g, el] of titles) { el.style.color = g === n ? '#fd6' : ''; el.style.fontWeight = g === n ? 'bold' : '' } },
    destroy: () => { clearInterval(timer); root.remove() }
  }
}
