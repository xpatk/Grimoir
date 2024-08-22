const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const isValid = MIME_TYPES[file.mimetype];
  const error = isValid ? null : new Error("Format non authorisé");
  callback(error, isValid);
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("image");
