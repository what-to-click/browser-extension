import { updateMeta } from './page/dom/seo.js';
import { savePdf, saveMarkdown, saveHtml, saveWtc } from './page/export.js';
import { main } from './page/dom/init.js';
import { attachOcrInfo } from './page/ocr/worker.js';
import { attachScrubs } from './page/dom/editor.js';

window.addEventListener('load', async () => {
  await main();
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('exportMd').addEventListener('click', saveMarkdown);
  document.getElementById('exportHtml').addEventListener('click', saveHtml);
  document.getElementById('saveWtc').addEventListener('click', saveWtc);
  document.querySelector('[autofocus]').focus();
  document.querySelector('h1').addEventListener('keyup', updateMeta);

  attachScrubs(document.querySelectorAll('.screenshot'));
  attachOcrInfo(document.querySelectorAll('.screenshot'));
});
