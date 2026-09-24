/**
 * nanoKONTROL2 lamps: the handshake that puts the surface in LED Mode External so a host can light
 * its buttons, and back to Internal on the way out. Needs a transport opened with sysex.
 *
 *   const dev = controller.add(nano); nanoTools(controller, dev)     // install() does this for a nano profile
 *   dev.nano.channel   the global channel the surface answered on (0-based), null until it has
 *   dev.nano.taken     true once the LED mode is External and lamps will show
 *
 * Steps (core/nano-sysex.js): inquiry -> reply gives the channel; scene request -> the scene; if its
 * LED mode is Internal, flip it and hand the scene back -> acknowledgement; then every lamp the device
 * remembers is sent. A surface that does not answer plays exactly as before, without lights, and says
 * so once. Nothing is written to the surface's flash.
 */
import { INQUIRY, channelOf, sceneRequest, sceneIn, sceneDump, ackIn, GLOBAL_CHANNEL, LED_MODE, EXTERNAL, INTERNAL } from '../core/nano-sysex.js'

const REPLY_MS = 1500

export function nanoTools (controller, device) {
  const st = { channel: null, taken: false, restore: null, step: null, listeners: new Set() }
  device.nano = st
  let timer = null
  const say = (what) => console.warn(`[midi ${device.id}] ${what}`)
  const done = (taken, why) => {
    st.step = 'done'; st.taken = taken
    if (timer) { clearTimeout(timer); timer = null }
    if (why) say(why)
    if (taken) device.refresh()
    for (const fn of st.listeners) { try { fn(st) } catch (e) { /* a listener's problem */ } }
  }
  const expect = (step) => {
    st.step = step
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => done(false, `no answer to the ${step === 'inquiry' ? 'device inquiry' : step === 'scene' ? 'scene request' : 'scene'}; its buttons light only while held`), REPLY_MS)
  }
  device.onTransport((t) => {
    if (!t || !t.sysex) { say('no sysex access: its buttons light only while held'); return }
    st.channel = null; st.taken = false
    expect('inquiry')
    device.send(INQUIRY)
  })
  controller.onSysex((bytes, dev) => {
    if (dev !== device) return
    if (st.step === 'inquiry') {
      const c = channelOf(bytes)
      if (c === null) return
      st.channel = c
      expect('scene')
      device.send(sceneRequest(c))
    } else if (st.step === 'scene') {
      const scene = sceneIn(st.channel, bytes)
      if (!scene) return
      if (scene[GLOBAL_CHANNEL] !== st.channel) return done(false, `its scene reads channel ${scene[GLOBAL_CHANNEL] + 1} where it answered on ${st.channel + 1}`)
      if (scene[LED_MODE] === EXTERNAL) return done(true)
      st.restore = scene.slice(); st.restore[LED_MODE] = INTERNAL
      const flipped = scene.slice(); flipped[LED_MODE] = EXTERNAL
      expect('ack')
      device.send(sceneDump(st.channel, flipped))
    } else if (st.step === 'ack') {
      const ok = ackIn(st.channel, bytes)
      if (ok === null) return
      done(ok, ok ? null : 'the surface refused the scene; its buttons light only while held')
    }
  })
  // on the way out the scene goes back as it was, LED mode Internal
  device.profile.release = () => (st.restore && st.channel !== null ? [sceneDump(st.channel, st.restore)] : [])
  st.onReady = (fn) => { st.listeners.add(fn); return () => st.listeners.delete(fn) }
  return st
}
