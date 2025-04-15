const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay key
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay secret
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  // Validate amount (must be a positive number)
  if (isNaN(amount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const options = {
    amount: amount, // Amount in paise
    currency: "INR",
    receipt: `order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/payment-success", (req, res) => {
  const { turfId, date, slot } = req.body;

  // Generate a unique key for the slot
  const slotKey = `${turfId}-${date}-${slot}`;

  // Check if the slot is locked
  if (!lockedSlots.has(slotKey)) {
    return res.status(400).json({ message: "Slot is not locked." });
  }

  // Remove the slot from the locked slots store
  lockedSlots.delete(slotKey);

  // Emit a Socket.IO event to notify all clients
  req.app.get("io").emit("slot-booked", { turfId, date, slot });

  res.status(200).json({ message: "Payment successful. Slot booked." });
});

module.exports = router;