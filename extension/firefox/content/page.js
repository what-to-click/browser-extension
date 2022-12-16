async function main() {
  const sessionId = new URLSearchParams(window.location.href.split('?')[1]).get('s');
  const images = await browser.runtime.sendMessage({ type: 'fetchImages', data: { session: sessionId } });
  const content = document.querySelector('.steps');
  content.innerHTML = images.map(({ image }, index) => `<p><span class="index">${index + 1}</span> <span contenteditable class="step-description">Click</span></p><img src="${image}">`);
}
main();

function savePdf() {
  browser.runtime.sendMessage({ type: 'savePdf' });
}

function saveHtml() {
  console.debug(`data:text/attachment;,
  <!DOCTYPE html>
  <html lang="en">
  <head>${document.head.innerHTML}</head>
  <body>${document.body.innerHTML}</body>
  </html>
  `);
}

window.addEventListener('load', () => {
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
});