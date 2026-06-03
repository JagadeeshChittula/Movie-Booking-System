const express = require("express");

const {lockSeats,releaseSeatLock,} = require("../controllers/seatLockController");

const {protect,} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/lock",protect,lockSeats);

router.post("/release",protect,releaseSeatLock);

module.exports = router;