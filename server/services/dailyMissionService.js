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

  const doc = await DailyMission.findOne({ user: userId, date });
  if (!doc) return null;

  let anyCompleted = false;
  for (const mission of doc.missions) {
    if (mission.type === missionType && !mission.completed) {
      mission.progress = Math.min(mission.progress + 1, mission.target);
      if (mission.progress >= mission.target) {
        mission.completed = true;
        anyCompleted = true;
      }
      break;
    }
  }

  if (!anyCompleted) {
    return doc.toObject();
  }

  const allDone = doc.missions.every((m) => m.completed);

  await doc.save();

  // Award individual mission XP
  const completedMission = doc.missions.find(
    (m) => m.type === missionType && m.completed,
  );
  if (completedMission) {
    applyUserProgress({
      userId,
      brainXp: completedMission.xpReward,
      source: "daily_mission",
      description: `Daily mission completed: ${missionType}`,
    }).catch(() => {});
  }

  // Award bonus if all missions complete and not yet claimed
  if (allDone && !doc.bonusClaimed) {
    doc.bonusClaimed = true;
    await doc.save();
    applyUserProgress({
      userId,
      brainXp: BONUS_XP,
      source: "daily_mission_bonus",
      description: "All daily missions completed bonus",
    }).catch(() => {});
  }

  return doc.toObject();
};

module.exports = {
  getOrCreateTodaysMissions,
  incrementMissionProgress,
  BONUS_XP,
  MISSION_TYPES,
};
