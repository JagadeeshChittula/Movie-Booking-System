const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const createPayment = async (
  req,
  res
) => {
  try {

    const {
      bookingId,
      amount,
      paymentMethod,
    } = req.body;

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment =
      await Payment.create({
        booking: bookingId,

        user: req.user.id,

        amount,

        paymentMethod,

        transactionId:
          "TXN_" + Date.now(),

        paymentStatus:
          "created",
      });

    res.status(201).json({
      success: true,
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const getPaymentById = async (
  req,
  res
) => {
  try {

    const payment =
      await Payment.findById(
        req.params.id
      )
      .populate(
        "user",
        "name email"
      )
      .populate(
        "booking"
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getAllPayments = async (
  req,
  res
) => {
  try {

    const payments =
      await Payment.find()
      .populate(
        "user",
        "name email"
      )
      .populate(
        "booking"
      );

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const paymentSuccess = async (
  req,
  res
) => {
  try {

    const payment =
      await Payment.findById(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.paymentStatus ="successful";

    await payment.save();

    const booking =
      await Booking.findById(
        payment.booking
      );

    if (booking) {

      booking.paymentStatus ="paid";

      booking.bookingStatus ="confirmed";

      await booking.save();

    }

    res.status(200).json({
      success: true,
      message:
        "Payment successful",
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const paymentFailed = async (
  req,
  res
) => {
  try {

    const payment =
      await Payment.findById(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.paymentStatus =
      "failed";

    await payment.save();

    const booking =
      await Booking.findById(
        payment.booking
      );

    if (booking) {

      booking.paymentStatus =
        "failed";

      booking.bookingStatus =
        "cancelled";

      await booking.save();

    }

    res.status(200).json({
      success: true,
      message:
        "Payment failed",
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const refundPayment = async (
  req,
  res
) => {
  try {

    const payment =
      await Payment.findById(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.paymentStatus =
      "refunded";

    payment.refundId =
      "REFUND_" + Date.now();

    payment.refundedAt =
      new Date();

    await payment.save();

    const booking =
      await Booking.findById(
        payment.booking
      );

    if (booking) {

      booking.bookingStatus =
        "cancelled";

      await booking.save();

    }

    res.status(200).json({
      success: true,
      message:
        "Payment refunded successfully",
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getPaymentStats = async (
  req,
  res
) => {
  try {

    const totalPayments =
      await Payment.countDocuments();

    const successfulPayments =
      await Payment.countDocuments({
        paymentStatus: "successful",
      });

    const failedPayments =
      await Payment.countDocuments({
        paymentStatus: "failed",
      });

    const refundedPayments =
      await Payment.countDocuments({
        paymentStatus: "refunded",
      });

    const pendingPayments =
      await Payment.countDocuments({
        paymentStatus: "pending",
      });

    res.status(200).json({
      success: true,

      stats: {
        totalPayments,
        successfulPayments,
        failedPayments,
        refundedPayments,
        pendingPayments,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getRevenueStats = async (
  req,
  res
) => {
  try {

    const revenue =
      await Payment.aggregate([
        {
          $match: {
            paymentStatus:
              "successful",
          },
        },
        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$amount",
            },

            totalTransactions: {
              $sum: 1,
            },
          },
        },
      ]);

    res.status(200).json({
      success: true,

      revenue:
        revenue[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
        },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {createPayment,getPaymentById,getAllPayments,paymentSuccess,paymentFailed,refundPayment,getPaymentStats,getRevenueStats};