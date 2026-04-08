export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

function notify(message) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("Pomodoro Plant", { body: message });
  }
}

function playChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const now = ctx.currentTime;
  const sequence = [659.25, 783.99, 987.77];

  sequence.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.16);
    gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.16 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.16 + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + index * 0.16);
    osc.stop(now + index * 0.16 + 0.16);
  });

  setTimeout(() => {
    ctx.close().catch(() => {});
  }, 1200);
}

export function announceIntervalComplete(timerDisplayEl, message) {
  notify(message);
  playChime();
  timerDisplayEl.classList.add("completed");
  setTimeout(() => timerDisplayEl.classList.remove("completed"), 600);
}
