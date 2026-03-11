const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const {
  validateLoginRequest,
  validateRegisterRequest,
  validateRequestPasswordResetRequest,
  validateResetPasswordRequest,
} = require("../validators/authValidator");
const router = express.Router();

router.post(
  "/register",
  validate(validateRegisterRequest),
  authController.register,
);
router.post("/login", validate(validateLoginRequest), authController.login);
router.post(
  "/request-reset",
  validate(validateRequestPasswordResetRequest),
  authController.requestPasswordReset,
);
router.post(
  "/reset-password/:token",
  validate(validateResetPasswordRequest),
  authController.resetPassword,
);

module.exports = router;
