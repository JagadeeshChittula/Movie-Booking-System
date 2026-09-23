const SeatLock = require("../models/SeatLock");

const clearExpiredLocks = async (io) => {
  try {
    const expiredLocks = await SeatLock.find({
      expiresAt: {
        $lt: new Date(),
      },
      isActive: true,
    });

    if (expiredLocks.length > 0) {
      await SeatLock.updateMany(
        {
          _id: { $in: expiredLocks.map((l) => l._id) },
        },
        {
          isActive: false,
        }
      );

      if (io) {
        expiredLocks.forEach((lock) => {
          io.to(String(lock.show)).emit("seat_released", {
            showId: lock.show,
            seats: lock.seats,
          });
        });
      }

      console.log(
        `Expired locks cleared: ${expiredLocks.length} lock(s) released.`
      );
    }
  } catch (error) {
    console.error("Error in clearExpiredLocks:", error.message);
  }
};

module.exports = clearExpiredLocks;