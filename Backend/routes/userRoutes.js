const express = require("express");

const {getAllUsers,getSingleUser,updateUser,blockUser,unblockUser,changePassword,getProfile} = require("../controllers/userController");

const {protect,} = require("../middleware/authMiddleware");

const {adminOnly,} = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/all",protect,adminOnly,getAllUsers);

router.put("/change-password",protect,changePassword);

router.get("/profile",protect,getProfile);

router.get("/:id",protect,adminOnly,getSingleUser);

router.put("/:id",protect,adminOnly,updateUser);

router.put("/block/:id",protect,adminOnly,blockUser);

router.put("/unblock/:id",protect,adminOnly,unblockUser);

router.get("/profile",protect,getProfile);

module.exports = router;