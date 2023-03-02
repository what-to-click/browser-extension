const express = require('express');
const router = express.Router();
const ocr = require('tesseract.js');
const upload = require('multer')({
  storage: require('multer').memoryStorage(),
  limits: {
    fieldSize: 1048576 * 2,
    fileSize: 1048576 // 1MB
  }
});

router.post('/', upload.single('image'), async function (req, res, next) {
  if (!req.file && !req.body) {
    return res.status(400).send();
  }

  const result = await ocr.recognize(
    (req.file && req.file.buffer) || req.body.image,
    'eng',
    { logger: m => console.debug(m) }
  );
  console.debug(Object.keys(result.data))
  const words = result.data.paragraphs.map(({ lines }) => {
    return lines.map((line) => line.words.map((word) => {
      return {
        word: word.choices[0],
        box: word.bbox
      }
    })).flat();
  }).flat();
  res.send(words);
});

module.exports = router;
