const Tesseract = require('tesseract.js');
const path = require('path');

let worker;

async function initWorker() {
  const w = await Tesseract.createWorker({
    langPath: path.join(__dirname, 'data'),
    tessedit_create_hocr: '0',
    tessedit_create_tsv: '0',
    tessedit_create_box: '0',
    tessedit_create_unlv: '0',
    tessedit_create_osd: '0',
    errorHandler: e => console.error(e)
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

module.exports = {
  initWorker,
  recognizeWords
}