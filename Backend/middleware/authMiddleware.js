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