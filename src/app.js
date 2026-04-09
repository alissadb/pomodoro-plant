import {
  MODES,
  DEFAULT_ROUND_GOAL,
  STAGE_LABELS,
  PLANTS,
  getGrowthGoalMinutes,
  normalizeRoundGoal,
  formatTime,
  clamp,
  getStageFromGrowthWithGoal,
  getNextMode,
} from "./pomodoro-core.js";
import {
  sanitizeState,
  applyFocusCompletion,
  applySkipInterval,
  switchPlantPreservingProgress,
} from "./app-state-core.js";
import { createStateStorage } from "./state-storage.js";
import { createTimerController } from "./timer-controller.js";
import {
  requestNotificationPermission,
  announceIntervalComplete as announceIntervalCompleteUi,
} from "./notifications.js";
import { getPlantSvg } from "./plant-renderer.js";

const STORAGE_KEY = "pomodoro-plant-state-v5";
const BUTTON_POSITION_KEY = "plant-button-position-v1";
const HISTORY_LIMIT = 8;
const DEFAULT_PLANT_ID = "snake";
const TIMER_TICK_INTERVAL_MS = 250;
const GROWTH_ANIMATION_DURATION_MS = 520;
const NOTIFICATION_ANIMATION_DURATION_MS = 600;
const INPUT_VALIDATION_FEEDBACK_DURATION_MS = 600;
const MODE_CLASS = {
  focus: "mode-focus",
  short: "mode-short",
  long: "mode-long",
};
const INTERVAL_COMPLETION = {
  focus: {
    historyLabel: "Focus complete",
    notification: "Focus session complete. Time for a break.",
  },
  short: {
    historyLabel: "Short break complete",
    notification: "Short break complete. Ready to focus again?",
  },
  long: {
    historyLabel: "Long break complete",
    notification: "Long break complete. Time to focus.",
  },
};

const els = {
  timerDisplay: document.getElementById("timerDisplay"),
  modePill: document.getElementById("modePill"),
  startPauseBtn: document.getElementById("startPauseBtn"),
  resetTimerBtn: document.getElementById("resetTimerBtn"),
  skipBtn: document.getElementById("skipBtn"),
  resetPlantBtn: document.getElementById("resetPlantBtn"),
  plantSelect: document.getElementById("plantSelect"),
  roundGoalInput: document.getElementById("roundGoalInput"),
  plantTitle: document.getElementById("plantTitle"),
  focusedMinutes: document.getElementById("focusedMinutes"),
  minutesRemaining: document.getElementById("minutesRemaining"),
  streakValue: document.getElementById("streakValue"),
  progressFill: document.getElementById("progressFill"),
  progressTrack: document.getElementById("progressTrack"),
  progressText: document.getElementById("progressText"),
  stageLabel: document.getElementById("stageLabel"),
  plantVisual: document.getElementById("plantVisual"),
  historyList: document.getElementById("historyList"),
  sessionCount: document.getElementById("sessionCount"),
  plantPreviewBtn: document.getElementById("plantPreviewBtn"),
  plantViewHeader: document.getElementById("plantViewHeader"),
  miniTimer: document.getElementById("miniTimer"),
  miniTimerMode: document.getElementById("miniTimerMode"),
  miniTimerDisplay: document.getElementById("miniTimerDisplay"),
};

let state = {
  mode: "focus",
  remainingSeconds: MODES.focus.seconds,
  isRunning: false,
  endTime: null,
  focusSessionsCompleted: 0,
  focusedMinutesTotal: 0,
  history: [],
  selectedPlantId: DEFAULT_PLANT_ID,
  streak: 0,
  lastCompletedStage: 1,
  roundGoal: DEFAULT_ROUND_GOAL,
};

const storage = createStateStorage(STORAGE_KEY, 500);

const timerController = createTimerController({
  now: () => Date.now(),
  getState: () => state,
  onTick: (remainingSeconds) => {
    state.remainingSeconds = remainingSeconds;
    renderTimer();
  },
  onElapsed: () => {
    state.isRunning = false;
    state.endTime = null;
    completeCurrentInterval();
  },
  intervalMs: TIMER_TICK_INTERVAL_MS,
});

function getModeClass(mode) {
  return MODE_CLASS[mode] ?? MODE_CLASS.long;
}

function applyModeTheme() {
  document.body.classList.remove("mode-focus", "mode-short", "mode-long");
  document.body.classList.add(getModeClass(state.mode));
  els.modePill.textContent = MODES[state.mode].label;
}

function saveState() {
  storage.saveDebounced(state);
}

function saveStateImmediate() {
  storage.saveImmediate(state);
}

function restoreState() {
  const raw = storage.loadRaw();
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const { state: restored, shouldCompleteInterval } = sanitizeState(parsed, Date.now(), HISTORY_LIMIT);
    state = {
      ...state,
      ...restored,
    };

    if (shouldCompleteInterval) {
      completeCurrentInterval(true);
    }
  } catch {
    storage.clear();
  }
}

function renderHistory() {
  // Update session count badge
  if (els.sessionCount && state.history && state.history.length > 0) {
    els.sessionCount.textContent = `(${state.history.length})`;
  } else if (els.sessionCount) {
    els.sessionCount.textContent = '';
  }
  
  // Update history list
  if (!state.history.length) {
    els.historyList.innerHTML = "<li>No sessions completed yet.</li>";
    return;
  }
  els.historyList.innerHTML = state.history.map((entry) => `<li>${entry.label} - ${entry.time}</li>`).join("");
}

function renderGrowth() {
  const goalMinutes = getGrowthGoalMinutes(state.roundGoal);
  const progress = clamp((state.focusedMinutesTotal / goalMinutes) * 100, 0, 100);
  const remaining = Math.max(0, goalMinutes - state.focusedMinutesTotal);
  const stage = getStageFromGrowthWithGoal(state.focusedMinutesTotal, goalMinutes);

  els.focusedMinutes.textContent = `${state.focusedMinutesTotal} min`;
  els.minutesRemaining.textContent = `${remaining} min`;
  els.progressFill.style.width = `${progress.toFixed(2)}%`;
  els.progressTrack?.setAttribute("aria-valuenow", String(Math.round(progress)));
  els.progressText.textContent = `${Math.round(progress)}% grown`;
  els.stageLabel.textContent = `Stage: ${STAGE_LABELS[stage]}`;
  els.plantVisual.dataset.stage = String(stage);
  els.plantVisual.style.setProperty("--growth-factor", String(progress / 100));

  if (progress >= 100 && state.focusedMinutesTotal > 0) {
    els.plantVisual.classList.add("fully-grown");
  } else {
    els.plantVisual.classList.remove("fully-grown");
  }

  if (els.roundGoalInput) {
    els.roundGoalInput.value = String(state.roundGoal);
  }
}

function renderTimer() {
  const timeStr = formatTime(state.remainingSeconds);
  els.timerDisplay.textContent = timeStr;
  els.streakValue.textContent = `${state.streak}`;
  els.startPauseBtn.textContent = state.isRunning ? "Pause" : "Start";
  els.startPauseBtn.setAttribute("aria-pressed", state.isRunning ? "true" : "false");

  // Update mini timer display
  if (els.miniTimerDisplay) {
    els.miniTimerDisplay.textContent = timeStr;
  }
  if (els.miniTimerMode) {
    els.miniTimerMode.textContent = MODES[state.mode].label;
  }

  const modeLabel = MODES[state.mode].label;
  document.title = state.isRunning
    ? `${timeStr} - ${modeLabel} - Pomodoro Garden`
    : "Pomodoro Garden";
}

function render() {
  applyModeTheme();
  renderPlantArt();
  renderTimer();
  renderGrowth();
  renderHistory();
}

function addHistory(label) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.history.unshift({ label, time });
  state.history = state.history.slice(0, HISTORY_LIMIT);
}

function announceIntervalComplete(message) {
  announceIntervalCompleteUi(els.timerDisplay, message);
}

function setMode(mode) {
  state.mode = mode;
  state.remainingSeconds = MODES[mode].seconds;
  state.isRunning = false;
  state.endTime = null;
}

function handleStageReward() {
  const newStage = getStageFromGrowthWithGoal(state.focusedMinutesTotal, getGrowthGoalMinutes(state.roundGoal));
  if (newStage > state.lastCompletedStage) {
    state.lastCompletedStage = newStage;
    addHistory(`Plant evolved to ${STAGE_LABELS[newStage]}`);
  }
}

function completeCurrentInterval(fromRestore = false) {
  const completedMode = state.mode;
  const completion = INTERVAL_COMPLETION[completedMode];

  if (completedMode === "focus") {
    state = {
      ...state,
      ...applyFocusCompletion(state),
    };
    addHistory(completion.historyLabel);
    handleStageReward();
    els.plantVisual.classList.add("growth-bump");
    setTimeout(() => els.plantVisual.classList.remove("growth-bump"), GROWTH_ANIMATION_DURATION_MS);
  } else {
    addHistory(completion.historyLabel);
  }

  if (!fromRestore && completion) {
    announceIntervalComplete(completion.notification);
  }

  setMode(getNextMode(state.mode, state.focusSessionsCompleted));
  saveStateImmediate();
  render();
}

function startTimer() {
  if (state.isRunning) return;
  requestNotificationPermission();
  state.isRunning = true;
  state.endTime = Date.now() + state.remainingSeconds * 1000;
  timerController.start();
  saveState();
  renderTimer();
}

function pauseTimer() {
  if (!state.isRunning) return;
  state.remainingSeconds = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  state.isRunning = false;
  state.endTime = null;
  timerController.stop();
  saveState();
  renderTimer();
}

function resetCurrentTimer() {
  pauseTimer();
  state.remainingSeconds = MODES[state.mode].seconds;
  saveState();
  renderTimer();
}

function skipCurrentInterval() {
  pauseTimer();
  const skipResult = applySkipInterval(state);
  state = {
    ...state,
    ...skipResult.state,
  };
  if (skipResult.streakReset) {
    addHistory("Streak reset");
  }
  const skippedMode = state.mode;
  addHistory(`${MODES[skippedMode].label} skipped`);
  setMode(getNextMode(skippedMode, state.focusSessionsCompleted));
  saveState();
  render();
}

function resetPlantGrowth() {
  const confirmed = confirm(
    "Reset all growth progress? This will clear your focused minutes, sessions, and history. This cannot be undone."
  );
  if (!confirmed) return;

  state.focusedMinutesTotal = 0;
  state.focusSessionsCompleted = 0;
  state.history = [];
  state.streak = 0;
  state.lastCompletedStage = 1;
  saveState();
  render();
}

function handleRoundGoalChange(value) {
  const nextRoundGoal = normalizeRoundGoal(value);
  state.roundGoal = nextRoundGoal;
  const currentStage = getStageFromGrowthWithGoal(state.focusedMinutesTotal, getGrowthGoalMinutes(nextRoundGoal));
  // Keep the max of current and previous lastCompletedStage to preserve achievement history
  state.lastCompletedStage = Math.max(state.lastCompletedStage, currentStage);
  saveState();
  renderGrowth();
}

function renderPlantArt() {
  const plantId = Object.hasOwn(PLANTS, state.selectedPlantId) ? state.selectedPlantId : DEFAULT_PLANT_ID;
  state.selectedPlantId = plantId;
  const plantName = PLANTS[plantId];
  els.plantTitle.textContent = plantName;
  els.plantVisual.dataset.plant = plantId;
  els.plantVisual.innerHTML = getPlantSvg(plantId);
  els.plantVisual.setAttribute("aria-label", `Growing ${plantName} illustration`);
  els.plantSelect.value = plantId;
}

function handlePlantChange(event) {
  state = switchPlantPreservingProgress(state, event.target.value);
  saveState();
  renderPlantArt();
}

els.startPauseBtn.addEventListener("click", () => {
  if (state.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

els.resetTimerBtn.addEventListener("click", resetCurrentTimer);
els.skipBtn.addEventListener("click", skipCurrentInterval);
els.resetPlantBtn.addEventListener("click", resetPlantGrowth);
els.plantSelect.addEventListener("change", handlePlantChange);
els.roundGoalInput?.addEventListener("change", (event) => {
  const input = event.target;
  const inputValue = input.value;
  const normalized = normalizeRoundGoal(inputValue);
  
  if (String(normalized) !== inputValue) {
    // Value was clamped - show user
    input.value = String(normalized);
    input.classList.add('value-adjusted');
    setTimeout(() => input.classList.remove('value-adjusted'), INPUT_VALIDATION_FEEDBACK_DURATION_MS);
  }
  
  handleRoundGoalChange(normalized);
});

// Scroll helper functions for mobile plant preview
function scrollToPlant() {
  const plantPanel = document.querySelector('.plant-panel');
  plantPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Toggle scroll between timer and plant
function toggleScroll() {
  const timerPanel = document.querySelector('.timer-panel');
  const plantPanel = document.querySelector('.plant-panel');
  
  if (!timerPanel || !plantPanel) return;
  
  // Check which panel is currently in view
  const timerRect = timerPanel.getBoundingClientRect();
  const isTimerVisible = timerRect.top >= -50 && timerRect.top <= 100;
  
  if (isTimerVisible) {
    scrollToPlant();
  } else {
    const timerPanel = document.querySelector('.timer-panel');
    timerPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Floating plant preview button (mobile) - toggles between timer and plant
// Also supports dragging to reposition
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let buttonStartX = 0;
let buttonStartY = 0;

// Save button position to localStorage as percentage of viewport
function saveButtonPosition(x, y) {
  try {
    const percentX = (x / window.innerWidth) * 100;
    const percentY = (y / window.innerHeight) * 100;
    localStorage.setItem(BUTTON_POSITION_KEY, JSON.stringify({ x: percentX, y: percentY }));
  } catch (e) {
    // localStorage might be disabled or full
    console.warn('Could not save button position:', e);
  }
}

// Restore button position from localStorage
function restoreButtonPosition() {
  try {
    const saved = localStorage.getItem(BUTTON_POSITION_KEY);
    if (!saved) return;
    
    const position = JSON.parse(saved);
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return;
    }
    
    // Convert percentage back to pixels
    const x = (position.x / 100) * window.innerWidth;
    const y = (position.y / 100) * window.innerHeight;
    
    // Validate position is still within bounds
    const buttonWidth = els.plantPreviewBtn.offsetWidth;
    const buttonHeight = els.plantPreviewBtn.offsetHeight;
    const maxX = window.innerWidth - buttonWidth;
    const maxY = window.innerHeight - buttonHeight;
    
    const validX = Math.max(0, Math.min(x, maxX));
    const validY = Math.max(0, Math.min(y, maxY));
    
    // Apply position
    els.plantPreviewBtn.style.left = `${validX}px`;
    els.plantPreviewBtn.style.top = `${validY}px`;
    els.plantPreviewBtn.style.right = 'auto';
    els.plantPreviewBtn.style.bottom = 'auto';
  } catch (e) {
    // Invalid JSON or other error - ignore and use default position
    console.warn('Could not restore button position:', e);
  }
}

function handleDragStart(e) {
  const touch = e.type.includes('touch') ? e.touches[0] : e;
  dragStartX = touch.clientX;
  dragStartY = touch.clientY;
  
  // Get current button position
  const rect = els.plantPreviewBtn.getBoundingClientRect();
  buttonStartX = rect.left;
  buttonStartY = rect.top;
  
  isDragging = false; // Will be set to true if movement exceeds threshold
}

function handleDragMove(e) {
  const touch = e.type.includes('touch') ? e.touches[0] : e;
  const deltaX = touch.clientX - dragStartX;
  const deltaY = touch.clientY - dragStartY;
  
  // Threshold to distinguish drag from click (5 pixels)
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isDragging = true;
    e.preventDefault(); // Prevent scrolling while dragging
    
    // Calculate new position
    let newX = buttonStartX + deltaX;
    let newY = buttonStartY + deltaY;
    
    // Constrain to viewport boundaries
    const buttonWidth = els.plantPreviewBtn.offsetWidth;
    const buttonHeight = els.plantPreviewBtn.offsetHeight;
    const maxX = window.innerWidth - buttonWidth;
    const maxY = window.innerHeight - buttonHeight;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    // Apply position
    els.plantPreviewBtn.style.left = `${newX}px`;
    els.plantPreviewBtn.style.top = `${newY}px`;
    els.plantPreviewBtn.style.right = 'auto';
    els.plantPreviewBtn.style.bottom = 'auto';
  }
}

function handleDragEnd(e) {
  if (isDragging) {
    e.preventDefault();
    e.stopPropagation(); // Prevent click event from firing
    
    // Save the new position
    const rect = els.plantPreviewBtn.getBoundingClientRect();
    saveButtonPosition(rect.left, rect.top);
  }
  isDragging = false;
}

function handleClick(e) {
  if (!isDragging) {
    toggleScroll();
  }
}

if (els.plantPreviewBtn) {
  // Restore saved position on load
  restoreButtonPosition();
  
  // Touch events for mobile
  els.plantPreviewBtn.addEventListener('touchstart', handleDragStart, { passive: true });
  els.plantPreviewBtn.addEventListener('touchmove', handleDragMove, { passive: false });
  els.plantPreviewBtn.addEventListener('touchend', handleDragEnd);
  
  // Mouse events for desktop
  els.plantPreviewBtn.addEventListener('mousedown', handleDragStart);
  els.plantPreviewBtn.addEventListener('mousemove', handleDragMove);
  els.plantPreviewBtn.addEventListener('mouseup', handleDragEnd);
  
  // Click handler (will be prevented if dragging)
  els.plantPreviewBtn.addEventListener('click', handleClick);
  
  // Recalculate position on resize to keep button in bounds
  window.addEventListener('resize', () => {
    if (els.plantPreviewBtn) {
      restoreButtonPosition();
    }
  });
}

// Keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
  // Ignore if user is typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  switch(e.key) {
    case ' ':  // Space = Start/Pause
      e.preventDefault();
      if (state.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
      break;
    case 'r':  // R = Reset
      if (e.ctrlKey || e.metaKey) return;  // Don't override Ctrl+R (browser refresh)
      e.preventDefault();
      resetCurrentTimer();
      break;
    case 's':  // S = Skip
      if (e.ctrlKey || e.metaKey) return;  // Don't override Ctrl+S (save)
      e.preventDefault();
      skipCurrentInterval();
      break;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

restoreState();
render();

if (state.isRunning) {
  timerController.start();
}

const urlParams = new URLSearchParams(window.location.search);
