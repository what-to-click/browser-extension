export function updateMeta() {
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