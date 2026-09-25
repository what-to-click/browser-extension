import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

test("screenshot steps include fullscreen controls", async (t) => {
  const dom = new JSDOM("<!DOCTYPE html><body></body>");
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  t.after(() => {
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
  });

  const { ScreenshotStep } = await import("../src/content/page/dom/init/ui.js");
  const step = ScreenshotStep({
    image: "https://example.test/magnified.png",
    offset: { bottom: 0, left: 0, right: 0, top: 0 },
    size: 100,
    target: { innerText: "Continue", tagName: "BUTTON" },
  }, 0);

  assert.equal(step.querySelector(".see-fullscreen").textContent, "See fullscreen");
  assert.notEqual(step.querySelector(".lightbox"), null);
  assert.notEqual(step.querySelector(".lightbox-close"), null);
  assert.notEqual(step.querySelector(".lightbox-image"), null);
});
