import { tagToName } from "../tagToName.js";
import { deleteStep } from "./editor.js";
import van from "../../deps/mini-van-0.3.8.min.js";
import { ScreenshotStep, StartingStep } from "./init/ui.js";

export async function loadImages(sessionId = new URLSearchParams(window.location.href.split('?')[1]).get('s')) {
  return browser.runtime.sendMessage({ type: 'fetchImages', data: { session: sessionId } });
}

function setupDocument(steps = []) {
  const content = document.querySelector('.steps');
  steps.forEach((step) => van.add(content, step));

  [...content.querySelectorAll('.delete-button')].forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => deleteStep(index + 1));
  });

  document.querySelectorAll('textarea').forEach((textarea) => {
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.addEventListener('input', (e) => {
      const element = e.target;
      element.innerText = element.value;
      element.style.height = 0;
      element.style.height = `${element.scrollHeight}px`;
    });
  });
  const time = document.querySelector('footer time');
  time.setAttribute('datetime', new Date().toISOString());
  document.querySelector('[property="author:modified_time"]').setAttribute('content', new Date().toISOString());
  time.innerText = new Date().toDateString();
  document.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.remove('hidden'));
  document.querySelectorAll('[wtc-editable]').forEach((element) => element.setAttribute('contenteditable', true));
}

export async function main() {
  const images = await loadImages();
  if (images.length === 0) {
    return;
  }
  setupDocument([StartingStep(images[0]), ...images.map(ScreenshotStep)]);
}
