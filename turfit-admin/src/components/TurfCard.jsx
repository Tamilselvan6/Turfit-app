import React from "react";
import "../styles/TurfCard.css";

const TurfCard = ({ turf, onEdit, onDelete }) => {
  // Function to determine if a date is a weekend (Sunday) or a weekday (Monday to Saturday)
  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0; // 0 is Sunday
  };

  // Function to convert time from "09:00 AM" to "09:00" (24-hour format)
  const convertTo24HourFormat = (time) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    if (modifier === "PM" && hours !== "12") {
      hours = String(Number(hours) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }
    return `${hours}:${minutes}`;
  };

  // Function to get the current price based on the current date and time
  const getCurrentPrice = () => {
    const now = new Date(); // Get the current date and time
    const currentTime = now.toTimeString().slice(0, 5); // Extract HH:MM from the current time (24-hour format)
    const currentDate = now.toISOString().slice(0, 10); // Extract YYYY-MM-DD from the current date

    // Determine if today is a weekend or weekday
    const dayType = isWeekend(currentDate) ? "Sunday" : "weekday";

    // Find the price rule that matches the current day type and time slot
    const priceRule = turf.price.find((rule) => {
      if (rule.dayType === dayType) {
        const startTime = convertTo24HourFormat(rule.startTime);
        const endTime = convertTo24HourFormat(rule.endTime);
        return currentTime >= startTime && currentTime <= endTime;
      }
      return false;
    });

    return priceRule ? `₹${priceRule.price}/hr` : "No pricing available for the current time.";
  };

  return (
    <div className="turf-card">
      <div className="turf-images">
        {turf.images.map((image, index) => (
          <img key={index} src={image} alt={`Turf ${index + 1}`} />
        ))}
      </div>
      <h3>{turf.name}</h3>
      <p>
        {turf.address.streetAddress1}
        {turf.address.streetAddress2 && `, ${turf.address.streetAddress2}`},
        {turf.address.city}, {turf.address.state}, {turf.address.country},{" "}
        {turf.address.pinCode}
      </p>
      {/* Display dynamic pricing */}
      <div className="turf-pricing">
        {turf.price && turf.price.length > 0 ? (
          <p>Price: {getCurrentPrice()}</p>
        ) : (
          <p>No pricing information available.</p>
        )}
      </div>
      <p>
        <strong>Sports:</strong> {turf.sports.join(", ")}
      </p>
      <p>
        <strong>Amenities:</strong> {turf.amenities.join(", ")}
      </p>
      <div className="card-actions">
        <button onClick={() => onEdit(turf)} className="edit-btn">
          Edit
        </button>
        <button onClick={() => onDelete(turf._id)} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TurfCard;