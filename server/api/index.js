require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { getMongoUri, validateServerEnvironment } = require("../config/env");
const { app } = require("../index");

let connected = false;

module.exports = async (req, res) => {
  if (!connected || mongoose.connection.readyState !== 1) {
    validateServerEnvironment();
    await mongoose.connect(getMongoUri());
    connected = true;
  }
  return app(req, res);
};
