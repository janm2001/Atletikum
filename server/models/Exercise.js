const mongoose = require("mongoose");
const MuscleGroup = require("../enums/MuscleGroup.enum");

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    muscleGroup: {
      type: String,
      required: true,
      enum: Object.values(MuscleGroup),
    },
    videoLink: { type: String, required: false },
    imageLink: { type: String, required: false },
    level: { type: Number, required: true, min: 1, max: 100 },
  },
  { timestamps: true },
);

exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ level: 1 });

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = { Exercise, exerciseSchema };
