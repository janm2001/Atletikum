// These endpoints take no request body, but validators are wired in to follow
// the project's consistent route middleware pattern and allow future extension.

const validateTrackLeaderboard = (_request) => {};

const validateTrackArticleRead = (_request) => {};

module.exports = {
  validateTrackLeaderboard,
  validateTrackArticleRead,
};
