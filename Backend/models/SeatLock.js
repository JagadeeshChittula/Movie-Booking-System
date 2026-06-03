const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema(
  {
    // Which show seats belong to
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    // Which user locked seats
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Temporarily locked seats
    seats: {
      type: [String],
      required: true,
    },

    // Lock expiry time
    expiresAt: {
      type: Date,
      required: true,
    },

    // Lock status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SeatLock",seatLockSchema);