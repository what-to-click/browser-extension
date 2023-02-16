export async function savePdf() {
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
}

export function saveHtml() {
  const pageHtml = document.querySelector('html').innerHTML;
  const documentToExport = new DOMParser().parseFromString(pageHtml, 'text/html');
  documentToExport.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.add('hidden'));
  documentToExport.querySelectorAll('[wtc-editable]').forEach((element) => element.removeAttribute('contenteditable'));
  documentToExport.querySelectorAll('[wtc-textarea]').forEach((textarea) => {
    textarea.style = '';
    const span = new DOMParser().parseFromString(
      textarea.outerHTML.replace('<textarea', '<span').replace(new RegExp('</textarea>$', 'gm'), '</span>'),
      'text/html'
    ).querySelector('span');
    textarea.replaceWith(span);
  });
  document.location = `data:text/attachment;,
  <!DOCTYPE html>
  ${encodeURIComponent(documentToExport.querySelector('html').innerHTML)}
  `;
}

export function saveMarkdown() {
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
