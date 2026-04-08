# Code Review: Pomodoro Plant

**Reviewed**: 2026-04-08  
**Status**: 🔴 **CRITICAL ISSUES FOUND** - Tests are broken

---

## Executive Summary

This is a well-architected vanilla JavaScript PWA with excellent separation of concerns. The codebase demonstrates solid engineering principles (SOLID, DRY, KISS) with pure functional core modules. However, there is a **critical blocker**: tests are completely broken due to incorrect import paths.

**Key Findings:**
- ✅ Architecture is exemplary (pure domain logic, isolated side effects)
- ✅ Code quality is high (readable, maintainable, well-structured)
- 🔴 **BLOCKER**: All tests fail due to incorrect module imports
- ⚠️ Several logic bugs and edge cases identified
- ⚠️ Missing error boundaries and input validation in UI layer
- ⚠️ Accessibility gaps in notifications module
- ⚠️ Documentation claims QA panel exists but it doesn't

---

## Critical Issues (Must Fix)

### 🔴 1. Tests Are Completely Broken

**Location**: `tests/*.test.js:4-5`

**Problem**: Test files import from wrong paths:
```javascript
// tests/pomodoro-core.test.js:18
import { ... } from "../pomodoro-core.js";  // ❌ WRONG

// Should be:
import { ... } from "../src/pomodoro-core.js";  // ✅ CORRECT
```

**Impact**: 
- CI/CD passes because pre-commit hook runs tests but they all fail
- README claims "28 automated tests" but **ZERO tests are actually running**
- No test coverage protecting production code

**Fix Required**:
```bash
# All test imports need to be updated:
sed -i '' 's|from "../pomodoro-core.js"|from "../src/pomodoro-core.js"|g' tests/pomodoro-core.test.js
sed -i '' 's|from "../app-state-core.js"|from "../src/app-state-core.js"|g' tests/app-state-core.test.js
```

**Why This Happened**: Tests were likely written before moving files into `src/` directory, and CI wasn't catching the failure properly.

---

### 🔴 2. Timer Drift and Time Precision Issues

**Location**: `timer-controller.js:14`, `app-state-core.js:41`

**Problem**: Multiple time calculation inconsistencies:

```javascript
// timer-controller.js:14
const remaining = Math.max(0, Math.ceil((state.endTime - now()) / 1000));

// app-state-core.js:41
const remaining = Math.ceil((safe.endTime - nowMs) / 1000);
```

**Issues**:
1. **No `Math.max(0, ...)` in sanitizeState** - Can produce negative remainingSeconds
2. **Drift accumulation** - 250ms tick interval means ±250ms error per session
3. **Race condition** - Timer can tick after `completeCurrentInterval()` is called

**Impact**: Timer can show negative values, drift by several seconds over 25 minutes

**Recommended Fix**:
```javascript
// app-state-core.js:41
const remaining = Math.max(0, Math.ceil((safe.endTime - nowMs) / 1000));

// timer-controller.js - Add drift correction
function tick() {
  const state = getState();
  if (!state.isRunning || !state.endTime) {
    stop(); // Prevent tick after completion
    return;
  }
  const remaining = Math.max(0, Math.ceil((state.endTime - now()) / 1000));
  onTick(remaining);
  if (remaining <= 0) {
    stop();
    onElapsed();
  }
}
```

---

### 🔴 3. localStorage Quota Exceeded Not Handled

**Location**: `state-storage.js:7`, `state-storage.js:13`

**Problem**: No error handling for localStorage operations:

```javascript
function saveImmediate(state) {
  clearTimeout(saveTimeout);
  localStorage.setItem(storageKey, JSON.stringify(state));  // Can throw!
}
```

**Impact**: 
- App crashes if localStorage quota exceeded (especially on iOS Safari with 5MB limit)
- App crashes in private browsing mode (localStorage disabled)
- Silent data loss

**Recommended Fix**:
```javascript
function saveImmediate(state) {
  clearTimeout(saveTimeout);
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
    // Optionally: Show user notification that data wasn't saved
  }
}

function loadRaw() {
  try {
    return localStorage.getItem(storageKey);
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}
```

---

## High-Priority Issues

### ⚠️ 4. Notification Permission Never Re-Requested

**Location**: `notifications.js:2-6`

**Problem**:
```javascript
export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {  // Only asks once
    Notification.requestPermission().catch(() => {});
  }
}
```

**Impact**: If user denies permission, they're never prompted again. No UI feedback.

**Recommended Fix**:
1. Return permission status from function
2. Show UI hint when permission is denied
3. Provide settings link to manually enable

```javascript
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (e) {
    console.error('Notification permission error:', e);
    return "denied";
  }
}
```

---

### ⚠️ 5. AudioContext Not Cleaned Up Properly

**Location**: `notifications.js:15-40`

**Problem**:
```javascript
function playChime() {
  const ctx = new AudioContextClass();  // Creates new context every call
  // ...
  setTimeout(() => {
    ctx.close().catch(() => {});  // Delayed cleanup
  }, 1200);
}
```

**Issues**:
1. Creates new AudioContext every time (memory leak if called rapidly)
2. 1200ms cleanup delay is arbitrary and can fail
3. No handling if AudioContext creation fails

**Recommended Fix**:
```javascript
let audioContext = null;

function playChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    // Reuse or create context
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass();
    }

    // Resume if suspended (required on iOS)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    const sequence = [659.25, 783.99, 987.77];

    sequence.forEach((frequency, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.16 + 0.14);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now + index * 0.16);
      osc.stop(now + index * 0.16 + 0.16);
    });
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}
```

---

### ⚠️ 6. Race Condition in Timer Stop/Complete

**Location**: `app.js:94-98`, `timer-controller.js:16-19`

**Problem**:
```javascript
// app.js - onElapsed callback
onElapsed: () => {
  state.isRunning = false;
  state.endTime = null;
  completeCurrentInterval();  // Called here
},

// timer-controller.js
if (remaining <= 0) {
  stop();      // Stops interval
  onElapsed(); // But tick could fire again before stop() completes
}
```

**Impact**: `completeCurrentInterval()` could be called multiple times if tick fires during async operations.

**Recommended Fix**:
```javascript
// timer-controller.js
function tick() {
  const state = getState();
  if (!state.isRunning || !state.endTime) return;
  
  const remaining = Math.max(0, Math.ceil((state.endTime - now()) / 1000));
  onTick(remaining);
  
  if (remaining <= 0 && state.isRunning) {  // Check isRunning again
    stop();
    onElapsed();
  }
}
```

---

### ⚠️ 7. Skip Interval Logic Bug

**Location**: `app-state-core.js:69-82`

**Problem**:
```javascript
export function applySkipInterval(inputState) {
  const isFocusRound = inputState.mode === "focus";
  const shouldReset = isFocusRound && inputState.streak > 0;
  return {
    state: {
      ...inputState,
      streak: shouldReset ? 0 : inputState.streak,
      focusSessionsCompleted: isFocusRound
        ? inputState.focusSessionsCompleted + 1  // ⚠️ Increments on skip!
        : inputState.focusSessionsCompleted,
    },
    streakReset: shouldReset,
    focusRoundAdvanced: isFocusRound,
  };
}
```

**Issue**: Skipping a focus session increments `focusSessionsCompleted` and affects long break timing. This means:
- User skips focus → counter increments
- User gets long break earlier than earned
- Defeats purpose of Pomodoro technique

**Expected Behavior**: Skipping focus should NOT increment completion counter.

**Recommended Fix**:
```javascript
export function applySkipInterval(inputState) {
  const isFocusRound = inputState.mode === "focus";
  const shouldReset = isFocusRound && inputState.streak > 0;
  return {
    state: {
      ...inputState,
      streak: shouldReset ? 0 : inputState.streak,
      // DO NOT increment focusSessionsCompleted on skip
    },
    streakReset: shouldReset,
    focusRoundAdvanced: false,  // Not a real completion
  };
}
```

**Update Tests**: `tests/app-state-core.test.js:64-75` needs updating after fix.

---

### ⚠️ 8. Plant SVG Injection Without Sanitization

**Location**: `app.js:320`

**Problem**:
```javascript
els.plantVisual.innerHTML = getPlantSvg(plantId);  // Direct innerHTML assignment
```

**Issue**: While `plantId` is normalized, if `generatePlantSvg()` ever uses user input in SVG generation, this could be an XSS vector.

**Current Risk**: **LOW** (plantId is validated, SVG is generated not user-supplied)  
**Future Risk**: **HIGH** if custom plant IDs with user data are added

**Recommended Fix**:
```javascript
function renderPlantArt() {
  const plantId = Object.hasOwn(PLANTS, state.selectedPlantId) 
    ? state.selectedPlantId 
    : DEFAULT_PLANT_ID;
  state.selectedPlantId = plantId;
  const plantName = PLANTS[plantId];
  els.plantTitle.textContent = plantName;
  els.plantVisual.dataset.plant = plantId;
  
  // Clear and set via DOM instead of innerHTML for safety
  const svgString = getPlantSvg(plantId);
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  
  els.plantVisual.innerHTML = '';  // Clear
  els.plantVisual.appendChild(svgElement);  // Safe append
  
  els.plantVisual.setAttribute("aria-label", `Growing ${plantName} illustration`);
  els.plantSelect.value = plantId;
}
```

---

## Medium-Priority Issues

### ⚠️ 9. State History Can Grow Unbounded

**Location**: `app.js:195-199`

**Problem**:
```javascript
function addHistory(label) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.history.unshift({ label, time });
  state.history = state.history.slice(0, HISTORY_LIMIT);  // Slices AFTER save
}
```

**Issue**: Between `unshift` and `slice`, if `saveDebounced` fires, unbounded history could be saved to localStorage.

**Impact**: Over weeks of use, localStorage could grow indefinitely.

**Fix**: Slice before saving:
```javascript
function addHistory(label) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.history = [{ label, time }, ...state.history].slice(0, HISTORY_LIMIT);
}
```

---

### ⚠️ 10. Round Goal Changes Don't Recalculate Properly

**Location**: `app.js:305-312`

**Problem**:
```javascript
function handleRoundGoalChange(value) {
  const nextRoundGoal = normalizeRoundGoal(value);
  state.roundGoal = nextRoundGoal;
  const currentStage = getStageFromGrowthWithGoal(
    state.focusedMinutesTotal, 
    getGrowthGoalMinutes(nextRoundGoal)
  );
  state.lastCompletedStage = currentStage;  // ⚠️ Sets to current, not last completed
  saveState();
  renderGrowth();
}
```

**Issue**: If user has 100 minutes focused and changes goal from 10→20 rounds:
- Stage drops from 3→2 (expected)
- But `lastCompletedStage` is set to current stage, not the max they actually reached
- User loses stage completion history

**Recommended Fix**:
```javascript
function handleRoundGoalChange(value) {
  const nextRoundGoal = normalizeRoundGoal(value);
  state.roundGoal = nextRoundGoal;
  const currentStage = getStageFromGrowthWithGoal(
    state.focusedMinutesTotal, 
    getGrowthGoalMinutes(nextRoundGoal)
  );
  // Keep max of current and previous lastCompletedStage
  state.lastCompletedStage = Math.max(state.lastCompletedStage, currentStage);
  saveState();
  renderGrowth();
}
```

---

### ⚠️ 11. No Input Validation on Round Goal Input

**Location**: `index.html:36`

**Problem**:
```html
<input id="roundGoalInput" type="number" min="1" max="60" step="1" value="10" />
```

HTML5 validation is present, but JavaScript doesn't validate before processing:

**Edge Cases**:
- User types negative number and hits Enter before blur
- User pastes "999" and submits
- User types "abc" (becomes NaN)

**Current Behavior**: `normalizeRoundGoal()` handles it, but no user feedback.

**Recommended**: Add visual feedback when value is clamped:
```javascript
els.roundGoalInput?.addEventListener("change", (event) => {
  const input = event.target;
  const normalized = normalizeRoundGoal(input.value);
  
  if (String(normalized) !== input.value) {
    // Value was clamped - show user
    input.value = String(normalized);
    input.classList.add('value-adjusted');
    setTimeout(() => input.classList.remove('value-adjusted'), 600);
  }
  
  handleRoundGoalChange(normalized);
});
```

---

### ⚠️ 12. Service Worker Registration Silent Failure

**Location**: `app.js:347-351`

**Problem**:
```javascript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});  // Silent failure
  });
}
```

**Impact**: If SW registration fails, app won't work offline and user never knows.

**Recommended**: Log error for debugging:
```javascript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```

---

## Low-Priority Issues (Nice to Have)

### 📝 13. Missing JSDoc Comments

**Location**: All modules

**Observation**: Public functions lack JSDoc. While code is readable, type hints would improve maintainability.

**Example**:
```javascript
/**
 * Calculates growth stage based on focused minutes and goal.
 * @param {number} minutes - Total focused minutes
 * @param {number} goalMinutes - Target minutes for full growth
 * @returns {1|2|3|4|5} Growth stage (1=Seedling, 5=Fully Grown)
 */
export function getStageFromGrowthWithGoal(minutes, goalMinutes) {
  const safeGoal = Math.max(1, goalMinutes);
  const progress = minutes / safeGoal;
  if (progress >= 1) return 5;
  if (progress >= 0.75) return 4;
  if (progress >= 0.5) return 3;
  if (progress >= 0.25) return 2;
  return 1;
}
```

---

### 📝 14. Accessibility: Keyboard Navigation for Controls

**Location**: `app.js:331-345`

**Observation**: All controls are buttons (good!), but no keyboard shortcuts for power users.

**Recommended Enhancement**:
```javascript
// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ignore if typing in input
  if (e.target.tagName === 'INPUT') return;
  
  switch(e.key) {
    case ' ':  // Space = Start/Pause
      e.preventDefault();
      state.isRunning ? pauseTimer() : startTimer();
      break;
    case 'r':  // R = Reset
      if (e.ctrlKey || e.metaKey) return;  // Don't override Ctrl+R
      e.preventDefault();
      resetCurrentTimer();
      break;
    case 's':  // S = Skip
      e.preventDefault();
      skipCurrentInterval();
      break;
  }
});
```

---

### 📝 15. Magic Numbers Throughout Code

**Location**: Multiple files

**Examples**:
```javascript
// timer-controller.js:24
timerId = setInterval(tick, intervalMs);  // 250ms hardcoded in app.js:99

// app.js:232
setTimeout(() => els.plantVisual.classList.remove("growth-bump"), 520);  // Why 520?

// notifications.js:37
setTimeout(() => { ctx.close().catch(() => {}); }, 1200);  // Why 1200?
```

**Recommended**: Extract to named constants:
```javascript
const TIMER_TICK_INTERVAL_MS = 250;
const GROWTH_ANIMATION_DURATION_MS = 520;
const AUDIO_CLEANUP_DELAY_MS = 1200;
```

---

### 📝 16. Plant Renderer Hash Function Collision Risk

**Location**: `plant-renderer.js:1-8`

**Problem**:
```javascript
function hashStringToSeed(input) {
  let h = 2166136261;  // FNV-1a 32-bit offset basis
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
```

**Observation**: FNV-1a is a good hash, but 32-bit has collision risk for user-generated plant IDs.

**Current Risk**: **NONE** (only 3 plants: snake, zz, begonia)  
**Future Risk**: If custom plant IDs are added, collisions could make different plants look identical

**Recommended**: Document this limitation or consider 64-bit hash if custom plants are added.

---

### 📝 17. CSS Custom Properties Could Use Fallbacks

**Location**: `src/styles/styles.css:1-35`

**Observation**: All CSS variables lack fallbacks. If variable is undefined, UI breaks.

**Example**:
```css
:root {
  --bg-a: #f4fbe8;
  --bg-b: #d2f2e4;
}

body {
  background: linear-gradient(140deg, var(--bg-a), var(--bg-b));
  /* If variables missing, background is transparent */
}
```

**Recommended**: Not critical for this app (variables are always defined), but good practice:
```css
background: linear-gradient(140deg, var(--bg-a, #f4fbe8), var(--bg-b, #d2f2e4));
```

---

## Documentation Issues

### 📄 18. QA Panel Documentation References Non-Existent Code

**Location**: `CONTRIBUTING.md:156-167`, `pr-guidelines.md:126-132`

**Problem**: Documentation references `qa/README.md` and `?qa=1` QA panel, but:
```bash
$ ls qa/
ls: qa/: No such file or directory
```

**Impact**: Contributors waste time looking for non-existent testing tools.

**Fix Options**:
1. **Remove references** from CONTRIBUTING.md and pr-guidelines.md
2. **Implement QA panel** as documented
3. **Add note** that QA panel is planned but not yet implemented

---

### 📄 19. README Claims 28 Tests But Tests Are Broken

**Location**: `README.md:52`, `AGENTS.md:47`

**Problem**: README says "28 automated tests" but all tests fail due to import path bug.

**Recommended**: After fixing imports, update count if it changes:
```bash
$ npm test 2>&1 | grep "pass"
# Then update README and AGENTS.md with actual count
```

---

## Strengths (Keep Doing This!)

### ✅ 1. Excellent Architecture

The separation between pure domain logic (`pomodoro-core.js`, `app-state-core.js`) and side effects (`app.js`, `timer-controller.js`, `state-storage.js`, `notifications.js`) is **exemplary**.

**Why This Matters**:
- Core modules are testable without DOM/localStorage/timers
- Business logic is framework-agnostic (easy to port to React/Vue/Svelte)
- Changes to UI don't affect domain rules

**Example**:
```javascript
// pomodoro-core.js - Pure function, no dependencies
export function getNextMode(currentMode, focusSessionsCompleted) {
  if (currentMode === "focus") {
    if (focusSessionsCompleted <= 0) return "short";
    return focusSessionsCompleted % 4 === 0 ? "long" : "short";
  }
  return "focus";
}
```

### ✅ 2. Immutable State Transformations

All state transitions return new objects instead of mutating:

```javascript
// app-state-core.js:60-67
export function applyFocusCompletion(inputState) {
  return {
    ...inputState,  // Spread creates new object
    focusSessionsCompleted: inputState.focusSessionsCompleted + 1,
    focusedMinutesTotal: inputState.focusedMinutesTotal + MINUTES_PER_ROUND,
    streak: inputState.streak + 1,
  };
}
```

This prevents accidental mutations and makes state changes predictable.

### ✅ 3. Debounced Saves with Immediate Fallback

```javascript
// state-storage.js
function saveDebounced(state) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, delayMs);
}

function saveImmediate(state) {
  clearTimeout(saveTimeout);
  localStorage.setItem(storageKey, JSON.stringify(state));
}
```

Smart design: frequent UI changes are debounced (performance), but critical events (focus completion) are saved immediately (data integrity).

### ✅ 4. CSS Custom Properties for Theming

The design system uses CSS variables consistently:

```css
:root {
  --focus: #2f7d4f;
  --short: #388d7a;
  --long: #4c6f9f;
}

body.mode-focus { /* Uses --focus */ }
body.mode-short { /* Uses --short */ }
body.mode-long { /* Uses --long */ }
```

Makes theming/dark mode implementation trivial.

### ✅ 5. Defensive State Sanitization

```javascript
// app-state-core.js:22-58
export function sanitizeState(parsed, nowMs = Date.now(), historyLimit = 8) {
  const safe = {
    mode: MODES[parsed?.mode] ? parsed.mode : "focus",
    remainingSeconds: toIntOrFallback(parsed?.remainingSeconds, MODES.focus.seconds),
    // ... validates every field
  };
  // ... handles expired timers
  return { state: safe, shouldCompleteInterval };
}
```

This prevents corruption from bad localStorage data or old app versions.

### ✅ 6. Progressive Web App Implementation

Proper PWA setup:
- Manifest with icons
- Service worker registration
- iOS meta tags for home screen
- Offline-capable

### ✅ 7. Procedural Plant Generation

The `generatePlantSvg()` function is sophisticated:
- Deterministic random (same seed = same plant)
- Multiple plant families with distinct characteristics
- Handles arbitrary custom plant IDs gracefully

---

## Testing Recommendations

### 🧪 After Fixing Import Paths

1. **Add integration tests** for timer lifecycle:
   ```javascript
   test("timer completes focus session and advances to break", async () => {
     // Test full 25-minute cycle with mocked time
   });
   ```

2. **Add edge case tests**:
   - localStorage quota exceeded
   - Notification permission denied
   - Service worker registration failure
   - Network offline during sync

3. **Add visual regression tests** for plant rendering:
   - Use snapshot testing for each plant at each stage
   - Verify procedurally generated plants render consistently

4. **Add performance tests**:
   - Verify debounced saves don't create backlog
   - Check timer accuracy over 25 minutes
   - Measure localStorage read/write times

---

## Security Audit

### 🔒 Low Risk Profile

**Findings**:
- No user authentication (no auth vulnerabilities)
- No network requests after initial load (no API vulnerabilities)
- No eval() or Function() usage
- localStorage contains only JSON (XSS risk minimal)
- SVG injection is controlled (plantId validated)

**Recommendations**:
1. Add Content Security Policy meta tag:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
   ```

2. If adding user-generated content in future, sanitize rigorously

---

## Performance Audit

### ⚡ Current Performance: Good

**Strengths**:
- No unnecessary re-renders (targeted DOM updates)
- Debounced localStorage writes
- CSS animations (GPU-accelerated)
- Small bundle size (no dependencies)

**Opportunities**:
1. **Memoize plant SVG generation**:
   ```javascript
   const svgCache = new Map();
   export function getPlantSvg(plantId) {
     if (svgCache.has(plantId)) return svgCache.get(plantId);
     const svg = renderer ? renderer() : generatePlantSvg(...);
     svgCache.set(plantId, svg);
     return svg;
   }
   ```

2. **Use requestIdleCallback for history rendering**:
   ```javascript
   function renderHistory() {
     if (!state.history.length) {
       els.historyList.innerHTML = "<li>No sessions completed yet.</li>";
       return;
     }
     
     const render = () => {
       els.historyList.innerHTML = state.history
         .map((entry) => `<li>${entry.label} - ${entry.time}</li>`)
         .join("");
     };
     
     if ('requestIdleCallback' in window) {
       requestIdleCallback(render);
     } else {
       setTimeout(render, 0);
     }
   }
   ```

---

## Action Items (Prioritized)

### 🔴 P0 - Critical (Block Release)

1. **Fix test imports** (`tests/*.test.js`) - 10 minutes
2. **Add Math.max(0, ...) to sanitizeState** (`app-state-core.js:41`) - 2 minutes
3. **Add try-catch to localStorage operations** (`state-storage.js`) - 5 minutes
4. **Fix skip interval logic** (`app-state-core.js:76-78`) - 5 minutes

**Estimated Time**: 30 minutes  
**Impact**: Tests run, data safety, correct Pomodoro behavior

---

### ⚠️ P1 - High (Fix Soon)

5. **Fix AudioContext memory leak** (`notifications.js:15-40`) - 15 minutes
6. **Fix timer race condition** (`timer-controller.js:16-19`) - 10 minutes
7. **Return notification permission status** (`notifications.js:2-6`) - 10 minutes
8. **Remove QA panel from docs** (`CONTRIBUTING.md`, `pr-guidelines.md`) - 5 minutes

**Estimated Time**: 40 minutes  
**Impact**: Resource leaks fixed, better UX

---

### 📝 P2 - Medium (Improve Quality)

9. **Add input validation feedback** (`app.js:343-345`) - 15 minutes
10. **Fix round goal stage calculation** (`app.js:305-312`) - 10 minutes
11. **Add keyboard shortcuts** (`app.js` new feature) - 20 minutes
12. **Add JSDoc to public functions** (all modules) - 60 minutes

**Estimated Time**: 105 minutes  
**Impact**: Better developer/user experience

---

### 💡 P3 - Low (Polish)

13. **Extract magic numbers to constants** (all modules) - 30 minutes
14. **Add integration tests** (new test files) - 120 minutes
15. **Implement SVG caching** (`plant-renderer.js`) - 15 minutes
16. **Add CSP meta tag** (`index.html`) - 2 minutes

**Estimated Time**: 167 minutes  
**Impact**: Code quality, test coverage

---

## Conclusion

This is a **well-crafted application** with excellent architecture. The separation of concerns, pure functional core, and attention to UX details demonstrate strong engineering skills.

However, the **broken test suite is a critical blocker**. With tests not running, there's zero confidence in code changes. This must be fixed immediately.

After addressing P0 and P1 issues, this app will be production-ready and maintainable for long-term evolution.

**Final Grade**: B+ (would be A- with working tests)

**Recommendation**: Fix test imports and localStorage error handling today, then proceed with P1 items this week.

---

**Reviewer**: OpenCode AI  
**Review Type**: Comprehensive code quality, security, and performance audit  
**Lines Reviewed**: ~1,600 LOC across 10 modules
