const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Turf = require("../models/Turf");

// Helper function to add hours to a time string
const addHours = (time, hours) => {
  const [timePart, period] = time.split(" ");
  const [startHour, startMinute] = timePart.split(":").map(Number);

  // Convert to 24-hour format
  let hour24 = startHour;
  if (period === "PM" && hour24 !== 12) hour24 += 12;
  if (period === "AM" && hour24 === 12) hour24 = 0;

  // Add the specified hours
  const totalMinutes = hour24 * 60 + startMinute + hours * 60;
  const endHour24 = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  // Convert back to 12-hour format
  let endHour12 = endHour24 % 12 || 12; // Handle midnight (0 -> 12)
  const endPeriod = endHour24 < 12 ? "AM" : "PM";

  return `${String(endHour12).padStart(2, "0")}:${String(endMinute).padStart(
    2,
    "0"
  )} ${endPeriod}`;
};

// Helper function to generate slots
const generateSlots = (timing, hours, bookings, slotDuration = 15) => {
  const slots = [];
  const startTime = new Date(`1970-01-01T${timing.open}:00`);
  const endTime = new Date(`1970-01-01T${timing.close}:00`);

  while (startTime < endTime) {
    const slotStart = startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const slotEnd = addHours(slotStart, hours);

    // Convert slotEnd to a Date object for comparison
    const [endTimePart, endPeriod] = slotEnd.split(" ");
    const [endHour, endMinute] = endTimePart.split(":").map(Number);
    let endHour24 = endHour;
    if (endPeriod === "PM" && endHour !== 12) endHour24 += 12;
    if (endPeriod === "AM" && endHour === 12) endHour24 = 0;
    const slotEndTime = new Date(1970, 0, 1, endHour24, endMinute);

    // Stop generating slots if the slotEndTime exceeds the turf's closing time
    if (slotEndTime > endTime) {
      break;
    }

    // Check if the slot overlaps with any booked slots
    const isSlotBooked = bookings.some((booking) => {
      const [bookedStart, bookedEnd] = booking.slot.split(" - ");
      return (
        (slotStart >= bookedStart && slotStart < bookedEnd) || // Slot starts during a booked slot
        (slotEnd > bookedStart && slotEnd <= bookedEnd) || // Slot ends during a booked slot
        (slotStart <= bookedStart && slotEnd >= bookedEnd) // Slot completely overlaps a booked slot
      );
    });

    if (!isSlotBooked) {
      slots.push({ slot: `${slotStart} - ${slotEnd}`, status: "available" });
    }

    startTime.setMinutes(startTime.getMinutes() + slotDuration); // Move to the next slot
  }

  return slots;
};

// Get available slots
router.get("/available-slots", async (req, res) => {
  const { turfId, date, hours } = req.query;
  try {
    // Validate input
    if (!turfId || !date || !hours) {
      return res
        .status(400)
        .json({ message: "turfId, date, and hours are required" });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Validate hours (must be a positive number)
    if (isNaN(hours)) {
      return res.status(400).json({ message: "Invalid hours" });
    }

    // Find the turf
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // Check if the turf is unavailable on the selected date
    if (turf.unavailableDates.includes(new Date(date))) {
      return res
        .status(400)
        .json({ message: "Turf is unavailable on this date" });
    }

    // Find booked slots for the given turf and date
    const bookings = await Booking.find({ turfId, date, status: { $ne: 'canceled' } });

    // Generate available slots
    const availableSlots = generateSlots(turf.timing, parseFloat(hours), bookings, turf.slotDuration);

    res.json(availableSlots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Error fetching slots", error });
  }
});

// Route to confirm a booking
router.post("/confirm-booking", async (req, res) => {
  const { turfId, date, slot, hours, phoneNumber, email, paymentId, paymentMethod } = req.body;
  const broadcastSlotUpdate = req.app.get('broadcastSlotUpdate'); // Get the broadcast function

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate input
    if (!turfId || !date || !slot || !hours || !phoneNumber || !email || !paymentId || !paymentMethod) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate phone number format (10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Validate slot format (HH:MM AM/PM - HH:MM AM/PM)
    if (!/^\d{2}:\d{2} [AP]M - \d{2}:\d{2} [AP]M$/.test(slot)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid slot format" });
    }

    // Validate hours (must be a positive number)
    if (isNaN(hours) || parseFloat(hours) <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid hours value" });
    }

    // Check if the turf exists
    const turf = await Turf.findById(turfId).session(session);
    if (!turf) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Turf not found" });
    }

    // Check if turf is available on this date
    if (turf.unavailableDates.includes(new Date(date))) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Turf is unavailable on this date" });
    }

    // Check if slot is still available (prevent double booking)
    const existingBookings = await Booking.find({
      turfId,
      date,
      slot,
      status: { $ne: 'canceled' }
    }).session(session);

    if (existingBookings.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: "This slot has already been booked" });
    }

    // Create the booking
    const booking = new Booking({
      turfId,
      date,
      slot,
      hours: parseFloat(hours),
      phoneNumber,
      email,
      paymentId,
      paymentMethod,
      status: "booked",
      paymentStatus: "paid",
      bookedAt: new Date()
    });

    await booking.save({ session });

    // Get updated slots after booking
    const bookings = await Booking.find({ 
      turfId, 
      date, 
      status: { $ne: 'canceled' } 
    }).session(session);
    
    const updatedSlots = generateSlots(
      turf.timing, 
      parseFloat(hours), 
      bookings, 
      turf.slotDuration
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Broadcast the slot update to all connected clients
    if (broadcastSlotUpdate) {
      broadcastSlotUpdate(turfId, date, updatedSlots);
    }

    res.status(201).json({ 
      success: true,
      message: "Booking confirmed", 
      booking,
      updatedSlots // Optionally return the updated slots
    });

  } catch (error) {
    // Abort the transaction if an error occurs
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    console.error("Error confirming booking:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error confirming booking", 
      error: error.message 
    });
  }
});

module.exports = router;