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

// Focus complete: Energetic ascending celebration (5.6s)
function playFocusCompleteSound() {
  const now = audioContext.currentTime;
  const noteDuration = 0.5;
  const spacing = 0.2;
  
  // Ascending melody: C5 → E5 → G5 → B5 → C6 → E6 → G6
  const melody = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
  
  melody.forEach((frequency, index) => {
    const startTime = now + index * spacing;
    const duration = index === melody.length - 1 ? 1.0 : noteDuration; // Last note sustained
    const peakGain = index === melody.length - 1 ? 0.22 : 0.18; // Louder on final note
    playNote(frequency, startTime, duration, 0.01, 0.15, peakGain);
  });
  
  // Add harmonic richness with subtle chord on final note
  const finalNoteTime = now + (melody.length - 1) * spacing;
  playNote(1046.50, finalNoteTime, 1.0, 0.02, 0.2, 0.08); // C6 harmony
}

// Short break complete: Gentle descending chime (5s)
function playShortBreakCompleteSound() {
  const now = audioContext.currentTime;
  const noteDuration = 0.8;
  const spacing = 0.4;
  
  // Descending melody: A5 → F5 → D5 → A4 → D5 (back up for hope)
  const melody = [880.00, 698.46, 587.33, 440.00, 587.33];
  
  melody.forEach((frequency, index) => {
    const startTime = now + index * spacing;
    const duration = index === melody.length - 1 ? 1.2 : noteDuration; // Last note sustained longer
    playNote(frequency, startTime, duration, 0.05, 0.2, 0.16);
  });
}

// Long break complete: Triumphant fanfare (6.5s)
function playLongBreakCompleteSound() {
  const now = audioContext.currentTime;
  
  // Pattern: Chord → Note → Chord → High note
  // Intro chord: C5 + E5 (major third)
  playChord([523.25, 659.25], now, 0.8, 0.01, 0.15, 0.16);
  
  // Rising melody note: G5
  playNote(783.99, now + 1.0, 0.6, 0.01, 0.1, 0.20);
  
  // Triumphant chord: C6 + E6 (octave higher)
  playChord([1046.50, 1318.51], now + 1.8, 1.0, 0.01, 0.2, 0.18);
  
  // Victory high note: G6 (sustained)
  playNote(1567.98, now + 3.0, 1.5, 0.02, 0.3, 0.22);
  
  // Add extra celebratory notes ascending
  playNote(1318.51, now + 4.7, 0.4, 0.01, 0.1, 0.18); // E6
  playNote(1567.98, now + 5.2, 1.0, 0.02, 0.3, 0.24); // G6 final
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
