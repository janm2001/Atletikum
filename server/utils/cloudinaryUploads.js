const { v2: cloudinary } = require("cloudinary");
const {
  getCloudinaryConfig,
  isCloudinaryStorageEnabled,
} = require("../config/env");

const CLOUDINARY_HOST_SUFFIX = "res.cloudinary.com";
const CLOUDINARY_UPLOAD_FOLDER = "atletikum/articles";

let cloudinaryConfigured = false;

const ensureCloudinaryConfigured = ({ required = true } = {}) => {
  const config = getCloudinaryConfig({ required });
  if (!config) {
    return false;
  }

  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    cloudinaryConfigured = true;
  }

  return true;
};

const isCloudinaryUrl = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.hostname.toLowerCase().endsWith(CLOUDINARY_HOST_SUFFIX);
  } catch {
    return false;
  }
};

const extractCloudinaryPublicId = (url) => {
  if (!isCloudinaryUrl(url)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex < 0 || uploadIndex + 1 >= pathParts.length) {
      return null;
    }

    const publicIdParts = pathParts.slice(uploadIndex + 1);
    if (/^v\d+$/i.test(publicIdParts[0])) {
      publicIdParts.shift();
    }

    if (publicIdParts.length === 0) {
      return null;
    }

    const lastPart = publicIdParts[publicIdParts.length - 1];
    publicIdParts[publicIdParts.length - 1] = lastPart.replace(/\.[^/.]+$/, "");

    return publicIdParts.join("/");
  } catch {
    return null;
  }
};

const uploadArticleCoverImage = async ({ filePath }) => {
  if (!filePath) {
    return null;
  }

  if (!isCloudinaryStorageEnabled()) {
    return null;
  }

  ensureCloudinaryConfigured({ required: true });

  const response = await cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_UPLOAD_FOLDER,
    resource_type: "image",
  });

  return response.secure_url;
};

const deleteCloudinaryImageByUrl = async (url) => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) {
    return;
  }

  const hasCloudinaryConfig = ensureCloudinaryConfigured({ required: false });
  if (!hasCloudinaryConfig) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error(`Greška pri brisanju Cloudinary slike ${publicId}:`, error);
  }
};

module.exports = {
  deleteCloudinaryImageByUrl,
  extractCloudinaryPublicId,
  isCloudinaryStorageEnabled,
  isCloudinaryUrl,
  uploadArticleCoverImage,
};
