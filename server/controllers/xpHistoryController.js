const asyncHandler = require("../middleware/asyncHandler");
const { getUserXpHistory } = require("../services/xpLedgerService");

exports.getXpHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;

  const result = await getUserXpHistory({
    userId: req.userId,
    limit,
    offset,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});
