export const MODES = {
  focus: { label: "Focus", seconds: 25 * 60 },
  short: { label: "Short Break", seconds: 5 * 60 },
  long: { label: "Long Break", seconds: 15 * 60 },
};

export const MINUTES_PER_ROUND = 25;
export const DEFAULT_ROUND_GOAL = 10;

export const STAGE_LABELS = {
  1: "Seedling",
  2: "Sprout",
  3: "Juvenile",
  4: "Mature",
  5: "Fully Grown",
};

export const PLANTS = {
  snake: "Snake Plant",
  zz: "ZZ Plant",
  begonia: "Begonia Maculata",
};

export const PLANT_FAMILIES = ["auto", "broad-leaf", "upright", "spotted"];

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getStageFromGrowth(minutes) {
  const progress = minutes / getGrowthGoalMinutes(DEFAULT_ROUND_GOAL);
  if (progress >= 1) return 5;
  if (progress >= 0.75) return 4;
  if (progress >= 0.5) return 3;
  if (progress >= 0.25) return 2;
  return 1;
}

export function getStageFromGrowthWithGoal(minutes, goalMinutes) {
  const safeGoal = Math.max(1, goalMinutes);
  const progress = minutes / safeGoal;
  if (progress >= 1) return 5;
  if (progress >= 0.75) return 4;
  if (progress >= 0.5) return 3;
  if (progress >= 0.25) return 2;
  return 1;
}

export function normalizeRoundGoal(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_ROUND_GOAL;
  return clamp(parsed, 1, 60);
}

export function getGrowthGoalMinutes(roundGoal) {
  return normalizeRoundGoal(roundGoal) * MINUTES_PER_ROUND;
}

export function getNextMode(currentMode, focusSessionsCompleted) {
  if (currentMode === "focus") {
    if (focusSessionsCompleted <= 0) return "short";
    return focusSessionsCompleted % 4 === 0 ? "long" : "short";
  }
  return "focus";
}

export function normalizePlantId(value) {
  return Object.hasOwn(PLANTS, value) ? value : "snake";
}

export function normalizePlantFamily(value) {
  return PLANT_FAMILIES.includes(value) ? value : "auto";
}
