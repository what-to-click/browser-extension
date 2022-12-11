const images = [];
browser.runtime.onMessage.addListener(async ({ type = 'general', data = {} }, sender) => {
  if (type === 'mousedown') {
    const image = await browser.tabs.captureVisibleTab();
    images.push(image);
  }
  if (type == 'fetchImages') {
    return images;
  }
});

browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({ url: `/content/page.html`, active: false });
});