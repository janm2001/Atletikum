const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

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
