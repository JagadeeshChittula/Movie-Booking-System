const express = require("express");
const {
  addScreen,
  getScreensByTheatre,
  getSingleScreen,
  updateScreen,
  deleteScreen,
  getAllScreens,
} = require("../controllers/screenController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/add", protect, adminOnly, addScreen);
router.get("/all", getAllScreens);
router.get("/theatre/:theatreId", getScreensByTheatre);
router.get("/:id", getSingleScreen);
router.put("/:id", protect, adminOnly, updateScreen);
router.delete("/:id", protect, adminOnly, deleteScreen);

module.exports = router;
