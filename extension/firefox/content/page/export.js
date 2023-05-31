import { loadImages } from './dom/init.js';

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

export function saveHtml() {
  const pageHtml = document.querySelector('html').innerHTML;
  const documentToExport = new DOMParser().parseFromString(pageHtml, 'text/html');
  documentToExport.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.add('hidden'));
  documentToExport.querySelectorAll('[wtc-editable]').forEach((element) => element.removeAttribute('contenteditable'));
  documentToExport.querySelectorAll('[wtc-textarea]').forEach((textarea) => {
    textarea.style = '';
    textarea.outerHTML = textarea.outerHTML
      .replace('<textarea', '<span')
      .replace(new RegExp('</textarea>$', 'gm'), '</span>');
  });
  const htmlContent = documentToExport.querySelector('html').innerHTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  const page = `
    <!DOCTYPE html>
    ${encodeURIComponent(htmlContent)}
    `;
  downloadURI(`data:text/html,${page}`, `What to click ${new Date().toDateString()}.html`);
}

export async function saveMarkdown() {
  document.querySelectorAll('.screenshot').forEach(applyScrubs);
  const title = document.querySelector('h1').innerText;
  const descriptions = [];
  document.querySelectorAll('.step-description .content').forEach((el) => descriptions.push(el.value));
  const screenshots = [];
  document.querySelectorAll('.step-image .screenshot').forEach((el) => screenshots.push(el.src));
  const markdown =
    `# ${title}

${descriptions.map((content, index) => `${index + 1}. ${content} \n ![${content}](${screenshots[index]})`).join('\n\n')}
    `;
  download(`What to click ${new Date().toDateString()}.md`, markdown, { type: 'text/markdown' });
  await removeScrubs();
}

export function download(filename, data, options = { type: 'text/html' }) {
  const blob = new Blob([data], options);
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.download = filename;
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
  URL.revokeObjectURL(url);
}

function downloadURI(uri, name) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link.remove();
}

function applyScrubs(screenshot) {
  const canvas = document.createElement('canvas');
  canvas.style = "width: 100%";
  const context = canvas.getContext('2d');
  canvas.width = screenshot.naturalWidth;
  canvas.height = screenshot.naturalHeight;
  context.drawImage(screenshot, 0, 0, screenshot.naturalWidth, screenshot.naturalHeight);
  const scrubs = screenshot.parentNode.querySelectorAll('.scrub-overlay>.scrubbed');
  for (const scrub of scrubs) {
    const { box } = JSON.parse(decodeURIComponent(scrub.getAttribute('wtc-word')));
    const { x0, y0, x1, y1 } = box;
    context.beginPath();
    context.rect(x0, y0, x1 - x0, y1 - y0);
    context.fill();
  }
  screenshot.src = canvas.toDataURL('image/jpeg');
}

async function removeScrubs() {
  const steps = await loadImages();
  const screenshots = document.querySelectorAll('.step .screenshot');
  screenshots.forEach((screenshot) => {
    const stepIndex = parseInt(screenshot.parentElement.parentElement.parentElement.getAttribute('wtc-step-index'), 10) - 2;
    screenshot.src = steps[stepIndex].image;
  });
}