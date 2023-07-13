import { updateMeta } from './page/dom/seo.js';
import { main } from './page/dom/init/init.js';
import { attachOcrInfo } from './page/ocr/worker.js';
import { attachScrubs } from './page/dom/editor/editor.js';
import { toggleExportDropdown } from './page/dom/editor/ui.js';
import { saveWtc } from './page/export/wtc.js';

window.addEventListener('load', async () => {
  await main();
  document.getElementById('exportMenu').addEventListener(
    'click',
    () => toggleExportDropdown(document.getElementById('exportMenu')
    ),
  );
  document.getElementById('saveWtc').addEventListener('click', saveWtc);
  document.querySelector('[autofocus]').focus();
  document.querySelector('h1').addEventListener('keyup', updateMeta);

  attachScrubs(document.querySelectorAll('.screenshot'));
  attachOcrInfo(document.querySelectorAll('.screenshot'));
});
