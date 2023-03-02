import { updateMeta } from './page/dom/seo.js';
import { savePdf, saveMarkdown, saveHtml } from './page/export.js';
import { main } from './page/dom/init.js';

window.addEventListener('load', async () => {
  await main();
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('exportMd').addEventListener('click', saveMarkdown);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
  document.querySelector('[autofocus]').focus();
  document.querySelector('h1').addEventListener('keyup', updateMeta);

  const formData = new FormData()
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = document.querySelector('.screenshot');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  formData.append('image', canvas.toDataURL('image/jpeg'))

  fetch('http://localhost:3000', { method: 'POST', body: formData, }).then(console.info).catch(console.error)
});
