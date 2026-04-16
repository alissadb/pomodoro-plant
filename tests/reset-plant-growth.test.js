import test from "node:test";
import assert from "node:assert/strict";

import { runResetPlantGrowth } from "../src/reset-plant-growth.js";
import { MODES } from "../src/pomodoro-core.js";

test("runResetPlantGrowth returns unchanged state when confirmation is declined", () => {
  let paused = false;
  const state = {
    mode: "long",
    isRunning: true,
    focusedMinutesTotal: 250,
  };

  const result = runResetPlantGrowth({
    confirmReset: () => false,
    pauseTimer: () => {
      paused = true;
    },
    state,
  });

  assert.equal(result.didReset, false);
  assert.equal(result.state, state);
  assert.equal(paused, false);
});

test("runResetPlantGrowth pauses timer and resets to full focus cycle", () => {
  let paused = false;
  const state = {
    mode: "short",
    remainingSeconds: 17,
    isRunning: true,
    endTime: Date.now() + 17_000,
    focusSessionsCompleted: 3,
    focusedMinutesTotal: 75,
    history: [{ label: "Short break complete", time: "11:00" }],
    streak: 3,
    lastCompletedStage: 2,
    selectedPlantId: "zz",
    roundGoal: 20,
  };

  const result = runResetPlantGrowth({
    confirmReset: () => true,
    pauseTimer: () => {
      paused = true;
    },
    state,
  });

  assert.equal(result.didReset, true);
  assert.equal(paused, true);
  assert.equal(result.state.mode, "focus");
  assert.equal(result.state.remainingSeconds, MODES.focus.seconds);
  assert.equal(result.state.isRunning, false);
  assert.equal(result.state.endTime, null);
  assert.equal(result.state.focusSessionsCompleted, 0);
  assert.equal(result.state.focusedMinutesTotal, 0);
  assert.deepEqual(result.state.history, []);
  assert.equal(result.state.streak, 0);
  assert.equal(result.state.lastCompletedStage, 1);
  assert.equal(result.state.selectedPlantId, "zz");
  assert.equal(result.state.roundGoal, 20);
});
