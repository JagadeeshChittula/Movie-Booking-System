const SeatLock = require("../models/SeatLock");
const Show = require("../models/Show");

const lockSeats = async (req, res) => {
  try {
    const { show, seats } = req.body;
    const user = req.user._id;

    if (!show || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select valid seats",
      });
    }

    const showDoc = await Show.findById(show);
    if (!showDoc) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // 1. Collision check: seats already permanently booked
    const alreadyBooked = seats.some((s) => showDoc.bookedSeats.includes(s));
    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: "One or more selected seats are already booked. Please choose other seats.",
      });
    }

    // 2. Collision check: seats held by another user in active lock
    const activeLocks = await SeatLock.find({
      show,
      isActive: true,
      expiresAt: { $gt: new Date() },
      user: { $ne: user },
    });
    const currentlyLockedSeats = activeLocks.flatMap((l) => l.seats);
    const alreadyLocked = seats.some((s) => currentlyLockedSeats.includes(s));
    if (alreadyLocked) {
      return res.status(400).json({
        success: false,
        message: "One or more selected seats are temporarily held by another customer. Please choose other seats.",
      });
    }

    // 3. Clear any previous active locks by this user for this show
    await SeatLock.updateMany(
      { show, user, isActive: true },
      { isActive: false }
    );

    // 4. Create 5-minute lock (300 seconds)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const lock = await SeatLock.create({
      show,
      user,
      seats,
      expiresAt,
    });

    // 5. Broadcast real-time seat lock to all clients viewing this show
    const io = req.app.get("io");
    if (io) {
      io.to(String(show)).emit("seat_locked", {
        show,
        seats,
        userId: user,
        expiresAt,
      });
    }

    res.status(201).json({
      success: true,
      message: "Seats locked for 5 minutes",
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

    // Broadcast real-time release
    const io = req.app.get("io");
    if (io) {
      io.to(String(req.body.show)).emit("seat_released", {
        show: req.body.show,
        seats: lock.seats,
      });
    }

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

// =============================
// EXTEND SEAT LOCK FOR PAYMENT (5 MINUTES)
// =============================
const extendSeatLock = async (req, res) => {
  try {
    const { lockId, show, minutes = 5 } = req.body;
    const user = req.user._id;

    let lock = null;
    if (lockId) {
      lock = await SeatLock.findOne({ _id: lockId, user, isActive: true });
    }
    if (!lock && show) {
      lock = await SeatLock.findOne({ show, user, isActive: true });
    }

    if (!lock) {
      return res.status(404).json({
        success: false,
        message: "No active seat lock found to extend",
      });
    }

    // Set expiration to 5 minutes (or requested minutes) from right now
    const durationMs = Math.max(1, Number(minutes)) * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    lock.expiresAt = expiresAt;
    await lock.save();

    // Broadcast updated lock expiration to all clients viewing this show
    const io = req.app.get("io");
    if (io) {
      io.to(String(lock.show)).emit("seat_locked", {
        show: lock.show,
        seats: lock.seats,
        userId: user,
        expiresAt,
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment hold time refreshed to ${minutes} minutes`,
      lock,
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { lockSeats, releaseSeatLock, extendSeatLock };