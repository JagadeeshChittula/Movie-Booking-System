const Booking = require("../models/Booking");
const Show = require("../models/Show");
const createBooking = async (req, res) => {
  try {

    const {
      show,
      seats,
      totalAmount,
    } = req.body;

    const booking =
      await Booking.create({
        user: req.user._id,
        show,
        seats,
        totalAmount,
        bookingStatus: "pending",
        paymentStatus: "pending",
      });

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// GET MY BOOKINGS
// =============================
const getMyBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("show");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET SINGLE BOOKING
// =============================
const getSingleBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(
      req.params.id
    )
      .populate("user")
      .populate({
        path: "show",
        populate: [
          {
            path: "movie",
          },
          {
            path: "theatre",
          },
          {
            path: "screen",
          },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// CONFIRM BOOKING
// =============================
const confirmBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update booking
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";

    await booking.save();

    // Update show seats
    const show = await Show.findById(
      booking.show
    );

    show.bookedSeats.push(
      ...booking.seats
    );

    await show.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed",
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// CANCEL BOOKING
// =============================
const cancelBooking = async (req, res) => {
  try {

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.bookingStatus ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking already cancelled",
      });
    }

    const show =
      await Show.findById(
        booking.show
      );

    // Remove booked seats
    show.bookedSeats =
      show.bookedSeats.filter(
        seat =>
          !booking.seats.includes(
            seat
          )
      );

    await show.save();

    booking.bookingStatus =
      "cancelled";

    booking.cancelledAt =
      new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET ALL BOOKINGS (ADMIN)
// =============================
const getAllBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "title" },
          { path: "theatre", select: "name city" }
        ]
      });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
module.exports = {createBooking,getMyBookings,getSingleBooking,confirmBooking,cancelBooking,getAllBookings,};