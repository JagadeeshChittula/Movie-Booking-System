const jwt = require("jsonwebtoken");

const User = require("../models/User");

// =============================
// PROTECT ROUTES
// =============================
const protect = async (req, res, next) => {
  try {

    let token;

    // Check token exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token =
        req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Get user from DB
      req.user = await User.findById(
        decoded.id
      ).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Account is blocked. Please contact support.",
        });
      }

      next();

    } else {

      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });

    }

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Token failed",
    });

  }
};

module.exports = {
  protect,
};