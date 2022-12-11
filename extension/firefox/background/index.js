browser.runtime.onMessage.addListener(async ({ type = 'general', data = {} }, sender) => {
  if (type === 'mousedown') {
    const image = await browser.tabs.captureVisibleTab({
      format: 'jpeg',
      quality: 95,
      rect: {
        x: data.x - data.size / 2,
        y: data.y - data.size / 2,
        width: data.size,
        height: data.size,
      }
    });
    await localforage.setItem(
      'images',
      [...await localforage.getItem('images') || [], image]
    );

  }
  if (type == 'fetchImages') {
    return localforage.getItem('images') || [];
  }
});

browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({ url: `/content/page.html`, active: false });
});
