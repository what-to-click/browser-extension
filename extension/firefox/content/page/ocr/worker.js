const serverUrl = 'http://localhost:3001';

async function recognizeWords(element) {
  const result = await fetch(serverUrl, {
    method: 'POST',
    body: imageDataFormFor(element),
  });
  return result.json();
}

function imageDataFormFor(element) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = element.naturalWidth;
  canvas.height = element.naturalHeight;
  context.drawImage(element, 0, 0, element.naturalWidth, element.naturalHeight);
  const formData = new FormData();
  formData.append('image', canvas.toDataURL('image/jpeg'));
  return formData;
}

export async function attachOcrInfo(screenshots) {
  document.querySelector('.ocr-loading-indicator').classList.toggle('hidden');
  document.querySelector('.ocr-error-indicator').classList.add('hidden');
  for (const screenshot of screenshots) {
    const overlay = screenshot.parentNode.querySelector('.loading-overlay');
    overlay.classList.toggle('loading');
    let words = [];
    try {
      words = await recognizeWords(screenshot);
      const serialized = JSON.stringify(words);
      screenshot.setAttribute('wtc-ocr', serialized);
    } catch (e) {
      console.error('Unable to access OCR service for ', screenshot, e);
      document.querySelector('.ocr-error-indicator').classList.remove('hidden');
    }
    overlay.classList.toggle('loading');
  }
  document.querySelector('.ocr-loading-indicator').classList.toggle('hidden');
}