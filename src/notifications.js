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

// Helper function to play a note with envelope shaping
function playNote(frequency, startTime, duration, attackTime = 0.02, releaseTime = 0.1, peakGain = 0.18) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = "sine";
  osc.frequency.value = frequency;
  
  // ADSR envelope (Attack, Decay, Sustain, Release)
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + attackTime);
  gain.gain.exponentialRampToValueAtTime(peakGain * 0.7, startTime + duration - releaseTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Helper function to play a chord (multiple notes simultaneously)
function playChord(frequencies, startTime, duration, attackTime = 0.02, releaseTime = 0.1, peakGain = 0.15) {
  frequencies.forEach(freq => {
    playNote(freq, startTime, duration, attackTime, releaseTime, peakGain);
  });
}

// Focus complete: Success chime (2.5s)
function playFocusCompleteSound() {
  const now = audioContext.currentTime;
  
  // Quick ascending arpeggio: C6 → E6 → G6
  playNote(1046.50, now, 0.4, 0.01, 0.15, 0.20);      // C6
  playNote(1318.51, now + 0.25, 0.4, 0.01, 0.15, 0.22); // E6
  playNote(1567.98, now + 0.5, 0.6, 0.01, 0.2, 0.24);   // G6
  
  // Add harmony on final note
  playNote(1046.50, now + 0.5, 0.6, 0.02, 0.2, 0.10);   // C6 harmony
}

// Short break complete: Gentle bell (2s)
function playShortBreakCompleteSound() {
  const now = audioContext.currentTime;
  
  // Soft descending chime: A5 → F5 → D5
  playNote(880.00, now, 0.5, 0.04, 0.2, 0.16);         // A5
  playNote(698.46, now + 0.4, 0.5, 0.04, 0.2, 0.14);   // F5
  playNote(587.33, now + 0.8, 0.7, 0.05, 0.3, 0.12);   // D5 sustained
}

// Long break complete: Achievement sound (3s)
function playLongBreakCompleteSound() {
  const now = audioContext.currentTime;
  
  // Triumphant chord progression
  // Major chord: C5 + E5 + G5
  playChord([523.25, 659.25, 783.99], now, 0.6, 0.01, 0.15, 0.18);
  
  // Higher octave: C6 + E6
  playChord([1046.50, 1318.51], now + 0.7, 0.8, 0.01, 0.2, 0.20);
  
  // Victory note: G6
  playNote(1567.98, now + 1.6, 1.0, 0.02, 0.3, 0.22);
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
