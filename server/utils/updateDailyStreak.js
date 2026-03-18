const { User } = require("../models/User");
const { addUtcDays, startOfUtcDay } = require("./dateUtils");
const { attachSession } = require("./mongoTransaction");
const { requireUserId } = require("./userIdentity");

const updateDailyStreak = async (
  userId,
  { session = null, now = new Date() } = {},
) => {
  const normalizedUserId = requireUserId({ userId });
  const todayStart = startOfUtcDay(now);
  const tomorrowStart = addUtcDays(todayStart, 1);
  const yesterdayStart = addUtcDays(todayStart, -1);

  const updateQuery = User.findOneAndUpdate(
    { _id: normalizedUserId },
    [
      {
        $set: {
          dailyStreak: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $ne: ["$lastActivityDate", null] },
                      { $gte: ["$lastActivityDate", todayStart] },
                      { $lt: ["$lastActivityDate", tomorrowStart] },
                    ],
                  },
                  then: "$dailyStreak",
                },
                {
                  case: {
                    $and: [
                      { $ne: ["$lastActivityDate", null] },
                      { $gte: ["$lastActivityDate", yesterdayStart] },
                      { $lt: ["$lastActivityDate", todayStart] },
                    ],
                  },
                  then: { $add: ["$dailyStreak", 1] },
                },
              ],
              default: 1,
            },
          },
          lastActivityDate: {
            $cond: [
              {
                $and: [
                  { $ne: ["$lastActivityDate", null] },
                  { $gte: ["$lastActivityDate", todayStart] },
                  { $lt: ["$lastActivityDate", tomorrowStart] },
                ],
              },
              "$lastActivityDate",
              now,
            ],
          },
        },
      },
      {
        $set: {
          longestStreak: {
            $max: [
              { $ifNull: ["$longestStreak", 0] },
              "$dailyStreak",
            ],
          },
        },
      },
    ],
    { returnDocument: "after", updatePipeline: true },
  );

  return attachSession(updateQuery, session);
};

module.exports = { updateDailyStreak };
