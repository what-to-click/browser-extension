browser.runtime.onMessage.addListener(async ({ type = 'general', data = {} }, sender) => {
  if (type === 'mousedown') {
    const currentSession = await localforage.getItem('currentSession');
    if (currentSession == null) {
      return;
    }
    const sessionKey = `images-${currentSession}`;
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
      sessionKey,
      [...await localforage.getItem(sessionKey) || [], {
        image,
        type: type,
        target: data.target,
      }]
    );

  } else if (type === 'fetchImages') {
    return await localforage.getItem(`images-${data.session}`) || [];
  } else if (type === 'fetchSessions') {
    return await localforage.getItem('sessions') || [];
  } else if (type === 'savePdf') {
    return await browser.tabs.saveAsPDF({ toFileName: `what-to-click-${new Date().toDateString()}.pdf` });
  }
});

browser.browserAction.onClicked.addListener(async () => {
  const sessionActive = await localforage.getItem('currentSession');
  if (sessionActive) {
    await browser.tabs.create({ url: `/content/page.html?s=${encodeURIComponent(sessionActive)}`, active: false });
    await localforage.setItem('currentSession', null);
    await browser.browserAction.setIcon({ path: '/icons/record.png' });
    await browser.browserAction.setBadgeText({ text: '' });
  } else {
    const session = new Date().toISOString();
    await localforage.setItem('currentSession', session);
    await localforage.setItem('sessions', [...(await localforage.getItem('sessions') || []), session]);
    await browser.browserAction.setIcon({ path: '/icons/stop.png' });
    await browser.browserAction.setBadgeText({ text: 'live' });
  }
});
