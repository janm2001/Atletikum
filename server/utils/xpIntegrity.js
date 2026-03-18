const { User } = require("../models/User");
const { XpLedger } = require("../models/XpLedger");

const XP_ANOMALY_THRESHOLD = 2000;
const DEFAULT_WINDOW_HOURS = 24;

const checkXpConsistency = async (userId) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    return {
      isConsistent: false,
      discrepancies: ["Korisnik nije pronađen."],
    };
  }

  const ledgerAgg = await XpLedger.aggregate([
    { $match: { user: String(userId) } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const ledgerByCategory = {};
  let ledgerTotalXp = 0;
  for (const row of ledgerAgg) {
    ledgerByCategory[row._id] = row.total;
    ledgerTotalXp += row.total;
  }

  const computedTotalXp = user.brainXp + user.bodyXp;
  const discrepancies = [];

  if (user.totalXp !== computedTotalXp) {
    discrepancies.push(
      `totalXp (${user.totalXp}) ne odgovara brainXp + bodyXp (${computedTotalXp}).`,
    );
  }

  if (user.totalXp !== ledgerTotalXp) {
    discrepancies.push(
      `totalXp (${user.totalXp}) ne odgovara zbroju ledgera (${ledgerTotalXp}).`,
    );
  }

  return {
    isConsistent: discrepancies.length === 0,
    userTotalXp: user.totalXp,
    computedTotalXp,
    ledgerTotalXp,
    brainXp: user.brainXp,
    bodyXp: user.bodyXp,
    discrepancies,
  };
};

const checkDuplicateAchievements = async (userId) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    return [];
  }

  const seen = new Set();
  const duplicates = [];

  for (const entry of user.achievements ?? []) {
    const id = entry.achievement?.toString();
    if (!id) continue;

    if (seen.has(id)) {
      duplicates.push(id);
    } else {
      seen.add(id);
    }
  }

  return duplicates;
};

const detectXpAnomalies = async (userId, { windowHours = DEFAULT_WINDOW_HOURS } = {}) => {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

  const result = await XpLedger.aggregate([
    {
      $match: {
        user: String(userId),
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        xpInWindow: { $sum: "$amount" },
      },
    },
  ]);

  const xpInWindow = result.length > 0 ? result[0].xpInWindow : 0;

  return {
    isAnomaly: xpInWindow > XP_ANOMALY_THRESHOLD,
    xpInWindow,
    threshold: XP_ANOMALY_THRESHOLD,
  };
};

module.exports = {
  XP_ANOMALY_THRESHOLD,
  DEFAULT_WINDOW_HOURS,
  checkXpConsistency,
  checkDuplicateAchievements,
  detectXpAnomalies,
};
