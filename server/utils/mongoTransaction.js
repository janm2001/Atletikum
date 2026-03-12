const mongoose = require("mongoose");

const MAX_TRANSACTION_RETRIES = 3;

const attachSession = (operation, session) => {
  if (!session || !operation || typeof operation.session !== "function") {
    return operation;
  }

  return operation.session(session);
};

const createWithSession = async (Model, document, session) => {
  if (!session) {
    return Model.create(document);
  }

  const [createdDocument] = await Model.create([document], { session });
  return createdDocument;
};

const saveWithSession = async (document, session) => {
  if (!document) {
    return document;
  }

  if (!session) {
    return document.save();
  }

  return document.save({ session });
};

const isRetryableTransactionError = (error) => {
  if (!error) {
    return false;
  }

  if (typeof error.hasErrorLabel === "function") {
    if (
      error.hasErrorLabel("TransientTransactionError") ||
      error.hasErrorLabel("UnknownTransactionCommitResult")
    ) {
      return true;
    }
  }

  const errorLabels = Array.isArray(error.errorLabels) ? error.errorLabels : [];
  if (
    errorLabels.includes("TransientTransactionError") ||
    errorLabels.includes("UnknownTransactionCommitResult")
  ) {
    return true;
  }

  return (
    error.code === 112 ||
    error.codeName === "WriteConflict" ||
    /WriteConflict/i.test(String(error.message ?? ""))
  );
};

const runInTransaction = async (
  work,
  { maxRetries = MAX_TRANSACTION_RETRIES } = {},
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        result = await work(session);
      });

      return result;
    } catch (error) {
      lastError = error;

      if (!isRetryableTransactionError(error) || attempt === maxRetries) {
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  throw lastError;
};

module.exports = {
  attachSession,
  createWithSession,
  runInTransaction,
  saveWithSession,
};
