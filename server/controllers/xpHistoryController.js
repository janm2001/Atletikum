const asyncHandler = require("../middleware/asyncHandler");
const { getUserXpHistory } = require("../services/xpLedgerService");

exports.getXpHistory = asyncHandler(async (req, res) => {
  const result = await getUserXpHistory({
    userId: req.userId,
    limit: req.validatedQuery.limit,
    offset: req.validatedQuery.offset,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});
