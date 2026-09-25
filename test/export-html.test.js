import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { saveHtml } from "../src/content/page/export/html.js";

const screenshotUrl = "https://example.test/magnified.png";

test("exported HTML includes working lightbox controls", async (t) => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <section class="step" wtc-step-index="2">
          <div class="step-image">
            <picture>
              <img class="screenshot" src="${screenshotUrl}">
            </picture>
            <button class="see-fullscreen">See fullscreen</button>
            <div class="lightbox">
              <button class="lightbox-close">Close</button>
              <img class="lightbox-image">
            </div>
          </div>
        </section>
      </body>
    </html>
  `, { url: "https://example.test/editor" });
  const downloads = [];

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    beginPath() {},
    drawImage() {},
    fill() {},
    rect() {},
  });
  dom.window.HTMLCanvasElement.prototype.toDataURL = function() {
    return this.ownerDocument.querySelector(".screenshot").src;
  };
  dom.window.HTMLAnchorElement.prototype.click = function() {
    downloads.push({ href: this.href, name: this.download });
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.DOMParser = dom.window.DOMParser;
  globalThis.HTMLAnchorElement = dom.window.HTMLAnchorElement;
  globalThis.browser = {
    runtime: {
      sendMessage: async () => [{ image: screenshotUrl }],
    },
  };
  t.after(() => {
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.DOMParser;
    delete globalThis.HTMLAnchorElement;
    delete globalThis.browser;
  });

  await saveHtml();

  assert.equal(downloads.length, 1);
  assert.match(downloads[0].name, /^What to click .+\.html$/);
  const htmlContent = decodeURIComponent(downloads[0].href.slice("data:text/html,".length));
  const exportedDom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    url: "https://example.test/guide.html",
  });
  const button = exportedDom.window.document.querySelector(".see-fullscreen");
  const lightbox = exportedDom.window.document.querySelector(".lightbox");
  const image = lightbox.querySelector(".lightbox-image");

  button.click();
  assert.equal(lightbox.classList.contains("open"), true);
  assert.equal(lightbox.parentElement, exportedDom.window.document.body);
  assert.equal(image.getAttribute("src"), screenshotUrl);

  lightbox.querySelector(".lightbox-close").click();
  assert.equal(lightbox.classList.contains("open"), false);
  exportedDom.window.close();
});
