import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaClock } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import RatingComponent from "../components/RatingComponent";
import "../styles/TurfDetails.css";

// Helper functions
const formatTime = (time) => {
  const [hour, minute] = time.split(":");
  const hour12 = hour % 12 || 12; // Convert to 12-hour format
  const period = hour < 12 ? "AM" : "PM";
  return `${hour12}:${minute} ${period}`;
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday (0) or Saturday (6)
};

const convertTo24HourFormat = (time) => {
  if (!time) return "00:00";
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");
  if (modifier === "PM" && hours !== "12") hours = String(Number(hours) + 12);
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Reusable Components
const PriceDisplay = ({ price, message, icon }) => (
  <div className="price-container">
    <p className="price-bold">₹{price.toLocaleString()}/hr</p>
    <p className="price-message">
      {icon && <span className="price-icon">{icon}</span>}
      {message}
    </p>
  </div>
);

const TimingDisplay = ({ timing }) => (
  <div className="turf-timing">
    <h2 className="section-title">Timings</h2>
    <div className="timing-details">
      <span className="timing-label">Open:</span>
      <span className="timing-value">{formatTime(timing?.open || "00:00 AM")}</span>
    </div>
    <div className="timing-details">
      <span className="timing-label">Close:</span>
      <span className="timing-value">{formatTime(timing?.close || "00:00 AM")}</span>
    </div>
  </div>
);

const AmenitiesList = ({ amenities = [] }) => (
  <div className="turf-amenities">
    <h2 className="section-title">Amenities</h2>
    <ul className="amenities-list">
      {amenities.map((amenity, index) => (
        <li key={index} className="amenity-item">
          {amenity}
        </li>
      ))}
    </ul>
  </div>
);

const SportsList = ({ sports = [] }) => (
  <div className="turf-sports">
    <h2 className="section-title">Sports</h2>
    <ul className="sports-list">
      {sports.map((sport, index) => (
        <li key={index} className="sport-item">
          {sport}
        </li>
      ))}
    </ul>
  </div>
);

const AddressDisplay = ({ address = {} }) => (
  <div className="turf-address">
    <h2 className="section-title">Address</h2>
    <div className="address-details">
      <p>{address.streetAddress1 || "Not specified"}</p>
      {address.streetAddress2 && <p>{address.streetAddress2}</p>}
      <p>
        {address.city}, {address.state}, {address.country}
      </p>
      <p>Pin Code: {address.pinCode || "Not specified"}</p>
    </div>
  </div>
);

const PricingDetails = ({ price = [] }) => (
  <div className="turf-pricing-details">
    <h2 className="section-title">Pricing Details</h2>
    {price && price.length > 0 ? (
      <div className="pricing-rules">
        {price.map((priceRule, index) => (
          <div key={index} className="pricing-rule">
            <span className="day-type">{priceRule.dayType}: </span>
            <span className="time-slot">
              {priceRule.startTime} - {priceRule.endTime}
            </span>
            <span className="price">
              ₹{priceRule.price.toLocaleString()}/hr
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="no-data">No pricing information available.</p>
    )}
  </div>
);

const SkeletonLoading = () => {
  return (
    <div className="turf-details-container skeleton-loading">
      {/* Hero Section Skeleton */}
      <div className="turfDetails-bg skeleton-bg">
        <div className="turfDetails-images">
          <div className="skeleton-image-slider"></div>
        </div>
        
        <div className="turfDetails-hero-content">
          <div className="skeleton-text skeleton-title" style={{ width: "70%" }}></div>
          
          <div className="turfDetails-rating">
            <div className="skeleton-star"></div>
            <div className="skeleton-text skeleton-rating" style={{ width: "60px" }}></div>
            <div className="skeleton-text skeleton-votes" style={{ width: "80px" }}></div>
            <div className="skeleton-text skeleton-rate-btn" style={{ width: "80px" }}></div>
          </div>
          
          <div className="turfDetails-price">
            <div className="skeleton-text skeleton-price" style={{ width: "120px" }}></div>
            <div className="skeleton-text skeleton-message" style={{ width: "160px" }}></div>
          </div>
          
          <div className="skeleton-btn skeleton-book-btn"></div>
        </div>
      </div>

      {/* Details Section Skeleton */}
      <div className="turf-details">
        <div className="skeleton-section">
          <div className="skeleton-text skeleton-section-title" style={{ width: "100px" }}></div>
          <div className="skeleton-text skeleton-address-line" style={{ width: "90%" }}></div>
          <div className="skeleton-text skeleton-address-line" style={{ width: "80%" }}></div>
          <div className="skeleton-text skeleton-address-line" style={{ width: "85%" }}></div>
          <div className="skeleton-text skeleton-address-line" style={{ width: "70%" }}></div>
        </div>
        
        <div className="skeleton-divider"></div>
        
        <div className="skeleton-section">
          <div className="skeleton-text skeleton-section-title" style={{ width: "120px" }}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-pricing-rule">
              <div className="skeleton-text skeleton-day-type" style={{ width: "80px" }}></div>
              <div className="skeleton-text skeleton-time-slot" style={{ width: "120px" }}></div>
              <div className="skeleton-text skeleton-price" style={{ width: "100px" }}></div>
            </div>
          ))}
        </div>
        
        <div className="skeleton-divider"></div>
        
        <div className="skeleton-section">
          <div className="skeleton-text skeleton-section-title" style={{ width: "80px" }}></div>
          <div className="skeleton-timing-container">
            <div className="skeleton-timing-line">
              <div className="skeleton-text skeleton-label" style={{ width: "50px" }}></div>
              <div className="skeleton-text skeleton-value" style={{ width: "100px" }}></div>
            </div>
            <div className="skeleton-timing-line">
              <div className="skeleton-text skeleton-label" style={{ width: "50px" }}></div>
              <div className="skeleton-text skeleton-value" style={{ width: "100px" }}></div>
            </div>
          </div>
        </div>
        
        <div className="skeleton-divider"></div>
        
        <div className="skeleton-section">
          <div className="skeleton-text skeleton-section-title" style={{ width: "60px" }}></div>
          <div className="skeleton-list">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-list-item" style={{ width: `${Math.random() * 60 + 80}px` }}></div>
            ))}
          </div>
        </div>
        
        <div className="skeleton-divider"></div>
        
        <div className="skeleton-section">
          <div className="skeleton-text skeleton-section-title" style={{ width: "90px" }}></div>
          <div className="skeleton-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-list-item" style={{ width: `${Math.random() * 60 + 80}px` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Component
function TurfDetails() {
  const { id } = useParams();
  const [turf, setTurf] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // WebSocket handler for slot updates
  const handleSlotUpdate = useCallback((message) => {
    if (message.type === 'slotUpdate') {
      setAvailableSlots(prevSlots => {
        // Only update if the date matches or if we want to show all updates
        if (message.date === selectedDate) {
          return message.slots;
        }
        return prevSlots;
      });
    }
  }, [selectedDate]);
  // Fetch turf details
  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/turfs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch turf data");
        const data = await response.json();
        setTurf(data);
        
        // Fetch initial available slots
        const slotsResponse = await fetch(
          `http://localhost:5000/api/bookings/available-slots?turfId=${id}&date=${selectedDate}&hours=1`
        );
        const slotsData = await slotsResponse.json();
        setAvailableSlots(slotsData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfDetails();
  }, [id, selectedDate]);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = debounce(() => {
      setIsScrolled(window.scrollY > 200);
    }, 100);
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get current price based on time and day
  const getCurrentPrice = useMemo(() => {
    if (!turf?.price || turf.price.length === 0) {
      return <PriceDisplay price={0} message="Pricing not available" />;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().slice(0, 10);
    const dayType = isWeekend(currentDate) ? "weekend" : "weekday";

    // Find the current price rule
    const currentPriceRule = turf.price.find(rule => {
      return (
        rule.dayType === dayType &&
        currentTime >= convertTo24HourFormat(rule.startTime) &&
        currentTime <= convertTo24HourFormat(rule.endTime)
      );
    });

    if (currentPriceRule) {
      return (
        <PriceDisplay
          price={currentPriceRule.price}
          message="Turf is open now."
        />
      );
    }

    // Find the next available slot for today
    const nextPriceRuleToday = turf.price.find(rule => {
      return (
        rule.dayType === dayType &&
        currentTime < convertTo24HourFormat(rule.startTime)
      );
    });

    if (nextPriceRuleToday) {
      return (
        <PriceDisplay
          price={nextPriceRuleToday.price}
          message={`Opens at ${nextPriceRuleToday.startTime}`}
          icon={<FaClock />}
        />
      );
    }

    // If no slots are available today, find the first slot for the next day
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
    const nextDayDate = nextDay.toISOString().slice(0, 10);
    const nextDayType = isWeekend(nextDayDate) ? "weekend" : "weekday";

    const nextDayPriceRule = turf.price.find(
      (rule) => rule.dayType === nextDayType
    );

    if (nextDayPriceRule) {
      return (
        <PriceDisplay
          price={nextDayPriceRule.price}
          message={`Turf is closed now. Opens tomorrow at ${nextDayPriceRule.startTime}`}
          icon={<FaClock />}
        />
      );
    }

    // Default fallback
    return <PriceDisplay price={0} message="Turf is closed now." />;
  }, [turf?.price]);

  // Handle rating submission
  const handleRatingSubmit = useCallback((updatedRating) => {
    setTurf(prev => ({
      ...prev,
      rating: updatedRating
    }));
    setShowRatingModal(false);
  }, []);

  if (error) return <div className="error-container"><SkeletonLoading />  {error}</div>;
  if (loading) return <div className="loading-container">  </div>;
  if (!turf) return <div className="not-found-container">Turf not found</div>;

  return (
    <div className="turf-details-container">
      {/* Hero Section */}
      <div 
        className="turfDetails-bg" 
        style={{ backgroundImage: turf.images?.[0] ? `url(${turf.images[0]})` : 'none' }}
      >
        <div className="turfDetails-images">
          {turf.images?.length > 0 ? (
            <Swiper
              navigation
              pagination={{ clickable: true }}
              modules={[Navigation, Pagination]}
              className="turfDetails-swiper"
            >
              {turf.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`Turf ${index + 1}`}
                    className="turfDetails-image"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="no-image-placeholder">No images available</div>
          )}
        </div>
        
        <div className="turfDetails-hero-content">
          <h1 className="turfDetails-name">{turf.name}</h1>
          
          <div className="turfDetails-rating">
            <span className="star-icon">
              <FaStar />
            </span>
            <span className="rating-text">
              {turf.rating?.score?.toFixed(1) || '0.0'} / 10
            </span>
            <span className="votes-text"> ({turf.rating?.votes || 0} Votes)</span>
            <button
              className="rate-now"
              onClick={() => setShowRatingModal(true)}
            >
              Rate now
            </button>
          </div>
          
          <div className="turfDetails-price">
            {getCurrentPrice}
          </div>
          
          <Link to={`/book/${id}`} className="book-now-btn">
            Book Now
          </Link>
        </div>
      </div>

      {/* Fixed Book Now Button */}
      <div className={`fixed-book-now ${isScrolled ? "visible" : ""}`}>
        <div className="fixed-turfDetails-name">{turf.name}</div>
        <Link to={`/book/${id}`} className="book-now-btn">
          Book Now
        </Link>
      </div>

      {/* Additional Details */}
      <div className="turf-details">
        <AddressDisplay address={turf.address} />
        <hr className="section-divider" />
        
        <PricingDetails price={turf.price} />
        <hr className="section-divider" />
        
        <TimingDisplay timing={turf.timing} />
        <hr className="section-divider" />
        
        <SportsList sports={turf.sports} />
        <hr className="section-divider" />
        
        <AmenitiesList amenities={turf.amenities} />
      </div>


      {/* Rating Modal */}
      {showRatingModal && (
        <RatingComponent
          turfId={id}
          currentRating={turf.rating}
          onRatingSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}

export default TurfDetails;