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

// Remote setup/group select (firmware 2.x, "special fixed commands"). Setup s and group g travel 0-based in
// the low nibble: F0 00 00 00 4E 2C 1B 4E 28 1s 4E 24 1g F7. The EC4 sends the same message when the
// setup or group is changed on the device, and in reply to the query F0 00 00 00 4E 20 10 F7.
const EC4_HEAD = [0xF0, 0x00, 0x00, 0x00, 0x4E, 0x2C, 0x1B]
const EC4_QUERY = [0xF0, 0x00, 0x00, 0x00, 0x4E, 0x20, 0x10, 0xF7]
const selectBytes = (setup, group) => [...EC4_HEAD, 0x4E, 0x28, 0x10 | (setup - 1), 0x4E, 0x24, 0x10 | (group - 1), 0xF7]
const parseSelect = (b) => (b.length === 14 && EC4_HEAD.every((v, i) => b[i] === v) && b[7] === 0x4E && b[8] === 0x28 && b[10] === 0x4E && b[11] === 0x24)
  ? { setup: (b[9] & 15) + 1, group: (b[12] & 15) + 1 } : null

export function ec4Tools (controller) {
  const selectListeners = new Set()
  const canSend = () => !!(controller.transport && controller.transport.send && controller.transport.sysex)
  controller.onSysex((bytes) => {
    const at = parseSelect(bytes)
    if (!at) return
    tools.where = at
    for (const fn of selectListeners) { try { fn(at) } catch (e) { /* a listener's problem */ } }
  })
  const tools = {
    /** { setup, group } (1-based) as last reported by the device, or null. */
    where: null,
    /** Ask the device where it is; the answer arrives through onSelect and lands in `where`. */
    query () { if (!canSend()) return false; controller.transport.send(EC4_QUERY); return true },
    /** Put the device on a group (and setup; default the one it is on). 1-based. False when it cannot be sent. */
    select (group, setup = (tools.where && tools.where.setup) || 1) {
      if (!canSend() || !(group >= 1 && group <= 16) || !(setup >= 1 && setup <= 16)) return false
      controller.transport.send(selectBytes(setup, group))
      tools.where = { setup, group }
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
