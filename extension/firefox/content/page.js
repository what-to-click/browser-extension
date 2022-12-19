const tagToName = {
  'BUTTON': 'button',
  'A': 'link',
  'INPUT': 'input field',
};

async function main() {
  const sessionId = new URLSearchParams(window.location.href.split('?')[1]).get('s');
  const images = await browser.runtime.sendMessage({ type: 'fetchImages', data: { session: sessionId } });
  const steps = images.map(({ image, target }, index) => `
    <div class="step">
      <p>
        <span class="index">${index + 1}</span> 
        <span contenteditable class="step-description">Click <i>${target.innerText}</i>${tagToName[target.tagName] ? ` ${tagToName[target.tagName]}` : ''}.</span>
      </p>
      <img src="${image}">
    </div>`
  );
  const parser = new DOMParser();
  const stepElements = steps.map((html) => parser.parseFromString(html, 'text/html').querySelector('.step'));
  const content = document.querySelector('.steps');
  stepElements.forEach((step) => content.appendChild(step));
}
main();

async function savePdf() {
  document.querySelector('.export').classList.add('hidden');
  await browser.runtime.sendMessage({ type: 'savePdf' });
  document.querySelector('.export').classList.remove('hidden');
}

function saveHtml() {
  document.location = `data:text/attachment;,
  <!DOCTYPE html>
  ${encodeURIComponent(document.querySelector('html').innerHTML.replace(/^.*<section class="export"[\s\S]*?<\/section>/m, ''))}
  `;
}

window.addEventListener('load', () => {
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
});