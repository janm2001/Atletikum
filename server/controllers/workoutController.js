const { Workout } = require("../models/Workout");

exports.getAllWorkouts = async (request, response) => {
  try {
    const workouts = await Workout.find();
    response.status(200).json({
      status: "success",
      results: workouts.length,
      data: { workouts },
    });
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
};
