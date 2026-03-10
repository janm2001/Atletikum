const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitizeMongo = require("./middleware/sanitizeMongo");
const hpp = require("hpp");
const authRoutes = require("./routes/authRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");
const articleRoutes = require("./routes/articleRoutes");
const quizRoutes = require("./routes/quizRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(sanitizeMongo);
app.use(hpp());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: "fail",
    message: "Previše zahtjeva s ove IP adrese. Pokušajte ponovo za 15 minuta.",
  },
});
app.use("/api/v1/auth", authLimiter, authRoutes);

app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/workout-logs", workoutLogRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/achievements", achievementRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB povezan!"))
  .catch((err) => console.log("Greška pri povezivanju:", err));

app.get("/", (req, res) => {
  res.send("Server radi!");
});

app.listen(PORT, () => {
  console.log(`Server pokrenut na portu: ${PORT}`);
});
