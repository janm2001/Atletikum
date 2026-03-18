const { XpLedger } = require("../models/XpLedger");
const { createWithSession } = require("../utils/mongoTransaction");

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const recordXpEvent = async ({
  userId,
  source,
  amount,
  category,
  sourceEntityId = null,
  description = "",
  session = null,
}) => {
  return createWithSession(
    XpLedger,
    {
      user: userId,
      source,
      amount,
      category,
      sourceEntityId: sourceEntityId ? String(sourceEntityId) : null,
      description,
    },
    session,
  );
};

const getUserXpHistory = async ({ userId, limit = DEFAULT_LIMIT, offset = 0 }) => {
  const clampedLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const clampedOffset = Math.max(offset, 0);

  const [entries, total] = await Promise.all([
    XpLedger.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(clampedOffset)
      .limit(clampedLimit)
      .lean(),
    XpLedger.countDocuments({ user: userId }),
  ]);

  return { entries, total };
};

const getUserXpSummary = async ({ userId }) => {
  const pipeline = [
    { $match: { user: userId } },
    {
      $group: {
        _id: { source: "$source", category: "$category" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ];

  const results = await XpLedger.aggregate(pipeline);

  const summary = { bySource: {}, byCategory: {}, grandTotal: 0 };

  for (const row of results) {
    const { source, category } = row._id;

    if (!summary.bySource[source]) {
      summary.bySource[source] = { total: 0, count: 0 };
    }
    summary.bySource[source].total += row.totalAmount;
    summary.bySource[source].count += row.count;

    if (!summary.byCategory[category]) {
      summary.byCategory[category] = { total: 0, count: 0 };
    }
    summary.byCategory[category].total += row.totalAmount;
    summary.byCategory[category].count += row.count;

    summary.grandTotal += row.totalAmount;
  }

  return summary;
};

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  recordXpEvent,
  getUserXpHistory,
  getUserXpSummary,
};
