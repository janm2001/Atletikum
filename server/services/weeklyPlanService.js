const { WeeklyPlan } = require("../models/WeeklyPlan");
const { Workout } = require("../models/Workout");
const { startOfIsoWeek, endOfIsoWeek, getIsoWeekDay } = require("../utils/dateUtils");
const { requireUserId } = require("../utils/userIdentity");

const FOCUS_WORKOUT_TAGS = {
  mobilnost: ["MOBILITY", "RECOVERY", "CORE"],
  snaga: ["STRENGTH", "PLYOMETRICS", "CORE"],
  prevencija_ozlijede: ["RECOVERY", "MOBILITY", "CORE"],
};

const generateSuggestedWorkouts = async ({ user, targetSessions }) => {
  const focusTags = FOCUS_WORKOUT_TAGS[user.focus] ?? FOCUS_WORKOUT_TAGS.snaga;

  const workouts = await Workout.find({
    requiredLevel: { $lte: user.level },
    $or: [{ createdBy: null }, { createdBy: user._id }],
  })
    .select("_id title tags requiredLevel")
    .lean();

  const scored = workouts.map((w) => {
    let score = 0;
    if (focusTags.some((tag) => (w.tags ?? []).includes(tag))) score += 3;
    score += Math.max(0, 4 - Math.abs((w.requiredLevel ?? 1) - user.level));
    return { ...w, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const dayPattern = [1, 3, 5, 7].slice(0, targetSessions);

  return dayPattern.map((day, idx) => ({
    day,
    workoutId: scored[idx % scored.length]?._id ?? null,
    reason: `Focus: ${user.focus}`,
  }));
};

const getOrCreateWeeklyPlan = async ({ userId, user }) => {
  const normalizedUserId = requireUserId({ userId, user });
  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = endOfIsoWeek(weekStart);

  let plan = await WeeklyPlan.findOne({
    userId: normalizedUserId,
    weekStart,
  }).lean();

  if (plan) {
    return plan;
  }

  const targetSessions = user.trainingFrequency || 3;
  const suggestedWorkouts = await generateSuggestedWorkouts({
    user,
    targetSessions,
  });

  plan = await WeeklyPlan.create({
    userId: normalizedUserId,
    weekStart,
    weekEnd,
    targetSessions,
    completedDays: [],
    suggestedWorkouts,
  });

  return plan.toObject();
};

const markDayComplete = async ({ userId, day }) => {
  const weekStart = startOfIsoWeek(new Date());

  return WeeklyPlan.findOneAndUpdate(
    { userId, weekStart },
    { $addToSet: { completedDays: day } },
    { new: true }
  );
};

const getCurrentWeekProgress = async ({ userId, user }) => {
  const plan = await getOrCreateWeeklyPlan({ userId, user });
  const today = getIsoWeekDay(new Date());

  return {
    ...plan,
    completedCount: plan.completedDays.length,
    remainingSessions: Math.max(0, plan.targetSessions - plan.completedDays.length),
    completionPercentage: Math.round(
      (plan.completedDays.length / plan.targetSessions) * 100
    ),
    todayIsoDay: today,
    todayCompleted: plan.completedDays.includes(today),
  };
};

module.exports = {
  getOrCreateWeeklyPlan,
  markDayComplete,
  getCurrentWeekProgress,
  generateSuggestedWorkouts,
};
