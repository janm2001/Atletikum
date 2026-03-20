const DEFAULT_CLIENT_URL = "http://localhost:5173";
const DEFAULT_NODE_ENV = "development";
const DEFAULT_PORT = 5001;
const DEFAULT_ARTICLE_IMAGE_STORAGE = "local";

const getTrimmedEnvValue = (name) => {
  const value = process.env[name];

  return typeof value === "string" ? value.trim() : "";
};

const getRequiredEnv = (name) => {
  const value = getTrimmedEnvValue(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getJwtSecret = () => getRequiredEnv("JWT_SECRET");

const getMongoUri = () => getRequiredEnv("MONGO_URI");

const getClientUrl = () =>
  (getTrimmedEnvValue("CLIENT_URL") || DEFAULT_CLIENT_URL).replace(/\/$/, "");

const getNodeEnv = () =>
  (getTrimmedEnvValue("NODE_ENV") || DEFAULT_NODE_ENV).toLowerCase();

const getArticleImageStorage = () => {
  const storageMode = (
    getTrimmedEnvValue("ARTICLE_IMAGE_STORAGE") || DEFAULT_ARTICLE_IMAGE_STORAGE
  ).toLowerCase();

  if (storageMode !== "local" && storageMode !== "cloudinary") {
    throw new Error(
      'Invalid ARTICLE_IMAGE_STORAGE value. Expected "local" or "cloudinary".',
    );
  }

  return storageMode;
};

const isCloudinaryStorageEnabled = () =>
  getArticleImageStorage() === "cloudinary";

const getCloudinaryConfig = ({ required = false } = {}) => {
  const cloudName = getTrimmedEnvValue("CLOUDINARY_CLOUD_NAME");
  const apiKey = getTrimmedEnvValue("CLOUDINARY_API_KEY");
  const apiSecret = getTrimmedEnvValue("CLOUDINARY_API_SECRET");

  const allValuesMissing = !cloudName && !apiKey && !apiSecret;
  if (allValuesMissing) {
    if (required) {
      throw new Error(
        "Missing required Cloudinary configuration: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
      );
    }
    return null;
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Incomplete Cloudinary configuration. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
};

const getPort = () => {
  const rawPort = getTrimmedEnvValue("PORT");

  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error(
      "Invalid PORT environment variable. Expected a positive integer.",
    );
  }

  return parsedPort;
};

const getTrustProxy = () => {
  const rawValue = getTrimmedEnvValue("TRUST_PROXY");

  if (!rawValue) {
    return false;
  }

  const normalizedValue = rawValue.toLowerCase();
  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  const parsedValue = Number(rawValue);
  if (Number.isInteger(parsedValue) && parsedValue >= 0) {
    return parsedValue;
  }

  throw new Error(
    "Invalid TRUST_PROXY environment variable. Expected true, false, or a non-negative integer.",
  );
};

const getResendApiKey = () => getTrimmedEnvValue("RESEND_API_KEY") || "";

const getEmailFrom = () =>
  getTrimmedEnvValue("EMAIL_FROM") || "Atletikum <onboarding@resend.dev>";

const validateServerEnvironment = () => {
  getJwtSecret();
  getMongoUri();
  getPort();

  if (isCloudinaryStorageEnabled()) {
    getCloudinaryConfig({ required: true });
  }

  if (getNodeEnv() === "production" && !getResendApiKey()) {
    throw new Error("Missing required environment variable: RESEND_API_KEY");
  }
};

module.exports = {
  getArticleImageStorage,
  getClientUrl,
  getCloudinaryConfig,
  getEmailFrom,
  getJwtSecret,
  getMongoUri,
  getNodeEnv,
  getPort,
  getResendApiKey,
  getTrustProxy,
  isCloudinaryStorageEnabled,
  validateServerEnvironment,
};
