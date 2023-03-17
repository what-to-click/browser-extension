import { updateMeta } from './page/dom/seo.js';
import { savePdf, saveMarkdown, saveHtml } from './page/export.js';
import { main } from './page/dom/init.js';
import { attachOcrInfo } from './page/ocr/worker.js';
import { attachScrubs } from './page/dom/editor.js';

window.addEventListener('load', async () => {
  await main();
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('exportMd').addEventListener('click', saveMarkdown);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
  document.querySelector('[autofocus]').focus();
  document.querySelector('h1').addEventListener('keyup', updateMeta);

  // If we don't wait here, FF can't send the first image (no error is shown)
  await delay(1000);
  attachScrubs(document.querySelectorAll('.screenshot'));
  attachOcrInfo(document.querySelectorAll('.screenshot'));
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}