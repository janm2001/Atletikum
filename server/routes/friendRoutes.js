const express = require("express");
const friendController = require("../controllers/friendController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  validateSendFriendRequest,
  validateFriendshipId,
  validateBlockUserId,
} = require("../validators/friendValidator");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const router = express.Router();

const getUserRateLimitKey = (request) =>
  request.userId ? `user:${request.userId}` : ipKeyGenerator(request.ip);

const friendRequestLimiter = rateLimit({
  legacyHeaders: false,
  standardHeaders: "draft-6",
  validate: { xForwardedForHeader: false, forwardedHeader: false },
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: getUserRateLimitKey,
  message: {
    status: "fail",
    message: "Previše zahtjeva za prijateljstvo. Pokušajte ponovo za 1 sat.",
  },
});

router.use(protect);

router
  .route("/")
  .get(friendController.getMyFriends)
  .post(
    friendRequestLimiter,
    validate(validateSendFriendRequest),
    friendController.sendFriendRequest,
  );

router.get("/requests", friendController.getPendingRequests);
router.get("/leaderboard", friendController.getFriendLeaderboard);

router.post(
  "/accept/:friendshipId",
  validate(validateFriendshipId),
  friendController.acceptFriendRequest,
);

router.delete(
  "/:friendshipId",
  validate(validateFriendshipId),
  friendController.removeFriend,
);

router.post(
  "/block/:userId",
  validate(validateBlockUserId),
  friendController.blockUser,
);

module.exports = router;
