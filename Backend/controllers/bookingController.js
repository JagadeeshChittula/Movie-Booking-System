const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const SeatLock = require("../models/SeatLock");
const User = require("../models/User");
const { sendBookingConfirmation } = require("../utils/emailService");

const createBooking = async (req, res) => {
  try {
    const {
      show,
      seats,
      totalAmount,
      snacks = [],
      snackTotal = 0,
      discount = 0,
      couponCode = "",
      coinsUsed = 0,
    } = req.body;

    const coinsUsedNum = Number(coinsUsed) || 0;
    if (coinsUsedNum > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { cineCoins: -coinsUsedNum },
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      show,
      seats,
      totalAmount,
      snacks,
      snackTotal,
      discount,
      couponCode,
      coinsUsed: coinsUsedNum,
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
      .populate({
        path: "show",
        populate: [
          { path: "movie" },
          { path: "theatre" },
          { path: "screen" },
        ],
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

// =============================
// HELPER: FLEXIBLE BOOKING RESOLVER
// Supports ObjectId, 8-char ticket code, #CV- prefix, or QR string
// =============================
const findBookingByIdentifier = async (rawId) => {
  if (!rawId) return null;
  const clean = rawId.toString().trim()
    .replace(/^#/, '')
    .replace(/^CINEVAULT_TICKET:/i, '')
    .replace(/^CV-/i, '');

  const populateUser = { path: "user", select: "name email phone" };
  const populateShow = {
    path: "show",
    populate: [
      { path: "movie" },
      { path: "theatre" },
      { path: "screen" },
    ],
  };

  // 1. Direct MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(clean)) {
    const byId = await Booking.findById(clean).populate(populateUser).populate(populateShow);
    if (byId) return byId;
  }

  // 2. Exact match by bookingCode or paymentId
  const byCode = await Booking.findOne({
    $or: [
      { bookingCode: new RegExp(`^${clean}$`, 'i') },
      { bookingCode: new RegExp(`^CV-${clean}$`, 'i') },
      { paymentId: clean },
    ]
  }).populate(populateUser).populate(populateShow);
  if (byCode) return byCode;

  // 3. Suffix match on _id (tickets show slice(-8).toUpperCase())
  if (clean.length >= 4) {
    const recent = await Booking.find().sort({ createdAt: -1 }).limit(300)
      .populate(populateUser)
      .populate(populateShow);

    const matched = recent.find((b) => {
      const idStr = b._id.toString();
      const codeStr = (b.bookingCode || '').toString();
      return (
        idStr.toLowerCase().endsWith(clean.toLowerCase()) ||
        idStr.toUpperCase().includes(clean.toUpperCase()) ||
        codeStr.toLowerCase().includes(clean.toLowerCase())
      );
    });
    if (matched) return matched;
  }

  return null;
};

// =============================
// GET SINGLE BOOKING
// =============================
const getSingleBooking = async (req, res) => {
  try {
    const booking = await findBookingByIdentifier(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found with this ID or Ticket Code",
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
// PUBLIC TICKET LOOKUP (BY CODE / QR)
// =============================
const lookupTicket = async (req, res) => {
  try {
    const booking = await findBookingByIdentifier(req.params.code);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No ticket found for this code. Please verify your Booking Reference.",
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

    // Award 10% of total amount as CineCoins reward points (min 15 coins)
    const earnedCoins = Math.max(15, Math.floor(booking.totalAmount * 0.10));
    booking.coinsEarned = earnedCoins;

    await booking.save();

    // Credit CineCoins to user
    await User.findByIdAndUpdate(booking.user, {
      $inc: { cineCoins: earnedCoins },
    });


    // Update show seats
    const show = await Show.findById(booking.show);
    show.bookedSeats.push(...booking.seats);
    await show.save();

    // Send booking confirmation email
    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate({
        path: "show",
        populate: [{ path: "movie", select: "title" }, { path: "theatre", select: "name" }],
      });
    if (populatedBooking?.user?.email) {
      sendBookingConfirmation(populatedBooking.user.email, {
        userName: populatedBooking.user.name,
        movieTitle: populatedBooking.show?.movie?.title || "Movie",
        theatreName: populatedBooking.show?.theatre?.name || "Cinema",
        showDate: new Date(populatedBooking.show?.showDate).toLocaleDateString("en-IN"),
        showTime: populatedBooking.show?.startTime || "",
        seats: booking.seats.join(", "),
        totalAmount: booking.totalAmount,
        bookingId: booking._id,
      });
    }

    // Deactivate temporary locks held for these seats
    await SeatLock.updateMany(
      { show: booking.show, seats: { $in: booking.seats }, isActive: true },
      { isActive: false }
    );

    // Broadcast permanently booked seats to all clients viewing this show
    const io = req.app.get("io");
    if (io) {
      io.to(String(booking.show)).emit("seat_booked", {
        show: booking.show,
        seats: booking.seats,
      });
    }

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

    if (show) {
      // Remove booked seats
      show.bookedSeats =
        show.bookedSeats.filter(
          seat =>
            !booking.seats.includes(
              seat
            )
        );

      await show.save();

      // Broadcast released seats in real time to all viewers of this show
      const io = req.app.get("io");
      if (io) {
        io.to(String(booking.show)).emit("seat_released", {
          showId: booking.show,
          seats: booking.seats,
        });
      }
    }

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

// =============================
// CHECK IN / ADMIT TICKET (USHER)
// =============================
const checkInBooking = async (req, res) => {
  try {
    const booking = await findBookingByIdentifier(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found with this ID or Ticket Code",
      });
    }

    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Ticket cannot be admitted. Current status is ${booking.bookingStatus}.`,
        booking,
      });
    }

    if (booking.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `Ticket was already admitted on ${new Date(booking.checkedInAt).toLocaleTimeString()}`,
        booking,
      });
    }

    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Ticket verified! Customer admitted successfully.",
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
// ORDER SNACKS (SEAT DELIVERY OR COUNTER)
// =============================
const orderSnacks = async (req, res) => {
  try {
    const { ticketCode, seatNumber, items, totalAmount, coinsUsed, customerName } = req.body;

    let booking = null;
    if (ticketCode) {
      booking = await findBookingByIdentifier(ticketCode);
    }

    const orderId = `SNK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (booking) {
      // Merge snacks into existing booking
      const newItems = Array.isArray(items) ? items : [];
      booking.snacks = [...(booking.snacks || []), ...newItems];
      booking.snackTotal = (booking.snackTotal || 0) + Number(totalAmount || 0);
      booking.totalAmount = (booking.totalAmount || 0) + Number(totalAmount || 0);
      if (coinsUsed) {
        booking.coinsUsed = (booking.coinsUsed || 0) + Number(coinsUsed);
      }
      await booking.save();

      return res.status(200).json({
        success: true,
        message: `Snacks confirmed! Delivering to Seat ${booking.seats?.join(', ')} during interval.`,
        orderId,
        booking,
        deliveredToSeat: booking.seats?.join(', '),
        theatreName: booking.show?.theatre?.name || 'Cinema',
        screenName: booking.show?.screen?.name || 'Screen 1',
        movieTitle: booking.show?.movie?.title || 'Movie',
      });
    }

    // Direct standalone counter pickup order
    res.status(200).json({
      success: true,
      message: "Snack order placed! Collect at the concessions counter with your Order ID.",
      orderId,
      deliveredToSeat: seatNumber || "Concession Counter Pickup",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getSingleBooking,
  lookupTicket,
  orderSnacks,
  confirmBooking,
  cancelBooking,
  getAllBookings,
  checkInBooking,
};