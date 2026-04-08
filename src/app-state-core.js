import {
  MINUTES_PER_ROUND,
  DEFAULT_ROUND_GOAL,
  MODES,
  normalizePlantId,
  normalizeRoundGoal,
  clamp,
} from "./pomodoro-core.js";

function toIntOrFallback(value, fallback) {
  return Number.isFinite(value) ? Math.floor(value) : fallback;
}

function toNonNegativeIntOrFallback(value, fallback = 0) {
  return Math.max(0, toIntOrFallback(value, fallback));
}

function toBoundedIntOrFallback(value, min, max, fallback) {
  return clamp(toIntOrFallback(value, fallback), min, max);
}

export function sanitizeState(parsed, nowMs = Date.now(), historyLimit = 8) {
  const safe = {
    mode: MODES[parsed?.mode] ? parsed.mode : "focus",
    remainingSeconds: toIntOrFallback(parsed?.remainingSeconds, MODES.focus.seconds),
    isRunning: Boolean(parsed?.isRunning),
    endTime: Number.isFinite(parsed?.endTime) ? parsed.endTime : null,
    focusSessionsCompleted: toNonNegativeIntOrFallback(parsed?.focusSessionsCompleted),
    focusedMinutesTotal: toNonNegativeIntOrFallback(parsed?.focusedMinutesTotal),
    history: Array.isArray(parsed?.history) ? parsed.history.slice(0, historyLimit) : [],
    selectedPlantId: normalizePlantId(parsed?.selectedPlantId),
    streak: toNonNegativeIntOrFallback(parsed?.streak),
    lastCompletedStage: toBoundedIntOrFallback(parsed?.lastCompletedStage, 1, 5, 1),
    hasDismissedNotificationPrompt: Boolean(parsed?.hasDismissedNotificationPrompt),
    roundGoal: normalizeRoundGoal(parsed?.roundGoal ?? DEFAULT_ROUND_GOAL),
  };

  let shouldCompleteInterval = false;

  if (safe.isRunning && safe.endTime) {
    const remaining = Math.max(0, Math.ceil((safe.endTime - nowMs) / 1000));
    if (remaining <= 0) {
      safe.remainingSeconds = 0;
      safe.isRunning = false;
      safe.endTime = null;
      shouldCompleteInterval = true;
    } else {
      safe.remainingSeconds = remaining;
    }
  } else {
    safe.isRunning = false;
    safe.endTime = null;
  }

  safe.remainingSeconds = clamp(safe.remainingSeconds, 0, MODES[safe.mode].seconds);

  return { state: safe, shouldCompleteInterval };
}

export function applyFocusCompletion(inputState) {
  return {
    ...inputState,
    focusSessionsCompleted: inputState.focusSessionsCompleted + 1,
    focusedMinutesTotal: inputState.focusedMinutesTotal + MINUTES_PER_ROUND,
    streak: inputState.streak + 1,
  };
}

export function applySkipInterval(inputState) {
  const isFocusRound = inputState.mode === "focus";
  const shouldReset = isFocusRound && inputState.streak > 0;
  return {
    state: {
      ...inputState,
      streak: shouldReset ? 0 : inputState.streak,
      // Don't increment focusSessionsCompleted on skip - user didn't earn it
    },
    streakReset: shouldReset,
    focusRoundAdvanced: false, // Skipping is not a real completion
  };
}

export function switchPlantPreservingProgress(inputState, plantId) {
  return {
    ...inputState,
    selectedPlantId: normalizePlantId(plantId),
  };
}
