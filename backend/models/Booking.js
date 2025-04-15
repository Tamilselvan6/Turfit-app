const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  turfId: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true, match: /^\d{2}:\d{2} [AP]M - \d{2}:\d{2} [AP]M$/ }, // Validate slot format
  hours: { type: Number, required: true, min: 1 }, // Ensure hours is at least 1
  phoneNumber: { type: String, required: true, match: /^\d{10}$/ }, // Validate phone number
  email: { type: String, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, // Validate email (optional)
  status: { type: String, enum: ["booked", "canceled", "available"], default: "booked" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paymentId: { type: String },
  paymentMethod: { type: String, default: "razorpay" },
  notes: { type: String, default: "" },
  cancellationReason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Add indexes
bookingSchema.index({ turfId: 1, date: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);