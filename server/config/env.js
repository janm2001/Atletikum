const DEFAULT_CLIENT_URL = "http://localhost:5173";
const DEFAULT_PORT = 5001;

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

const getPort = () => {
  const rawPort = getTrimmedEnvValue("PORT");

  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("Invalid PORT environment variable. Expected a positive integer.");
  }

  return parsedPort;
};

const validateServerEnvironment = () => {
  getJwtSecret();
  getMongoUri();
  getPort();
};

module.exports = {
  getClientUrl,
  getJwtSecret,
  getMongoUri,
  getPort,
  validateServerEnvironment,
};
