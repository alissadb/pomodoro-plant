export function requestNotificationPermission() {
  if (!("Notification" in window)) return Promise.resolve("unsupported");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  
  return Notification.requestPermission()
    .then((result) => result)
    .catch(() => "denied");
}

function notify(message) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("Pomodoro Plant", { body: message });
  }
}

let audioContext = null;

// Helper function to play a note with envelope shaping and rich timbre
// Uses layered oscillators (sine + triangle) for warmer, fuller sound
function playNote(frequency, startTime, duration, attackTime = 0.02, releaseTime = 0.1, peakGain = 0.28) {
  // Layer 1: Sine wave (fundamental, pure tone)
  const oscSine = audioContext.createOscillator();
  const gainSine = audioContext.createGain();
  
  oscSine.type = "sine";
  oscSine.frequency.value = frequency;
  
  // Sine wave gets 70% of the total gain (primary tone)
  const sineGain = peakGain * 0.7;
  gainSine.gain.setValueAtTime(0.0001, startTime);
  gainSine.gain.exponentialRampToValueAtTime(sineGain, startTime + attackTime);
  gainSine.gain.exponentialRampToValueAtTime(sineGain * 0.7, startTime + duration - releaseTime);
  gainSine.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  
  oscSine.connect(gainSine);
  gainSine.connect(audioContext.destination);
  oscSine.start(startTime);
  oscSine.stop(startTime + duration);
  
  // Layer 2: Triangle wave (harmonics, warmth)
  const oscTriangle = audioContext.createOscillator();
  const gainTriangle = audioContext.createGain();
  
  oscTriangle.type = "triangle";
  oscTriangle.frequency.value = frequency * 1.002; // Subtle detuning for chorus effect
  
  // Triangle wave gets 30% of the total gain (adds richness)
  const triangleGain = peakGain * 0.3;
  gainTriangle.gain.setValueAtTime(0.0001, startTime);
  gainTriangle.gain.exponentialRampToValueAtTime(triangleGain, startTime + attackTime * 1.5); // Slightly slower attack
  gainTriangle.gain.exponentialRampToValueAtTime(triangleGain * 0.6, startTime + duration - releaseTime);
  gainTriangle.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  
  oscTriangle.connect(gainTriangle);
  gainTriangle.connect(audioContext.destination);
  oscTriangle.start(startTime);
  oscTriangle.stop(startTime + duration);
}

// Helper function to play a chord (multiple notes simultaneously)
function playChord(frequencies, startTime, duration, attackTime = 0.02, releaseTime = 0.1, peakGain = 0.24) {
  frequencies.forEach(freq => {
    playNote(freq, startTime, duration, attackTime, releaseTime, peakGain);
  });
}

// Helper function to add subtle reverb effect using delayed copies
// Creates a sense of space and depth without heavy processing
function playNoteWithReverb(frequency, startTime, duration, attackTime = 0.02, releaseTime = 0.1, peakGain = 0.28) {
  // Play the main (dry) note
  playNote(frequency, startTime, duration, attackTime, releaseTime, peakGain);
  
  // Add subtle reverb tails (2 delay taps)
  const reverbDelays = [0.05, 0.09]; // 50ms and 90ms delays
  const reverbGains = [0.15, 0.08];  // Decreasing gains for natural decay
  
  reverbDelays.forEach((delay, index) => {
    const reverbGain = peakGain * reverbGains[index];
    playNote(
      frequency,
      startTime + delay,
      duration * 0.8, // Shorter duration for reverb tails
      attackTime * 2,  // Softer attack
      releaseTime * 1.5, // Longer release
      reverbGain
    );
  });
}

// Focus complete: Success chime (2.5s) - Bright and celebratory
function playFocusCompleteSound() {
  const now = audioContext.currentTime;
  
  // Quick ascending arpeggio with reverb on final note for celebration
  playNote(1046.50, now, 0.4, 0.01, 0.15, 0.30);        // C6 - louder
  playNote(1318.51, now + 0.25, 0.4, 0.01, 0.15, 0.33);  // E6 - louder
  playNoteWithReverb(1567.98, now + 0.5, 0.6, 0.01, 0.2, 0.36); // G6 with reverb - louder
  
  // Add harmony on final note
  playNote(1046.50, now + 0.5, 0.6, 0.02, 0.2, 0.15);   // C6 harmony
}

// Short break complete: Gentle bell (2s) - Warm and soothing
function playShortBreakCompleteSound() {
  const now = audioContext.currentTime;
  
  // Soft descending chime with reverb for bell-like quality
  playNoteWithReverb(880.00, now, 0.5, 0.04, 0.2, 0.24);        // A5 with reverb - louder
  playNote(698.46, now + 0.4, 0.5, 0.04, 0.2, 0.21);            // F5 - louder
  playNoteWithReverb(587.33, now + 0.8, 0.7, 0.05, 0.3, 0.18);  // D5 sustained with reverb - louder
}

// Long break complete: Achievement sound (3s) - Rich and triumphant
function playLongBreakCompleteSound() {
  const now = audioContext.currentTime;
  
  // Triumphant chord progression with reverb for grandeur
  // Major chord: C5 + E5 + G5
  playChord([523.25, 659.25, 783.99], now, 0.6, 0.01, 0.15, 0.27);
  
  // Higher octave with reverb: C6 + E6
  playChord([1046.50, 1318.51], now + 0.7, 0.8, 0.01, 0.2, 0.30);
  
  // Victory note with reverb for lasting impact
  playNoteWithReverb(1567.98, now + 1.6, 1.0, 0.02, 0.3, 0.33); // G6 with reverb - louder
}

// Main function to play completion sound based on mode
function playCompletionSound(mode) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    // Reuse or create context
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass();
    }

    // Resume if suspended (required on iOS after user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Play mode-specific sound
    switch (mode) {
      case 'focus':
        playFocusCompleteSound();
        break;
      case 'short':
        playShortBreakCompleteSound();
        break;
      case 'long':
        playLongBreakCompleteSound();
        break;
      default:
        // Fallback to focus sound if mode unknown
        playFocusCompleteSound();
    }
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

const NOTIFICATION_ANIMATION_DURATION_MS = 600;

export function announceIntervalComplete(timerDisplayEl, message, mode) {
  notify(message);
  playCompletionSound(mode);
  timerDisplayEl.classList.add("completed");
  setTimeout(() => timerDisplayEl.classList.remove("completed"), NOTIFICATION_ANIMATION_DURATION_MS);
}
