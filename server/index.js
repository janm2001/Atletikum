const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const sanitizeMongo = require("./middleware/sanitizeMongo");
const errorHandler = require("./middleware/errorHandler");
const hpp = require("hpp");
const AppError = require("./utils/AppError");
const { authLimiter, globalLimiter } = require("./middleware/rateLimiters");
const authRoutes = require("./routes/authRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");
const articleRoutes = require("./routes/articleRoutes");
const quizRoutes = require("./routes/quizRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const analyticsEventRoutes = require("./routes/analyticsEventRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const adminChallengeRoutes = require("./routes/adminChallengeRoutes");
const weeklyPlanRoutes = require("./routes/weeklyPlanRoutes");
const { startStreakExpirationJob } = require("./jobs/streakExpirationJob");
const {
  getClientUrl,
  getMongoUri,
  getPort,
  getTrustProxy,
  validateServerEnvironment,
} = require("./config/env");

const path = require("path");

require("dotenv").config();

const app = express();

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const trustProxy = getTrustProxy();
if (trustProxy !== false) {
  app.set("trust proxy", trustProxy);
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
  }),
);
app.use(
  cors({
    origin: getClientUrl(),
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(sanitizeMongo);
app.use(hpp());
app.use(compression());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", globalLimiter);

app.use("/api/v1/auth", authLimiter, authRoutes);

app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/workout-logs", workoutLogRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/achievements", achievementRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/analytics-events", analyticsEventRoutes);
app.use("/api/v1/challenges", challengeRoutes);
app.use("/api/v1/admin/challenges", adminChallengeRoutes);
app.use("/api/v1/weekly-plan", weeklyPlanRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const startServer = async () => {
  validateServerEnvironment();

  await mongoose.connect(getMongoUri(), {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: process.env.NODE_ENV !== "production",
  });
  console.log("MongoDB povezan!");

  if (process.env.NODE_ENV !== 'test') {
    startStreakExpirationJob();
  }

  const port = getPort();

  return app.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
  });
};

if (require.main === module) {
  startServer()
    .then((server) => {
      const shutdown = async (signal) => {
        console.log(`${signal} primljen, gašenje servera...`);
        server.close(async () => {
          await mongoose.connection.close();
          console.log("Server ugašen.");
          process.exit(0);
        });
      };
      process.on("SIGTERM", () => shutdown("SIGTERM"));
      process.on("SIGINT", () => shutdown("SIGINT"));
    })
    .catch((error) => {
      console.error("Greška pri pokretanju servera:", error);
      process.exit(1);
    });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:", reason);
  // Don't exit — let existing shutdown handlers deal with it
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

module.exports = {
  app,
  startServer,
};
