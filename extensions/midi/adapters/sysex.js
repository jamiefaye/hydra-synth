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

export function ec4Tools (controller) {
  const tools = {
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
