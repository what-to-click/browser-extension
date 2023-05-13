import { tagToName } from "../tagToName.js";
import { deleteStep } from "./editor.js";

export async function loadImages(sessionId = new URLSearchParams(window.location.href.split('?')[1]).get('s')) {
  return browser.runtime.sendMessage({ type: 'fetchImages', data: { session: sessionId } });
}

function constructCursorPosition(offset, size) {
  const offsetPercent = {
    left: offset.left / size * 100,
    top: offset.top / size * 100,
    bottom: offset.bottom / size * 100,
    right: offset.right / size * 100,
  }

  let result = '';
  if (offsetPercent.left) result += `left: -${offsetPercent.left}%;`;
  if (offsetPercent.top) result += `top: -${offsetPercent.top}%;`;
  if (offsetPercent.bottom) result += `bottom: -${offsetPercent.bottom}%;`;
  if (offsetPercent.right) result += `right: -${offsetPercent.right}%;`;
  return result;
}

function createStep({ image, offset, size, target }, index) {

  return `
  <div class="step" wtc-step-index="${index + 2}">
    <p class="step-description">
      <span class="text-content">
        <span class="index"></span> 
        <textarea wtc-textarea class="content">Click "${target.innerText}"${tagToName[target.tagName] ? ` ${tagToName[target.tagName]}` : ''}.</textarea>
      </span>
      <button wtc-editor class="text-button delete-button">Remove step</button>
    </p>
    <div class="step-image">
      <picture>
        <img class="screenshot" src="${image}">
        <div class="scrub-overlay"></div>
        <div class="loading-overlay" wtc-editor></div>
        <img class="cursor" style="${constructCursorPosition(offset, size)}" src="${cursorPng}">
      </picture>
    </div>
  </div>`;
}

function createStartingPoint({ url }) {
  return `
    <div class="step" wtc-step-index="1">
    <p class="step-description">
      <span class="text-content">
        <span class="index"></span> 
        <span class="content">Visit <a href="${url}">${url}</a>.</span>
      </span>
      <button wtc-editor class="text-button delete-button">Remove step</button>
    </p>
  </div>
  `;
}

function setupDocument(steps = []) {
  const parser = new DOMParser();
  const stepElements = steps.map((html) => parser.parseFromString(html, 'text/html').querySelector('.step'));
  const content = document.querySelector('.steps');
  stepElements.forEach((step, index) => step.querySelector('.delete-button').addEventListener('click', () => deleteStep(index + 1)));
  stepElements.forEach((step) => content.appendChild(step));

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
  setupDocument([createStartingPoint(images[0]), ...images.map(createStep)]);
}

const cursorPng = ' data:image/png;base64,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';