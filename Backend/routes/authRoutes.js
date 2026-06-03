const express = require("express");

const {registerUser,loginUser,getAllUsers,} = require("../controllers/authController");

const {protect,} = require("../middleware/authMiddleware");

const {adminOnly,} = require("../middleware/adminMiddleware");

const router = express.Router();

// Register Route
router.post("/register",registerUser);

// Login Route
router.post("/login",loginUser);

// Get All Users
router.get("/all-users",protect,adminOnly,getAllUsers);

module.exports = router;