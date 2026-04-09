import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

test("back button element should not exist in index.html", () => {
  const html = readFileSync(join(projectRoot, "index.html"), "utf-8");
  
  // Should not contain back button element
  assert.ok(
    !html.includes('id="backToTimerBtn"'),
    "Back button element should be removed from HTML"
  );
  
  assert.ok(
    !html.includes("back-to-timer-btn"),
    "Back button class should not exist in HTML"
  );
});

test("mini timer should be first child of plant-view-header", () => {
  const html = readFileSync(join(projectRoot, "index.html"), "utf-8");
  
  // Extract plant-view-header content
  const headerMatch = html.match(
    /<div class="plant-view-header"[^>]*>([\s\S]*?)<\/div>/
  );
  
  assert.ok(headerMatch, "plant-view-header should exist");
  
  const headerContent = headerMatch[1];
  
  // Mini timer should come first (before any button)
  const miniTimerIndex = headerContent.indexOf('id="miniTimer"');
  const backButtonIndex = headerContent.indexOf('id="backToTimerBtn"');
  
  // Back button should not exist (-1)
  assert.equal(
    backButtonIndex,
    -1,
    "Back button should not exist in plant-view-header"
  );
  
  // Mini timer should exist and be early in the content
  assert.ok(miniTimerIndex > -1, "Mini timer should exist in header");
  assert.ok(
    miniTimerIndex < 200,
    "Mini timer should appear early in header (left side)"
  );
});

test("back button CSS styles should not exist", () => {
  const css = readFileSync(
    join(projectRoot, "src/styles/styles.css"),
    "utf-8"
  );
  
  assert.ok(
    !css.includes(".back-to-timer-btn"),
    "Back button CSS class should be removed"
  );
});

test("back button event listener should not exist in app.js", () => {
  const js = readFileSync(join(projectRoot, "src/app.js"), "utf-8");
  
  assert.ok(
    !js.includes("backToTimerBtn"),
    "Back button variable reference should not exist in app.js"
  );
  
  assert.ok(
    !js.includes("scrollToTimer"),
    "scrollToTimer function should be removed (only used by back button)"
  );
});
