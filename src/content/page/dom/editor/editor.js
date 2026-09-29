export function deleteStep(index = -1) {
  const step = document.querySelector(`[wtc-step-index="${index}"]`);
  step.remove();
}

export function attachFullscreenLightboxes(stepImages = []) {
  for (const stepImage of stepImages) {
    const button = stepImage.querySelector('.see-fullscreen');
    const lightbox = stepImage.querySelector('.lightbox');
    if (!button || !lightbox) {
      continue;
    }
    button.addEventListener('click', () => {
      document.querySelectorAll('.lightbox.open').forEach((element) => element.classList.remove('open'));
      lightbox.querySelector('.lightbox-image').src = stepImage.querySelector('.screenshot').src;
      document.body.appendChild(lightbox);
      lightbox.classList.add('open');
    });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('.lightbox-close')) {
        lightbox.classList.remove('open');
      }
    });
  }
}

export function attachScrubs(screenshots = []) {
  for (const screenshot of screenshots) {
    const observer = new MutationObserver((mutations, observer) => {
      observer.disconnect();
      const words = JSON.parse(mutations[0].target.getAttribute('wtc-ocr'));
      const overlay = screenshot.parentNode.querySelector('.scrub-overlay');
      const parser = new DOMParser();
      const sizeRatio = screenshot.clientHeight / screenshot.naturalHeight;
      const clientSize = { width: screenshot.clientWidth, height: screenshot.clientHeight };
      for (const { word, box } of words) {
        const width = ((box.x1 - box.x0) * sizeRatio / clientSize.width) * 100;
        const height = ((box.y1 - box.y0) * sizeRatio / clientSize.height) * 100;
        const top = ((box.y0 * sizeRatio) / clientSize.height) * 100;
        const left = ((box.x0 * sizeRatio) / clientSize.width) * 100;
        const scrubElementHtml = `
          <div 
            class="scrub-element"
            wtc-word="${encodeURIComponent(JSON.stringify({ word, box }))}"
            style="width: ${width}%; height: ${height}%; top: ${top}%; left: ${left}%"
          ></div>
        `;
        const scrubElement = parser.parseFromString(scrubElementHtml, 'text/html').querySelector('.scrub-element');
        scrubElement.addEventListener('click', () => {
          scrubElement.classList.toggle('scrubbed');
        });
        overlay.appendChild(scrubElement);
      }
    });
    observer.observe(screenshot, {
      childList: false,
      subtree: false,
      attributes: true,
      attributeFilter: ['wtc-ocr']
    });
  }
}
