const asyncHandler = require("../middleware/asyncHandler");
const { getGamificationStatus } = require("../services/gamificationService");

exports.getGamificationStatus = asyncHandler(async (req, res) => {
  const status = getGamificationStatus(req.user);

  res.status(200).json({
    status: "success",
    data: status,
  });
});
