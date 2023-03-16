const express = require('express');
const { recognizeWords } = require('../service/ocr/ocr');
const router = express.Router();
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

  const words = await recognizeWords(
    (req.file && req.file.buffer) || req.body.image
  );
  res.send(words);
});

module.exports = router;
