const express = require("express");

const {getAvailableSeats,} = require("../controllers/seatController");

const router = express.Router();

router.get("/:showId/seats",getAvailableSeats);

module.exports = router;