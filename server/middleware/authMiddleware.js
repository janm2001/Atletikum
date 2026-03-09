const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "Nemate dozvolu za ovu radnju.",
      });
    }
    next();
  };
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Niste prijavljeni. Molimo prijavite se.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "Korisnik više ne postoji.",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Nevažeći token ili neautoriziran pristup.",
    });
  }
};
