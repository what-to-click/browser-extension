import { updateMeta } from './page/dom/seo.js';
import { savePdf, saveMarkdown, saveHtml } from './page/export.js';
import { main } from './page/dom/init.js';
import * as ocr from './deps/tesseract@4.0.2.min.js';

window.addEventListener('load', async () => {
  await main();
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('exportMd').addEventListener('click', saveMarkdown);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
  document.querySelector('[autofocus]').focus();
  document.querySelector('h1').addEventListener('keyup', updateMeta);

  const worker = await Tesseract.createWorker({
    workerPath: './deps/worker@4.0.2.min.js',
    workerBlobURL: false,
    langPath: './deps/eng-fast.traineddata.gz',
    corePath: './deps/tesseract-core@4.0.2.wasm.js'
  });

  const { data: { text } } = await worker.recognize(
    document.querySelector('.screenshot'),
    'eng',
    { logger: m => console.log(m) }
  );
  console.debug(text);
});
