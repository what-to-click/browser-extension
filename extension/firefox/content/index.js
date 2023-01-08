async function sendMessageToBg({ type = 'general', data = {} } = {}) {
  try {
    const response = await browser.runtime.sendMessage({ type, data });
    return response;
  } catch (error) {
    console.error("sendMessageToBackground error: ", error);
    return null;
  }
}

function figureOutTargetPositionOnPage(target) {
  const rect = target.getBoundingClientRect();
  return {
    x: rect.x + rect.width / 2,
    y: (rect.y + rect.height / 2) + document.documentElement.scrollTop,
    size: Math.max(Math.max(rect.width, rect.height) * 1.1, 300),
  };
}

function reportStep(type = '', target) {
  sendMessageToBg({
    type: type,
    data: {
      ...figureOutTargetPositionOnPage(target),
      target: {
        innerText: target.innerText,
        tagName: target.tagName,
      }
    }
  });
}

['mousedown', 'focusin', 'keypress'].forEach((eventName) => {
  document.addEventListener(eventName, ({ target }) => reportStep(eventName, target));
});
