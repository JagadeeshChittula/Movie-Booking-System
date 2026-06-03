const express = require("express");

const {createPayment,getPaymentById,getAllPayments,paymentSuccess,paymentFailed,refundPayment,getPaymentStats,getRevenueStats} = require("../controllers/paymentController");

const {protect,} = require("../middleware/authMiddleware");

const {adminOnly,} = require("../middleware/adminMiddleware");

const router =express.Router();

router.post("/create",protect,createPayment);

router.get("/all",protect,adminOnly,getAllPayments);

router.put("/success/:id",  protect,  paymentSuccess);

router.put("/failed/:id",protect,paymentFailed);

router.put("/refund/:id",protect,adminOnly,refundPayment);

router.get("/stats",protect,adminOnly,getPaymentStats);

router.get("/revenue",protect,adminOnly,getRevenueStats);

router.get("/:id",protect,getPaymentById);

module.exports = router;