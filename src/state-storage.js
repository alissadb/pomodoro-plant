export function createStateStorage(storageKey, delayMs = 500) {
  let saveTimeout;

  function saveDebounced(state) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save state (debounced):', e);
      }
    }, delayMs);
  }

  function saveImmediate(state) {
    clearTimeout(saveTimeout);
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state (immediate):', e);
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

  function clear() {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to clear state:', e);
    }
  }

  return {
    saveDebounced,
    saveImmediate,
    loadRaw,
    clear,
  };
}
