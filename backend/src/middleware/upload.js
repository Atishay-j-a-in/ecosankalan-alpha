const multer = require("multer");
const { MAX_FILE_SIZE } = require("../config/env");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = {
  upload,
};
