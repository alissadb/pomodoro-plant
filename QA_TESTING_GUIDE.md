# QA Testing Guide for Pomodoro Plant

## Overview

The QA Testing Panel provides an interactive interface to inspect and test the plant growth mechanics in the Pomodoro Plant application. This is useful for:

- **Visual QA**: Quickly verify all plant growth stages
- **Design review**: Check how plants look at different stages
- **Development**: Test plant rendering without waiting for actual pomodoro sessions
- **Bug reproduction**: Easily reproduce specific growth states

## Activation

The QA Testing Panel is automatically enabled when:

1. Running on `localhost`, OR
2. URL contains `?qa=1` query parameter

### Example URLs:
```
http://localhost:8000/?qa=1
http://127.0.0.1:8000/?qa=1
```

## Starting the Development Server

```bash
npm run dev
```

Then open: `http://localhost:8000/?qa=1`

## Features

### 1. Current State Inspector

The panel displays real-time information about:
- **Plant**: Current selected plant type (Snake, ZZ, or Begonia)
- **Stage**: Current growth stage (1-5)
- **Progress**: Visual progress percentage
- **Focused Minutes**: Total accumulated focus time
- **Goal Minutes**: Minutes needed for full growth

### 2. Stage Controls

Five buttons to instantly jump to any growth stage:

- **Stage 1: Seedling** (0-19% progress)
- **Stage 2: Sprout** (20-39% progress)
- **Stage 3: Young** (40-59% progress)
- **Stage 4: Mature** (60-79% progress)
- **Stage 5: Full Grown** (80-100% progress)

Click any button to set the plant to the middle of that stage's progress range.

### 3. Quick Actions

#### 🌱 Animate Full Growth
Watch the plant grow smoothly from stage 1 to stage 5 over a few seconds. Great for:
- Previewing the full growth animation
- Verifying smooth transitions between stages
- Showcasing the app to stakeholders

#### 🔄 Cycle Through All Plants
Automatically cycles through all three plant types (Snake → ZZ → Begonia) every 2 seconds. Useful for:
- Comparing how different plants look at the same stage
- Verifying all plants render correctly
- Quick visual regression testing

#### 🎚️ Show Progress Slider
Reveals a slider for fine-grained control over growth progress. Move the slider to see:
- Exact progress percentages
- How the plant scales between stages
- The `--growth-factor` CSS variable in action

### 4. Keyboard Shortcuts

- **`Ctrl + Q`** (or `Cmd + Q` on Mac): Toggle the QA panel on/off

## Growth Stage Breakdown

The app divides growth into 5 stages based on progress percentage:

| Stage | Label        | Progress Range | Example Minutes (10 rounds) |
|-------|--------------|----------------|------------------------------|
| 1     | Seedling     | 0-19%          | 0-91 min                     |
| 2     | Sprout       | 20-39%         | 96-187 min                   |
| 3     | Young        | 40-59%         | 192-283 min                  |
| 4     | Mature       | 60-79%         | 288-379 min                  |
| 5     | Full Grown   | 80-100%        | 384-480 min                  |

**Note**: Each pomodoro round = 48 minutes (25 focus + 5 short break + extra time for long breaks)

## Testing Workflow Examples

### Test Case 1: Verify All Stages Render
1. Open app with `?qa=1`
2. Press `Ctrl + Q` to show QA panel
3. Click each stage button sequentially
4. Verify the plant renders correctly at each stage

### Test Case 2: Compare Plants
1. Set to Stage 3 using the stage button
2. Click "Cycle Through All Plants"
3. Observe how Snake, ZZ, and Begonia look at the same stage

### Test Case 3: Test Growth Animation
1. Reset plant growth (main app button)
2. Click "Animate Full Growth"
3. Watch the smooth transition animation
4. Verify the celebration glow at 100%

### Test Case 4: Fine-tune Progress
1. Click "Show Progress Slider"
2. Move slider to 78%
3. Verify plant is still in Stage 4
4. Move to 80%
5. Verify plant transitions to Stage 5

## Technical Notes

### CSS Variables Used
The panel manipulates:
- `state.focusedMinutesTotal`: Controls progress calculation
- `state.lastCompletedStage`: Determines which stage SVG is visible
- `--growth-factor`: CSS custom property for subtle scaling (0.0 to 1.0)

### Stage Visibility
CSS controls which stage is visible via:
```css
.plant-visual[data-stage="3"] .stage-3 {
  opacity: 1;
}
```

The `data-stage` attribute is set in app.js:182

### Progress Calculation
```javascript
progress = (focusedMinutesTotal / goalMinutes) * 100
stage = based on progress thresholds (20%, 40%, 60%, 80%)
```

## Troubleshooting

**Panel doesn't appear:**
- Ensure URL has `?qa=1` or you're on localhost
- Check browser console for errors
- Try pressing `Ctrl + Q`

**Stage doesn't change:**
- Check that state is being updated (console log)
- Verify render() is being called
- Inspect `data-stage` attribute on `.plant-visual`

**Progress slider doesn't work:**
- Click "Show Progress Slider" button first
- Ensure slider is visible
- Check that slider input events are firing

## Code Structure

```
qa-testing.js
├── createQATestingPanel()      - Creates the DOM elements
├── injectQAStyles()             - Injects CSS for the panel
└── setupQATestingControls()    - Wires up event handlers
    ├── updateStateDisplay()     - Syncs panel with app state
    ├── Stage button handlers    - Jump to specific stages
    ├── Animate growth handler   - Full growth animation
    ├── Plant cycle handler      - Rotate through plants
    └── Slider handler           - Fine-grained progress control
```

## Accessibility

The QA panel includes:
- Keyboard navigation support
- Clear visual feedback for active states
- ARIA-friendly controls (inherits from base app)
- Keyboard shortcut for power users

## Future Enhancements

Potential improvements:
- [ ] Export/import state snapshots
- [ ] Screenshot comparison testing
- [ ] Performance metrics (FPS during animations)
- [ ] Custom growth speed control
- [ ] Stage transition event logging
- [ ] Mobile-friendly panel layout
- [ ] Visual diff against reference images

## Contributing

When adding new plant types or stages:
1. Update stage buttons if stage count changes
2. Update stage threshold logic in slider handler
3. Test with QA panel to ensure new plants render at all stages
4. Update this documentation

---

**Happy Testing! 🌱**
