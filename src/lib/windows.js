/**
 * Windows on screens: where a page's windows go on a rig with more than one monitor, and remembering it.
 *
 * A browser puts a popup on the screen its opener is on and forgets where it was dragged. With the
 * Window Management API (Chrome 100+, one permission prompt from a user gesture) a page can list its
 * screens, open a window on a chosen one and go fullscreen there. This module wraps that for two roles:
 *
 *   'stage'  the picture: the largest external screen (the projector), fullscreen
 *   'panel'  the controls: the internal screen (the laptop), or the primary one
 *
 * and remembers where each named window ended up, keyed by a fingerprint of the set of screens, so a
 * layout comes back only on the same rig and a strange rig gets the heuristic, never stale coordinates.
 * Positions are stored as a screen plus an offset within it, so rearranging displays in System
 * Settings does not move a window off its screen.
 *
 *   const info = await getScreens()                 // no prompt: what is known now
 *   const info = await getScreens({ ask: true })    // in a click handler: prompts once, then remembers
 *   const win  = await openWindow('panel', { role: 'panel', width: 900, height: 700 })
 *   const p    = await portal('panel', { role: 'panel', title: 'Controls' })   // -> { root, window, boxed, close() }
 *   await fullscreenOn(canvas, 'stage')             // fullscreen on the stage's screen
 *
 * portal() renders into a popup's body when one opens, and into a box over the page when popups are
 * blocked (Safari, Firefox, a blocker), so the calling code is the same either way: it gets a root
 * element. Stylesheets are copied across (and kept in step) so the same components look the same.
 *
 * The pure parts (fingerprint, homeFor, placements, the store) run in node; see windows.test.js.
 */

// ---- screens -----------------------------------------------------------------------------------

/** A screen as this module sees it (a ScreenDetailed or window.screen, flattened). */
export function describeScreen (s, index = 0, current = false) {
  const n = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d)
  // window.screen has availLeft/availTop but no left/top: the available area says where the screen is
  return {
    index,
    left: n(s.left, n(s.availLeft)), top: n(s.top, n(s.availTop)), width: n(s.width), height: n(s.height),
    availLeft: n(s.availLeft, n(s.left)), availTop: n(s.availTop, n(s.top)),
    availWidth: n(s.availWidth, n(s.width)), availHeight: n(s.availHeight, n(s.height)),
    dpr: n(s.devicePixelRatio, 1),
    internal: !!s.isInternal,
    primary: typeof s.isPrimary === 'boolean' ? s.isPrimary : index === 0,
    label: s.label || '',
    current: !!current,
  }
}

const hasWindow = () => typeof window !== 'undefined' && typeof document !== 'undefined'

/** Is the window-management permission already granted (so getScreenDetails() needs no gesture)? */
export async function screensGranted () {
  if (!hasWindow() || !navigator.permissions) return false
  for (const name of ['window-management', 'window-placement']) {
    try { const st = await navigator.permissions.query({ name }); return st.state === 'granted' } catch (e) { /* unknown name here */ }
  }
  return false
}

/**
 * The screens. Without the permission (or the API) it is the one screen the window is on, with
 * `extended` saying whether there are more. `ask: true` calls getScreenDetails(), which prompts the
 * first time and must then be inside a user gesture; once granted it needs no gesture and no ask.
 * -> { screens, current, extended, granted, details }
 */
export async function getScreens ({ ask = false } = {}) {
  if (!hasWindow()) return { screens: [], current: -1, extended: false, granted: false, details: null }
  const one = () => {
    const s = describeScreen(window.screen, 0, true)
    return { screens: [s], current: 0, extended: !!window.screen.isExtended, granted: false, details: null }
  }
  if (typeof window.getScreenDetails !== 'function') return one()
  if (!ask && !(await screensGranted())) return one()
  try {
    const details = await window.getScreenDetails()
    const screens = details.screens.map((s, i) => describeScreen(s, i, s === details.currentScreen))
    return { screens, current: screens.findIndex(s => s.current), extended: screens.length > 1, granted: true, details }
  } catch (e) {
    return one()
  }
}

/** Call fn (with fresh getScreens()) when screens are added, removed or change. Returns an unlisten. */
export function onScreensChange (details, fn) {
  if (!details || typeof details.addEventListener !== 'function') return () => {}
  const h = async () => fn(await getScreens())
  details.addEventListener('screenschange', h)
  details.addEventListener('currentscreenchange', h)
  return () => { details.removeEventListener('screenschange', h); details.removeEventListener('currentscreenchange', h) }
}

// ---- naming a set of screens ---------------------------------------------------------------------

const shapeOf = (s) => `${s.width}x${s.height}@${s.dpr}${s.internal ? 'i' : ''}`

/**
 * An id for a screen within its set: shape, plus an ordinal when two screens share a shape (in
 * left-to-right, top-to-bottom order). Labels are not used: they can be empty or generic.
 */
export function screenId (s, screens) {
  const same = screens.filter(o => shapeOf(o) === shapeOf(s)).sort((a, b) => a.left - b.left || a.top - b.top)
  return same.length > 1 ? `${shapeOf(s)}#${same.indexOf(s)}` : shapeOf(s)
}

/** A name for the whole set, the same whatever order the screens come in and however they are arranged. */
export function fingerprint (screens) {
  return screens.map(shapeOf).sort().join('+') || 'none'
}

// ---- where a role goes when nothing is remembered ------------------------------------------------

/**
 * The index of the screen a role belongs on. 'panel': the internal screen, else the primary. 'stage':
 * the biggest screen that is not the panel's, non-primary first on a tie. Any other role goes with
 * the panel. One screen: that one.
 */
export function homeFor (role, screens) {
  if (!screens.length) return -1
  if (screens.length === 1) return 0
  const area = (s) => s.width * s.height
  const panel = screens.find(s => s.internal) || screens.find(s => s.primary) || screens[0]
  if (role !== 'stage') return panel.index
  const others = screens.filter(s => s !== panel).sort((a, b) => area(b) - area(a) || (a.primary ? 1 : 0) - (b.primary ? 1 : 0))
  return (others[0] || panel).index
}

// ---- placements: a window's spot as (screen, offset within it) ---------------------------------

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi))

/** The screen containing a point, else the nearest by centre distance. */
export function screenAt (x, y, screens) {
  const inside = screens.find(s => x >= s.left && x < s.left + s.width && y >= s.top && y < s.top + s.height)
  if (inside) return inside
  const d = (s) => Math.hypot(s.left + s.width / 2 - x, s.top + s.height / 2 - y)
  return screens.slice().sort((a, b) => d(a) - d(b))[0] || null
}

/**
 * An absolute box { left, top, width, height } -> { screen, x, y, w, h } (offset from the screen's
 * available area). A window whose centre is on no known screen is put on the nearest, unless only
 * one screen is known (no permission): then it is somewhere the page cannot see, and null is returned
 * rather than a guess.
 */
export function placementOf (box, screens) {
  const cx = box.left + box.width / 2, cy = box.top + box.height / 2
  const s = screenAt(cx, cy, screens)
  if (!s) return null
  const inside = cx >= s.left && cx < s.left + s.width && cy >= s.top && cy < s.top + s.height
  if (!inside && screens.length === 1) return null
  return { screen: screenId(s, screens), x: box.left - s.availLeft, y: box.top - s.availTop, w: box.width, h: box.height, fullscreen: !!box.fullscreen }
}

/** A placement -> an absolute box on the matching screen of this set, kept inside it; null if the screen is not here. */
export function boxOf (placement, screens) {
  const s = screens.find(o => screenId(o, screens) === placement.screen)
  if (!s) return null
  const width = clamp(placement.w, 100, s.availWidth), height = clamp(placement.h, 100, s.availHeight)
  return {
    left: clamp(s.availLeft + placement.x, s.availLeft, s.availLeft + s.availWidth - width),
    top: clamp(s.availTop + placement.y, s.availTop, s.availTop + s.availHeight - height),
    width, height, screen: s, fullscreen: !!placement.fullscreen,
  }
}

/** A box of the given size in the middle of a screen (or filling it when it does not fit). */
export function centred (s, width, height) {
  const w = Math.min(width, s.availWidth), h = Math.min(height, s.availHeight)
  return { left: Math.round(s.availLeft + (s.availWidth - w) / 2), top: Math.round(s.availTop + (s.availHeight - h) / 2), width: w, height: h, screen: s }
}

/** The box a window occupies now (outer edges), from the same-origin window object. */
export function boxOfWindow (win) {
  return { left: win.screenX, top: win.screenY, width: win.outerWidth, height: win.outerHeight }
}

// ---- remembering ---------------------------------------------------------------------------------

/**
 * Layouts in a storage (localStorage by default): { [fingerprint]: { [name]: placement } }.
 * The storage only needs getItem/setItem/removeItem.
 */
export function layoutStore (storage, key = 'hydra.windows') {
  const st = storage || (hasWindow() && window.localStorage) || null
  const load = () => { try { return JSON.parse(st && st.getItem(key)) || {} } catch (e) { return {} } }
  const write = (all) => { try { if (st) st.setItem(key, JSON.stringify(all)) } catch (e) { /* storage full or off */ } }
  return {
    key,
    all: load,
    get (fp, name) { const a = load(); return (a[fp] && a[fp][name]) || null },
    set (fp, name, placement) { const a = load(); (a[fp] = a[fp] || {})[name] = placement; write(a); return placement },
    forget (fp, name) {
      const a = load()
      if (fp === undefined) { try { st && st.removeItem(key) } catch (e) { /* off */ } return }
      if (name === undefined) delete a[fp]; else if (a[fp]) delete a[fp][name]
      write(a)
    },
  }
}

let defaultStore = null
const storeOf = (s) => s || defaultStore || (defaultStore = layoutStore())

// ---- opening windows -----------------------------------------------------------------------------

/** Where a named window should go now: its remembered spot on this rig, else the role's home, centred. */
export function whereFor (name, { role = 'panel', width = 800, height = 600, screens, store } = {}) {
  const fp = fingerprint(screens)
  const saved = storeOf(store).get(fp, name)
  const box = saved && boxOf(saved, screens)
  if (box) return Object.assign(box, { remembered: true })
  const home = screens[homeFor(role, screens)]
  return home ? Object.assign(centred(home, width, height), { remembered: false }) : null
}

/**
 * Remember where a window is, now and as it moves: a poll (popups have no move event) saves its
 * placement when it changes, and once more as it closes. Returns a stop function.
 */
export function watchWindow (win, name, { screens, store, every = 1000 } = {}) {
  const fp = fingerprint(screens), s = storeOf(store)
  let last = ''
  const save = () => {
    try {
      if (win.closed) return
      const box = boxOfWindow(win)
      const sig = JSON.stringify(box)
      if (sig === last) return
      last = sig
      const p = placementOf(box, screens)
      if (p) s.set(fp, name, p)
    } catch (e) { /* window gone or cross-origin */ }
  }
  save()
  const timer = setInterval(() => { if (win.closed) stop(); else save() }, every)
  try { win.addEventListener('pagehide', save) } catch (e) { /* cross-origin */ }
  const stop = () => clearInterval(timer)
  return stop
}

/**
 * window.open() a named window where it belongs (see whereFor) and watch it. `url` '' gives a blank
 * same-origin document to build into. Returns the window, or null when blocked.
 */
export async function openWindow (name, { role = 'panel', url = '', width = 800, height = 600, features = '', screens, store } = {}) {
  if (!hasWindow()) return null
  const info = screens ? { screens } : await getScreens()
  const box = whereFor(name, { role, width, height, screens: info.screens, store })
  const feats = box ? `left=${Math.round(box.left)},top=${Math.round(box.top)},width=${Math.round(box.width)},height=${Math.round(box.height)}` : `width=${width},height=${height}`
  const win = window.open(url, name, features ? `${feats},${features}` : feats)
  if (!win) return null
  // Chrome may ignore a position on another screen without the permission: settle for what it gave
  if (info.screens.length) watchWindow(win, name, { screens: info.screens, store })
  return win
}

// ---- a portal: a root element in a popup, or in a box over the page --------------------------------

/** Copy the opener's <style> and <link rel=stylesheet> into another document, and keep copying as they are added. */
export function copyStyles (from, to) {
  const copy = (el) => {
    if (!(el instanceof from.defaultView.HTMLStyleElement) && !(el.tagName === 'LINK' && /stylesheet/i.test(el.rel || ''))) return
    const c = to.importNode(el, true)
    if (el.tagName === 'LINK' && el.href) c.href = el.href
    to.head.appendChild(c)
  }
  from.head.querySelectorAll('style, link[rel~=stylesheet]').forEach(copy)
  const mo = new from.defaultView.MutationObserver((muts) => muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) copy(n) })))
  mo.observe(from.head, { childList: true })
  return () => mo.disconnect()
}

/** Re-dispatch a document's keydown events (outside text fields) on another document: the opener keeps its keys. */
export function forwardKeys (from, to) {
  const h = (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return
    to.dispatchEvent(new to.defaultView.KeyboardEvent('keydown', { key: e.key, code: e.code, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey }))
  }
  from.addEventListener('keydown', h)
  return () => from.removeEventListener('keydown', h)
}

// z-index 1500: above a Vuetify layout (900), below its overlays (2000), so tooltips still show over the box
const BOX_CSS = 'position: fixed; right: 8px; top: 8px; width: 800px; max-width: calc(100vw - 32px); max-height: 85vh; overflow: auto; z-index: 1500; padding: 8px; background: rgba(17,17,17,0.94); border: 1px solid #444; color: #ccc; font: 12px monospace; box-sizing: border-box;'

/**
 * A place to render a panel: the body of a popup opened where it belongs, or, when popups are
 * blocked (or `box: 'always'`), a box over this page. Either way -> { root, document, window, boxed,
 * closed, close(), focus(), onClose(fn) }. Options: role, title, width, height, styles (copy the
 * opener's stylesheets, default true), keys (forward keydown to the opener, default true), box
 * (fall back to a box, default true; 'always' never opens a window), boxStyle (CSS text for the box),
 * closeWithOpener (default true), screens, store.
 */
export async function portal (name, opts = {}) {
  const { role = 'panel', title = name, width = 800, height = 600, styles = true, keys = true, box = true, boxStyle, closeWithOpener = true, screens, store } = opts
  if (!hasWindow()) return null
  const closers = [], cleanups = []
  const fire = () => { cleanups.splice(0).forEach(f => { try { f() } catch (e) { /* */ } }); closers.splice(0).forEach(f => { try { f() } catch (e) { /* */ } }) }
  const win = box === 'always' ? null : await openWindow(name, { role, width, height, screens, store })
  if (win) {
    let d = win.document
    // a fresh popup is about:blank with no doctype: quirks mode, where a <table> does not inherit colour or
    // font size but takes the body's (a panel's icons went grey). A doctype puts the document in standards mode
    if (d.compatMode !== 'CSS1Compat') { d.open(); d.write('<!DOCTYPE html><html><head></head><body></body></html>'); d.close(); d = win.document }
    d.title = title
    d.body.innerHTML = ''
    d.body.style.cssText = 'margin: 8px; background: #111; color: #ccc; font: 12px monospace;'
    if (styles) cleanups.push(copyStyles(document, d))
    if (keys) cleanups.push(forwardKeys(d, document))
    if (closeWithOpener) {
      const h = () => { try { if (!win.closed) win.close() } catch (e) { /* */ } }
      window.addEventListener('pagehide', h); cleanups.push(() => window.removeEventListener('pagehide', h))
    }
    const timer = setInterval(() => { if (win.closed) { clearInterval(timer); fire() } }, 300)
    cleanups.push(() => clearInterval(timer))
    return { root: d.body, document: d, window: win, boxed: false, get closed () { return win.closed }, close () { try { win.close() } catch (e) { /* */ } fire() }, focus () { try { win.focus() } catch (e) { /* */ } }, onClose (fn) { closers.push(fn) } }
  }
  if (!box) return null
  const root = document.createElement('div')
  root.style.cssText = boxStyle || BOX_CSS
  root.setAttribute('data-portal', name)
  document.body.appendChild(root)
  let closed = false
  return { root, document, window: null, boxed: true, get closed () { return closed }, close () { if (closed) return; closed = true; root.remove(); fire() }, focus () {}, onClose (fn) { closers.push(fn) } }
}

// ---- fullscreen on a chosen screen -----------------------------------------------------------------

/**
 * Fullscreen an element on a screen: a role ('stage'), a screen index, or a screen from getScreens().
 * With the permission the element goes fullscreen on that screen even from another; without it, on
 * the screen the window is on. Resolves true when fullscreen was entered.
 */
export async function fullscreenOn (el, target = 'stage', info) {
  if (!hasWindow() || !el || !el.requestFullscreen) return false
  info = info || await getScreens()
  const s = typeof target === 'number' ? info.screens[target] : typeof target === 'string' ? info.screens[homeFor(target, info.screens)] : target
  const raw = info.details && s ? info.details.screens[s.index] : null
  try { await el.requestFullscreen(raw ? { screen: raw, navigationUI: 'hide' } : { navigationUI: 'hide' }); return true } catch (e) {
    try { await el.requestFullscreen(); return true } catch (e2) { return false }
  }
}
