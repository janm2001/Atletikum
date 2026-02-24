const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
