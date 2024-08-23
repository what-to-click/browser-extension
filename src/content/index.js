async function sendMessageToBg({ type = 'general', data = {} } = {}) {
  try {
    const response = await browser.runtime.sendMessage({ type, data });
    return response;
  } catch (error) {
    console.error("sendMessageToBackground error: ", error);
    return null;
  }
}

document.addEventListener('mousedown', ({ pageX, pageY, target }) => {
  sendMessageToBg(createMouseDownRecord(pageX, pageY, window.scrollX, window.scrollY, target));
});

function createMouseDownRecord(pageX, pageY, scrollX, scrollY, target) {
  const imageSize = Math.max(window.screen.availHeight, window.screen.availWidth) * .25;
  return {
    type: 'mousedown',
    data: {
      x: pageX,
      y: pageY,
      scrollX,
      scrollY,
      documentSize: document.body.getBoundingClientRect(),
      size: imageSize,
      target: {
        innerText: target.innerText,
        tagName: target.tagName,
      },
      url: location.href,
    }
  };
}

function addIframeMouseDownListener(iframe) {
  try {
    function attachListener() {
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.addEventListener('mousedown', ({ pageX, pageY, target }) => {
        const iframePos = iframe.getBoundingClientRect();
        const clickPosition = { x: pageX + iframePos.left, y: pageY + iframePos.top };
        sendMessageToBg(createMouseDownRecord(clickPosition.x, clickPosition.y, window.scrollX, window.scrollY, target));
      });
    }
    iframe.addEventListener('load', attachListener);
  } catch (e) { /* Can cause SecurityError, which nothing can be do about */ }
}

[...document.getElementsByTagName('iframe')].forEach(addIframeMouseDownListener);

const observer = new MutationObserver((mutationList) => {
  mutationList.forEach((mutation) => {
    [...mutation.addedNodes].filter((e) => e.nodeName == 'IFRAME').forEach(addIframeMouseDownListener);
  });
});
observer.observe(document, { attributes: false, subtree: true, childList: true })
