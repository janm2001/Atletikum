const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const standardRateLimitOptions = {
  legacyHeaders: false,
  standardHeaders: "draft-6",
  validate: { xForwardedForHeader: false, forwardedHeader: false },
};

const createRateLimitMessage = (message) => ({
  status: "fail",
  message,
});

const getUserRateLimitKey = (request) =>
  request.userId ? `user:${request.userId}` : ipKeyGenerator(request.ip);

const authLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: createRateLimitMessage(
    "Previše zahtjeva s ove IP adrese. Pokušajte ponovo za 15 minuta.",
  ),
});

const quizSubmissionLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše predaja kviza. Pokušajte ponovo za 1 sat.",
  ),
});

const recommendationLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše zahtjeva za preporuke. Pokušajte ponovo za 15 minuta.",
  ),
});

const articleMutationLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše izmjena članaka. Pokušajte ponovo za 1 sat.",
  ),
});

const workoutLogCreationLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše spremanja treninga. Pokušajte ponovo za 1 sat.",
  ),
});

const articleUserMutationLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše izmjena oznaka i napretka članaka. Pokušajte ponovo za 15 minuta.",
  ),
});

const workoutMutationLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 60 * 60 * 1000,
  max: 60,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše izmjena treninga. Pokušajte ponovo za 1 sat.",
  ),
});

const exerciseMutationLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 60 * 60 * 1000,
  max: 60,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše izmjena vježbi. Pokušajte ponovo za 1 sat.",
  ),
});

const globalLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: createRateLimitMessage(
    "Previše zahtjeva. Pokušajte ponovo za 15 minuta.",
  ),
});

module.exports = {
  authLimiter,
  globalLimiter,
  articleMutationLimiter,
  articleUserMutationLimiter,
  exerciseMutationLimiter,
  quizSubmissionLimiter,
  recommendationLimiter,
  workoutMutationLimiter,
  workoutLogCreationLimiter,
};
