import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-fade";
import "../styles/Home.css";
import HeroSection from "./HeroSection";
import FilterComponent from "../components/FilterComponent";
import { Drawer } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "../components/Navbar"; // Import the Navbar component

function Home() {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [filters, setFilters] = useState({
    turfType: [],
    priceRange: [],
    bookingSlot: [],
    availability: [],
    rating: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [error, setError] = useState(null);

  // Fetch turfs from the API
  useEffect(() => {
    fetch(`https://turfit-app.onrender.com/api/turfs/`)
      .then((res) => res.json())
      .then((data) => {
        setTurfs(data);
      })
      .catch((err) => {
        console.error("Error fetching turfs:", err);
        setError("Failed to load turfs. Please try again later.");
      });
  }, []);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Function to get the current price for a turf based on the current date and time
  const getCurrentPrice = (turf) => {
    const now = new Date(); // Get the current date and time
    const currentTime = now.toTimeString().slice(0, 5); // Extract HH:MM from the current time (24-hour format)
    const currentDate = now.toISOString().slice(0, 10); // Extract YYYY-MM-DD from the current date

    // Determine if today is a weekend or weekday
    const dayType = isWeekend(currentDate) ? "weekend" : "weekday";

    // Find the current price rule
    const currentPriceRule = turf.price.find((rule) => {
      if (rule.dayType === dayType) {
        const startTime = convertTo24HourFormat(rule.startTime);
        const endTime = convertTo24HourFormat(rule.endTime);
        return currentTime >= startTime && currentTime <= endTime;
      }
      return false;
    });

    if (currentPriceRule) {
      return `₹${currentPriceRule.price}/hr | Turf is open now.`;
    }

    // Find the next available slot for today
    const nextPriceRuleToday = turf.price.find(
      (rule) =>
        rule.dayType === dayType &&
        currentTime < convertTo24HourFormat(rule.startTime)
    );

    if (nextPriceRuleToday) {
      return `₹${nextPriceRuleToday.price}/hr | Opens at ${nextPriceRuleToday.startTime}`;
    }

    // If no slots are available today, find the first slot for the next day
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
    const nextDayDate = nextDay.toISOString().slice(0, 10);
    const nextDayType = isWeekend(nextDayDate) ? "weekend" : "weekday";

    const nextDayPriceRule = turf.price.find(
      (rule) => rule.dayType === nextDayType
    );

    if (nextDayPriceRule) {
      return `₹${nextDayPriceRule.price}/hr | Turf is closed now. Opens tomorrow at ${nextDayPriceRule.startTime}`;
    }

    // If no pricing rules are found
    return "No pricing available.";
  };


  // Memoized filtered turfs
  const filteredTurfs = useMemo(() => {
    return turfs.filter((turf) => {
      return (
        turf.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filters.turfType.length === 0 ||
          filters.turfType.some((type) => turf.sports.includes(type))) &&
        (filters.priceRange.length === 0 ||
          filters.priceRange.some((range) => {
            const [min, max] = range.split("-").map(Number);
            return turf.price >= min && turf.price <= max;
          })) &&
        (filters.availability.length === 0 ||
          filters.availability.includes(turf.availability)) &&
        (filters.rating.length === 0 ||
          filters.rating.some((rating) => turf.rating?.score >= rating))
      );
    });
  }, [turfs, searchQuery, filters]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  // Toggle filter drawer for mobile
  const toggleFilterDrawer = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Toggle search input for mobile
  const toggleSearchInput = () => {
    setShowSearchInput(true);
  };

  // Loading state
  // Loading state
  if (turfs.length === 0 && !error) {
    return (
      <div className="skeleton-container">
      {/* Skeleton for Hero Section */}
      <div className="skeleton-hero">
        <Skeleton height={200} borderRadius={10} />
      </div>

      {/* Main Content Layout */}
      <div className="main-content">
        {/* Skeleton for Filter Section (Hidden on Mobile) */}
        <div className="skeleton-filter">
          <Skeleton height={30} width="80%" borderRadius={8} />
          <Skeleton height={20} width="60%" borderRadius={8} style={{ marginTop: "10px" }} />
          <Skeleton height={20} width="60%" borderRadius={8} style={{ marginTop: "10px" }} />
          <Skeleton height={20} width="60%" borderRadius={8} style={{ marginTop: "10px" }} />
        </div>

        {/* Skeleton for Turf Cards */}
        <div className="skeleton-turf-container">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="skeleton-turf-card">
              <Skeleton height={150} borderRadius={8} className="skeleton-image" />
              <div className="skeleton-info">
                <Skeleton height={16} width="80%" borderRadius={4} />
                <Skeleton height={16} width="60%" borderRadius={4} />
                <Skeleton height={16} width="40%" borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }

  // Error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      {/* Navbar */}
      <Navbar
        isMobile={isMobile}
        showSearchInput={showSearchInput}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        toggleSearchInput={toggleSearchInput}
        toggleFilterDrawer={toggleFilterDrawer}
        filteredTurfs={filteredTurfs} // Pass filteredTurfs
        isSearchFocused={isSearchFocused} // Pass isSearchFocused
        setIsSearchFocused={setIsSearchFocused} // Pass setIsSearchFocused
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="main-content">
        {/* Filter Component */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={isFilterOpen}
            onClose={toggleFilterDrawer}
          >
            <div className="filter-drawer">
              <button onClick={toggleFilterDrawer} className="close-drawer-btn">
                Close
              </button>
              <FilterComponent onFilterChange={setFilters} />
            </div>
          </Drawer>
        ) : (
          <div className="filter-sidebar">
            <FilterComponent onFilterChange={setFilters} />
          </div>
        )}

        {/* Turf Container */}
        <div className="turf-container">
          {filteredTurfs.length > 0 ? (
            filteredTurfs.map((turf) => (
              <div
                key={turf._id}
                className="turf-card"
                onClick={() => navigate(`/turf/${turf._id}`)}
              >
                <div className="image-container">
                  {turf.images && turf.images.length > 0 ? (
                    <img
                      src={turf.images[0]}
                      alt={`Image of ${turf.name}`}
                      className="turf-image"
                    />
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                  <div className="turf-rating">
                    <span>Rating: </span>
                    <span className="rating-text">
                      {turf.rating.score.toFixed(1)} / 10{" "}
                    </span>
                  </div>
                </div>
                <div className="turf-info">
                  <h3 className="turf-name">{turf.name}</h3>
                  <p className="turf-sports">
                    {Array.isArray(turf.sports) && turf.sports.length > 0
                      ? turf.sports.join(", ")
                      : ""}
                  </p>
                  {/* Display dynamic pricing */}
                  <p className="turf-price">{getCurrentPrice(turf)}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No turfs found matching your criteria.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
