import { useState } from "react";
import { FaStar } from "react-icons/fa";
import "../styles/TurfDetails.css";

// Star Rating Component
const StarRating = ({ rating, setRating }) => {
  const totalStars = 10;

  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          className={`star ${index < rating ? "filled" : "empty"}`}
          onClick={() => setRating(index + 1)}
        >
          {index < rating ? "✮" : "☆"}
        </span>
      ))}
    </div>
  );
};

const RatingComponent = ({ turfId, currentRating, onRatingSubmit, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Handle rating submission
  const handleRatingSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          turfId,
          score: rating,
          comment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit rating");

      const data = await response.json();
      console.log("Backend Response:", data); // Log the backend response

      // Notify the parent component about the new rating
      onRatingSubmit(data.updatedTurf.rating);

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("You have already rated this turf or an error occurred.");
    }
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <h2>Rate this Turf</h2>
        <form onSubmit={handleRatingSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Rating:</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment (optional):</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-rating-btn">
            Submit Rating
          </button>
          <button
            type="button"
            className="cancel-rating-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingComponent;