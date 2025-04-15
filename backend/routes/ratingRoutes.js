const express = require("express");
const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const Turf = require("../models/Turf");

const router = express.Router();

// ✅ Add a new rating
router.post('/', async (req, res) => {
    const { phoneNumber, turfId, score, comment } = req.body;
  
    // Validate required fields
    if (!phoneNumber || !turfId || !score) {
      return res.status(400).json({ message: 'Phone number, turf ID, and score are required' });
    }
  
    try {
      // Step 1: Check if the phone number has already rated this turf
      const existingRating = await Rating.findOne({ phoneNumber, turf: turfId });
      if (existingRating) {
        return res.status(400).json({ message: 'You have already rated this turf' });
      }
  
      // Step 2: Create and save the new rating
      const newRating = new Rating({
        phoneNumber,
        turf: turfId,
        score,
        comment,
      });
  
      const savedRating = await newRating.save();
  
      // Step 3: Update the Turf's rating and votes
      const turf = await Turf.findById(turfId);
      if (!turf) throw new Error('Turf not found');
  
      // Calculate new average rating and total votes
      const totalScore = turf.rating.score * turf.rating.votes + score;
      const totalVotes = turf.rating.votes + 1;
      const newAverageScore = totalScore / totalVotes;
  
      // Update the Turf
      turf.rating.score = newAverageScore;
      turf.rating.votes = totalVotes;
      await turf.save();
  
      // Return the updated turf object
      res.status(201).json({
        message: 'Rating added successfully!',
        updatedTurf: turf, // Include the updated turf object in the response
      });
    } catch (error) {
      console.error('Error adding rating:', error);
      res.status(500).json({ message: 'Server error while adding rating' });
    }
  });

// ✅ Get all ratings for a turf
router.get("/turf/:turfId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.turfId)) {
      return res.status(400).json({ message: "Invalid Turf ID" });
    }

    const ratings = await Rating.find({ turf: req.params.turfId });
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Server error while fetching ratings" });
  }
});

// ✅ Get a single rating by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Rating ID" });
    }

    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: "Rating not found" });

    res.status(200).json(rating);
  } catch (error) {
    console.error("Error fetching rating:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching rating details" });
  }
});

// ✅ Update a rating
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Rating ID" });
    }

    const { score, comment } = req.body;

    // Find the existing rating
    const existingRating = await Rating.findById(req.params.id);
    if (!existingRating)
      return res.status(404).json({ message: "Rating not found" });

    // Step 1: Update the rating
    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      { score, comment },
      { new: true, runValidators: true }
    );

    // Step 2: Update the Turf's rating and votes
    const turf = await Turf.findById(existingRating.turf);
    if (!turf) throw new Error("Turf not found");

    // Recalculate the average rating
    const ratings = await Rating.find({ turf: existingRating.turf });
    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const totalVotes = ratings.length;
    const newAverageScore = totalScore / totalVotes;

    // Update the Turf
    turf.rating.score = newAverageScore;
    turf.rating.votes = totalVotes;
    await turf.save();

    res.status(200).json(updatedRating);
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Server error while updating rating" });
  }
});

// ✅ Delete a rating
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Rating ID" });
    }

    // Find the existing rating
    const existingRating = await Rating.findById(req.params.id);
    if (!existingRating)
      return res.status(404).json({ message: "Rating not found" });

    // Step 1: Delete the rating
    await Rating.findByIdAndDelete(req.params.id);

    // Step 2: Update the Turf's rating and votes
    const turf = await Turf.findById(existingRating.turf);
    if (!turf) throw new Error("Turf not found");

    // Recalculate the average rating
    const ratings = await Rating.find({ turf: existingRating.turf });
    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const totalVotes = ratings.length;
    const newAverageScore = totalVotes > 0 ? totalScore / totalVotes : 0;

    // Update the Turf
    turf.rating.score = newAverageScore;
    turf.rating.votes = totalVotes;
    await turf.save();

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Server error while deleting rating" });
  }
});

module.exports = router;
