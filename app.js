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

const STORAGE_KEY = "monstera-pomodoro-state-v4";

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
};

let state = {
  mode: "focus",
  remainingSeconds: MODES.focus.seconds,
  isRunning: false,
  endTime: null,
  focusSessionsCompleted: 0,
  focusedMinutesTotal: 0,
  history: [],
  selectedPlantId: "monstera",
  streak: 0,
  lastCompletedStage: 1,
  roundGoal: DEFAULT_ROUND_GOAL,
};

let timerId = null;

function hashStringToSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getModeClass(mode) {
  if (mode === "focus") return "mode-focus";
  if (mode === "short") return "mode-short";
  return "mode-long";
}

function applyModeTheme() {
  document.body.classList.remove("mode-focus", "mode-short", "mode-long");
  document.body.classList.add(getModeClass(state.mode));
  els.modePill.textContent = MODES[state.mode].label;
}

let saveTimeout;

function saveState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 500);
}

function saveStateImmediate() {
  clearTimeout(saveTimeout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const { state: restored, shouldCompleteInterval } = sanitizeState(parsed, Date.now(), 8);
    state = {
      ...state,
      ...restored,
    };

    if (shouldCompleteInterval) {
      completeCurrentInterval(true);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function renderHistory() {
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
  
  // Celebration animation at 100%
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
  
  // Update document title for tab visibility
  const modeLabel = MODES[state.mode].label;
  document.title = state.isRunning 
    ? `${timeStr} - ${modeLabel} - Pomodoro Garden`
    : `Pomodoro Garden`;
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
  state.history = state.history.slice(0, 8);
}

function requestNotificationPermission() {
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

  if (completedMode === "focus") {
    state = {
      ...state,
      ...applyFocusCompletion(state),
    };
    addHistory("Focus complete");
    handleStageReward();
    els.plantVisual.classList.add("growth-bump");
    setTimeout(() => els.plantVisual.classList.remove("growth-bump"), 520);
    if (!fromRestore) {
      notify("Focus session complete. Time for a break.");
      playChime();
      els.timerDisplay.classList.add('completed');
      setTimeout(() => els.timerDisplay.classList.remove('completed'), 600);
    }
  } else if (completedMode === "short") {
    addHistory("Short break complete");
    if (!fromRestore) {
      notify("Short break complete. Ready to focus again?");
      playChime();
      els.timerDisplay.classList.add('completed');
      setTimeout(() => els.timerDisplay.classList.remove('completed'), 600);
    }
  } else {
    addHistory("Long break complete");
    if (!fromRestore) {
      notify("Long break complete. Time to focus.");
      playChime();
      els.timerDisplay.classList.add('completed');
      setTimeout(() => els.timerDisplay.classList.remove('completed'), 600);
    }
  }

  setMode(getNextMode(state.mode, state.focusSessionsCompleted));
  saveStateImmediate();
  render();
}

function stopTicker() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  if (!state.isRunning || !state.endTime) return;
  const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  state.remainingSeconds = remaining;
  renderTimer();

  if (remaining <= 0) {
    stopTicker();
    state.isRunning = false;
    state.endTime = null;
    completeCurrentInterval();
  }
}

function startTimer() {
  if (state.isRunning) return;
  requestNotificationPermission();
  updateNotificationPrompt();
  state.isRunning = true;
  state.endTime = Date.now() + state.remainingSeconds * 1000;
  timerId = setInterval(tick, 250);
  saveState();
  renderTimer();
}

function pauseTimer() {
  if (!state.isRunning) return;
  state.remainingSeconds = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  state.isRunning = false;
  state.endTime = null;
  stopTicker();
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
    'Reset all growth progress? This will clear your focused minutes, sessions, and history. This cannot be undone.'
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
  state.lastCompletedStage = currentStage;
  saveState();
  renderGrowth();
}

function familyForBuiltIn(plantId) {
  if (plantId === "snake") return "upright";
  if (plantId === "spider") return "spotted";
  if (plantId === "peace_lily") return "broad-leaf";
  if (plantId === "zz") return "upright";
  if (plantId === "pothos") return "broad-leaf";
  return "auto";
}

function stylePaletteForFamily(resolvedFamily, random) {
  if (resolvedFamily === "broad-leaf") {
    return {
      leafLight: "#5faa73",
      leafDark: "#2f8b58",
      vein: "#1f5d39",
      accent: "#f4f0d7",
      spots: false,
      rxBoost: 8,
      ryBoost: 2,
    };
  }
  if (resolvedFamily === "upright") {
    return {
      leafLight: "#62b089",
      leafDark: "#3a8d60",
      vein: "#2c6f54",
      accent: "#d9efd6",
      spots: false,
      rxBoost: -2,
      ryBoost: 10,
    };
  }
  if (resolvedFamily === "spotted") {
    return {
      leafLight: "#4f8e67",
      leafDark: "#2a6d4a",
      vein: "#1f5036",
      accent: "#f2f6ef",
      spots: true,
      rxBoost: 2,
      ryBoost: 4,
    };
  }
  const pick = random();
  if (pick < 0.33) return stylePaletteForFamily("broad-leaf", random);
  if (pick < 0.66) return stylePaletteForFamily("upright", random);
  return stylePaletteForFamily("spotted", random);
}

function createLeafPath(cx, cy, rx, ry, bend) {
  const leftX = cx - rx;
  const rightX = cx + rx;
  const topY = cy - ry;
  const bottomY = cy + ry;

  return `M ${cx.toFixed(1)} ${topY.toFixed(1)} C ${(leftX - rx * 0.35).toFixed(1)} ${(cy - ry * 0.25).toFixed(1)} ${(leftX + rx * 0.1).toFixed(1)} ${(bottomY - ry * 0.2).toFixed(1)} ${cx.toFixed(1)} ${bottomY.toFixed(1)} C ${(rightX - rx * 0.1).toFixed(1)} ${(bottomY - ry * 0.2).toFixed(1)} ${(rightX + rx * 0.35).toFixed(1)} ${(cy - ry * 0.25).toFixed(1)} ${cx.toFixed(1)} ${topY.toFixed(1)} Z`;
}

function generatePlantSvg(seed, family) {
  const random = mulberry32((seed >>> 0) + 7);
  const palette = stylePaletteForFamily(family, random);
  const stages = [];

  for (let stage = 1; stage <= 5; stage += 1) {
    const stageRandom = mulberry32((seed >>> 0) + stage * 997);
    const leafCount = stage + 1 + (palette.spots ? 1 : 0);
    const stemTop = 300 - (52 + stage * 34);
    const leaves = [];

    for (let i = 0; i < leafCount; i += 1) {
      const ratio = leafCount === 1 ? 0 : i / (leafCount - 1);
      const centered = ratio * 2 - 1;
      const cx = 210 + centered * (26 + stage * 26) + (stageRandom() - 0.5) * 10;
      const cy = stemTop + 45 + Math.abs(centered) * 25 + (stageRandom() - 0.5) * 10;
      const angle = centered * (35 + stage * 8) + (stageRandom() - 0.5) * 16;
      const rx = 12 + stage * 4 + palette.rxBoost + stageRandom() * 4;
      const ry = 18 + stage * 6 + palette.ryBoost + stageRandom() * 6;
      const bend = stageRandom() * 0.9 - 0.45;
      const leafPath = createLeafPath(cx, cy, rx, ry, bend);
      const leafId = `leaf-${stage}-${i}-${Math.floor(cx * 10)}`;
      leaves.push(`<g transform="rotate(${angle.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"><path class="leaf generated-leaf" d="${leafPath}" fill="url(#leafGradient-${leafId})" /><path class="leaf-vein" d="M ${cx.toFixed(1)} ${(cy + ry * 0.95).toFixed(1)} C ${(cx + bend * rx * 0.28).toFixed(1)} ${(cy + ry * 0.2).toFixed(1)} ${(cx - bend * rx * 0.2).toFixed(1)} ${(cy - ry * 0.1).toFixed(1)} ${cx.toFixed(1)} ${(cy - ry * 0.9).toFixed(1)}" /></g>`);

      leaves.push(`<defs><linearGradient id="leafGradient-${leafId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.leafLight}"/><stop offset="100%" stop-color="${palette.leafDark}"/></linearGradient></defs>`);

      if (!palette.spots && stageRandom() > 0.58) {
        const vx = cx + (stageRandom() - 0.5) * 10;
        const vy = cy + (stageRandom() - 0.5) * 10;
        leaves.push(`<ellipse class="variegation" cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" rx="${(rx * 0.24).toFixed(1)}" ry="${(ry * 0.35).toFixed(1)}" transform="rotate(${angle.toFixed(1)} ${vx.toFixed(1)} ${vy.toFixed(1)})" />`);
      }

      if (palette.spots) {
        const dots = 2 + Math.floor(stage / 2);
        for (let d = 0; d < dots; d += 1) {
          const dx = cx + (stageRandom() - 0.5) * (rx * 1.2);
          const dy = cy + (stageRandom() - 0.5) * (ry * 1.2);
          const rr = 1.6 + stageRandom() * 1.4;
          leaves.push(`<circle class="begonia-dot" cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${rr.toFixed(1)}" />`);
        }
      }
    }

    stages.push(`<g class="plant-stage stage-${stage}"><path class="stem" d="M210 300 L210 ${stemTop.toFixed(1)}" />${leaves.join("")}</g>`);
  }

  return `
    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9723d" />
          <stop offset="100%" stop-color="#8c4f2a" />
        </linearGradient>
        <style>
          .generated-leaf { filter: drop-shadow(0 1px 1px rgba(15, 44, 25, 0.22)); }
          .leaf-vein { fill: none; stroke: ${palette.vein}; stroke-width: 1.7; stroke-linecap: round; opacity: 0.45; }
          .variegation { fill: ${palette.accent}; }
        </style>
      </defs>
      <ellipse cx="210" cy="374" rx="140" ry="22" class="shadow" />
      ${stages.join("")}
      <path class="pot-rim" d="M118 296 H302 C314 296 324 305 324 317 C324 325 319 332 312 336 H108 C101 332 96 325 96 317 C96 305 106 296 118 296Z" />
      <path class="pot-body" d="M110 335 H310 L290 386 H130 Z" />
    </svg>
  `;
}

function getPlantSvg(plantId) {
  if (plantId === "monstera") return generatePlantSvg(hashStringToSeed("monstera-variegata"), "auto");
  if (plantId === "strelitzia") return generatePlantSvg(hashStringToSeed("strelitzia-nicolai"), "upright");
  if (plantId === "begonia") return generatePlantSvg(hashStringToSeed("begonia-maculata"), "spotted");
  return generatePlantSvg(hashStringToSeed(plantId), familyForBuiltIn(plantId));
}

function renderPlantArt() {
  const plantId = Object.hasOwn(PLANTS, state.selectedPlantId) ? state.selectedPlantId : "monstera";
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
  handleRoundGoalChange(event.target.value);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

restoreState();
render();

if (state.isRunning) {
  timerId = setInterval(tick, 250);
}
