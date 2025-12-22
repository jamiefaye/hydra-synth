/**
 * InAct Extension for Hydra
 *
 * InAct (InActor) is a sketch recording and playback system for Hydra.
 * It allows performers to record code execution with timestamps,
 * then replay choreographed visual performances.
 *
 * Usage on hydra.ojack.xyz:
 *   const inact = await import('https://www.fentonia.com/hydra-extensions/inact/index.js')
 *   inact.install()
 *
 * Usage in custom setup:
 *   import { install, InActState, InActUI } from 'inact-extension'
 *   install(hydra, { position: 'bottom' })
 */

import { InActState } from './inact-state.js'
import { InActUI } from './inact-ui.js'

// Extension version
export const VERSION = '0.1.0'

// Global state
let _inactState = null
let _inactUI = null
let _hydra = null
let _originalEval = null
let _isPlayback = false  // Flag to prevent recording during playback

/**
 * Install InAct extension
 *
 * @param {object} hydra - Hydra instance (optional, will try to find window.hydraSynth)
 * @param {object} options - Configuration options
 * @param {string} options.position - Toolbar position: 'bottom' or 'top' (default: 'bottom')
 * @param {boolean} options.autoRecord - Automatically record on eval (default: true)
 * @param {boolean} options.beepsEnabled - Enable audio feedback (default: false)
 */
export function install(hydra = null, options = {}) {
  // Prevent re-installation - just return existing instance
  if (_inactUI && _inactState) {
    console.log('[inact] Already installed, returning existing instance')
    return { state: _inactState, ui: _inactUI }
  }

  console.log(`[inact] Installing InAct extension v${VERSION}`)

  // Find hydra instance
  _hydra = hydra || (typeof window !== 'undefined' ? window.hydraSynth : null)

  if (!_hydra) {
    console.warn('[inact] No hydra instance found. Call install(hydra) with your hydra instance.')
  }

  // Create status object
  const statusObj = {
    playing: false,
    hasrecord: false,
    hasplay: false,
    countdown: '0.0',
    playerIndex: '0',
    filename: '',
    defaultDur: options.defaultDur || 2.0,
    maxDur: options.maxDur || 60
  }

  // Create state with updateText callback
  _inactState = new InActState(
    (sketch, sketchInfo, e, what) => {
      // Update the editor and execute the sketch
      updateAndEval(sketch, sketchInfo, what)
    },
    statusObj,
    { beepsEnabled: options.beepsEnabled || false }
  )

  // Create UI
  _inactUI = new InActUI(_inactState, {
    position: options.position || 'top'  // Default to top-right, below Hydra's toolbar
  })
  _inactUI.build()

  // Hook into hydra's eval if autoRecord is enabled (default true)
  if (options.autoRecord !== false) {
    hookEval()
  }

  // Add keyboard shortcuts
  setupKeyboardShortcuts()

  // Expose globally for console access
  if (typeof window !== 'undefined') {
    window.inact = {
      state: _inactState,
      ui: _inactUI,
      record: (code) => _inactState.pushSketch(code),
      play: () => _inactState.doPlay(),
      stop: () => { _inactState.realTimePlayback = false; _inactState.statusObj.playing = false; _inactState.emit() },
      clear: () => _inactState.doClear(),
      load: () => _inactState.doLoad(),
      import: () => _inactState.doFileImport(),
      export: () => _inactState.doFileExport(),
      toggle: () => _inactUI.toggle(),
      show: () => _inactUI.show(),
      hide: () => _inactUI.hide()
    }
  }

  console.log('[inact] Extension installed. Toolbar visible at bottom of screen.')
  console.log('[inact] Keyboard shortcuts: Ctrl+Shift+R (toggle record), Ctrl+Shift+P (play/pause)')

  return { state: _inactState, ui: _inactUI }
}

/**
 * Update editor and evaluate sketch
 * Sets code in editor and triggers Hydra's eval
 */
function updateAndEval(sketch, sketchInfo, what) {
  // Try to update the editor (hydra.ojack.xyz uses CodeMirror on window.cm)
  const cm = findCodeMirror()
  if (cm) {
    cm.setValue(sketch)
  }

  // Try multiple methods to trigger eval

  // Method 1: Try to use Hydra's editor emit (if available)
  if (window.editor && window.editor.emit) {
    try {
      window.editor.emit('repl: eval', sketch)
      return
    } catch (e) {}
  }

  // Method 2: Dispatch keyboard event to CodeMirror wrapper
  const cmWrapper = document.querySelector('.CodeMirror')
  if (cmWrapper) {
    try {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
      cmWrapper.dispatchEvent(event)
    } catch (err) {
      console.error('[inact] Keyboard dispatch failed:', err)
    }
  }

  // Method 3: Fallback to direct eval with Hydra globals
  try {
    const jsString = `(async() => {
      ${sketch}
    })()`
    window.eval(jsString)
  } catch (err) {
    console.error('[inact] Direct eval failed:', err)
  }
}

/**
 * Flash the editor content (visual feedback)
 */
function flashEditor(cm) {
  try {
    // CodeMirror 5 pattern (used by hydra.ojack.xyz)
    if (cm.markText) {
      const start = { line: cm.firstLine(), ch: 0 }
      const end = { line: cm.lastLine() + 1, ch: 0 }
      const marker = cm.markText(start, end, { className: 'styled-background' })
      setTimeout(() => marker.clear(), 300)
    }
  } catch (e) {
    // Ignore flash errors - it's just visual feedback
  }
}

/**
 * Find CodeMirror instance
 */
function findCodeMirror() {
  // hydra.ojack.xyz stores CodeMirror on window or in a specific element
  if (typeof window !== 'undefined') {
    // Try common patterns
    if (window.cm) return window.cm
    if (window.editor) return window.editor

    // Look for CodeMirror 6 view
    const cmElement = document.querySelector('.cm-editor')
    if (cmElement && cmElement.cmView) {
      return {
        setValue: (text) => {
          const view = cmElement.cmView
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: text }
          })
        },
        getValue: () => cmElement.cmView.state.doc.toString()
      }
    }

    // Look for CodeMirror 5
    const cm5Element = document.querySelector('.CodeMirror')
    if (cm5Element && cm5Element.CodeMirror) {
      return cm5Element.CodeMirror
    }
  }

  return null
}

/**
 * Hook into hydra's eval to auto-record
 */
function hookEval() {
  // Try to hook into the global eval used by hydra
  if (typeof window === 'undefined') return

  // For hydra.ojack.xyz, try to intercept the eval function
  // The editor typically calls a function to evaluate code

  // Method 1: Hook into keyboard handler
  document.addEventListener('keydown', (e) => {
    // Hydra keymaps:
    // Ctrl+Enter = eval line
    // Alt+Enter = eval block
    // Shift+Ctrl+Enter = eval all
    const isEval = (e.ctrlKey || e.metaKey) && e.key === 'Enter'
    const isAltEval = e.altKey && e.key === 'Enter'

    if (isEval || isAltEval) {
      // Get current code from editor (recording works even during playback)
      setTimeout(() => {
        const cm = findCodeMirror()
        if (cm) {
          const code = cm.getValue ? cm.getValue() : ''
          if (code && code.trim()) {
            _inactState.pushSketch(code)
          }
        }
      }, 50) // Small delay to ensure code has been evaluated
    }
  }, true)

  console.log('[inact] Auto-recording enabled on Ctrl+Enter')
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  if (typeof window === 'undefined') return

  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R - Toggle toolbar visibility
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault()
      _inactUI.toggle()
    }

    // Ctrl+Shift+P - Play/Pause
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault()
      _inactState.doPlay(e)
    }

    // Ctrl+Shift+M - Mark
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
      e.preventDefault()
      _inactState.doMark()
    }

    // Left/Right arrows during playback (when not in editor)
    if (_inactState.statusObj.hasplay && !isInEditor()) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        _inactState.doStepBackward(e)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        _inactState.doStepForward(e)
      }
    }
  })
}

/**
 * Check if focus is in the code editor
 */
function isInEditor() {
  const active = document.activeElement
  if (!active) return false
  return active.classList.contains('cm-content') ||
         active.classList.contains('CodeMirror') ||
         active.tagName === 'TEXTAREA'
}

/**
 * Uninstall the extension
 */
export function uninstall() {
  if (_inactUI) {
    _inactUI.destroy()
    _inactUI = null
  }
  if (_inactState) {
    _inactState.destroy()
    _inactState = null
  }
  if (typeof window !== 'undefined' && window.inact) {
    delete window.inact
  }
  console.log('[inact] Extension uninstalled')
}

// Re-export components for direct use
export { InActState, InActUI }
