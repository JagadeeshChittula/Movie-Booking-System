const SeatLock = require("../models/SeatLock");

const clearExpiredLocks = async () => {
  try {

    await SeatLock.updateMany(
      {
        expiresAt: {
          $lt: new Date(),
        },
        isActive: true,
      },
      {
        isActive: false,
      }
    );

    console.log(
      "Expired locks cleared"
    );

  } catch (error) {

    console.log(error);

  }
};

module.exports = clearExpiredLocks;