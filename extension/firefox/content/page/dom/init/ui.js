import van from "../../../deps/mini-van-0.3.8.min.js";
import { tagToName } from "../../tagToName.js";

const { div, p, span, textarea, picture, img, button, a } = van.tags;

function constructCursorPosition(offset, size) {
  const offsetPercent = {
    left: offset.left / size * 100,
    top: offset.top / size * 100,
    bottom: offset.bottom / size * 100,
    right: offset.right / size * 100,
  }

  let result = '';
  if (offsetPercent.left) result += `left: -${offsetPercent.left}%;`;
  if (offsetPercent.top) result += `top: -${offsetPercent.top}%;`;
  if (offsetPercent.bottom) result += `bottom: -${offsetPercent.bottom}%;`;
  if (offsetPercent.right) result += `right: -${offsetPercent.right}%;`;
  return result;
}

function StepDescription(child) {
  return p({ class: 'step-description' },
    span({ class: 'text-content' },
      span({ class: 'index' }),
      child,
    ),
    button({ class: 'text-button delete-button' }, 'Remove step'),
  );
}

export function StartingStep({ url }) {
  return div({ class: 'step', 'wtc-step-index': 1 },
    StepDescription(span({ class: 'content' }, ['Visit ', a({ href: url }, url)]))
  );
}

export function ScreenshotStep({ image, offset, size, target }, index) {
  const actionDescription = tagToName[target.tagName] ? ` ${tagToName[target.tagName]}` : '';

  return div({ class: 'step', 'wtc-step-index': index + 2 },
    StepDescription(
      textarea({ class: 'content', 'wtc-textarea': 0 },
        `Click "${target.innerText}" ${actionDescription}`
      ),
    ),
    div({ class: 'step-image' },
      picture(
        img({ class: 'screenshot', src: image }),
        div({ class: 'scrub-overlay' }),
        div({ class: 'loading-overlay' }),
        img({ class: 'cursor', style: constructCursorPosition(offset, size), src: cursorPng }),
      ),
    ),
  );
}

const cursorPng = 'data:image/webp;base64,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';