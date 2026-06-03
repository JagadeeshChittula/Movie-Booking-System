const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Which user booked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which show was booked
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    // Selected seats
    seats: {
      type: [String],
      required: true,
    },

    // Total amount paid
    totalAmount: {
      type: Number,
      required: true,
    },

    // Booking lifecycle
    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
      ],
      default: "pending",
    },

    // Payment lifecycle
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    // Payment gateway transaction ID
    paymentId: {
      type: String,
      default: "",
    },

    // Optional cancellation reason
    cancellationReason: {
      type: String,
      default: "",
    },

    // When booking was cancelled
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking",bookingSchema);