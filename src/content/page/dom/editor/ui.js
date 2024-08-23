import van from '../../../deps/mini-van-0.3.8.min.js';
import { saveHtml } from '../../export/html.js';
import { saveMarkdown } from '../../export/markdown.js';
import { savePdf } from '../../export/pdf.js';

const { div, button, li, ul } = van.tags;

function Dropdown(child, target) {
  const { left, bottom } = target.getBoundingClientRect();
  target.classList.add('bring-to-front');
  return div(
    { class: 'dropdown', 'wtc-editor': 1 },
    div(
      { style: `top: ${bottom}px; left: ${left}px; display: inline-block;` },
      child
    ),
  );
}

function Button(props, child) {
  return button(
    { ...props, class: 'wtc-button' },
    child
  );
}

let dropdown = null;
export function toggleExportDropdown(anchor) {
  function cleanup() {
    dropdown.remove();
    dropdown = null;
  }
  function cleanupAfter(func) {
    func();
    cleanup();
  }
  if (dropdown) {
    cleanup();
    return;
  }

  van.add(document.body,
    Dropdown(
      li({ class: 'export-options' },
        ul(Button({ onclick: () => cleanupAfter(savePdf) }, 'PDF')),
        ul(Button({ onclick: () => cleanupAfter(saveMarkdown) }, 'Markdown')),
        ul(Button({ onclick: () => cleanupAfter(saveHtml) }, 'HTML')),
      ),
      anchor,
    ),
  );
  dropdown = document.getElementsByClassName('dropdown')[0];
}