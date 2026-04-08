export function createStateStorage(storageKey, delayMs = 500) {
  let saveTimeout;

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

  function loadRaw() {
    return localStorage.getItem(storageKey);
  }

  function clear() {
    localStorage.removeItem(storageKey);
  }

  return {
    saveDebounced,
    saveImmediate,
    loadRaw,
    clear,
  };
}
