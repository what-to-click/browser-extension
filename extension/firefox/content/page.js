async function main() {
  const images = await browser.runtime.sendMessage({ type: 'fetchImages' });
  document.body.innerHTML = images.map((image) => `<img src="${image}">`);
}

main();