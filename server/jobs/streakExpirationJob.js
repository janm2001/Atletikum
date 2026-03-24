const cron = require('node-cron');
const User = require('../models/User');
const logger = console; // use console until a proper logger is set up

const startStreakExpirationJob = () => {
  // Run daily at 2am UTC
  cron.schedule('0 2 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const result = await User.updateMany(
        { lastActivityDate: { $lt: yesterday }, dailyStreak: { $gt: 0 } },
        { $set: { dailyStreak: 0 } }
      );

      logger.info(`[StreakExpirationJob] Reset streaks for ${result.modifiedCount} users`);
    } catch (err) {
      logger.error('[StreakExpirationJob] Failed:', err);
    }
  }, {
    timezone: 'UTC'
  });

  logger.info('[StreakExpirationJob] Scheduled — runs daily at 02:00 UTC');
};

module.exports = { startStreakExpirationJob };
