/**
 * Manual Sound Testing Utilities
 * 
 * This file provides console commands for manually testing completion sounds.
 * To use:
 * 1. Open the app in browser
 * 2. Open DevTools console (F12)
 * 3. Load this module:
 *    import('./tests/manual-sound-test.js')
 * 4. Use the global testSounds object:
 *    testSounds.focus() - Test focus sound
 *    testSounds.short() - Test short break sound
 *    testSounds.long() - Test long break sound
 *    testSounds.all() - Test all sounds in sequence
 */

import { announceIntervalComplete } from '../src/notifications.js';

const timerEl = document.getElementById('timerDisplay');

export const testSounds = {
  focus: () => {
    console.log('🎯 Playing Focus Complete sound (2.5s)...');
    announceIntervalComplete(timerEl, "Focus complete!", "focus");
  },
  
  short: () => {
    console.log('☕ Playing Short Break sound (2s)...');
    announceIntervalComplete(timerEl, "Short break complete!", "short");
  },
  
  long: () => {
    console.log('🌟 Playing Long Break sound (3s)...');
    announceIntervalComplete(timerEl, "Long break complete!", "long");
  },
  
  all: () => {
    console.log('🎼 Testing all sounds: Focus → Short (3s) → Long (6s)');
    testSounds.focus();
    setTimeout(() => testSounds.short(), 3000);
    setTimeout(() => testSounds.long(), 6000);
  }
};

// Make globally available for console access
window.testSounds = testSounds;

console.log('🎵 Sound test functions loaded!');
console.log('Available commands:');
console.log('  testSounds.focus() - Test focus sound (2.5s success chime)');
console.log('  testSounds.short() - Test short break (2s gentle bell)');
console.log('  testSounds.long()  - Test long break (3s achievement)');
console.log('  testSounds.all()   - Test all sounds in sequence');
