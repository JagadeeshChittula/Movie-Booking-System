const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    genre: {
      type: [String],
      required: true,
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    posterUrl: {
      type: String,
      required: true,
    },

    trailerUrl: {
      type: String,
    },

    rating: {
      type: Number,
      default: 0,
    },

    userRating: {
      type: Number,
      default: 0,
    },

    userRatingCount: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ isActive: 1, releaseDate: -1 });
movieSchema.index({ title: 1 });

module.exports = mongoose.model("Movie", movieSchema);