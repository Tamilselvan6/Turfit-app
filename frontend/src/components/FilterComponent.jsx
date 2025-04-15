import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../styles/FilterComponent.css";

function FilterComponent({ onFilterChange }) {
  const [filters, setFilters] = useState({
    turfType: [],
    priceRange: [],
    bookingSlot: [],
    availability: [],
    rating: [],
  });

  const handleCheckboxChange = (category, value) => {
    setFilters((prevFilters) => {
      const updatedCategory = prevFilters[category].includes(value)
        ? prevFilters[category].filter((item) => item !== value)
        : [...prevFilters[category], value];

      const newFilters = { ...prevFilters, [category]: updatedCategory };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleClear = (category) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [category]: [] };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  return (
    <div className="filter-container">
      <h2>Filters</h2>

      {/* Turf Type */}
      <Accordion className="filter-component">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span className="filter-title">Turf Type</span>
          <span className="clear-btn" onClick={() => handleClear("turfType")}>
            Clear
          </span>
        </AccordionSummary>
        <AccordionDetails>
          {["Football", "Cricket", "Badminton"].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={filters.turfType.includes(type)}
                  onChange={() => handleCheckboxChange("turfType", type)}
                />
              }
              label={type}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion className="filter-component">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span className="filter-title">Price Range</span>
          <span className="clear-btn" onClick={() => handleClear("priceRange")}>
            Clear
          </span>
        </AccordionSummary>
        <AccordionDetails>
          {["500-1000", "1000-2000", "2000-3000"].map((price) => (
            <FormControlLabel
              key={price}
              control={
                <Checkbox
                  checked={filters.priceRange.includes(price)}
                  onChange={() => handleCheckboxChange("priceRange", price)}
                />
              }
              label={`₹${price}`}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Booking Slot */}
      <Accordion className="filter-component">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span className="filter-title">Booking Slot</span>
          <span
            className="clear-btn"
            onClick={() => handleClear("bookingSlot")}
          >
            Clear
          </span>
        </AccordionSummary>
        <AccordionDetails>
          {["Morning", "Afternoon", "Evening"].map((slot) => (
            <FormControlLabel
              key={slot}
              control={
                <Checkbox
                  checked={filters.bookingSlot.includes(slot)}
                  onChange={() => handleCheckboxChange("bookingSlot", slot)}
                />
              }
              label={slot}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Availability */}
      <Accordion className="filter-component">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span className="filter-title">Availability</span>
          <span
            className="clear-btn"
            onClick={() => handleClear("availability")}
          >
            Clear
          </span>
        </AccordionSummary>
        <AccordionDetails>
          {["Available Now", "Fully Booked"].map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={filters.availability.includes(status)}
                  onChange={() => handleCheckboxChange("availability", status)}
                />
              }
              label={status}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Rating */}
      <Accordion className="filter-component">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span className="filter-title">Ratings</span>
          <span className="clear-btn" onClick={() => handleClear("rating")}>
            Clear
          </span>
        </AccordionSummary>
        <AccordionDetails>
          {[ 9, 7, 5].map((rating) => (
            <FormControlLabel
              key={rating}
              control={
                <Checkbox
                  checked={filters.rating.includes(rating)}
                  onChange={() => handleCheckboxChange("rating", rating)}
                />
              }
              label={`${rating} Star & Above`}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default FilterComponent;
