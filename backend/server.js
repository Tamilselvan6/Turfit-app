const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const Razorpay = require("razorpay");
require("dotenv").config();
const http = require('http');
const WebSocket = require('ws');

// Import routes
const turfRoutes = require("./routes/turfRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Initialize Express
const app = express();
const server = http.createServer(app); // Create HTTP server
// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// CORS Configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
app.set("razorpay", razorpay);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/turfs", turfRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/payments", paymentRoutes);
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.send("Turfit Booking API is running...");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ MongoDB Error:", error);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// Start server with both HTTP and WebSocket
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

