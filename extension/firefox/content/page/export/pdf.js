import { applyScrubs, removeScrubs } from "./common/scrubs.js";

export async function savePdf() {
  document.querySelectorAll('.screenshot').forEach(applyScrubs);
  document.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.add('hidden'));
  const textareas = [];
  document.querySelectorAll('[wtc-textarea]').forEach((textarea) => {
    textareas.push(textarea);
    textarea.style = '';
    const span = new DOMParser().parseFromString(
      textarea.outerHTML.replace('<textarea', '<span').replace(new RegExp('</textarea>$', 'gm'), '</span>'),
      'text/html'
    ).querySelector('span');
    textarea.replaceWith(span);
  });
  await browser.runtime.sendMessage({ type: 'savePdf' });
  document.querySelectorAll('[wtc-textarea]').forEach((span, index) => {
    const textarea = textareas[index];
    span.replaceWith(textarea);
    textarea.style.height = `${textarea.scrollHeight}px`;
  });
  document.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.remove('hidden'));
  await removeScrubs();
}