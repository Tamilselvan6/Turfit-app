const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: {
    streetAddress1: { type: String, required: true, trim: true },
    streetAddress2: { type: String, trim: true }, // Optional
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
  },
  // Dynamic pricing based on day type and time slots
  price: [
    {
      dayType: { type: String, required: true, enum: ["weekday", "weekend"] }, // Weekday or weekend
      startTime: { type: String, required: true, trim: true }, // Start time of the slot (e.g., "09:00 AM")
      endTime: { type: String, required: true, trim: true }, // End time of the slot (e.g., "05:00 PM")
      price: { type: Number, required: true, min: 0 }, // Price for this slot
    },
  ],
  size: { type: String, required: true, trim: true },
  sports: { type: [String], required: true },
  images: { type: [String], required: true },
  availability: { type: Boolean, default: true },
  number: { type: String, required: true, trim: true },
  amenities: { type: [String], required: true },
  rating: {
    score: { type: Number, default: 0, min: 0, max: 10 },
    votes: { type: Number, default: 0, min: 0 },
  },
  timing: {
    open: { type: String, required: true, trim: true },
    close: { type: String, required: true, trim: true },
  },
  unavailableDates: [{ type: Date }],
  slotDuration: { type: Number, default: 15 }, // Slot duration in minutes
});

const Turf = mongoose.model("Turf", turfSchema, "turfDetails");

module.exports = Turf;