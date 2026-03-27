const asyncHandler = require("../middleware/asyncHandler");
const { sanitizeUser } = require("../utils/sanitizeUser");

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: sanitizeUser(req.user) },
  });
});
