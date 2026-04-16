import { resetGrowthAndCycleToFocus } from "./app-state-core.js";

export function runResetPlantGrowth({ confirmReset, pauseTimer, state }) {
  if (!confirmReset()) {
    return { didReset: false, state };
  }

  pauseTimer();

  return {
    didReset: true,
    state: resetGrowthAndCycleToFocus(state),
  };
}
