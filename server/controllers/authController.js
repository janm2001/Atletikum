const { User } = require("../models/User");
const jwt = require("jsonwebtoken");
const bcyrpt = require("bcryptjs");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
  try {
    const { username, password, trainingFrequency, focus } = req.body;

    const newUser = await User.create({
      username,
      password,
      trainingFrequency,
      focus,
    });

    const token = signToken(newUser._id);
    res.status(201).json({ status: "success", token, data: { user: newUser } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new Error("Molimo unesite username i lozinku");

    const user = await User.findOne({ username });
    if (!user || !(await bcyrpt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Pogrešni podaci" });
    }

    const token = signToken(user._id);
    res.status(200).json({ status: "success", token, data: { user } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
