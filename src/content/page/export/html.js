import { downloadURI } from "./common/download.js";
import { applyScrubs, removeScrubs } from "./common/scrubs.js";

const lightboxScript = `
  (() => {
    document.addEventListener('click', (event) => {
      const opener = event.target.closest('.see-fullscreen');
      if (opener) {
        const stepImage = opener.closest('.step-image');
        const lightbox = stepImage.querySelector('.lightbox');
        document.querySelectorAll('.lightbox.open').forEach((element) => element.classList.remove('open'));
        lightbox.querySelector('.lightbox-image').src = stepImage.querySelector('.screenshot').src;
        document.body.appendChild(lightbox);
        lightbox.classList.add('open');
        return;
      }
      const lightbox = event.target.closest('.lightbox');
      if (lightbox && (event.target === lightbox || event.target.closest('.lightbox-close'))) {
        lightbox.classList.remove('open');
      }
    });
  })();
`;

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
  const script = documentToExport.createElement('script');
  script.type = 'text/javascript';
  script.textContent = lightboxScript;
  documentToExport.body.appendChild(script);

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