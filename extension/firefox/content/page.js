const tagToName = {
  'BUTTON': 'button',
  'A': 'link',
  'INPUT': 'input field',
};

async function main() {
  const sessionId = new URLSearchParams(window.location.href.split('?')[1]).get('s');
  const images = await browser.runtime.sendMessage({ type: 'fetchImages', data: { session: sessionId } });
  const steps = images.map(({ image, target }, index) => `
    <div class="step" wtc-step-index="${index + 1}">
      <p class="step-description">
        <span class="text-content">
          <span class="index">${index + 1}</span> 
          <textarea wtc-textarea class="content">Click "${target.innerText}"${tagToName[target.tagName] ? ` ${tagToName[target.tagName]}` : ''}.</textarea>
        </span>
        <button wtc-editor class="text-button delete-button">Remove step</button>
      </p>
      <div class="step-image">
        <picture>
          <img class="screenshot" src="${image}">
          <img class="cursor" src="${cursorPng}">
        </picture>
      </div>
    </div>`
  );
  const parser = new DOMParser();
  const stepElements = steps.map((html) => parser.parseFromString(html, 'text/html').querySelector('.step'));
  const content = document.querySelector('.steps');
  stepElements.forEach((step, index) => step.querySelector('.delete-button').addEventListener('click', () => deleteStep(index + 1)));
  stepElements.forEach((step) => content.appendChild(step));

  document.querySelectorAll('textarea').forEach((textarea) => {
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.addEventListener('input', (e) => {
      const element = e.target;
      element.innerText = element.value;
      element.style.height = `${element.scrollHeight}px`;
    });
  });
  const time = document.querySelector('footer time');
  time.setAttribute('datetime', new Date().toISOString());
  document.querySelector('[property="author:modified_time"]').setAttribute('content', new Date().toISOString());
  time.innerText = new Date().toDateString();
  document.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.remove('hidden'));
  document.querySelectorAll('[wtc-editable]').forEach((element) => element.setAttribute('contenteditable', true));
}
main();

async function savePdf() {
  document.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.add('hidden'));
  await browser.runtime.sendMessage({ type: 'savePdf' });
  document.querySelectorAll('[wtc-editor]').forEach((element) => element.classList.remove('hidden'));
}

function saveHtml() {
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

function saveMarkdown() {
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

function download(filename, data, options = { type: 'text/html' }) {
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

function deleteStep(index = -1) {
  const step = document.querySelector(`[wtc-step-index="${index}"]`);
  step.remove();
  recountIndexes();
}

function recountIndexes() {
  const steps = document.querySelectorAll('.step');
  let index = 1;
  for (const step of steps) {
    step.querySelector('.index').innerText = index;
    index++;
  }
}

function updateMeta() {
  const title = document.querySelector('h1');
  // Firefox adds <br> to contenteditable h1's for some reason
  // which breaks regexps. Get rid of them:
  const titleText = title.innerHTML.replaceAll('<br>', '').replace(/:$/, '');
  document.querySelector('title').innerText = titleText;
  document.querySelector('[property="og:title"]').setAttribute('content', titleText);
  document.querySelector('[name="description"]').setAttribute(
    'content',
    `Step-by-step guide ${titleText.replace('What to click', '')}`
  );
  document.querySelector('[property="og:description"]').setAttribute(
    'content',
    `Step-by-step guide ${titleText.replace('What to click', '')}`
  );
}

window.addEventListener('load', () => {
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('exportMd').addEventListener('click', saveMarkdown);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
  document.querySelector('[autofocus]').focus();
  document.querySelector('h1').addEventListener('keyup', updateMeta);
});

const cursorPng = 'data:image/png;base64,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';