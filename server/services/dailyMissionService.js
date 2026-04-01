const { DailyMission, MISSION_TYPES } = require("../models/DailyMission");
const { applyUserProgress } = require("./userProgressService");

const MISSION_CONFIGS = [
  { type: "log_workout", target: 1, xpReward: 25 },
  { type: "complete_quiz", target: 1, xpReward: 20 },
  { type: "read_article", target: 1, xpReward: 15 },
  { type: "check_leaderboard", target: 1, xpReward: 15 },
];

const BONUS_XP = 50;

const getTodayDate = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const pickDailyMissions = () => {
  // Always pick 3 distinct mission types
  const shuffled = [...MISSION_CONFIGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((config) => ({ ...config, progress: 0, completed: false }));
};

const getOrCreateTodaysMissions = async ({ userId }) => {
  const date = getTodayDate();

  const existing = await DailyMission.findOne({ user: userId, date }).lean();
  if (existing) {
    return existing;
  }

  const missions = pickDailyMissions();
  const doc = await DailyMission.create({ user: userId, date, missions });
  return doc.toObject();
};

const incrementMissionProgress = async ({ userId, missionType }) => {
  const date = getTodayDate();

  // Step 1: Atomically increment progress, but only if the mission is not yet completed.
  // The positional $ operator updates the first array element matching the filter.
  const afterIncrement = await DailyMission.findOneAndUpdate(
    {
      user: userId,
      date,
      missions: { $elemMatch: { type: missionType, completed: false } },
    },
    { $inc: { "missions.$.progress": 1 } },
    { new: true },
  );

  if (!afterIncrement) {
    // Doc doesn't exist, mission not found, or already completed — nothing to do
    return null;
  }

  const mission = afterIncrement.missions.find((m) => m.type === missionType);
  if (!mission || mission.progress < mission.target) {
    return afterIncrement.toObject();
  }

  // Step 2: Atomically mark the mission as completed. The guard on `completed: false`
  // ensures only one concurrent request wins this update.
  const afterComplete = await DailyMission.findOneAndUpdate(
    {
      user: userId,
      date,
      missions: {
        $elemMatch: { type: missionType, completed: false, progress: { $gte: mission.target } },
      },
    },
    { $set: { "missions.$.completed": true } },
    { new: true },
  );

  if (!afterComplete) {
    // Another concurrent request already claimed the completion
    return afterIncrement.toObject();
  }

  // Award individual mission XP (awaited so silent failures don't go unnoticed)
  const config = MISSION_CONFIGS.find((c) => c.type === missionType);
  if (config) {
    await applyUserProgress({
      userId,
      brainXp: config.xpReward,
      source: "daily_mission",
      description: `Daily mission completed: ${missionType}`,
    });
  }

  // Step 3: Award bonus XP if all missions are now complete.
  // Atomically claim the bonus so concurrent requests cannot double-award it.
  const allDone = afterComplete.missions.every((m) => m.completed);
  if (allDone) {
    const bonusClaimed = await DailyMission.findOneAndUpdate(
      { user: userId, date, bonusClaimed: false },
      { $set: { bonusClaimed: true } },
      { new: true },
    );

    if (bonusClaimed) {
      await applyUserProgress({
        userId,
        brainXp: BONUS_XP,
        source: "daily_mission_bonus",
        description: "All daily missions completed bonus",
      });
    }
  }

  return afterComplete.toObject();
};

module.exports = {
  getOrCreateTodaysMissions,
  incrementMissionProgress,
  BONUS_XP,
  MISSION_TYPES,
};
