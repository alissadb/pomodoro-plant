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

function playChime() {
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

    const now = audioContext.currentTime;
    const sequence = [659.25, 783.99, 987.77];

    sequence.forEach((frequency, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.16 + 0.14);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now + index * 0.16);
      osc.stop(now + index * 0.16 + 0.16);
    });
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

const NOTIFICATION_ANIMATION_DURATION_MS = 600;

export function announceIntervalComplete(timerDisplayEl, message) {
  notify(message);
  playChime();
  timerDisplayEl.classList.add("completed");
  setTimeout(() => timerDisplayEl.classList.remove("completed"), NOTIFICATION_ANIMATION_DURATION_MS);
}
