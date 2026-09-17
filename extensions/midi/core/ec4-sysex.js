/**
 * Faderfox EC4 (firmware 2.x) setup memory as SysEx: parse a dump, edit names / encoder
 * settings, encode a dump. Pure functions and one class, no MIDI here.
 *
 * Format from Faderfox's "sysex format general" and "sysex data format EC4 V2" documents,
 * as shipped with the MIT-licensed privatepublic-de/faderfox-editor (Peter Witzel, with
 * Faderfox). The device only accepts a complete "all setups" image, sent while it sits in
 * Setup > Receive ("Work in progress"), so the workflow is: receive or load a backup,
 * change what you want, send the whole image back.
 */

export const MEMORY_OFFSET = 0x0b00
export const MEMORY_SIZE = 0xf500
export const DEVICE_ID_EC4 = 0x0b
export const PAGE = 64

// Areas, as offsets into the image (address - MEMORY_OFFSET)
export const ADDR = {
  key1: 0x0b00 - MEMORY_OFFSET,        // push mode(1) + push number(7), 16 bytes per group
  setupNames: 0x1bc0 - MEMORY_OFFSET,  // 16 x 4 chars
  groupNames: 0x1c00 - MEMORY_OFFSET,  // 16 setups x 16 groups x 4 chars
  setupData: 0x2000 - MEMORY_OFFSET,   // 192 bytes per group (see FIELD)
  key2: 0xe000 - MEMORY_OFFSET         // push display/lower, link/upper, 32 bytes per group
}
export const GROUP_BYTES = 192
export const KEY1_GROUP_BYTES = 16
export const KEY2_GROUP_BYTES = 32

// Byte offsets within a group's 192-byte setup-data block (encoder e = 0..15 adds e, names add 4e)
const FIELD = {
  typeChannel: 0,   // type bits 4..7, channel-1 bits 0..3
  linkNumber: 16,   // link bit 7, command number bits 0..6
  numberHigh: 32,   // NRPN MSB
  lower: 48,
  upper: 64,
  modeScale: 80,    // mode bits 4..7, display scale bits 0..3
  msbs: 96,         // upper msb bits 4..7, lower msb bits 0..3 (14-bit ranges)
  pushTypeChannel: 112,
  names: 128        // 16 x 4 chars
}

export const TYPES = ['CCR1', 'CCR2', 'CCab', 'PrgC', 'CCAh', 'PBnd', 'AftT', 'Note', 'NRPN']
export const MODES = ['Div8', 'Div4', 'Div2', 'Acc0', 'Acc1', 'Acc2', 'Acc3', 'LSp2', 'LSp4', 'LSp6']
export const SCALES = ['off', '127', '100', '1000', '+-63', '+-50', '+-500', 'ONOF', '9999']
// Push button types in the order the editor lists them (value = index)
export const PUSH_TYPES = ['Off', 'Note', 'CC', 'PrgC', 'PBnd', 'AftT', 'Grp', 'Set', 'Acc0', 'Acc3', 'LSp6', 'Min', 'Max']

const NAME_OK = /^[0-9A-Za-z .\/-]*$/

export function normalizeName (name) {
  const s = String(name ?? '').slice(0, 4)
  if (!NAME_OK.test(s)) throw new Error(`EC4 name "${name}": only 0-9 A-Z a-z space . / - allowed`)
  return s.padEnd(4, ' ')
}

const enumIndex = (list, v, what) => {
  if (typeof v === 'number') return v
  const i = list.indexOf(v)
  if (i < 0) throw new Error(`EC4 ${what} "${v}": use one of ${list.join(', ')}`)
  return i
}

// ---------------------------------------------------------------- image access

export class Ec4Image {
  /** @param {Uint8Array} [data] a MEMORY_SIZE image; empty (zeroed, blank names) when omitted */
  constructor (data = null) {
    this.data = data ? Uint8Array.from(data) : new Uint8Array(MEMORY_SIZE)
    if (this.data.length !== MEMORY_SIZE) throw new Error(`EC4 image must be ${MEMORY_SIZE} bytes, got ${this.data.length}`)
    this.version = null
  }

  static blank () {
    const img = new Ec4Image()
    for (let s = 1; s <= 16; s++) {
      img.setSetupName(s, `SE${String(s).padStart(2, '0')}`)
      for (let g = 1; g <= 16; g++) {
        img.setGroupName(s, g, `GR${String(g).padStart(2, '0')}`)
        for (let e = 1; e <= 16; e++) {
          img.setEncoder(s, g, e, { type: 'CCab', channel: 1, number: e - 1, lower: 0, upper: 127, mode: 'Acc0', scale: '127', name: `EC${String(e).padStart(2, '0')}` })
        }
      }
    }
    return img
  }

  _check (s, g, e) {
    if (s < 1 || s > 16) throw new Error(`EC4 setup ${s} out of range 1..16`)
    if (g !== undefined && (g < 1 || g > 16)) throw new Error(`EC4 group ${g} out of range 1..16`)
    if (e !== undefined && (e < 1 || e > 16)) throw new Error(`EC4 encoder ${e} out of range 1..16`)
  }

  _groupBase (s, g) { return ADDR.setupData + ((s - 1) * 16 + (g - 1)) * GROUP_BYTES }
  _key1Base (s, g) { return ADDR.key1 + ((s - 1) * 16 + (g - 1)) * KEY1_GROUP_BYTES }
  _key2Base (s, g) { return ADDR.key2 + ((s - 1) * 16 + (g - 1)) * KEY2_GROUP_BYTES }

  _str (addr) { return String.fromCharCode(...this.data.subarray(addr, addr + 4)) }
  _putStr (addr, name) { const n = normalizeName(name); for (let i = 0; i < 4; i++) this.data[addr + i] = n.charCodeAt(i) }

  getSetupName (s) { this._check(s); return this._str(ADDR.setupNames + (s - 1) * 4) }
  setSetupName (s, name) { this._check(s); this._putStr(ADDR.setupNames + (s - 1) * 4, name); return this }
  getGroupName (s, g) { this._check(s, g); return this._str(ADDR.groupNames + (s - 1) * 64 + (g - 1) * 4) }
  setGroupName (s, g, name) { this._check(s, g); this._putStr(ADDR.groupNames + (s - 1) * 64 + (g - 1) * 4, name); return this }
  getEncoderName (s, g, e) { this._check(s, g, e); return this._str(this._groupBase(s, g) + FIELD.names + (e - 1) * 4) }
  setEncoderName (s, g, e, name) { this._check(s, g, e); this._putStr(this._groupBase(s, g) + FIELD.names + (e - 1) * 4, name); return this }

  /** All settings of one encoder, with enum names. */
  getEncoder (s, g, e) {
    this._check(s, g, e)
    const d = this.data, b = this._groupBase(s, g), i = e - 1
    const k1 = this._key1Base(s, g), k2 = this._key2Base(s, g)
    return {
      type: TYPES[d[b + FIELD.typeChannel + i] >> 4] ?? d[b + FIELD.typeChannel + i] >> 4,
      channel: (d[b + FIELD.typeChannel + i] & 0x0f) + 1,
      number: d[b + FIELD.linkNumber + i] & 0x7f,
      link: !!(d[b + FIELD.linkNumber + i] & 0x80),
      numberHigh: d[b + FIELD.numberHigh + i],
      lower: d[b + FIELD.lower + i] + ((d[b + FIELD.msbs + i] & 0x0f) << 8),
      upper: d[b + FIELD.upper + i] + ((d[b + FIELD.msbs + i] >> 4) << 8),
      mode: MODES[d[b + FIELD.modeScale + i] >> 4] ?? d[b + FIELD.modeScale + i] >> 4,
      scale: SCALES[d[b + FIELD.modeScale + i] & 0x0f] ?? d[b + FIELD.modeScale + i] & 0x0f,
      name: this.getEncoderName(s, g, e),
      push: {
        type: PUSH_TYPES[d[b + FIELD.pushTypeChannel + i] >> 4] ?? d[b + FIELD.pushTypeChannel + i] >> 4,
        channel: (d[b + FIELD.pushTypeChannel + i] & 0x0f) + 1,
        mode: d[k1 + i] >> 7,
        number: d[k1 + i] & 0x7f,
        display: d[k2 + i] >> 7,
        lower: d[k2 + i] & 0x7f,
        link: d[k2 + 16 + i] >> 7,
        upper: d[k2 + 16 + i] & 0x7f
      }
    }
  }

  /** Set any subset of an encoder's settings; enum names or raw numbers accepted. */
  setEncoder (s, g, e, v = {}) {
    this._check(s, g, e)
    const d = this.data, b = this._groupBase(s, g), i = e - 1
    const k1 = this._key1Base(s, g), k2 = this._key2Base(s, g)
    const setHi = (addr, hi) => { d[addr] = (d[addr] & 0x0f) | ((hi & 0x0f) << 4) }
    const setLo = (addr, lo) => { d[addr] = (d[addr] & 0xf0) | (lo & 0x0f) }
    if (v.type !== undefined) setHi(b + FIELD.typeChannel + i, enumIndex(TYPES, v.type, 'type'))
    if (v.channel !== undefined) setLo(b + FIELD.typeChannel + i, v.channel - 1)
    if (v.number !== undefined) d[b + FIELD.linkNumber + i] = (d[b + FIELD.linkNumber + i] & 0x80) | (v.number & 0x7f)
    if (v.link !== undefined) d[b + FIELD.linkNumber + i] = (d[b + FIELD.linkNumber + i] & 0x7f) | (v.link ? 0x80 : 0)
    if (v.numberHigh !== undefined) d[b + FIELD.numberHigh + i] = v.numberHigh & 0xff
    if (v.lower !== undefined) { d[b + FIELD.lower + i] = v.lower & 0xff; setLo(b + FIELD.msbs + i, v.lower >> 8) }
    if (v.upper !== undefined) { d[b + FIELD.upper + i] = v.upper & 0xff; setHi(b + FIELD.msbs + i, v.upper >> 8) }
    if (v.mode !== undefined) setHi(b + FIELD.modeScale + i, enumIndex(MODES, v.mode, 'mode'))
    if (v.scale !== undefined) setLo(b + FIELD.modeScale + i, enumIndex(SCALES, v.scale, 'scale'))
    if (v.name !== undefined) this.setEncoderName(s, g, e, v.name)
    const p = v.push || {}
    if (p.type !== undefined) setHi(b + FIELD.pushTypeChannel + i, enumIndex(PUSH_TYPES, p.type, 'push type'))
    if (p.channel !== undefined) setLo(b + FIELD.pushTypeChannel + i, p.channel - 1)
    if (p.mode !== undefined) d[k1 + i] = (d[k1 + i] & 0x7f) | (p.mode ? 0x80 : 0)
    if (p.number !== undefined) d[k1 + i] = (d[k1 + i] & 0x80) | (p.number & 0x7f)
    if (p.display !== undefined) d[k2 + i] = (d[k2 + i] & 0x7f) | (p.display ? 0x80 : 0)
    if (p.lower !== undefined) d[k2 + i] = (d[k2 + i] & 0x80) | (p.lower & 0x7f)
    if (p.link !== undefined) d[k2 + 16 + i] = (d[k2 + 16 + i] & 0x7f) | (p.link ? 0x80 : 0)
    if (p.upper !== undefined) d[k2 + 16 + i] = (d[k2 + 16 + i] & 0x80) | (p.upper & 0x7f)
    return this
  }

  /** Apply { [encoder]: name } or { [encoder]: {settings} } to one group. */
  labelGroup (s, g, map) {
    for (const [e, v] of Object.entries(map)) {
      if (typeof v === 'string') this.setEncoderName(s, g, Number(e), v)
      else this.setEncoder(s, g, Number(e), v)
    }
    return this
  }

  /** Human summary of one group. */
  describeGroup (s, g) {
    const lines = [`Setup ${s} "${this.getSetupName(s)}"  group ${g} "${this.getGroupName(s, g)}"`]
    for (let e = 1; e <= 16; e++) {
      const x = this.getEncoder(s, g, e)
      lines.push(`  ${String(e).padStart(2)} "${x.name}" ${x.type} ch${x.channel} #${x.number} ${x.mode} disp ${x.scale} ${x.lower}..${x.upper}  push ${x.push.type}`)
    }
    return lines.join('\n')
  }
}

// ---------------------------------------------------------------- sysex encode / decode

const hilo = (v) => [0x20 | ((v >> 4) & 0x0f), 0x10 | (v & 0x0f)]

/**
 * Encode an image as a complete "all setups" dump (what the device expects in Receive).
 * version: firmware app id, default 2.4 as the current editor writes (0x43 = 2, 0x44 = 4).
 */
export function encodeDump (image, { version = [2, 4] } = {}) {
  const data = image instanceof Ec4Image ? image.data : image
  if (data.length !== MEMORY_SIZE) throw new Error(`EC4 image must be ${MEMORY_SIZE} bytes`)
  const out = [0xf0, 0x00, 0x00, 0x00,
    0x41, ...hilo(DEVICE_ID_EC4),   // download start, device id
    0x42, ...hilo(0x03),            // type: all setups
    0x43, ...hilo(version[0]),      // app id high
    0x44, ...hilo(version[1])]      // app id low
  const pages = data.length / PAGE
  for (let p = 0; p < pages; p++) {
    const pos = p * PAGE
    const addr = pos + MEMORY_OFFSET
    out.push(0x49, ...hilo(addr >> 8), 0x4a, ...hilo(addr & 0xff))
    let crc = 0
    for (let i = 0; i < PAGE; i++) { out.push(0x4d, ...hilo(data[pos + i])); crc += data[pos + i] }
    crc &= 0xffff
    out.push(0x4b, ...hilo(crc >> 8), 0x4c, ...hilo(crc & 0xff))
    for (let i = 0; i < 30; i++) out.push(0x00)   // required by the device's flash routine
  }
  out.push(0x4f, ...hilo(DEVICE_ID_EC4), 0xf7)
  return Uint8Array.from(out)
}

/**
 * Decode a dump into an Ec4Image. Throws on wrong device, bad CRC or truncated data.
 * Accepts firmware 1.x dumps but does not convert them (image.version tells you).
 */
export function parseDump (bytes) {
  if (!bytes || bytes.length < 4 || bytes[0] !== 0xf0) throw new Error('EC4 sysex: not a sysex dump')
  if (bytes[1] | bytes[2] | bytes[3]) throw new Error('EC4 sysex: wrong manufacturer id')
  const img = new Ec4Image()
  let ix = 4, version = 0, addr = 0, page = new Uint8Array(PAGE), pi = 0, crc = 0, done = false, pagesSeen = 0
  while (!done) {
    while (ix < bytes.length && bytes[ix] === 0) ix++
    if (ix > bytes.length - 3) throw new Error('EC4 sysex: data incomplete')
    const cmd = bytes[ix], val = ((bytes[ix + 1] & 0x0f) << 4) | (bytes[ix + 2] & 0x0f)
    ix += 3
    switch (cmd) {
      case 0x41: if (val !== DEVICE_ID_EC4) throw new Error(`EC4 sysex: dump is for device id ${val}, not the EC4`); break
      case 0x42: if (val !== 0x03) throw new Error(`EC4 sysex: download type ${val} (only "all setups" = 3 supported)`); break
      case 0x43: version += val; break
      case 0x44: version += val / 10; break
      case 0x49: addr = val << 8; break
      case 0x4a: addr |= val; break
      case 0x4d: if (pi < PAGE) { page[pi++] = val; crc += val }; break
      case 0x4b: crc = crc & 0xffff; if ((crc >> 8) !== val) throw new Error(`EC4 sysex: CRC high mismatch at page ${addr.toString(16)}`); break
      case 0x4c: {
        if ((crc & 0xff) !== val) throw new Error(`EC4 sysex: CRC low mismatch at page ${addr.toString(16)}`)
        const off = addr - MEMORY_OFFSET
        if (off >= 0 && off + pi <= MEMORY_SIZE) img.data.set(page.subarray(0, pi), off)
        pagesSeen++
        page = new Uint8Array(PAGE); pi = 0; crc = 0
        break
      }
      case 0x4f: done = true; break
      case 0xf7: done = true; break
      default: break   // unknown command: ignore, as the editor does
    }
  }
  img.version = version
  img.pages = pagesSeen
  return img
}
