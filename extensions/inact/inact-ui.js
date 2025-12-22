/**
 * InAct UI - Vanilla JavaScript UI for InAct
 *
 * Matches the hydra.ojack.xyz toolbar style:
 * - Font Awesome icons
 * - Dark theme (white icons on transparent)
 * - Horizontal icon strip
 * - Tooltips on hover
 */

// CSS styles matching hydra.ojack.xyz
const INACT_STYLES = `
.inact-toolbar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  z-index: 1000;
  font-family: 'Chivo', sans-serif;
}

/* When injected into Hydra's toolbar area */
.inact-toolbar.inact-inline {
  background: transparent;
  padding: 5px 0;
  margin-top: 2px;
}

/* Fixed positioning options */
.inact-toolbar.fixed-bottom {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.inact-toolbar.fixed-top {
  position: fixed;
  top: 40px;
  right: 10px;
}

.inact-toolbar .icon {
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.15s, color 0.15s;
  padding: 2px;
}

.inact-toolbar .icon:hover {
  opacity: 1;
  color: cyan;
}

.inact-toolbar .icon.active {
  color: #f00;
}

.inact-toolbar .icon.disabled {
  opacity: 0.4;
  cursor: default;
}

.inact-toolbar .separator {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 2px;
}

.inact-toolbar .status {
  color: #fff;
  font-size: 12px;
  font-family: monospace;
  min-width: 40px;
  text-align: center;
}

.inact-toolbar .countdown {
  color: cyan;
  font-size: 14px;
  font-family: monospace;
  min-width: 50px;
  text-align: right;
}

.inact-toolbar .filename {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Recording indicator */
.inact-toolbar .recording-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f00;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`

class InActUI {
  constructor(inactState, options = {}) {
    this.state = inactState
    this.options = {
      position: options.position || 'bottom', // 'bottom', 'top'
      ...options
    }
    this.container = null
    this.elements = {}

    // Subscribe to state changes
    this.state.on(() => this.update())
  }

  // Inject Font Awesome if not present
  injectFontAwesome() {
    if (document.querySelector('link[href*="fontawesome"]')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    document.head.appendChild(link)
  }

  // Inject styles
  injectStyles() {
    if (document.getElementById('inact-styles')) return

    const style = document.createElement('style')
    style.id = 'inact-styles'
    style.textContent = INACT_STYLES
    document.head.appendChild(style)
  }

  // Create an icon button
  createIcon(iconClass, title, onClick, id) {
    const i = document.createElement('i')
    i.className = `fas icon ${iconClass}`
    i.title = title
    i.setAttribute('aria-hidden', 'true')
    if (id) i.id = id
    i.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        onClick(e)
      } catch (err) {
        console.error('[inact] Button error:', err)
      }
    }
    return i
  }

  // Create separator
  createSeparator() {
    const div = document.createElement('div')
    div.className = 'separator'
    return div
  }

  // Build the toolbar
  build() {
    this.injectFontAwesome()
    this.injectStyles()

    // Create fixed-position toolbar
    this.container = document.createElement('div')
    this.container.className = 'inact-toolbar fixed-top'
    this.container.id = 'inact-toolbar'
    document.body.appendChild(this.container)

    // Watchdog: re-add toolbar if it gets removed from DOM
    this.startWatchdog()

    // Recording section
    this.elements.recordDot = document.createElement('div')
    this.elements.recordDot.className = 'recording-dot'
    this.elements.recordDot.style.display = 'none'
    this.container.appendChild(this.elements.recordDot)

    // Clear button
    this.elements.clear = this.createIcon('fa-trash', 'Clear recording', () => this.state.doClear())
    this.container.appendChild(this.elements.clear)

    // Import button (FA5: fa-download, FA6: fa-file-import)
    this.elements.import = this.createIcon('fa-download', 'Import recording', () => this.state.doFileImport())
    this.container.appendChild(this.elements.import)

    // Export button (FA5: fa-upload, FA6: fa-file-export)
    this.elements.export = this.createIcon('fa-upload', 'Export recording', () => this.state.doFileExport())
    this.container.appendChild(this.elements.export)

    // Load (transfer recording to player) - FA5: fa-sync-alt
    this.elements.load = this.createIcon('fa-sync-alt', 'Load recording to player', () => this.state.doLoad())
    this.container.appendChild(this.elements.load)

    // Mark button
    this.elements.mark = this.createIcon('fa-bookmark', 'Mark current position', () => this.state.doMark())
    this.container.appendChild(this.elements.mark)

    this.container.appendChild(this.createSeparator())

    // Playback section (FA5 names)
    this.elements.fastBack = this.createIcon('fa-fast-backward', 'Jump to previous mark', (e) => this.state.doFastBackward(e))
    this.container.appendChild(this.elements.fastBack)

    this.elements.stepBack = this.createIcon('fa-step-backward', 'Step backward', (e) => this.state.doStepBackward(e))
    this.container.appendChild(this.elements.stepBack)

    // Play/Pause button
    this.elements.play = this.createIcon('fa-play', 'Play / Pause', (e) => this.state.doPlay(e), 'inact-play')
    this.container.appendChild(this.elements.play)

    this.elements.stepForward = this.createIcon('fa-step-forward', 'Step forward', (e) => this.state.doStepForward(e))
    this.container.appendChild(this.elements.stepForward)

    this.elements.fastForward = this.createIcon('fa-fast-forward', 'Jump to next mark', (e) => this.state.doFastForward(e))
    this.container.appendChild(this.elements.fastForward)

    this.container.appendChild(this.createSeparator())

    // Status display
    this.elements.playerIndex = document.createElement('span')
    this.elements.playerIndex.className = 'status'
    this.elements.playerIndex.textContent = '0'
    this.container.appendChild(this.elements.playerIndex)

    this.elements.countdown = document.createElement('span')
    this.elements.countdown.className = 'countdown'
    this.elements.countdown.textContent = '0.0'
    this.container.appendChild(this.elements.countdown)

    this.elements.filename = document.createElement('span')
    this.elements.filename.className = 'filename'
    this.elements.filename.textContent = ''
    this.container.appendChild(this.elements.filename)

    // Initial update
    this.update()

    return this
  }

  // Update UI based on state
  update() {
    try {
      if (!this.container) {
        console.log('[inact] UI update skipped - no container')
        return
      }
      const s = this.state.statusObj
      console.log('[inact] UI update:', s.hasrecord, s.hasplay, 'elements:', Object.keys(this.elements).length)

    // Recording dot
    if (this.elements.recordDot) {
      this.elements.recordDot.style.display = s.hasrecord ? 'block' : 'none'
    }

    // Export/Load visibility
    if (this.elements.export) {
      this.elements.export.classList.toggle('disabled', !s.hasrecord)
    }
    if (this.elements.load) {
      this.elements.load.classList.toggle('disabled', !s.hasrecord)
    }
    if (this.elements.mark) {
      this.elements.mark.classList.toggle('disabled', !s.hasrecord)
    }

    // Playback controls visibility
    const hasPlay = s.hasplay
    const playbackIcons = [
      this.elements.fastBack,
      this.elements.stepBack,
      this.elements.play,
      this.elements.stepForward,
      this.elements.fastForward
    ]
    playbackIcons.forEach(el => {
      if (el) el.classList.toggle('disabled', !hasPlay)
    })

    // Play/Pause icon toggle
    if (this.elements.play) {
      this.elements.play.classList.remove('fa-play', 'fa-pause')
      this.elements.play.classList.add(s.playing ? 'fa-pause' : 'fa-play')
      this.elements.play.classList.toggle('active', s.playing)
    }

    // Status displays
    if (this.elements.playerIndex) {
      this.elements.playerIndex.textContent = s.playerIndex || '0'
    }
    if (this.elements.countdown) {
      this.elements.countdown.textContent = s.countdown || '0.0'
    }
    if (this.elements.filename) {
      this.elements.filename.textContent = s.filename || ''
      this.elements.filename.title = s.filename || ''
    }
    } catch (err) {
      console.error('[inact] UI update error:', err)
    }
  }

  // Show/hide the toolbar
  show() {
    if (this.container) this.container.style.display = 'flex'
  }

  hide() {
    if (this.container) this.container.style.display = 'none'
  }

  toggle() {
    if (this.container) {
      const isVisible = this.container.style.display !== 'none'
      this.container.style.display = isVisible ? 'none' : 'flex'
    }
  }

  // Watchdog to re-add toolbar if removed from DOM
  startWatchdog() {
    this.watchdogInterval = setInterval(() => {
      if (this.container && !document.body.contains(this.container)) {
        console.log('[inact] Toolbar was removed, re-adding...')
        document.body.appendChild(this.container)
      }
    }, 500)
  }

  stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval)
      this.watchdogInterval = null
    }
  }

  // Remove from DOM
  destroy() {
    this.stopWatchdog()
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
    this.elements = {}
  }
}

export { InActUI, INACT_STYLES }
