import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/turfs'; // Replace with your backend URL

// ✅ Fetch all turfs
export const fetchTurfs = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching turfs:', error);
        throw error;
    }
};

// ✅ Add a new turf (address is now embedded)
export const addTurf = async (turfData) => {
    try {
        console.log("Sending turf data:", turfData);

        // Send the turf data directly (address is included in turfData)
        const response = await axios.post(API_BASE_URL, turfData);

        return response.data;
    } catch (error) {
        console.error('Error adding turf:', error.response?.data || error.message);
        throw error;
    }
};

// ✅ Update a turf (address is now embedded)
export const updateTurf = async (turf) => {
    if (!turf._id) {
        console.error("Error: Cannot update turf without an ID!");
        throw new Error("Turf ID is missing.");
    }
    try {
        // Send the updated turf data directly (address is included in turf)
        const response = await axios.put(`${API_BASE_URL}/${turf._id}`, turf);

        return response.data;
    } catch (error) {
        console.error('Error updating turf:', error.response?.data || error.message);
        throw error;
    }
};

// ✅ Delete a turf
export const deleteTurf = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting turf:', error.response?.data || error.message);
        throw error;
    }
};