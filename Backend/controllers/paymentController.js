const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// Initialize Razorpay (uses test keys if configured)
const razorpayInstance = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let razorpayOrder = null;

    // Create Razorpay order if keys are configured
    if (razorpayInstance) {
      try {
        razorpayOrder = await razorpayInstance.orders.create({
          amount: Math.round(amount * 100), // Razorpay expects amount in paise
          currency: "INR",
          receipt: `receipt_${bookingId}`,
        });
      } catch (rzpErr) {
        console.warn("Razorpay order creation skipped or failed:", rzpErr.message);
      }
    }

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount,
      paymentMethod: paymentMethod || "card",
      transactionId: razorpayOrder ? razorpayOrder.id : "TXN_" + Date.now(),
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
      paymentStatus: "created",
    });

    res.status(201).json({
      success: true,
      payment,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay payment signature
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (razorpayInstance && razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature" });
      }
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    payment.paymentStatus = "successful";
    payment.razorpayPaymentId = razorpay_payment_id || null;
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      await booking.save();
    }

    res.status(200).json({ success: true, message: "Payment verified successfully", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user", "name email").populate("booking");
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user", "name email").populate("booking");
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const paymentSuccess = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    payment.paymentStatus = "successful";
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      await booking.save();
    }

    res.status(200).json({ success: true, message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const paymentFailed = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    payment.paymentStatus = "failed";
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
      await booking.save();
    }

    res.status(200).json({ success: true, message: "Payment failed", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    payment.paymentStatus = "refunded";
    payment.refundId = "REFUND_" + Date.now();
    payment.refundedAt = new Date();
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.bookingStatus = "cancelled";
      await booking.save();
    }

    res.status(200).json({ success: true, message: "Payment refunded successfully", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    const [totalPayments, successfulPayments, failedPayments, refundedPayments, pendingPayments] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ paymentStatus: "successful" }),
      Payment.countDocuments({ paymentStatus: "failed" }),
      Payment.countDocuments({ paymentStatus: "refunded" }),
      Payment.countDocuments({ paymentStatus: "pending" }),
    ]);
    res.status(200).json({
      success: true,
      stats: { totalPayments, successfulPayments, failedPayments, refundedPayments, pendingPayments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { paymentStatus: "successful" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalTransactions: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      revenue: revenue[0] || { totalRevenue: 0, totalTransactions: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  getPaymentById,
  getAllPayments,
  paymentSuccess,
  paymentFailed,
  refundPayment,
  getPaymentStats,
  getRevenueStats,
};
