const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { getJwtSecret } = require("../config/env");
const AppError = require("../utils/AppError");

const extractBearerToken = (request) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  return token || null;
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError("Nemate dozvolu za ovu radnju.", 403));
    }

    next();
  };
};

exports.protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return next(new AppError("Niste prijavljeni. Molimo prijavite se.", 401));
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded?.id) {
      return next(new AppError("Nevažeći token ili neautoriziran pristup.", 401));
    }

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError("Korisnik više ne postoji.", 401));
    }

    req.user = currentUser;
    req.userId = String(currentUser._id);

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Token je istekao. Molimo prijavite se ponovno.", 401),
      );
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Nevažeći token ili neautoriziran pristup.", 401));
    }

    return next(err);
  }
};
