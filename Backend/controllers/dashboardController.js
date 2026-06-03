const User = require("../models/User");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Booking = require("../models/Booking");

const getDashboardStats = async (
  req,
  res
) => {
  try {

    const totalUsers =
      await User.countDocuments();

    const totalMovies =
      await Movie.countDocuments();

    const totalTheatres =
      await Theatre.countDocuments();

    const totalBookings =
      await Booking.countDocuments();

    const confirmedBookings =
      await Booking.countDocuments({
        bookingStatus: "confirmed",
      });

    const cancelledBookings =
      await Booking.countDocuments({
        bookingStatus: "cancelled",
      });

    const revenueData =
      await Booking.find({
        bookingStatus: "confirmed",
      });

    const totalRevenue =
      revenueData.reduce(
        (sum, booking) =>
          sum + booking.totalAmount,
        0
      );

    res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {getDashboardStats,};