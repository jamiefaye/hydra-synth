# InAct Extension for Hydra

InAct (InActor) is a sketch recording and playback system for [Hydra](https://hydra.ojack.xyz/). It allows performers to record code execution with timestamps, then replay choreographed visual performances.

## Quick Start on hydra.ojack.xyz

Paste this in the browser console:

```javascript
const inact = await import('https://www.fentonia.com/hydra-extensions/inact/index.js')
inact.install()
```

A toolbar will appear at the bottom of the screen.

## Features

- **Record** code snippets with timestamps during live performance
- **Playback** with precise timing control
- **Navigation** - step forward/backward, jump to marked positions
- **Export/Import** recordings to/from disk
- **Mark** important keyframe moments
- **Auto-record** on Ctrl+Enter (when you run code)

## Toolbar Controls

| Icon | Action | Description |
|------|--------|-------------|
| 🗑️ | Clear | Clear current recording |
| 📥 | Import | Load recording from file |
| 📤 | Export | Save recording to file |
| 🔄 | Load | Transfer recording to player |
| 🔖 | Mark | Flag current position as keyframe |
| ⏪ | Fast Back | Jump to previous mark |
| ⏮️ | Step Back | Go to previous sketch |
| ▶️/⏸️ | Play/Pause | Start/stop automatic playback |
| ⏭️ | Step Forward | Go to next sketch |
| ⏩ | Fast Forward | Jump to next mark |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+R | Toggle toolbar visibility |
| Ctrl+Shift+P | Play/Pause |
| Ctrl+Shift+M | Mark current position |
| ← / → | Step backward/forward (when not in editor) |

## Console API

After installing, you can control InAct from the console:

```javascript
inact.record(code)    // Manually record a sketch
inact.play()          // Start playback
inact.stop()          // Stop playback
inact.clear()         // Clear recording
inact.load()          // Load recording to player
inact.import()        // Open file dialog
inact.export()        // Save to file
inact.toggle()        // Show/hide toolbar
inact.show()          // Show toolbar
inact.hide()          // Hide toolbar
```

## File Format

InAct uses a simple text format:

```
//+ 2.5 0 2024-01-15T10:30:00.000Z
osc(10).out()




//+ 1.0 mark 1 2024-01-15T10:32:30.000Z
osc(20).rotate(0.1).out()
```

- `//+` prefix marks a new sketch
- First number is duration until next sketch (seconds)
- `mark` flag indicates a keyframe
- Index and timestamp follow
- 4+ blank lines separate sketches

## Installation Options

```javascript
inact.install(hydra, {
  position: 'bottom',    // 'bottom' or 'top'
  autoRecord: true,      // Auto-record on Ctrl+Enter
  beepsEnabled: false,   // Audio feedback on record
  defaultDur: 2.0,       // Default sketch duration
  maxDur: 60             // Maximum duration cap
})
```

## Building from Source

```bash
cd hyv
npm run build:inact
```

## License

MIT
