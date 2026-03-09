const mongoose = require("mongoose");
const bcyrpt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    trainingFrequency: { type: Number, required: true, min: 0, max: 7 },
    focus: {
      type: String,
      required: true,
      enum: ["mobilnost", "snaga", "prevencija_ozlijede"],
      default: "snaga",
    },

    level: { type: Number, default: 1 },
    totalXp: { type: Number, default: 0 },
    brainXp: { type: Number, default: 0 },
    bodyXp: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
    achievements: [
      {
        achievement: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Achievement",
        },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcyrpt.hash(this.password, 12);
});

const User = mongoose.model("User", userSchema);

module.exports = { User, userSchema };
