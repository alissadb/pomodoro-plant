import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_ROUND_GOAL,
  MINUTES_PER_ROUND,
  PLANTS,
  PLANT_FAMILIES,
  formatTime,
  clamp,
  getStageFromGrowth,
  getStageFromGrowthWithGoal,
  getGrowthGoalMinutes,
  normalizeRoundGoal,
  getNextMode,
  normalizePlantId,
  normalizePlantFamily,
} from "../pomodoro-core.js";

test("formatTime renders mm:ss with leading zeros", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(65), "01:05");
  assert.equal(formatTime(25 * 60), "25:00");
});

test("clamp keeps values inside boundaries", () => {
  assert.equal(clamp(10, 0, 100), 10);
  assert.equal(clamp(-5, 0, 100), 0);
  assert.equal(clamp(500, 0, 100), 100);
});

test("growth stages map correctly to thresholds", () => {
  const goal = getGrowthGoalMinutes(DEFAULT_ROUND_GOAL);
  assert.equal(getStageFromGrowth(0), 1);
  assert.equal(getStageFromGrowth(goal * 0.25), 2);
  assert.equal(getStageFromGrowth(goal * 0.5), 3);
  assert.equal(getStageFromGrowth(goal * 0.75), 4);
  assert.equal(getStageFromGrowth(goal), 5);
  assert.equal(getStageFromGrowth(goal + 100), 5);
});

test("next mode cycles with long break every 4th focus", () => {
  assert.equal(getNextMode("focus", 1), "short");
  assert.equal(getNextMode("focus", 2), "short");
  assert.equal(getNextMode("focus", 3), "short");
  assert.equal(getNextMode("focus", 4), "long");
  assert.equal(getNextMode("short", 4), "focus");
  assert.equal(getNextMode("long", 8), "focus");
});

test("plant selection normalizes to known values", () => {
  assert.equal(normalizePlantId("snake"), "snake");
  assert.equal(normalizePlantId("zz"), "zz");
  assert.equal(normalizePlantId("begonia"), "begonia");
  assert.equal(normalizePlantId("unknown"), "snake");
  assert.equal(normalizePlantId(""), "snake");
  assert.equal(Object.keys(PLANTS).length, 3);
});

test("formatTime handles edge cases", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(59), "00:59");
  assert.equal(formatTime(60), "01:00");
  assert.equal(formatTime(3599), "59:59");
  assert.equal(formatTime(3600), "60:00");
});

test("clamp handles edge cases", () => {
  assert.equal(clamp(5, 5, 10), 5);
  assert.equal(clamp(10, 5, 10), 10);
  assert.equal(clamp(7.5, 5, 10), 7.5);
  assert.equal(clamp(0, 0, 0), 0);
});

test("growth stages handle boundary values correctly", () => {
  const goal = getGrowthGoalMinutes(DEFAULT_ROUND_GOAL);
  assert.equal(getStageFromGrowth(0), 1);
  assert.equal(getStageFromGrowth(goal * 0.24), 1);
  assert.equal(getStageFromGrowth(goal * 0.25), 2);
  assert.equal(getStageFromGrowth(goal * 0.49), 2);
  assert.equal(getStageFromGrowth(goal * 0.5), 3);
  assert.equal(getStageFromGrowth(goal * 0.74), 3);
  assert.equal(getStageFromGrowth(goal * 0.75), 4);
  assert.equal(getStageFromGrowth(goal * 0.99), 4);
  assert.equal(getStageFromGrowth(goal), 5);
  assert.equal(getStageFromGrowth(goal * 2), 5);
});

test("growth stages support variable round goals", () => {
  const goal = getGrowthGoalMinutes(10);
  assert.equal(goal, 250);
  assert.equal(getStageFromGrowthWithGoal(0, goal), 1);
  assert.equal(getStageFromGrowthWithGoal(63, goal), 2);
  assert.equal(getStageFromGrowthWithGoal(125, goal), 3);
  assert.equal(getStageFromGrowthWithGoal(188, goal), 4);
  assert.equal(getStageFromGrowthWithGoal(250, goal), 5);
});

test("round goal normalization and minutes conversion", () => {
  assert.equal(normalizeRoundGoal("10"), 10);
  assert.equal(normalizeRoundGoal(0), 1);
  assert.equal(normalizeRoundGoal(999), 60);
  assert.equal(normalizeRoundGoal("x"), DEFAULT_ROUND_GOAL);
  assert.equal(getGrowthGoalMinutes(10), 10 * MINUTES_PER_ROUND);
});

test("mode cycling respects Pomodoro pattern", () => {
  assert.equal(getNextMode("focus", 0), "short");
  // After 1st, 2nd, 3rd focus: short break
  assert.equal(getNextMode("focus", 1), "short");
  assert.equal(getNextMode("focus", 2), "short");
  assert.equal(getNextMode("focus", 3), "short");
  // After 4th focus: long break
  assert.equal(getNextMode("focus", 4), "long");
  // After 5th, 6th, 7th focus: short break again
  assert.equal(getNextMode("focus", 5), "short");
  assert.equal(getNextMode("focus", 6), "short");
  assert.equal(getNextMode("focus", 7), "short");
  // After 8th focus: long break again
  assert.equal(getNextMode("focus", 8), "long");
  // After any break: back to focus
  assert.equal(getNextMode("short", 1), "focus");
  assert.equal(getNextMode("long", 4), "focus");
});

test("plant family normalization", () => {
  assert.equal(normalizePlantFamily("auto"), "auto");
  assert.equal(normalizePlantFamily("broad-leaf"), "broad-leaf");
  assert.equal(normalizePlantFamily("upright"), "upright");
  assert.equal(normalizePlantFamily("spotted"), "spotted");
  assert.equal(normalizePlantFamily("invalid"), "auto");
  assert.equal(normalizePlantFamily(""), "auto");
  assert.equal(PLANT_FAMILIES.length, 4);
});

test("PLANTS constant has expected entries", () => {
  assert.equal(Object.keys(PLANTS).length, 3);
  assert.ok(PLANTS.snake.includes("Snake"));
  assert.ok(PLANTS.zz.includes("ZZ"));
  assert.ok(PLANTS.begonia.includes("Begonia"));
});

test("default round goal minutes are correctly set", () => {
  assert.equal(getGrowthGoalMinutes(DEFAULT_ROUND_GOAL), DEFAULT_ROUND_GOAL * MINUTES_PER_ROUND);
});
