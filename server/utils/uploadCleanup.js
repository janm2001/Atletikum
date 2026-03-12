const fs = require("fs/promises");
const path = require("path");

const ARTICLE_UPLOADS_ROOT = path.join(__dirname, "..", "uploads", "articles");
const MANAGED_UPLOAD_PREFIX = "/uploads/articles/";

const deleteFileAtPath = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }

    console.error(`Greška pri brisanju datoteke ${filePath}:`, error);
  }
};

const deleteUploadedRequestFile = async (file) => {
  await deleteFileAtPath(file?.path);
};

const resolveManagedUploadPath = (publicPath) => {
  if (typeof publicPath !== "string" || !publicPath.startsWith(MANAGED_UPLOAD_PREFIX)) {
    return null;
  }

  const relativePath = publicPath.slice(MANAGED_UPLOAD_PREFIX.length);
  if (!relativePath) {
    return null;
  }

  const resolvedPath = path.normalize(
    path.join(ARTICLE_UPLOADS_ROOT, ...relativePath.split("/")),
  );
  const relativeToUploadsRoot = path.relative(ARTICLE_UPLOADS_ROOT, resolvedPath);

  if (
    !relativeToUploadsRoot ||
    relativeToUploadsRoot.startsWith("..") ||
    path.isAbsolute(relativeToUploadsRoot)
  ) {
    return null;
  }

  return resolvedPath;
};

const deleteUploadByPublicPath = async (publicPath) => {
  const resolvedPath = resolveManagedUploadPath(publicPath);

  if (!resolvedPath) {
    return;
  }

  await deleteFileAtPath(resolvedPath);
};

module.exports = {
  deleteUploadedRequestFile,
  deleteUploadByPublicPath,
  resolveManagedUploadPath,
};
