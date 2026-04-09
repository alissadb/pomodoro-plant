# Manual Sound Testing

## Quick Start

1. Open the app: http://localhost:8000
2. Open DevTools Console (F12)
3. Load the test utilities:
   ```javascript
   import('./tests/manual-sound-test.js')
   ```
4. Test the sounds:
   ```javascript
   testSounds.focus()  // 2.5s success chime
   testSounds.short()  // 2s gentle bell
   testSounds.long()   // 3s achievement
   testSounds.all()    // Test all three
   ```

## Sound Descriptions

| Mode | Duration | Description |
|------|----------|-------------|
| Focus | 2.5s | Quick success chime - ascending ding-ding-DING |
| Short Break | 2s | Gentle bell - soft descending tones |
| Long Break | 3s | Achievement - chord progression with victory note |

## Testing in Real Timer

To test sounds in the actual timer flow:
1. Open browser console
2. Complete a full timer cycle, OR
3. Use skip button to cycle through modes quickly
