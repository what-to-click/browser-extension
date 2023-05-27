async function sendMessageToBg({ type = 'general', data = {} } = {}) {
  try {
    const response = await browser.runtime.sendMessage({ type, data });
    return response;
  } catch (error) {
    console.error("sendMessageToBackground error: ", error);
    return null;
  }
}

document.addEventListener('mousedown', ({ pageX, pageY, target, }) => {
  sendMessageToBg(createMouseDownRecord(pageX, pageY, target));
});

function createMouseDownRecord(pageX, pageY, target) {
  const imageSize = Math.max(window.screen.availHeight, window.screen.availWidth) * .25;
  return {
    type: 'mousedown',
    data: {
      x: pageX,
      y: pageY,
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
        sendMessageToBg(createMouseDownRecord(clickPosition.x, clickPosition.y, target));
      });
    }
    iframe.addEventListener('load', attachListener);
  } catch (e) {
    console.debug('WTC: unable to attach click listener to ', iframe, e);
  }
}

[...document.getElementsByTagName('iframe')].forEach(addIframeMouseDownListener);

const observer = new MutationObserver((mutationList) => {
  mutationList.forEach((mutation) => {
    [...mutation.addedNodes].filter((e) => e.nodeName == 'IFRAME').forEach(addIframeMouseDownListener);
  });
});
observer.observe(document, { attributes: false, subtree: true, childList: true })