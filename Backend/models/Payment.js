const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Which booking belongs to this payment
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Which user made payment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Total payment amount
    amount: {
      type: Number,
      required: true,
    },

    // Payment gateway name
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe"],
      default: "razorpay",
    },

    // Gateway transaction ID
    transactionId: {
      type: String,
      required: true,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: [
        "created",
        "pending",
        "successful",
        "failed",
        "refunded",
      ],
      default: "created",
    },

    // Payment method
    paymentMethod: {
      type: String,
      default: "",
    },

    // Refund information
    refundId: {
      type: String,
      default: "",
    },

    refundedAt: {
      type: Date,
    },

    // Gateway response
    gatewayResponse: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment",paymentSchema);