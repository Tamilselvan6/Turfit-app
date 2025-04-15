const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Turf", 
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ratingSchema.index({ phoneNumber: 1, turf: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema, "ratings");

module.exports = Rating;