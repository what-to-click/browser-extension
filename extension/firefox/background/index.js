console.debug('hello from bg');

browser.runtime.onMessage.addListener(({ type = 'general', data = {} }, sender) => {
  if (type === 'mousedown') {
    browser.tabs.captureVisibleTab().then((image) => localStorage.setItem('screen', image));
  }
});