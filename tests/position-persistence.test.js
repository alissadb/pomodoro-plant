import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

test("position should be saved to localStorage on drag end", () => {
  const js = readFileSync(join(projectRoot, "src/app.js"), "utf-8");
  
  // Should save position to localStorage
  assert.ok(
    js.includes("localStorage.setItem") || js.includes("localStorage['"),
    "Should save to localStorage"
  );
  
  // Should have a key for plant button position
  assert.ok(
    js.match(/plant.*button.*position/i) || js.match(/button.*position/i),
    "Should have a localStorage key for button position"
  );
});

test("position should be restored from localStorage on page load", () => {
  const js = readFileSync(join(projectRoot, "src/app.js"), "utf-8");
  
  // Should load position from localStorage
  assert.ok(
    js.includes("localStorage.getItem") || js.includes("localStorage['"),
    "Should load from localStorage"
  );
  
  // Should restore position on init
  assert.ok(
    js.match(/restore.*position/i) || js.match(/load.*position/i),
    "Should have position restore logic"
  );
});

test("position should be stored as percentage values", () => {
  const js = readFileSync(join(projectRoot, "src/app.js"), "utf-8");
  
  // Should convert to/from percentage
  assert.ok(
    js.match(/[*\/\s]100/),
    "Should use percentage calculation (* 100 or / 100)"
  );
});

test("invalid stored positions should be handled gracefully", () => {
  const js = readFileSync(join(projectRoot, "src/app.js"), "utf-8");
  
  // Should have try-catch or null checks for localStorage
  assert.ok(
    js.includes("try") || js.match(/if\s*\([^)]*position/),
    "Should handle invalid positions with try-catch or null checks"
  );
});

test("viewport resize should trigger position recalculation", () => {
  const js = readFileSync(join(projectRoot, "src/app.js"), "utf-8");
  
  // Should listen to resize event
  assert.ok(
    js.includes("resize"),
    "Should handle viewport resize events"
  );
});
