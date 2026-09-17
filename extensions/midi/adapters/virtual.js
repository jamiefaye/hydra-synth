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
    send: (bytes) => { transport.sent.push(Array.from(bytes)) },
    close: () => {}
  }
  controller.attachTransport(transport)
  return transport
}
