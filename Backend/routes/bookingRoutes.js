const express = require("express");

const {createBooking,getMyBookings,getSingleBooking,confirmBooking,cancelBooking,getAllBookings,checkInBooking} = require("../controllers/bookingController");

const {protect,} = require("../middleware/authMiddleware");

const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/create",protect,createBooking);

router.get("/my-bookings",protect,getMyBookings);

router.get("/:id",protect,getSingleBooking);

router.put("/confirm/:id",protect,confirmBooking);

router.put("/cancel/:id",protect,cancelBooking);

router.put("/check-in/:id",protect,adminOnly,checkInBooking);

router.get("/admin/all",protect,adminOnly,getAllBookings);

module.exports = router;