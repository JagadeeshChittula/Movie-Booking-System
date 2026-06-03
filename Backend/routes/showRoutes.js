const express = require("express");

const {addShow,getAllShows,getSingleShow,updateShow,deleteShow} = require("../controllers/showController");

const {protect,} = require("../middleware/authMiddleware");

const {adminOnly,} = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/add",protect,adminOnly,addShow);

router.get("/all",getAllShows);

router.get("/:id",getSingleShow);

router.put("/:id",protect,adminOnly,updateShow);

router.delete("/:id",protect,adminOnly,deleteShow);

module.exports = router;