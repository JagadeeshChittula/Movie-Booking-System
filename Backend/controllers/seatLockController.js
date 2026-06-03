const SeatLock = require("../models/SeatLock");

const lockSeats = async (req, res) => {
  try {

    const {
      show,
      seats,
    } = req.body;

    const user = req.user._id;

    const expiresAt = new Date(
      Date.now() + 1 * 60 * 1000
    );

    const lock = await SeatLock.create({
      show,
      user,
      seats,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Seats locked",
      lock,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// RELEASE SEAT LOCK
// =============================
const releaseSeatLock = async (req, res) => {
  try {

    const lock = await SeatLock.findOne({
      show: req.body.show,
      user: req.user._id,
      isActive: true,
    });

    if (!lock) {
      return res.status(404).json({
        success: false,
        message: "No active seat lock found",
      });
    }

    lock.isActive = false;

    await lock.save();

    res.status(200).json({
      success: true,
      message: "Seat lock released",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {lockSeats,releaseSeatLock,};