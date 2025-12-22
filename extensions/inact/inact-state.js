/**
 * InAct State - Core recording/playback logic for Hydra sketches
 *
 * InAct (InActor) is a sketch recording and playback system that allows:
 * - Recording code snippets with timestamps during live performance
 * - Playback with precise timing control
 * - Navigation (step, fast forward/backward, jump to marks)
 * - Export/Import recordings to/from disk
 *
 * This module is framework-agnostic and can be used with any UI.
 */

// File System helpers (inline to avoid external dependencies)
function getFileHandle() {
  if ('showOpenFilePicker' in window) {
    return window.showOpenFilePicker().then(handles => handles[0])
  }
  return window.chooseFileSystemEntries()
}

function getNewFileHandle() {
  if ('showSaveFilePicker' in window) {
    const opts = {
      types: [{
        description: 'Text file',
        accept: { 'text/plain': ['.txt'] },
      }],
    }
    return window.showSaveFilePicker(opts)
  }
  const opts = {
    type: 'save-file',
    accepts: [{
      description: 'Text file',
      extensions: ['txt'],
      mimeTypes: ['text/plain'],
    }],
  }
  return window.chooseFileSystemEntries(opts)
}

function readFile(file) {
  if (file.text) {
    return file.text()
  }
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('loadend', e => {
      resolve(e.srcElement.result)
    })
    reader.readAsText(file)
  })
}

async function writeFile(fileHandle, contents) {
  if (fileHandle.createWriter) {
    const writer = await fileHandle.createWriter()
    await writer.write(0, contents)
    await writer.close()
    return
  }
  const writable = await fileHandle.createWritable()
  await writable.write(contents)
  await writable.close()
}

// Simple beeper for audio feedback
let audioContext, oscillator, gainNode
function beep(vol = 0.5, freq = 220, duration = 0.1) {
  try {
    if (!audioContext) {
      audioContext = new AudioContext()
      oscillator = audioContext.createOscillator()
      gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      oscillator.frequency.value = freq
      oscillator.type = 'sawtooth'
      gainNode.connect(audioContext.destination)
      gainNode.gain.value = vol * 0.01
    }
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (e) {
    // Audio not available, ignore
  }
}

class InActState {
  constructor(updateText, statusObj, options = {}) {
    this.playA = []           // Playback array
    this.recordA = []         // Recording array
    this.playerIndex = -1
    this.defaultDuration = 2.0
    this.maxDuration = 0
    this.fastForwardDuration = 15
    this.realTimePlayback = false
    this.updateText = updateText  // Callback to update sketch in editor
    this.beepsEnabled = options.beepsEnabled || false

    this.statusObj = statusObj || {
      playing: false,
      hasrecord: false,
      hasplay: false,
      countdown: '0.0',
      playerIndex: '0',
      filename: '',
      defaultDur: 2.0,
      maxDur: 60
    }

    this.blastOffTime = Date.now()
    this.boundTimerHandler = this.timerHandler.bind(this)
    this.updateCountDownClock = this.updateCountDownClock.bind(this)

    // Event listeners for UI updates
    this.listeners = []
  }

  // Event system for UI updates
  on(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  emit() {
    console.log('[inact] emit:', this.statusObj.hasrecord, this.statusObj.hasplay, 'listeners:', this.listeners.length)
    this.listeners.forEach(cb => {
      try {
        cb(this.statusObj)
      } catch (err) {
        console.error('[inact] Listener error:', err)
      }
    })
  }

  _beep() {
    if (this.beepsEnabled) {
      beep(0.5, 220, 0.1)
    }
  }

  pushSketch(code) {
    const snapshot = {
      timeStamp: Date.now(),
      sketch: code,
    }
    this.recordA.push(snapshot)
    this.statusObj.hasrecord = true
    this._beep()
    this.emit()
  }

  evalDone(hydraRenderer, text, timeB4) {
    const outA = []
    if (hydraRenderer && hydraRenderer.activeFromBefore) {
      const preamble = hydraRenderer.activeFromBefore(timeB4 + performance.timeOrigin)
      if (preamble !== '') {
        outA.push('/*\n')
        outA.push(preamble)
        outA.push('*/\n')
      }
    }
    outA.push(text)
    const code = outA.join('')
    this.pushSketch(code)
  }

  doClear() {
    this.recordA = []
    this.statusObj.hasrecord = false
    this.emit()
  }

  doFileImport() {
    this.openFile()
  }

  doFileExport() {
    this.saveFile()
  }

  doLoad() {
    const asText = this.recordingToText()
    this.loadPlayer(asText)
    this.emit()
  }

  doFastBackward(e) {
    this.moveFast(e, -1)
  }

  doStepBackward(e) {
    this.moveUp(e)
  }

  clearTimer() {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer)
      this.activeTimer = null
    }
  }

  startTimer(dur) {
    this.clearTimer()
    const durMS = dur * 1000
    this.blastOffTime = Date.now() + durMS
    this.activeTimer = setTimeout(this.boundTimerHandler, durMS)
  }

  timerHandler(e) {
    this.activeTimer = null
    if (this.realTimePlayback) {
      this.moveDown(e, 'play')
    }
  }

  updateCountDownClock() {
    const nowTime = Date.now()
    let tMinus = nowTime - this.blastOffTime
    if (tMinus > 0) tMinus = 0
    const tPlus = Math.abs(tMinus)
    const secs = Math.trunc(tPlus / 1000).toString()
    const tenths = (Math.trunc(tPlus / 100) % 10).toString()
    const sign = tMinus < 0 ? '-' : ' '
    this.statusObj.countdown = sign + secs + '.' + tenths
    this.emit()
  }

  startCountdownClock() {
    if (this.countDownIntervalObject === undefined) {
      this.countDownIntervalObject = setInterval(this.updateCountDownClock, 100)
    }
  }

  stopCountdownClock() {
    if (this.countDownIntervalObject) {
      clearInterval(this.countDownIntervalObject)
      this.countDownIntervalObject = undefined
    }
  }

  doPlay(e) {
    this.realTimePlayback = !this.realTimePlayback

    if (this.realTimePlayback) {
      this.statusObj.playing = true
      this.moveDown(e, 'play')
      this.startCountdownClock()
    } else {
      this.clearTimer()
      this.stopCountdownClock()
      this.statusObj.playing = false
    }
    this.emit()
  }

  doStepForward(e) {
    this.moveDown(e, 'step')
  }

  doFastForward(e) {
    this.moveFast(e, 1)
  }

  doMark() {
    this.mark()
  }

  async saveFile() {
    let fileHandle
    try {
      fileHandle = await getNewFileHandle()
    } catch (ex) {
      if (ex.name === 'AbortError') return
      console.error('Error opening file for save:', ex)
      return
    }
    try {
      const text = this.recordingToText()
      await writeFile(fileHandle, text)
    } catch (ex) {
      console.error('Unable to save file:', ex)
    }
  }

  async openFile() {
    try {
      const fhand = await getFileHandle()
      const file = await fhand.getFile()
      const text = await readFile(file)
      this.loadPlayer(text)
      this.statusObj.filename = file.name
      this.emit()
    } catch (ex) {
      if (ex.name === 'AbortError') return
      console.error('Error opening file:', ex)
    }
  }

  recordingToText() {
    let stringBuff = []
    const rSize = this.recordA.length

    for (let i = 0; i < rSize; ++i) {
      const ent = this.recordA[i]
      let dT = 0

      if (ent.timeStamp) {
        if (i < rSize - 1) {
          dT = this.recordA[i + 1].timeStamp - ent.timeStamp
          if (dT < 0) dT = 0
        }
        dT = dT / 1000
      } else {
        dT = ent.dur || 1.0
      }

      stringBuff.push('//+ ' + dT)
      if (ent.key) stringBuff.push(' key')
      if (ent.mark) stringBuff.push(' mark')

      if (ent.timeStamp) {
        stringBuff.push(' ' + i + ' ' + new Date(ent.timeStamp).toISOString() + '\n')
      } else {
        stringBuff.push(' ' + i + '\n')
      }

      stringBuff.push(ent.sketch)
      stringBuff.push('\n\n\n\n')
    }

    return stringBuff.join('')
  }

  loadPlayer(text) {
    this.playA = []
    this.playerIndex = 0
    const textA = text.split(/\r\n|\n/)
    const aSize = textA.length

    // Check for JSON base64 format
    if (aSize > 0 && textA[0].startsWith('{"code":')) {
      return this.loadJSONBase64(textA)
    }

    let ix = 0
    let working = []
    let runL = 0
    let lastDur = 0, marked = false, keyFlag = false

    for (ix = 0; ix < aSize; ++ix) {
      const ln = textA[ix]

      if (ln.trim() === '' || ln.startsWith('----')) {
        runL++
      } else if (ln.startsWith('//+')) {
        let restOfLine = ln.substring(3).trim()
        if (restOfLine.startsWith('dur=')) {
          restOfLine = restOfLine.substring(4).trim()
        }
        const tokens = restOfLine.split(' ')

        keyFlag = false
        marked = false

        if (tokens.length > 0) {
          const dur = Number.parseFloat(tokens[0])
          lastDur = isNaN(dur) ? 1.0 : dur
        }

        for (let i = 1; i < tokens.length; ++i) {
          const s = tokens[i]
          if (s === 'key') keyFlag = true
          else if (s === 'mark') marked = true
        }
      } else {
        if (runL >= 3 && working.length > 0) {
          const sketch = working.join('\n')
          this.playA.push({ dur: lastDur, mark: marked, key: keyFlag, sketch })
          working = []
        }
        runL = 0
        working.push(ln)
        lastDur = 0
        marked = false
      }
    }

    if (working.length > 0) {
      const lastSketch = working.join('\n')
      this.playA.push({ dur: lastDur, mark: marked, key: keyFlag, sketch: lastSketch })
    }

    this.statusObj.hasplay = this.playA.length > 0
    this.emit()
  }

  loadJSONBase64(textA) {
    for (let ix = 0; ix < textA.length; ++ix) {
      let aLine
      try {
        aLine = JSON.parse(textA[ix])
      } catch (err) {
        console.log('Parse error in loadJSONBase64:', err)
        continue
      }

      if (aLine && aLine.code) {
        try {
          const aSketch = decodeURIComponent(atob(aLine.code))
          if (aSketch.indexOf('initScreen') < 0) {
            this.playA.push({ sketch: aSketch, dur: 2 })
          }
        } catch (exs) {
          console.log('Error decoding URI Component:', exs)
        }
      }
    }

    this.playerIndex = 0
    this.statusObj.hasplay = this.playA.length > 0
    this.emit()
  }

  loadAtIndex(e, what) {
    if (this.playA.length === 0) return

    const entry = this.playA[this.playerIndex]
    if (!entry) return

    const sketchInfo = {
      key: entry.key === true,
      mark: entry.mark === true,
      dur: entry.dur
    }

    this.updateText(entry.sketch, sketchInfo, e, what)

    if (this.realTimePlayback) {
      this.clearTimer()
      let dur = entry.dur
      if (dur <= 0) dur = this.statusObj.defaultDur || this.defaultDuration
      if (this.statusObj.maxDur && dur > this.statusObj.maxDur) dur = this.statusObj.maxDur
      this.startTimer(dur)
    }

    this.statusObj.playerIndex = this.playerIndex.toString()
    this.emit()
  }

  moveUp(e) {
    if (this.playA.length === 0) return
    this.playerIndex--
    if (this.playerIndex < 0) {
      this.playerIndex = this.playA.length - 1
    }
    this.loadAtIndex(e, 'step')
  }

  moveDown(e, what) {
    if (this.playA.length === 0) return
    this.playerIndex++
    if (this.playerIndex >= this.playA.length) this.playerIndex = 0
    this.loadAtIndex(e, what)
  }

  moveFast(e, dir) {
    if (this.playA.length === 0) return

    let loopMax = this.playA.length
    const playerXWas = this.playerIndex

    while (loopMax > 0) {
      this.playerIndex += dir
      if (this.playerIndex < 0) this.playerIndex = this.playA.length - 1
      if (this.playerIndex >= this.playA.length) this.playerIndex = 0

      const ent = this.playA[this.playerIndex]
      if ((ent.mark) || (ent.dur && ent.dur >= this.fastForwardDuration)) {
        this.loadAtIndex(e, 'fast')
        return
      }
      loopMax--
    }

    // No mark found, jump by 16 (or 4 for small playlists)
    this.playerIndex = playerXWas
    let jump = this.playA.length <= 16 ? 4 : 16

    if (dir < 0 && playerXWas > 0 && jump > playerXWas) {
      this.playerIndex = 0
    } else {
      this.playerIndex += jump * dir
    }

    if (this.playerIndex < 0) this.playerIndex = this.playA.length - 1
    else if (this.playerIndex >= this.playA.length) this.playerIndex = 0

    this.loadAtIndex(e, 'fast')
  }

  mark() {
    if (this.recordA.length === 0) return
    this.recordA[this.recordA.length - 1].mark = true
    this._beep()
    this.emit()
  }

  destroy() {
    this.clearTimer()
    this.stopCountdownClock()
    this.listeners = []
  }
}

export { InActState }
