const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    screenType: {
      type: String,
      enum: ["2D", "3D", "IMAX"],
      default: "2D",
    },

    totalSeats: {
      type: Number,
      required: true,
    },

    seatLayout: {
      rows: {
        type: Number,
        required: true,
      },

      cols: {
        type: Number,
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Screen", screenSchema);