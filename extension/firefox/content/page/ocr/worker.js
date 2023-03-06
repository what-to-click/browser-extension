import * as ocr from '../../deps/tesseract@4.0.2.min.js';

let worker;

async function initWorker() {
  const w = await Tesseract.createWorker({
    workerPath: './deps/worker@4.0.2.min.js',
    workerBlobURL: false,
    langPath: './deps',
    corePath: './deps/tesseract-core@4.0.2.wasm.js',
  });
  await w.loadLanguage('eng-fast');
  await w.initialize('eng-fast');
  worker = w;
  return w;
}

export async function recognizeWords(element) {
  if (worker == null) {
    await initWorker();
  }
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
