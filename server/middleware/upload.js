const crypto = require("crypto");
const multer = require("multer");
const os = require("os");
const path = require("path");
const AppError = require("../utils/AppError");
const { isCloudinaryStorageEnabled } = require("../config/env");

const getUploadDestination = () =>
  isCloudinaryStorageEnabled()
    ? os.tmpdir()
    : path.join(__dirname, "..", "uploads", "articles");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDestination());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `thumbnail-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError("Dozvoljeni su samo JPEG, PNG, GIF i WebP formati slika.", 400),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 20,
    fieldSize: 200 * 1024,
  },
});

module.exports = upload;
