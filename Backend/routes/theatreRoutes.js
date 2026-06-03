const express = require("express");

const {addTheatre,getAllTheatres,getSingleTheatre,updateTheatre,deleteTheatre} = require("../controllers/theatreController");

const {protect,} = require("../middleware/authMiddleware");

const {adminOnly,} = require("../middleware/adminMiddleware");


const router = express.Router();

// Add Theatre
router.post("/add",protect,adminOnly,addTheatre);

// Get All Theatres
router.get("/all",getAllTheatres);

// Get Single Theatre
router.get("/:id",getSingleTheatre);

router.put("/:id",protect,adminOnly,updateTheatre);

router.delete("/:id", protect, adminOnly, deleteTheatre);

module.exports = router;