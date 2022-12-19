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
  const imageSize = Math.max(window.screen.availHeight, window.screen.availWidth) * .3;
  sendMessageToBg({
    type: 'mousedown',
    data: {
      x: pageX,
      y: pageY,
      size: imageSize,
      target: {
        innerText: target.innerText,
        tagName: target.tagName,
      }
    }
  })
});