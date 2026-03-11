const asyncHandler = require("../middleware/asyncHandler");
const authService = require("../services/authService");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    status: "success",
    token: result.token,
    data: { user: result.user },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    status: "success",
    token: result.token,
    data: { user: result.user },
  });
});
