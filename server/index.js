const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
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

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const startServer = async () => {
  validateServerEnvironment();

  await mongoose.connect(getMongoUri());
  console.log("MongoDB povezan!");

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

module.exports = {
  app,
  startServer,
};
