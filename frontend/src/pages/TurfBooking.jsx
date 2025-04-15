import React, { useState, useEffect , useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";
import { ClipLoader } from "react-spinners";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/TurfBooking.css";

const API_BASE_URL = "https://turfit-app.onrender.com"; // Replace with your backend URL

// Helper function to check if a slot is in the future
const isSlotInFuture = (slot, selectedDate) => {
  const now = new Date();
  const [startTime] = slot.slot.split(" - ");
  const slotDateTime = new Date(`${selectedDate} ${startTime}`);
  return slotDateTime > now;
};

// Helper function to convert time to 24-hour format
const convertTo24HourFormat = (time) => {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");
  if (modifier === "PM" && hours !== "12") hours = String(Number(hours) + 12);
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours}:${minutes}`;
};

// Helper function to check if a date is a weekend
const isWeekend = (date) => {
  const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// Helper function to calculate the price based on the selected slot and duration
const calculatePrice = (turf, selectedSlot, hours, selectedDate) => {
  if (!turf || !hours || !selectedDate) return 0;

  const dayType = isWeekend(selectedDate) ? "weekend" : "weekday";

  // If no slot is selected, find the price rule for the current or next available time
  if (!selectedSlot) {
    const priceRule = turf.price.find((rule) => rule.dayType === dayType);
    return priceRule ? priceRule.price * hours : 0;
  }

  // If a slot is selected, use the existing logic
  const [startTime] = selectedSlot.split(" - ");
  const priceRule = turf.price.find((rule) => {
    if (rule.dayType === dayType) {
      const ruleStartTime = convertTo24HourFormat(rule.startTime);
      const ruleEndTime = convertTo24HourFormat(rule.endTime);
      const slotStartTime = convertTo24HourFormat(startTime);
      return slotStartTime >= ruleStartTime && slotStartTime < ruleEndTime;
    }
    return false;
  });

  return priceRule ? priceRule.price * hours : 0;
};

// Helper function to convert decimal hours to a readable format
const formatHours = (hours) => {
  const hoursInt = Math.floor(hours); // Get the integer part (full hours)
  const minutes = Math.round((hours - hoursInt) * 60); // Get the minutes part

  if (hoursInt === 0) {
    return `${minutes}min`; // Only minutes (e.g., 30min)
  } else if (minutes === 0) {
    return `${hoursInt}h`; // Only hours (e.g., 1h)
  } else {
    return `${hoursInt}h ${minutes}min`; // Both hours and minutes (e.g., 1h 15min)
  }
};

function TurfBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hours, setHours] = useState(1); // Default to 1 hour
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false); // Loading state for booking
  const [isFetchingSlots, setIsFetchingSlots] = useState(false); // Loading state for slot fetching
  const [isDragging, setIsDragging] = useState(false); // Track if the user is dragging the slider

  const [ws, setWs] = useState(null);
  const wsRef = useRef(null);

  const handleDurationChange = (duration) => {
    setHours(duration); // Update the duration
    setSelectedSlot(null); // Clear the selected slot
  };

  const handleDateChange = (date) => {
    setSelectedDate(date); // Update the date
    setSelectedSlot(null); // Clear the selected slot
  };

  const SlotSkeleton = () => {
    return (
      <div className="slot-skeleton">
        {Array.from({ length: 26 }).map((_, index) => (
          <div key={index} className="skeleton-button"></div>
        ))}
      </div>
    );
  };

  // Fetch turf details
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/turfs/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch data");
        }
        const data = await response.json();
        setTurf(data);
      } catch (error) {
        console.error("Error fetching turf:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfDetails();
  }, [id]);

  // Debounced function to fetch available slots
  const fetchAvailableSlots = debounce(async () => {
    if (selectedDate && hours && turf) {
      setIsFetchingSlots(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bookings/available-slots?turfId=${id}&date=${
            selectedDate.toISOString().split("T")[0]
          }&hours=${hours}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch slots");
        }
        const data = await response.json();

        // Filter out past slots
        const futureSlots = data.filter((slot) =>
          isSlotInFuture(slot, selectedDate.toISOString().split("T")[0])
        );
        setAvailableSlots(futureSlots);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setError(error.message);
      } finally {
        setIsFetchingSlots(false);
      }
    } else {
      setAvailableSlots([]);
    }
  }, 300); // 300ms debounce

  // Fetch available slots when date or hours change
  useEffect(() => {
    if (!isDragging) {
      fetchAvailableSlots();
    }
  }, [selectedDate, hours, id, turf, isDragging]);

  const handleSlotSelection = (slot) => {
    if (slot.status === "available") {
      setSelectedSlot(slot.slot);
    }
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select a slot.");
      return;
    }
    setIsBooking(true);

    try {
      // Navigate to payment page
      navigate(`/payment/${id}`, {
        state: {
          turfId: id,
          turfName: turf.name,
          date: selectedDate.toISOString().split("T")[0],
          slot: selectedSlot,
          hours: hours,
          price: calculatePrice(turf, selectedSlot, hours, selectedDate),
        },
      });
    } catch (error) {
      console.error("Error during booking:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  // Calculate the price for the selected slot
  const price = calculatePrice(turf, selectedSlot, hours, selectedDate);
  if (loading) return <ClipLoader color="#4caf50" size={50} />;

  return (
    <div className="turf-booking-container">
      <div className="header">
        <div className="selected-turf-details">
          <h1 className="turf-name">{turf.name}</h1>
          <div className="turf-overview">
            <span>
              ₹{price.toFixed(2)} | {selectedDate.getDate()}{" "}
              {selectedDate.toLocaleString("default", { month: "short" })}{" "}
              {selectedDate.getFullYear()}
            </span>
          </div>
        </div>
        <div className="date-selector">
        <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            customInput={
              <button className="custom-date-picker">Pick a Date</button>
            }
          />
        
          <button
            className={
              selectedDate.toISOString().split("T")[0] ===
              new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
                ? "active"
                : ""
            }
            onClick={() =>
              handleDateChange(
                new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
              )
            }
          >
            Tomorrow
          </button>

          <button
            className={
              selectedDate.toISOString().split("T")[0] ===
              new Date().toISOString().split("T")[0]
                ? "active"
                : ""
            }
            onClick={() => handleDateChange(new Date())}
          >
            Today
          </button>
          
        </div>
      </div>
      {/* Predefined Duration Buttons */}
      <div className="duration-buttons">
        {[1, 1.5, 2, 2.5].map((duration) => (
          <button
            key={duration}
            type="button"
            className={`duration-button ${hours === duration ? "active" : ""}`}
            onClick={() => handleDurationChange(duration)}
          >
            {formatHours(duration)}
          </button>
        ))}
      </div>
      <div className="slot-selection">
        {/* Range Input with Dynamic Display */}
        <div className="range-container">
          <input
            type="range"
            id="hours"
            value={hours}
            onChange={(e) => {
              setHours(parseFloat(e.target.value));
              setSelectedSlot(null);
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            min="1"
            max="6"
            step="0.25"
            required
            disabled={isFetchingSlots}
          />
          <span className="range-value">{formatHours(hours)}</span>
        </div>

        {/* Slots Section */}
        <div className="slots-section">
          <div className="slots-container">
            {isFetchingSlots ? (
              <SlotSkeleton />
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  className={`slot-button ${
                    slot.status === "available" ? "available" : ""
                  } ${selectedSlot === slot.slot ? "selected" : ""}`}
                  disabled={slot.status !== "available"}
                  onClick={() => handleSlotSelection(slot)}
                >
                  {slot.slot}
                </button>
              ))
            ) : (
              <p className="no-slots-message">
                *No slots available for the selected date and duration.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Pay Button */}
      {selectedSlot && (
        <div className="pay-button-container">
          <button
            type="button"
            className="pay-button"
            onClick={handleBooking}
            disabled={isBooking || isFetchingSlots}
          >
            {isBooking || isFetchingSlots ? (
              <span>Processing...</span>
            ) : (
              `Pay Rs. ${price.toFixed(2)}`
            )}
          </button>
        </div>
      )}

      {/* Slot Legend */}
      <div className="slot-legend">
        <div className="legend-item">
          <div className="box green-border"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="box green"></div>
          <span>Selected</span>
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default TurfBooking;
