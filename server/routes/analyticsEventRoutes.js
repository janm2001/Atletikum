const express = require("express");
const analyticsEventController = require("../controllers/analyticsEventController");
const { protect } = require("../middleware/authMiddleware");
const { analyticsEventLimiter } = require("../middleware/rateLimiters");
const validate = require("../middleware/validate");
const {
  validateCreateEventRequest,
  validateAbandonedEventRequest,
} = require("../validators/analyticsEventValidator");

const router = express.Router();

// Apply rate limiter to all routes in this file
router.use(analyticsEventLimiter);

// Unauthenticated route for beforeunload beacon (no protect middleware)
router.post(
  "/abandoned",
  validate(validateAbandonedEventRequest),
  analyticsEventController.createAbandonedEvent,
);

// All routes below require authentication
router.use(protect);

router.post(
  "/",
  validate(validateCreateEventRequest),
  analyticsEventController.createEvent,
);

module.exports = router;
