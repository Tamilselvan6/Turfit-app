import React from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "../styles/TurfForm.css";

const TurfForm = ({
  formData,
  handleChange,
  handleArrayChange,
  handlePriceChange,
  addPriceRule,
  removePriceRule,
  handleSubmit,
  isEditing,
  isLoading,
  resetForm,
  errors,
}) => {
  const handleEditConfirmation = (e) => {
    e.preventDefault();
    confirmAlert({
      title: "Confirm Update",
      message: "Are you sure you want to update this turf?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleSubmit(e),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleAddConfirmation = (e) => {
    e.preventDefault();
    confirmAlert({
      title: "Confirm Add",
      message: "Are you sure you want to add this turf?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleSubmit(e),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleCancelConfirmation = () => {
    confirmAlert({
      title: "Confirm Cancel",
      message:
        "Are you sure you want to cancel? All unsaved changes will be lost.",
      buttons: [
        {
          label: "Yes",
          onClick: () => resetForm(),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  return (
    <form
      onSubmit={isEditing ? handleEditConfirmation : handleAddConfirmation}
      className="turf-form"
    >
      <div className="form-fields">
        {renderInput(
          "Name",
          "name",
          formData.name,
          handleChange,
          "text",
          errors.name
        )}
        {renderAddressFields(formData.address, handleChange, errors)}
        {renderDynamicPricing(
          formData.price,
          handlePriceChange,
          addPriceRule,
          removePriceRule,
          errors.price
        )}
        {renderInput(
          "Size",
          "size",
          formData.size,
          handleChange,
          "text",
          errors.size
        )}
        {renderInput(
          "Sports (comma-separated)",
          "sports",
          formData.sports.join(","),
          (e) => handleArrayChange(e, "sports"),
          "text",
          errors.sports
        )}
        {renderInput(
          "Images (comma-separated URLs)",
          "images",
          formData.images.join(","),
          (e) => handleArrayChange(e, "images"),
          "text",
          errors.images
        )}
        {renderInput(
          "Contact Number",
          "number",
          formData.number,
          handleChange,
          "text",
          errors.number
        )}
        {renderInput(
          "Amenities (comma-separated)",
          "amenities",
          formData.amenities.join(","),
          (e) => handleArrayChange(e, "amenities"),
          "text",
          errors.amenities
        )}
        {renderInput(
          "Rating Score",
          "rating.score",
          formData.rating.score,
          handleChange,
          "number",
          errors.ratingScore
        )}
        {renderInput(
          "Rating Votes",
          "rating.votes",
          formData.rating.votes,
          handleChange,
          "number",
          errors.ratingVotes
        )}

        <div className="form-field">
          <label>Opening Time:</label>
          <TimePicker
            value={formData.timing.open}
            onChange={(value) =>
              handleChange({ target: { name: "open", value } })
            }
            disableClock
            clearIcon={null}
            format="h:mm a"
            placeholder="Select opening time"
          />
          {errors.openTime && (
            <span className="error-message">{errors.openTime}</span>
          )}
        </div>
        <div className="form-field">
          <label>Closing Time:</label>
          <TimePicker
            value={formData.timing.close}
            onChange={(value) =>
              handleChange({ target: { name: "close", value } })
            }
            disableClock
            clearIcon={null}
            format="h:mm a"
            placeholder="Select closing time"
          />
          {errors.closeTime && (
            <span className="error-message">{errors.closeTime}</span>
          )}
        </div>
        {renderInput(
          "Slot Duration (minutes)",
          "slotDuration",
          formData.slotDuration,
          handleChange,
          "number",
          errors.slotDuration
        )}
        {renderInput(
          "Unavailable Dates (comma-separated)",
          "unavailableDates",
          formData.unavailableDates.join(","),
          (e) => handleArrayChange(e, "unavailableDates"),
          "text",
          errors.unavailableDates
        )}
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              <span>Submitting...</span>
            </>
          ) : isEditing ? (
            "Update Turf"
          ) : (
            "Add Turf"
          )}
        </button>
        <button
          type="button"
          onClick={handleCancelConfirmation}
          className="cancel-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const renderInput = (
  label,
  name,
  value,
  onChange,
  type = "text",
  error = ""
) => (
  <div className="form-field">
    <label>{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => {
        if (type === "number") {
          onChange({ target: { name, value: parseFloat(e.target.value) || 0 } });
        } else {
          onChange(e);
        }
      }}
      className={error ? "input-error" : ""}
    />
    {error && <span className="error-message">{error}</span>}
  </div>
);

const renderAddressFields = (address, handleChange, errors) => (
  <>
    {renderInput(
      "Street Address 1",
      "address.streetAddress1",
      address.streetAddress1,
      handleChange,
      "text",
      errors.streetAddress1
    )}
    {renderInput(
      "Street Address 2",
      "address.streetAddress2",
      address.streetAddress2,
      handleChange,
      "text",
      errors.streetAddress2
    )}
    {renderInput(
      "City",
      "address.city",
      address.city,
      handleChange,
      "text",
      errors.city
    )}
    {renderInput(
      "State",
      "address.state",
      address.state,
      handleChange,
      "text",
      errors.state
    )}
    {renderInput(
      "Country",
      "address.country",
      address.country,
      handleChange,
      "text",
      errors.country
    )}
    {renderInput(
      "Pin Code",
      "address.pinCode",
      address.pinCode,
      handleChange,
      "text",
      errors.pinCode
    )}
  </>
);

const renderDynamicPricing = (
  price,
  handlePriceChange,
  addPriceRule,
  removePriceRule,
  error
) => (
  <div className="form-field">
    <label>Pricing Rules:</label>
    {price.map((rule, index) => (
      <div key={index} className="price-rule">
        <select
          value={rule.dayType}
          onChange={(e) =>
            handlePriceChange(index, "dayType", e.target.value)
          }
        >
          <option value="weekday">Weekday</option>
          <option value="weekend">Weekend</option>
        </select>
        <input
          type="text"
          value={rule.startTime}
          onChange={(e) =>
            handlePriceChange(index, "startTime", e.target.value)
          }
          placeholder="Start Time (e.g., 09:00 AM)"
        />
        <input
          type="text"
          value={rule.endTime}
          onChange={(e) =>
            handlePriceChange(index, "endTime", e.target.value)
          }
          placeholder="End Time (e.g., 05:00 PM)"
        />
        <input
          type="number"
          value={rule.price}
          onChange={(e) =>
            handlePriceChange(index, "price", parseFloat(e.target.value) || 0)
          }
          placeholder="Price"
        />
        <button
          type="button"
          onClick={() => removePriceRule(index)}
          className="remove-price-rule-btn"
        >
          Remove
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={addPriceRule}
      className="add-price-rule-btn"
    >
      Add Pricing Rule
    </button>
    {error && <span className="error-message">{error}</span>}
  </div>
);

export default TurfForm;