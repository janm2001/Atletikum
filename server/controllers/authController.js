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

exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body);

  res.status(200).json({
    status: "success",
    message: result.message,
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({
    token: req.params.token,
    password: req.body.password,
  });

  res.status(200).json({
    status: "success",
    message: result.message,
  });
});
