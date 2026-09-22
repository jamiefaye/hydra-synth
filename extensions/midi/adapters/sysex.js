/**
 * EC4 configuration over the wire: receive a dump from the device, send an image back.
 * Needs a transport opened with sysex (Web MIDI: requestMIDIAccess({ sysex: true })).
 *
 * The device side is manual, per Faderfox:
 *   receive: on the EC4, Func > Setup > Send > hold "Send all setups" until it starts
 *   send:    on the EC4, Func > Setup > Receive ("Work in progress"), then call send()
 * Sending overwrites all 16 setups. Keep a backup (.syx) before the first send.
 */
import { parseDump, encodeDump, Ec4Image } from '../core/ec4-sysex.js'
import { Ec4Labels, labelsFromControls, namesBytes, clearNamesBytes, screenBytes, hideScreenBytes, selectBytes, parseSelect, QUERY_BYTES } from '../core/ec4-display.js'

// Remote setup/group select (firmware 2.x, "special fixed commands"). Setup s and group g travel 0-based in
// the low nibble: F0 00 00 00 4E 2C 1B 4E 28 1s 4E 24 1g F7. The EC4 sends the same message when the
// setup or group is changed on the device, and in reply to the query F0 00 00 00 4E 20 10 F7.
// Live display writes (names, whole screen) are in core/ec4-display.js.

// The device takes a moment to switch before a display write lands on the new group
const SELECT_SETTLE_MS = 80
// Ports have just opened: ask the device where it is, then the labels for that group go out
const QUERY_AFTER_CONNECT_MS = 300

export function ec4Tools (controller) {
  const selectListeners = new Set()
  const canSend = () => !!(controller.transport && controller.transport.send && controller.transport.sysex)
  const sendBytes = (bytes) => { if (!canSend()) return false; try { controller.transport.send(bytes) } catch (e) { return false } return true }
  controller.onSysex((bytes) => {
    const at = parseSelect(bytes)
    if (!at) return
    tools.where = at
    for (const fn of selectListeners) { try { fn(at) } catch (e) { /* a listener's problem */ } }
    if (display.auto) display.refresh()
  })
  controller.onTransport((t) => { if (t && t.sysex && display.auto) setTimeout(() => tools.query(), QUERY_AFTER_CONNECT_MS) })
  let labelTimer = null
  controller.onLabels(() => {
    // registrations come in bursts (a sketch eval): rebuild once, after the burst
    if (!display.auto || labelTimer) return
    labelTimer = setTimeout(() => { labelTimer = null; display.fromControls() }, 0)
  })

  const homeSetup = () => (controller.profile && controller.profile.setup) || (tools.where && tools.where.setup) || 1

  /**
   * Live OLED labels. The device shows what was last written for the group on screen and
   * forgets it on a group change or power cycle, so the names live here (display.labels)
   * and go out again on connect, on every group change and whenever a labelled control is
   * registered. Only encoders whose stored name is '----' take a written name (PARM: all).
   */
  const display = {
    /** re-send on connect / group change / registration; off = a page does its own refresh() */
    auto: true,
    labels: new Ec4Labels(),
    /** names(group, names, setup?): array (encoder 1 first) or { encoder: name }; sent now if that group is on screen */
    names (group, names, setup = homeSetup()) {
      display.labels.set(setup, group, names)
      return display.refresh(setup, group)
    },
    /** Send the names of the group on screen from the model. (setup, group) given: only if that is the one on screen. */
    refresh (setup, group) {
      const at = tools.where
      if (!at) return false
      if (setup !== undefined && group !== undefined && (setup !== at.setup || group !== at.group)) return false
      const names = display.labels.get(at.setup, at.group)
      return names ? sendBytes(namesBytes(names)) : false
    },
    /**
     * Labels from the registered controls (their `label` option, else their profile name), then refresh.
     * A group with labelled controls is rebuilt whole; groups set by names() alone are left as they are.
     */
    fromControls (setup = homeSetup()) {
      const built = labelsFromControls(controller, setup)
      for (const g of built.groups(setup)) display.labels.set(setup, g, built.get(setup, g))
      display.refresh()
      return display.labels
    },
    /** Forget a group's names (or a setup's, or all) and put the device's blanks back if it is on screen. */
    clear (group, setup = homeSetup()) {
      display.labels.clear(group === undefined ? undefined : setup, group)
      const at = tools.where
      if (at && (group === undefined || (group === at.group && setup === at.setup))) sendBytes(clearNamesBytes())
      return display.labels
    },
    /** Free text over the whole display, up to 4 rows of 20, until hide(). */
    text (rows) { return sendBytes(screenBytes(rows)) },
    hide () { return sendBytes(hideScreenBytes()) }
  }

  const tools = {
    display,
    /** { setup, group } (1-based) as last reported by the device, or null. */
    where: null,
    /** Ask the device where it is; the answer arrives through onSelect and lands in `where`. */
    query () { return sendBytes(QUERY_BYTES) },
    /** Put the device on a group (and setup; default the one it is on). 1-based. False when it cannot be sent. */
    select (group, setup = (tools.where && tools.where.setup) || 1) {
      if (!canSend() || !(group >= 1 && group <= 16) || !(setup >= 1 && setup <= 16)) return false
      controller.transport.send(selectBytes(setup, group))
      tools.where = { setup, group }
      if (display.auto) setTimeout(() => display.refresh(setup, group), SELECT_SETTLE_MS)
      return true
    },
    /** Called with { setup, group } whenever the device reports a change (its own keys included). */
    onSelect (fn) { selectListeners.add(fn); return () => selectListeners.delete(fn) },
    image: null,
    Ec4Image,
    parseDump,
    encodeDump,

    /** Resolve with an Ec4Image when the device sends a dump (start it on the EC4). */
    receive ({ timeoutMs = 120000 } = {}) {
      console.log('[midi/ec4] waiting for a dump: on the EC4 press Func > Setup > Send, hold "Send all setups"')
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { off(); reject(new Error('EC4 dump not received in time')) }, timeoutMs)
        const off = controller.onSysex(bytes => {
          if (bytes.length < 100) return
          try {
            const img = parseDump(bytes)
            clearTimeout(timer); off()
            tools.image = img
            console.log(`[midi/ec4] received firmware ${img.version} dump, ${img.pages} pages`)
            resolve(img)
          } catch (e) {
            clearTimeout(timer); off(); reject(e)
          }
        })
      })
    },

    /** Send an image (default: the last received/loaded one). Device must be in Setup > Receive. */
    send (image = tools.image) {
      if (!image) throw new Error('midi.ec4.send: no image; receive() or load one first')
      if (!controller.transport || !controller.transport.send) throw new Error('midi.ec4.send: no MIDI output')
      if (!controller.transport.sysex) throw new Error('midi.ec4.send: transport was opened without sysex (install with { sysex: true })')
      const bytes = encodeDump(image)
      console.log(`[midi/ec4] sending ${bytes.length} bytes; the EC4 must show "Work in progress" (Func > Setup > Receive)`)
      controller.transport.send(bytes)
      return bytes.length
    },

    /** Label encoders of one group from a map { encoder: name | settings } on the current image. */
    label (setup, group, map) {
      if (!tools.image) throw new Error('midi.ec4.label: no image; receive() or load one first')
      return tools.image.labelGroup(setup, group, map)
    },

    /** Label encoders in the given setup from the controller's profile names ({ name: [group, n] }). */
    labelFromNames (setup = 1, names = controller.profile && controller.profile.names) {
      if (!names) throw new Error('midi.ec4.labelFromNames: no names; call midi.names({...}) first')
      for (const [name, id] of Object.entries(names)) {
        if (Array.isArray(id)) tools.image.setEncoderName(setup, id[0], id[1], name)
      }
      return tools.image
    },

    /** Load a .syx file's bytes (e.g. from an <input type=file> or fetch) as the current image. */
    load (bytes) { tools.image = parseDump(bytes); return tools.image },

    /** Bytes for saving the current image as a .syx file. */
    toBytes (image = tools.image) { return encodeDump(image) }
  }
  return tools
}
