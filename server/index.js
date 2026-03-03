const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/workout-logs", workoutLogRoutes);

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
