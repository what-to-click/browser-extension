import { loadSteps } from "../../dom/init/init.js";

export function applyScrubs(screenshot) {
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
  screenshot.src = canvas.toDataURL('image/webp');
}

export async function removeScrubs() {
  const steps = await loadSteps();
  const screenshots = document.querySelectorAll('.step .screenshot');
  screenshots.forEach((screenshot) => {
    const stepIndex = parseInt(screenshot.parentElement.parentElement.parentElement.getAttribute('wtc-step-index'), 10) - 2;
    screenshot.src = steps[stepIndex].image;
  });
}