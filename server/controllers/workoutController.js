const { Workout } = require("../models/Workout");

exports.getAllWorkouts = async (request, response) => {
  try {
    const workouts = await Workout.find().populate(
      "exercises.exerciseId",
      "title imageLink",
    );
    response.status(200).json({
      status: "success",
      results: workouts.length,
      data: { workouts },
    });
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
};

exports.getWorkoutById = async (request, response) => {
  try {
    const workout = await Workout.findById(request.params.id).populate(
      "exercises.exerciseId",
      "title imageLink",
    );
    if (!workout) {
      return response
        .status(404)
        .json({ status: "fail", message: "Workout not found" });
    }
    response.status(200).json(workout);
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const newWorkout = await Workout.create(req.body);
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedWorkout) {
      return res
        .status(404)
        .json({ status: "fail", message: "Workout not found" });
    }
    res.status(200).json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const deletedWorkout = await Workout.findByIdAndDelete(req.params.id);
    if (!deletedWorkout) {
      return res
        .status(404)
        .json({ status: "fail", message: "Workout not found" });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
