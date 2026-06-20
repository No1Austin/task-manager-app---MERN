const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createBusinessProfile,
  getMyBusinessProfile,
  getPublicBookingProfile,
  createPublicBooking,
  getMyBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const router = express.Router();

// Business profile routes
router.post("/profile", authMiddleware, createBusinessProfile);
router.get("/profile/me", authMiddleware, getMyBusinessProfile);

// Protected booking routes
router.get("/my-bookings", authMiddleware, getMyBookings);
router.patch("/:id/status", authMiddleware, updateBookingStatus);

// Public booking routes
router.get("/public/:slug", getPublicBookingProfile);
router.post("/public/:slug", createPublicBooking);

module.exports = router;