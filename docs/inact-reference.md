# InAct Extension Reference

InAct (InActor) is a sketch recording and playback system for Hydra. It allows performers to record code execution with timestamps, then replay choreographed visual performances.

## Installation

### Built-in (hydra+)

If using the enhanced hydra+ at fentonia.com/hydra/, InAct is already installed. The toolbar appears at the top of the screen.

### Standalone Installation

```javascript
// On hydra.ojack.xyz, paste in browser console:
const inact = await import('https://www.fentonia.com/hydra-extensions/inact/index.js')
inact.install()

// Or with options:
inact.install(null, {
  position: 'top',      // 'top' or 'bottom'
  autoRecord: true,     // Auto-record on Ctrl+Enter
  beepsEnabled: false,  // Audio feedback
  defaultDur: 2.0,      // Default sketch duration (seconds)
  maxDur: 60            // Maximum duration cap
})
```

### ES Module Import

```javascript
import { install } from 'hydra-synth/extensions/inact'

const hydra = new Hydra({ ... })
install(hydra, { position: 'top' })
```

---

## Concepts

### Recording vs Playing

InAct has two main modes:

1. **Recording**: Capturing code snippets as you perform live
2. **Playing**: Replaying a recorded sequence with precise timing

### The Two Buffers

- **Record Buffer**: Where new sketches are captured during performance
- **Play Buffer**: The loaded sequence ready for playback

Use the **Load** button to transfer from record buffer to play buffer.

### Timing

Each sketch has a **duration** - how long to wait before the next sketch plays. During recording, this is calculated from the actual time between code executions.

### Marks

Marks are keyframe flags on specific sketches. Use them to:
- Navigate quickly through a long recording
- Flag important moments in your performance
- Create chapter-like divisions in your sequence

---

## Toolbar Controls

The toolbar appears at the top (or bottom) of the screen with these controls:

### Record Section

| Icon | Name | Description |
|------|------|-------------|
| `fa-trash` | Clear | Clear the record buffer |
| `fa-file-import` | Import | Load a recording from a `.inact` file |
| `fa-file-export` | Export | Save the record buffer to a file |
| `fa-arrow-right-to-bracket` | Load | Transfer record buffer to play buffer |
| `fa-bookmark` | Mark | Flag current position as a keyframe |

### Playback Section

| Icon | Name | Description |
|------|------|-------------|
| `fa-backward-fast` | Fast Back | Jump to previous marked sketch |
| `fa-backward-step` | Step Back | Go to previous sketch |
| `fa-play` / `fa-pause` | Play/Pause | Start or stop automatic playback |
| `fa-forward-step` | Step Forward | Go to next sketch |
| `fa-forward-fast` | Fast Forward | Jump to next marked sketch |

### Status Display

- **Countdown**: Shows seconds until next sketch (cyan, right side)
- **Index**: Current position in play buffer (e.g., "3/15")
- **Filename**: Name of loaded file (truncated)
- **Recording dot**: Red pulsing indicator when recording

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+R` | Toggle toolbar visibility |
| `Ctrl+Shift+P` | Play/Pause playback |
| `Ctrl+Shift+M` | Mark current position |
| `←` (Left Arrow) | Step backward (when not editing) |
| `→` (Right Arrow) | Step forward (when not editing) |

---

## Workflow Examples

### Basic Recording Session

1. Start with a clean slate: click **Clear** (trash icon)
2. Write and execute Hydra code normally (`Ctrl+Enter` or `Ctrl+Shift+Enter`)
3. Each execution is automatically recorded with timing
4. Click **Mark** (bookmark) on important moments
5. When done, click **Export** to save your recording
6. Click **Load** to prepare for playback
7. Click **Play** to replay your performance

### Loading and Editing a Recording

1. Click **Import** to load a `.inact` file
2. The recording appears in the record buffer
3. Use **Step Forward/Back** to review sketches
4. Add/remove marks as needed
5. Click **Load** to move to play buffer
6. Click **Play** to start playback

### Live Performance Setup

1. **Before the show**: Import your prepared recording
2. Click **Load** to prepare the play buffer
3. **During the show**: Use manual stepping or auto-play
4. Use **Fast Forward/Back** to jump between marked sections
5. You can still execute code manually - it won't affect the play buffer

---

## Console API

After installation, the `inact` global object provides programmatic control:

### Recording

```javascript
inact.record(code)    // Manually add a sketch to record buffer
inact.clear()         // Clear the record buffer
inact.export()        // Open save dialog for record buffer
inact.import()        // Open file picker to load recording
inact.load()          // Transfer record buffer to play buffer
```

### Playback

```javascript
inact.play()          // Start automatic playback
inact.stop()          // Stop playback
inact.stepForward()   // Go to next sketch
inact.stepBack()      // Go to previous sketch
inact.jumpForward()   // Jump to next mark
inact.jumpBack()      // Jump to previous mark
```

### UI Control

```javascript
inact.toggle()        // Toggle toolbar visibility
inact.show()          // Show toolbar
inact.hide()          // Hide toolbar
```

### State Access

```javascript
inact.state           // InActState instance
inact.ui              // InActUI instance
inact.state.sketches  // Array of recorded sketches
inact.state.playList  // Array of sketches ready for playback
```

---

## File Format

InAct uses a simple text-based format with `.inact` extension:

```
//+ 2.5 0 2024-01-15T10:30:00.000Z
osc(10).out()




//+ 1.0 mark 1 2024-01-15T10:32:30.000Z
osc(20).rotate(0.1).out()




//+ 3.0 2 2024-01-15T10:33:30.000Z
noise(3).modulate(osc(10)).out()
```

### Format Details

- **`//+`** prefix marks the start of a new sketch
- **First number**: Duration in seconds until next sketch
- **`mark`** (optional): Indicates this is a marked keyframe
- **Index**: Position in the sequence (0, 1, 2, ...)
- **Timestamp**: ISO 8601 datetime of when recorded
- **4+ blank lines**: Separator between sketches
- **Code**: The actual Hydra code to execute

### Editing Files Manually

You can edit `.inact` files in any text editor:

```
//+ 5.0 0 2024-01-15T10:30:00.000Z
// This is my opening scene
osc(10)
  .color(1, 0.5, 0.2)
  .out()




//+ 3.0 mark 1 2024-01-15T10:35:00.000Z
// Transition to noise
noise(3)
  .blend(osc(20))
  .out()
```

Tips for manual editing:
- Adjust durations to fine-tune timing
- Add `mark` to any sketch header to create a navigation point
- Keep at least 4 blank lines between sketches
- Comments inside the code are preserved

---

## Auto-Record Feature

When `autoRecord` is enabled (default), InAct hooks into Hydra's code execution:

- Every time you run code with `Ctrl+Enter` or `Ctrl+Shift+Enter`, it's recorded
- The duration is calculated from time since last recording
- This happens transparently during live performance

### Disabling Auto-Record

```javascript
inact.install(hydra, { autoRecord: false })
```

With auto-record disabled, use `inact.record(code)` to manually capture sketches.

---

## Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | string | `'top'` | Toolbar position: `'top'` or `'bottom'` |
| `autoRecord` | boolean | `true` | Auto-record on code execution |
| `beepsEnabled` | boolean | `false` | Audio feedback when recording |
| `defaultDur` | number | `2.0` | Default duration for new sketches (seconds) |
| `maxDur` | number | `60` | Maximum duration cap (seconds) |

---

## Tips and Best Practices

### For Recording

1. **Plan your structure**: Think about natural sections and mark them
2. **Use consistent timing**: Keep similar durations for smoother playback
3. **Test incrementally**: Load and play back sections as you build
4. **Save often**: Export your work regularly

### For Performance

1. **Pre-load everything**: Import and load before your set
2. **Know your marks**: Memorize where your marked sections are
3. **Practice navigation**: Get comfortable with step/jump controls
4. **Have a backup**: Keep your `.inact` file accessible

### For Collaboration

1. **Share `.inact` files**: They're plain text and easy to share
2. **Document your recordings**: Add comments in the code
3. **Version your files**: Use descriptive filenames with dates

---

## Troubleshooting

### Toolbar not appearing

- Check browser console for errors
- Ensure Font Awesome is loading (check network tab)
- Try `inact.show()` in console

### Recording not capturing code

- Verify `autoRecord` is enabled
- Check that you're using `Ctrl+Enter` to run code
- Try `inact.record('osc().out()')` manually

### Playback not executing code

- Ensure play buffer is loaded (click Load button)
- Check that sketches contain valid Hydra code
- Look for errors in browser console

### Timing seems off

- Check the duration values in your `.inact` file
- Very short durations (<0.5s) may feel rushed
- Very long durations (>30s) may cause apparent freezes

---

## Version

Extension Version: 0.1.0
