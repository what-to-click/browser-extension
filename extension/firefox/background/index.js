console.debug('hello from bg');

const images = [];
browser.runtime.onMessage.addListener(async ({ type = 'general', data = {} }, sender) => {
  if (type === 'mousedown') {
    const image = await browser.tabs.captureVisibleTab();
    images.push(image);
  }
});

browser.browserAction.onClicked.addListener(async () => {
  const htmlImages = images.map((image) => `<img style="max-width: 50vw;" src="${image}">`);
  const tab = await browser.tabs.create({ url: `/content/page.html?imgs=${encodeURIComponent(htmlImages)}`, active: false });
});