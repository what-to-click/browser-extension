let lastVisited = null;

browser.runtime.onMessage.addListener(async ({ type = 'general', data = {} }, sender) => {
  if (type === 'mousedown') {
    const currentSession = await localforage.getItem('currentSession');
    if (currentSession == null) {
      return;
    }
    const sessionKey = `images-${currentSession}`;
    const screenshotPosition = calculateScreenshotPosition({ x: data.x, y: data.y }, data.documentSize, data.size);
    const image = await browser.tabs.captureVisibleTab({
      format: 'jpeg',
      quality: 95,
      rect: {
        x: screenshotPosition.x,
        y: screenshotPosition.y,
        width: data.size,
        height: data.size,
      }
    });
    await localforage.setItem(
      sessionKey,
      [...await localforage.getItem(sessionKey) || [], {
        image,
        offset: screenshotPosition.offset,
        size: data.size,
        type: type,
        target: data.target,
        url: data.url,
      }]
    );
  } else if (type === 'popstate') {
    const currentSession = await localforage.getItem('currentSession');
    if (currentSession == null) {
      return;
    }
    const sessionKey = `images-${currentSession}`;
    await localforage.setItem(
      sessionKey,
      [...await localforage.getItem(sessionKey) || [], {
        type: type,
        url: data.url,
      }]
    );
  } else if (type === 'fetchImages') {
    return await localforage.getItem(`images-${data.session}`) || [];
  } else if (type === 'fetchSessions') {
    return await localforage.getItem('sessions') || [];
  } else if (type === 'savePdf') {
    return await browser.tabs.saveAsPDF({
      toFileName: `what-to-click-${new Date().toDateString()}.pdf`,
      footerLeft: '',
      footerRight: '',
      headerLeft: '',
      headerRight: '',
    });
  }
});

browser.browserAction.onClicked.addListener(async () => {
  const sessionActive = await localforage.getItem('currentSession');
  if (sessionActive) {
    await localforage.setItem('currentSession', null);
    await browser.browserAction.setIcon({ path: '/icons/record.svg' });
    await browser.browserAction.setBadgeText({ text: '' });
    if ((await localforage.getItem(`images-${sessionActive}`)).length > 0) {
      await browser.tabs.create({ url: `/content/page.html?s=${encodeURIComponent(sessionActive)}`, active: false });
    }
  } else {
    const session = new Date().toISOString();
    await localforage.setItem('currentSession', session);
    await localforage.setItem('sessions', [...(await localforage.getItem('sessions') || []), session]);
    await browser.browserAction.setIcon({ path: '/icons/stop.svg' });
    await browser.browserAction.setBadgeText({ text: 'live' });

    const { id, url } = (await browser.tabs.query({ active: true }))[0];
    lastVisited = { tabId: id, url };
  }
});

function calculateScreenshotPosition(clickPosition = { x: 0, y: 0 }, documentSize = { width: 0, height: 0 }, size = 300) {
  const x = clickPosition.x - size / 2;
  const y = clickPosition.y - size / 2;
  const rect = {
    top: y,
    left: x,
    bottom: y + size,
    right: x + size,
  };
  const documentRect = {
    top: 0,
    left: 0,
    bottom: documentSize.height,
    right: documentSize.width,
  };
  const offset = {
    top: Math.abs(Math.min(0, documentRect.top + rect.top)),
    left: Math.abs(Math.min(0, documentRect.left + rect.left)),
    bottom: Math.abs(Math.min(0, documentRect.bottom - rect.bottom)),
    right: Math.abs(Math.min(0, documentRect.right - rect.right)),
  };

  // Avoid screenshots outside the document
  const correctedX = x + offset.left - offset.right;
  const correctedY = y + offset.top - offset.bottom;

  return { x: correctedX, y: correctedY, offset };
}

browser.webNavigation.onBeforeNavigate.addListener(async (event) => {
  const currentSession = await localforage.getItem('currentSession');
  if (currentSession == null) {
    return;
  }
  if (lastVisited.url === event.url && lastVisited.tabId == event.tabId) {
    const sessionKey = `images-${currentSession}`;
    await localforage.setItem(
      sessionKey,
      [...await localforage.getItem(sessionKey) || [], {
        type: 'backNavigation',
        url: lastVisited.url,
      }]
    );
  }
  lastVisited = event;
});