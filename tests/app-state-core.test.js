import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeState, applyFocusCompletion, applySkipInterval, switchPlantPreservingProgress } from "../app-state-core.js";
import { MODES, MINUTES_PER_ROUND } from "../pomodoro-core.js";

test("sanitizeState clamps invalid values and normalizes fields", () => {
  const now = 1_700_000_000_000;
  const parsed = {
    mode: "invalid",
    remainingSeconds: 9_999,
    isRunning: false,
    endTime: null,
    focusSessionsCompleted: -9,
    focusedMinutesTotal: 5000,
    history: Array.from({ length: 20 }, (_, i) => ({ label: `e-${i}`, time: "10:00" })),
    selectedPlantId: "unknown",
    streak: -12,
    lastCompletedStage: 99,
    roundGoal: "999",
  };

  const { state } = sanitizeState(parsed, now, 8);
  assert.equal(state.mode, "focus");
  assert.equal(state.remainingSeconds, MODES.focus.seconds);
  assert.equal(state.focusSessionsCompleted, 0);
  assert.equal(state.focusedMinutesTotal, 5000);
  assert.equal(state.history.length, 8);
  assert.equal(state.selectedPlantId, "monstera");
  assert.equal(state.streak, 0);
  assert.equal(state.lastCompletedStage, 5);
  assert.equal(state.roundGoal, 60);
});

test("sanitizeState detects stale running interval", () => {
  const now = 1_700_000_100_000;
  const parsed = {
    mode: "focus",
    remainingSeconds: 120,
    isRunning: true,
    endTime: now - 1,
  };

  const { state, shouldCompleteInterval } = sanitizeState(parsed, now, 8);
  assert.equal(shouldCompleteInterval, true);
  assert.equal(state.isRunning, false);
  assert.equal(state.endTime, null);
  assert.equal(state.remainingSeconds, 0);
});

test("applyFocusCompletion increments streak and growth", () => {
  const next = applyFocusCompletion({
    focusSessionsCompleted: 2,
    focusedMinutesTotal: 50,
    streak: 3,
  });

  assert.equal(next.focusSessionsCompleted, 3);
  assert.equal(next.focusedMinutesTotal, 50 + MINUTES_PER_ROUND);
  assert.equal(next.streak, 4);
});

test("applySkipInterval resets streak only for focus mode", () => {
  const focusSkip = applySkipInterval({ mode: "focus", streak: 4, focusSessionsCompleted: 3 });
  assert.equal(focusSkip.streakReset, true);
  assert.equal(focusSkip.state.streak, 0);
  assert.equal(focusSkip.state.focusSessionsCompleted, 4);
  assert.equal(focusSkip.focusRoundAdvanced, true);

  const shortSkip = applySkipInterval({ mode: "short", streak: 4, focusSessionsCompleted: 4 });
  assert.equal(shortSkip.streakReset, false);
  assert.equal(shortSkip.state.streak, 4);
  assert.equal(shortSkip.state.focusSessionsCompleted, 4);
  assert.equal(shortSkip.focusRoundAdvanced, false);
});

test("switchPlantPreservingProgress changes only selected plant", () => {
  const input = {
    selectedPlantId: "monstera",
    focusedMinutesTotal: 125,
    streak: 5,
    remainingSeconds: 333,
    history: [{ label: "Focus complete", time: "10:10" }],
  };

  const out = switchPlantPreservingProgress(input, "snake");
  assert.equal(out.selectedPlantId, "snake");
  assert.equal(out.focusedMinutesTotal, 125);
  assert.equal(out.streak, 5);
  assert.equal(out.remainingSeconds, 333);
  assert.deepEqual(out.history, input.history);
});

// Additional comprehensive tests

test("sanitizeState handles null/undefined input gracefully", () => {
  const result1 = sanitizeState(null);
  assert.ok(result1.state);
  assert.equal(result1.state.mode, "focus");

  const result2 = sanitizeState(undefined);
  assert.ok(result2.state);
  assert.equal(result2.state.mode, "focus");
});

test("sanitizeState ensures numeric values are integers", () => {
  const result = sanitizeState({
    focusSessionsCompleted: 3.7,
    focusedMinutesTotal: 125.9,
    streak: 2.3,
    lastCompletedStage: 3.8,
  });
  assert.equal(result.state.focusSessionsCompleted, 3);
  assert.equal(result.state.focusedMinutesTotal, 125);
  assert.equal(result.state.streak, 2);
  assert.equal(result.state.lastCompletedStage, 3);
});

test("sanitizeState updates remainingSeconds from endTime when running", () => {
  const nowMs = Date.now();
  const endTimeMs = nowMs + 10000; // 10 seconds from now
  const result = sanitizeState(
    { isRunning: true, endTime: endTimeMs, remainingSeconds: 999 },
    nowMs
  );
  assert.equal(result.state.isRunning, true);
  assert.equal(result.state.remainingSeconds, 10);
  assert.equal(result.shouldCompleteInterval, false);
});

test("sanitizeState stops timer when endTime is null but isRunning is true", () => {
  const result = sanitizeState({ isRunning: true, endTime: null });
  assert.equal(result.state.isRunning, false);
  assert.equal(result.state.endTime, null);
});

test("sanitizeState handles NaN and Infinity values", () => {
  const result = sanitizeState({
    remainingSeconds: NaN,
    focusSessionsCompleted: Infinity,
    focusedMinutesTotal: -Infinity,
  });
  assert.equal(result.state.remainingSeconds, MODES.focus.seconds);
  assert.equal(result.state.focusSessionsCompleted, 0);
  assert.equal(result.state.focusedMinutesTotal, 0);
});

test("applyFocusCompletion preserves other state fields", () => {
  const input = {
    mode: "focus",
    selectedPlantId: "begonia",
    focusSessionsCompleted: 2,
    focusedMinutesTotal: 50,
    streak: 1,
    history: [{ label: "test", time: "1m" }],
  };
  const result = applyFocusCompletion(input);
  assert.equal(result.mode, "focus");
  assert.equal(result.selectedPlantId, "begonia");
  assert.deepEqual(result.history, input.history);
});

test("applySkipInterval does not reset if focus mode has zero streak", () => {
  const input = { mode: "focus", streak: 0 };
  const result = applySkipInterval(input);
  assert.equal(result.state.streak, 0);
  assert.equal(result.streakReset, false);
});

test("applySkipInterval preserves streak when mode is long break", () => {
  const input = { mode: "long", streak: 4 };
  const result = applySkipInterval(input);
  assert.equal(result.state.streak, 4);
  assert.equal(result.streakReset, false);
});

test("switchPlantPreservingProgress normalizes invalid plant IDs", () => {
  const input = { selectedPlantId: "begonia" };
  const result = switchPlantPreservingProgress(input, "invalid_plant_123");
  assert.equal(result.selectedPlantId, "monstera");
});
