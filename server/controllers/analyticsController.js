const asyncHandler = require("../middleware/asyncHandler");
const { getGamificationKpis } = require("../services/analyticsService");

exports.getGamificationKpis = asyncHandler(async (req, res) => {
  const kpis = await getGamificationKpis();

  res.status(200).json({
    status: "success",
    data: kpis,
  });
});
