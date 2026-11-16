const express = require("express");
const {
  addTheatre,
  getAllTheatres,
  getSingleTheatre,
  updateTheatre,
  deleteTheatre,
  renameLocation,
} = require("../controllers/theatreController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/add", protect, adminOnly, addTheatre);
router.get("/all", getAllTheatres);
router.put("/location/rename", protect, adminOnly, renameLocation);
router.get("/:id", getSingleTheatre);
router.put("/:id", protect, adminOnly, updateTheatre);
router.delete("/:id", protect, adminOnly, deleteTheatre);

module.exports = router;

