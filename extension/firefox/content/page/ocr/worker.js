import * as ocr from '../../deps/tesseract@4.0.2.min.js';

let worker;

async function initWorker() {
  const w = await Tesseract.createWorker({
    workerPath: './deps/worker@4.0.2.min.js',
    workerBlobURL: false,
    langPath: './deps',
    corePath: './deps/tesseract-core@4.0.2.wasm.js',
    tessedit_create_hocr: '0',
    tessedit_create_tsv: '0',
    tessedit_create_box: '0',
    tessedit_create_unlv: '0',
    tessedit_create_osd: '0',
  });
  await w.loadLanguage('eng-fast');
  await w.initialize('eng-fast');
  worker = w;
  return w;
}

async function recognizeWords(element) {
  const result = await worker.recognize(element);
  return result.data.paragraphs.map(({ lines }) => {
    return lines.map((line) => line.words.map((word) => {
      return {
        word: word.choices[0],
        box: word.bbox,
      };
    })).flat();
  }).flat();
}


export async function attachOcrInfo(screenshots) {
  document.querySelector('.ocr-loading-indicator').classList.toggle('hidden');
  if (worker == null) {
    await initWorker();
  }
  for (const screenshot of screenshots) {
    const overlay = screenshot.parentNode.querySelector('.loading-overlay');
    overlay.classList.toggle('loading');
    const words = await recognizeWords(screenshot);
    const serialized = JSON.stringify(words);
    screenshot.setAttribute('wtc-ocr', serialized);
    overlay.classList.toggle('loading');
  }
  document.querySelector('.ocr-loading-indicator').classList.toggle('hidden');
}