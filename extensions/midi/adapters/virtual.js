/**
 * Virtual adapter: no hardware. Feed bytes in with controller.handleMessage(); everything the
 * controller sends as feedback is collected in transport.sent. For tests, OSC bridges, or
 * driving a Controller from a recording.
 */
export function connectVirtual (controller, { name = 'virtual' } = {}) {
  const transport = {
    name,
    inputs: [name],
    outputs: [name],
    sent: [],
    at: [],       // the timestamp each frame was scheduled for (undefined = now)
    send: (bytes, at) => { transport.sent.push(Array.from(bytes)); transport.at.push(at) },
    close: () => {}
  }
  controller.attachTransport(transport)
  return transport
}
