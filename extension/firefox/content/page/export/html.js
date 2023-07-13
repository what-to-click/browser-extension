import { downloadURI } from "./common/download.js";
import { applyScrubs, removeScrubs } from "./common/scrubs.js";

export async function saveHtml() {
  document.querySelectorAll('.screenshot').forEach(applyScrubs);
  const pageHtml = document.querySelector('html').innerHTML;
  const documentToExport = new DOMParser().parseFromString(pageHtml, 'text/html');
  documentToExport.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.add('hidden'));
  documentToExport.querySelectorAll('.scrub-overlay').forEach((element) => element.remove());
  documentToExport.querySelectorAll('[wtc-ocr]').forEach((element) => element.removeAttribute('wtc-ocr'));
  documentToExport.querySelectorAll('[wtc-editable]').forEach((element) => element.removeAttribute('contenteditable'));
  documentToExport.querySelectorAll('[wtc-textarea]').forEach((textarea) => {
    textarea.style = '';
    const span = new DOMParser().parseFromString(
      textarea.outerHTML.replace('<textarea', '<span').replace(new RegExp('</textarea>$', 'gm'), '</span>'),
      'text/html'
    ).querySelector('span');
    textarea.replaceWith(span);
  });

  const htmlContent = documentToExport.querySelector('html').innerHTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  const page = `
    <!DOCTYPE html>
    ${encodeURIComponent(htmlContent)}
    `;
  downloadURI(`data:text/html,${page}`, `What to click ${new Date().toDateString()}.html`);
  await removeScrubs();
}