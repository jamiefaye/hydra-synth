/**
 * Web MIDI adapter: opens browser MIDI ports and wires them to a Controller.
 * Access is requested in the background so a permission prompt never blocks the caller.
 *
 *   const controller = new Controller({ profile: ec4 })
 *   controller.ready = connectWebMidi(controller, { inputFilter, outputFilter })
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
    // Feedback only to the profiled device by default. Sending to everything would reach
    // loopback ports such as the IAC bus, and the echo would feed back into the controller.
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
    console.warn('[midi] MIDI access refused:', e.message)
    return controller
  }

  const matchIn = matcher(opts.inputFilter)
  const matchOut = matcher(opts.outputFilter)
  let inputs = []
  let outputs = []
  let lastKey = null

  const attach = () => {
    const foundIn = [...access.inputs.values()].filter(i => matchIn(i.name))
    const foundOut = controller.opts.feedback ? [...access.outputs.values()].filter(o => matchOut(o.name)) : []
    const key = foundIn.map(i => i.id).join('|') + '#' + foundOut.map(o => o.id).join('|')
    if (key === lastKey) return   // statechange fires once per port; rewire only when the set changed
    lastKey = key
    for (const input of inputs) input.onmidimessage = null
    inputs = foundIn
    outputs = foundOut
    for (const input of inputs) input.onmidimessage = (msg) => controller.handleMessage(msg.data)
    const transport = {
      name: 'web-midi',
      access,
      inputs: inputs.map(i => i.name),
      outputs: outputs.map(o => o.name),
      send: (bytes) => { for (const o of outputs) o.send(bytes) },
      close: () => { for (const input of inputs) input.onmidimessage = null; access.onstatechange = null }
    }
    if (opts.log) {
      console.log(`[midi] listening on: ${transport.inputs.join(', ') || '(no inputs)'}` +
        (controller.opts.feedback ? `; feedback to: ${transport.outputs.join(', ') || '(no outputs)'}` : ''))
    }
    controller.attachTransport(transport)
  }
  attach()
  access.onstatechange = attach
  return controller
}
