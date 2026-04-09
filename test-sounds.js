// Quick Sound Test Script
// Paste this in your browser console to test each sound

console.log("🎵 Sound Test Script Loaded!");
console.log("Commands available:");
console.log("  testFocusSound()    - Test focus completion sound");
console.log("  testShortSound()    - Test short break completion sound");
console.log("  testLongSound()     - Test long break completion sound");
console.log("  testAllSounds()     - Test all sounds in sequence");

// Import the notification function
import { announceIntervalComplete } from './src/notifications.js';

// Get timer display element
const timerEl = document.getElementById('timerDisplay');

window.testFocusSound = function() {
  console.log("🎯 Playing Focus Complete sound...");
  announceIntervalComplete(timerEl, "Focus session complete!", "focus");
};

window.testShortSound = function() {
  console.log("☕ Playing Short Break Complete sound...");
  announceIntervalComplete(timerEl, "Short break complete!", "short");
};

window.testLongSound = function() {
  console.log("🌟 Playing Long Break Complete sound...");
  announceIntervalComplete(timerEl, "Long break complete!", "long");
};

window.testAllSounds = function() {
  console.log("🎼 Testing all sounds in sequence...");
  
  testFocusSound();
  
  setTimeout(() => {
    testShortSound();
  }, 7000);
  
  setTimeout(() => {
    testLongSound();
  }, 14000);
  
  console.log("Will play: Focus (now) → Short (7s) → Long (14s)");
};

console.log("\n✨ Try: testFocusSound() or testAllSounds()");
