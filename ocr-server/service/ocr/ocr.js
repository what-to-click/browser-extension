const Tesseract = require('tesseract.js');
const path = require('path');

let scheduler;

async function initWorker({ workerCount = 2 } = {}) {
  let coldScheduler = Tesseract.createScheduler();
  for (const _ of Array(workerCount).fill(0)) {
    const worker = await Tesseract.createWorker({
      langPath: path.join(__dirname, 'data'),
      tessedit_create_hocr: '0',
      tessedit_create_tsv: '0',
      tessedit_create_box: '0',
      tessedit_create_unlv: '0',
      tessedit_create_osd: '0',
      errorHandler: e => console.error(e)
    });
    await worker.loadLanguage('eng-fast');
    await worker.initialize('eng-fast');
    coldScheduler.addWorker(worker);
  }
  scheduler = coldScheduler;
}

async function recognizeWords(element) {
  const result = await scheduler.addJob('recognize', element);
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