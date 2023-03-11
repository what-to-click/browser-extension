export function deleteStep(index = -1) {
  const step = document.querySelector(`[wtc-step-index="${index}"]`);
  step.remove();
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
          scrubElement.c
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
