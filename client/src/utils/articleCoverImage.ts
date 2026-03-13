import { API_ORIGIN } from "@/utils/apiService";

const ARTICLE_UPLOADS_PREFIX = "/uploads/articles/";
const UPLOADS_ARTICLES_MARKER = "uploads/articles/";
const IMAGE_FILENAME_PATTERN = /^[^/\\]+\.(png|jpe?g|gif|webp|svg|avif)$/i;
const BACKEND_HOST = new URL(API_ORIGIN).host.toLowerCase();

const isBrowserAbsoluteUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:") ||
  value.startsWith("blob:") ||
  value.startsWith("//");

const parseAbsoluteUrl = (value: string): URL | null => {
  try {
    return value.startsWith("//") ? new URL(`http:${value}`) : new URL(value);
  } catch {
    return null;
  }
};

const extractUploadsPublicPath = (value: string): string | null => {
  const basePath = value.split(/[?#]/, 1)[0];
  const normalizedPath = basePath.replace(/\\/g, "/");
  const lowerNormalizedPath = normalizedPath.toLowerCase();
  const uploadsMarkerIndex = lowerNormalizedPath.indexOf(UPLOADS_ARTICLES_MARKER);

  if (uploadsMarkerIndex < 0) {
    return null;
  }

  const uploadsRelativePath = normalizedPath
    .slice(uploadsMarkerIndex)
    .replace(/^\/+/, "");

  return `/${uploadsRelativePath}`;
};

export const resolveArticleCoverImageUrl = (coverImage?: string): string | undefined => {
  if (!coverImage) {
    return undefined;
  }

  const trimmedCoverImage = coverImage.trim();
  if (!trimmedCoverImage) {
    return undefined;
  }

  const lowerTrimmedCoverImage = trimmedCoverImage.toLowerCase();

  if (isBrowserAbsoluteUrl(lowerTrimmedCoverImage)) {
    if (
      lowerTrimmedCoverImage.startsWith("data:") ||
      lowerTrimmedCoverImage.startsWith("blob:")
    ) {
      return trimmedCoverImage;
    }

    const parsedAbsoluteUrl = parseAbsoluteUrl(trimmedCoverImage);
    if (!parsedAbsoluteUrl) {
      return trimmedCoverImage;
    }

    if (parsedAbsoluteUrl.host.toLowerCase() !== BACKEND_HOST) {
      return trimmedCoverImage;
    }

    const uploadsPublicPath = extractUploadsPublicPath(parsedAbsoluteUrl.pathname);
    return uploadsPublicPath ?? trimmedCoverImage;
  }

  const uploadsPublicPath = extractUploadsPublicPath(trimmedCoverImage);
  if (uploadsPublicPath) {
    return uploadsPublicPath;
  }

  if (IMAGE_FILENAME_PATTERN.test(trimmedCoverImage)) {
    return `${ARTICLE_UPLOADS_PREFIX}${trimmedCoverImage}`;
  }

  return trimmedCoverImage;
};
