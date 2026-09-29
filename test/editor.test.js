import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { attachFullscreenLightboxes } from "../src/content/page/dom/editor/editor.js";

function screenshotStep(id) {
  return `
    <section class="step-image">
      <img class="screenshot" src="https://example.test/magnified-${id}.png">
      <button class="see-fullscreen">See fullscreen</button>
      <div class="lightbox">
        <button class="lightbox-close">Close</button>
        <img class="lightbox-image">
      </div>
    </section>
  `;
}

function setupDocument(count, t) {
  const dom = new JSDOM(
    `<!DOCTYPE html><body>${Array.from({ length: count }, (_, index) => screenshotStep(index)).join("")}</body>`,
    { url: "https://example.test/editor" },
  );
  globalThis.document = dom.window.document;
  t.after(() => {
    dom.window.close();
    delete globalThis.document;
  });
  return dom;
}

test("opens the selected screenshot and closes an open lightbox", (t) => {
  setupDocument(2, t);
  attachFullscreenLightboxes(document.querySelectorAll(".step-image"));

  const stepImages = document.querySelectorAll(".step-image");
  const buttons = document.querySelectorAll(".see-fullscreen");
  const lightboxes = document.querySelectorAll(".lightbox");

  buttons[0].click();
  assert.equal(lightboxes[0].classList.contains("open"), true);
  assert.equal(
    lightboxes[0].querySelector(".lightbox-image").getAttribute("src"),
    "https://example.test/magnified-0.png",
  );

  buttons[1].click();
  assert.equal(lightboxes[0].classList.contains("open"), false);
  assert.equal(lightboxes[1].classList.contains("open"), true);
  assert.equal(lightboxes[1].parentElement, document.body);
  assert.equal(
    lightboxes[1].querySelector(".lightbox-image").getAttribute("src"),
    "https://example.test/magnified-1.png",
  );
  assert.equal(stepImages[0].querySelector(".lightbox"), null);
});

test("only closes a lightbox from its backdrop or close button", (t) => {
  setupDocument(1, t);
  attachFullscreenLightboxes(document.querySelectorAll(".step-image"));

  const button = document.querySelector(".see-fullscreen");
  const lightbox = document.querySelector(".lightbox");
  const image = lightbox.querySelector(".lightbox-image");
  const closeButton = lightbox.querySelector(".lightbox-close");

  button.click();
  image.click();
  assert.equal(lightbox.classList.contains("open"), true);

  lightbox.click();
  assert.equal(lightbox.classList.contains("open"), false);

  button.click();
  closeButton.click();
  assert.equal(lightbox.classList.contains("open"), false);
});
