const express = require('express');
const mongoose = require('mongoose');
const Turf = require('../models/Turf'); // Import the Turf model

const router = express.Router();

// ✅ Get all turfs
router.get('/', async (req, res) => {
    try {
        const turfs = await Turf.find().lean(); // Fetch all turfs
        res.status(200).json(turfs);
    } catch (error) {
        console.error("Error fetching turfs:", error);
        res.status(500).json({ message: "Server error while fetching turfs" });
    }
});

// ✅ Get a single turf by ID
router.get('/:id', async (req, res) => {
    try {
        // Validate Turf ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Turf ID' });
        }

        // Find the turf by ID
        const turf = await Turf.findById(req.params.id);
        if (!turf) return res.status(404).json({ message: 'Turf not found' });

        res.status(200).json(turf);
    } catch (error) {
        console.error("Error fetching turf:", error);
        res.status(500).json({ message: "Server error while fetching turf details" });
    }
});

// ✅ Add a new turf
router.post('/', async (req, res) => {
    const {
        name,
        address,
        price,
        size,
        sports,
        images,
        availability,
        number,
        amenities,
        timing,
        unavailableDates,
        slotDuration,
    } = req.body;

    // Validate required fields
    if (
        !name ||
        !address ||
        !price ||
        !size ||
        !sports ||
        !images ||
        !number ||
        !amenities ||
        !timing
    ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new Turf
        const newTurf = new Turf({
            name,
            address,
            price,
            size,
            sports,
            images,
            availability: availability || true, // Default to true if not provided
            number,
            amenities,
            timing,
            unavailableDates: unavailableDates || [], // Default to empty array if not provided
            slotDuration: slotDuration || 15, // Default to 15 minutes if not provided
            rating: { score: 0, votes: 0 }, // Default rating
        });

        // Save the Turf
        const savedTurf = await newTurf.save();

        res.status(201).json({ message: 'Turf added successfully!', turf: savedTurf });
    } catch (error) {
        console.error("Error adding turf:", error);
        res.status(500).json({ message: "Server error while adding turf" });
    }
});

// ✅ Update a turf (partial updates allowed)
router.put('/:id', async (req, res) => {
    try {
        // Validate Turf ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Turf ID' });
        }

        // Find the Turf
        const turf = await Turf.findById(req.params.id);
        if (!turf) return res.status(404).json({ message: 'Turf not found' });

        // Extract fields from the request body
        const { address, price, ...turfData } = req.body;

        // Update address if provided
        if (address) {
            turf.address = {
                streetAddress1: address.streetAddress1 || turf.address.streetAddress1,
                streetAddress2: address.streetAddress2 || turf.address.streetAddress2,
                city: address.city || turf.address.city,
                state: address.state || turf.address.state,
                country: address.country || turf.address.country,
                pinCode: address.pinCode || turf.address.pinCode,
            };
        }

        // Update price array if provided
        if (price) {
            turf.price = price;
        }

        // Update other fields if provided
        Object.keys(turfData).forEach((key) => {
            if (turfData[key] !== undefined) {
                turf[key] = turfData[key];
            }
        });

        // Save the updated Turf
        const updatedTurf = await turf.save();

        res.status(200).json(updatedTurf);
    } catch (error) {
        console.error("Error updating turf:", error);
        res.status(500).json({ message: "Server error while updating turf" });
    }
});

// ✅ Delete a turf
router.delete('/:id', async (req, res) => {
    try {
        // Validate Turf ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Turf ID' });
        }

        // Find and delete the Turf
        const turf = await Turf.findByIdAndDelete(req.params.id);
        if (!turf) return res.status(404).json({ message: 'Turf not found' });

        res.status(200).json({ message: 'Turf deleted successfully' });
    } catch (error) {
        console.error("Error deleting turf:", error);
        res.status(500).json({ message: "Server error while deleting turf" });
    }
});

module.exports = router;