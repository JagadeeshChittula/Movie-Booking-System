const Show = require("../models/Show");
const SeatLock = require("../models/SeatLock");

const getAvailableSeats = async (req, res) => {
  try {

    const show = await Show.findById(
      req.params.showId
    );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const activeLocks =
      await SeatLock.find({
        show: req.params.showId,
        isActive: true,
      });

    const lockedSeats =
      activeLocks.flatMap(
        lock => lock.seats
      );

    res.status(200).json({
      success: true,
      bookedSeats:
        show.bookedSeats,
      lockedSeats,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {getAvailableSeats,};