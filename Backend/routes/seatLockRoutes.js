const express = require("express");

const {
  lockSeats,
  releaseSeatLock,
  extendSeatLock,
} = require("../controllers/seatLockController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/lock", protect, lockSeats);

router.post("/release", protect, releaseSeatLock);

router.post("/extend", protect, extendSeatLock);

module.exports = router;