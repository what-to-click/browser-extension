async function main() {
  const images = await browser.runtime.sendMessage({ type: 'fetchImages' });
  const content = document.querySelector('.steps');
  content.innerHTML = images.map((image, index) => `<p><span class="index">${index + 1}</span> <span contenteditable class="step-description">Click</span></p><img src="${image}">`);
}

main();