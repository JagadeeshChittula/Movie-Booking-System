const express = require("express");

const {addMovie,getAllMovies,getSingleMovie,updateMovie,deleteMovie,} = require("../controllers/movieController");

const {protect,} = require("../middleware/authMiddleware");

const {adminOnly,} = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/add",  protect,adminOnly,addMovie);

router.get("/all",getAllMovies);

router.get("/:id",getSingleMovie);

router.put("/update/:id", protect,adminOnly,updateMovie);

router.delete("/delete/:id", protect,adminOnly,deleteMovie);

module.exports = router;