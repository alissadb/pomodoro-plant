export function createTimerController({ now, getState, onTick, onElapsed, intervalMs = 250 }) {
  let timerId = null;

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function tick() {
    const state = getState();
    if (!state.isRunning || !state.endTime) {
      stop(); // Stop if state changed externally
      return;
    }
    const remaining = Math.max(0, Math.ceil((state.endTime - now()) / 1000));
    onTick(remaining);
    if (remaining <= 0 && state.isRunning) {  // Double-check isRunning
      stop();
      onElapsed();
    }
  }

  function start() {
    stop();
    timerId = setInterval(tick, intervalMs);
  }

  function isRunning() {
    return Boolean(timerId);
  }

  return {
    start,
    stop,
    tick,
    isRunning,
  };
}
