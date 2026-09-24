/**
 * Web MIDI adapter: opens browser MIDI ports and wires them to a Controller's devices.
 * Access is requested in the background so a permission prompt never blocks the caller.
 *
 *   const controller = new Controller({ profile: ec4 })
 *   controller.add(xl3daw)
 *   controller.ready = connectWebMidi(controller, { inputFilter, outputFilter, sysex })
 *
 * Each device claims the ports whose names its `match` (a RegExp or a substring, from the
 * profile or add()'s options) accepts, in the order they were added, except the default
 * device, which goes last and takes what is left, filtered by inputFilter / outputFilter as
 * before there were several. A port feeds one device only. Feedback goes only to a device's
 * own outputs: sending to everything would reach loopbacks such as the IAC bus and echo.
 */

const matcher = (filter) => (name) => {
  if (!filter) return true
  if (filter instanceof RegExp) return filter.test(name)
  return name.toLowerCase().includes(String(filter).toLowerCase())
}

const defined = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined))

export async function connectWebMidi (controller, options = {}) {
  const opts = Object.assign({
    inputFilter: null,
    outputFilter: (controller.profile && controller.profile.match) || null,
    sysex: false,
    log: true
  }, defined(options))
  if (opts.outputFilter === null && controller.opts.feedback) {
    console.warn('[midi] feedback with no outputFilter: sending to every output, including loopbacks')
  }

  if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
    console.warn('[midi] Web MIDI is not available here; controls keep their initial values')
    return controller
  }
  let access
  try {
    access = await navigator.requestMIDIAccess({ sysex: opts.sysex })
  } catch (e) {
    // sysex is a permission of its own; without it the knobs still work
    if (opts.sysex) {
      console.warn('[midi] no sysex access (' + e.message + '); carrying on without it')
      opts.sysex = false
      try { access = await navigator.requestMIDIAccess({ sysex: false }) } catch (e2) { access = null }
    }
    if (!access) {
      console.warn('[midi] MIDI access refused:', e.message)
      return controller
    }
  }

  const wired = []       // inputs with a handler on them
  let lastKey = null

  // which device gets which ports: the others in the order added, the default last with the leftovers
  const plan = () => {
    const ins = [...access.inputs.values()]
    const outs = [...access.outputs.values()]
    const claimedIn = new Set(); const claimedOut = new Set()
    const devices = [...controller._order.filter(d => d !== controller.default), controller.default]
    return devices.map(dev => {
      const isDefault = dev === controller.default
      const m = isDefault ? matcher(opts.inputFilter) : matcher(dev.match)
      const mo = isDefault ? matcher(opts.outputFilter) : matcher(dev.match)
      const feedback = controller.opts.feedback && dev.opts.feedback !== false
      const inputs = ins.filter(i => !claimedIn.has(i.id) && m(i.name))
      const outputs = feedback ? outs.filter(o => !claimedOut.has(o.id) && mo(o.name)) : []
      for (const i of inputs) claimedIn.add(i.id)
      for (const o of outputs) claimedOut.add(o.id)
      return { dev, inputs, outputs }
    })
  }

  const attach = () => {
    const p = plan()
    const key = p.map(({ dev, inputs, outputs }) => `${dev.id}:${inputs.map(i => i.id).join('|')}#${outputs.map(o => o.id).join('|')}`).join(';')
    if (key === lastKey) return   // statechange fires once per port; rewire only when the set changed
    lastKey = key
    for (const input of wired) input.onmidimessage = null
    wired.length = 0
    for (const { dev, inputs, outputs } of p) {
      for (const input of inputs) { input.onmidimessage = (msg) => dev.handleMessage(msg.data); wired.push(input) }
      const transport = {
        name: 'web-midi',
        sysex: !!opts.sysex,
        access,
        inputs: inputs.map(i => i.name),
        outputs: outputs.map(o => o.name),
        // `at` is a DOMHighResTimeStamp: Web MIDI holds the message until then (paced feedback)
        send: (bytes, at) => { for (const o of outputs) (at ? o.send(bytes, at) : o.send(bytes)) },
        close: () => { for (const input of inputs) input.onmidimessage = null; access.onstatechange = null }
      }
      if (opts.log) {
        const who = controller._order.length > 1 ? ` ${dev.id}` : ''
        console.log(`[midi${who}] listening on: ${transport.inputs.join(', ') || '(no inputs)'}` +
          (controller.opts.feedback ? `; feedback to: ${transport.outputs.join(', ') || '(no outputs)'}` : ''))
      }
      dev.attachTransport(transport)
    }
  }
  attach()
  access.onstatechange = attach
  return controller
}
