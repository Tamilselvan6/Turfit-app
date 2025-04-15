import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/TurfPayment.css";

const API_BASE_URL = "http://localhost:5000"; // Replace with backend URL

const TurfPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { turfId, turfName, turfAddress, date, slot, hours, price } =
    location.state;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderResponse = await fetch(
        `${API_BASE_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: price * 100 }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order. Try again.");
      }

      const order = await orderResponse.json();
      const options = {
        key: "rzp_test_3VFVUxiuNoS1AQ",
        amount: order.amount,
        currency: "INR",
        name: "Turfit",
        description: "Booking Payment",
        order_id: order.id,
        handler: async (response) => {
          const bookingData = {
            turfId,
            turfName,
            date,
            slot,
            hours,
            phoneNumber: phone,
            email,
            paymentId: response.razorpay_payment_id,
            paymentMethod: "UPI",
          };

          const bookingResponse = await fetch(
            `${API_BASE_URL}/api/bookings/confirm-booking`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bookingData),
            }
          );

          if (!bookingResponse.ok) {
            throw new Error("Failed to confirm booking.");
          }

          toast.success("Payment successful! 🎉");
          // After successful payment
          // In the handler function after successful payment:
          const bookingResponseData = await bookingResponse.json();
          navigate("/confirmationPage", {
            state: {
              booking: {
                turfId,
                turfName, // From location.state
                turfAddress, // From location.state
                date, // From location.state
                slot, // From location.state
                hours, // From location.state
                amount: price, // From location.state (renamed from price to amount)
                ...bookingResponseData, // From backend (includes paymentId, etc.)
                userName: email,
                userEmail: email,
                phoneNumber: phone,
              },
            },
          });
        },
        prefill: {
          email,
          contact: phone,
        },
        theme: {
          color: "#4caf50",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page-container">
      <div className="payment-content">
        {/* Left Side - Payment Form */}
        <div className="payment-form-section">
          <h2>Complete Your Payment</h2>
          <p className="secure-payment-text">
            <span className="lock-icon">🔒</span> Secure payment processed by
            Razorpay
          </p>

          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="Enter your email"
                className={emailError ? "error" : ""}
              />
              {emailError && (
                <span className="error-message">{emailError}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError("");
                }}
                placeholder="Enter your phone number"
                className={phoneError ? "error" : ""}
              />
              {phoneError && (
                <span className="error-message">{phoneError}</span>
              )}
            </div>

            <div className="payment-methods">
              <h3>Payment Methods</h3>
              <div className="payment-options">
                <button
                  type="button"
                  className="payment-option active"
                  onClick={() => toast.info("UPI selected")}
                >
                  UPI
                </button>
                <button
                  type="button"
                  className="payment-option"
                  onClick={() => toast.info("Credit Card selected")}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  className="payment-option"
                  onClick={() => toast.info("Debit Card selected")}
                >
                  Debit Card
                </button>
                <button
                  type="button"
                  className="payment-option"
                  onClick={() => toast.info("Net Banking selected")}
                >
                  Net Banking
                </button>
              </div>
            </div>

            <button
              className="pay-now-button"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${price.toFixed(2)}`
              )}
            </button>

            <p className="payment-security-note">
              <span className="security-badge">PCI DSS Compliant</span>
              <span className="security-badge">256-bit SSL Encryption</span>
            </p>
          </div>
        </div>

        {/* Right Side - Booking Summary */}
        <div className="booking-summary-section">
          <h2>Booking Summary</h2>

          <div className="summary-details">
            <div className="detail-row">
              <span>Turf Name:</span>
              <span>{turfName}</span>
            </div>
            <div className="detail-row">
              <span>Date:</span>
              <span>{new Date(date).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <span>Slot:</span>
              <span>{slot}</span>
            </div>
            <div className="detail-row">
              <span>Duration:</span>
              <span>
                {hours} {hours > 1 ? "hours" : "hour"}
              </span>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Base Price</span>
              <span>₹{(price / 1.18).toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>GST (18%)</span>
              <span>₹{(price - price / 1.18).toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total Amount</span>
              <span className="total-amount">₹{price.toFixed(2)}</span>
            </div>
          </div>

          <div className="support-section">
            <h3>Need Help?</h3>
            <p>Our customer support team is available 24/7 to assist you.</p>
            <div className="support-contact">
              <span>📞 +91 9876543210</span>
              <span>✉️ support@turfit.com</span>
            </div>
            <div className="razorpay-logo">
              <span>Powered by</span>
              <img
                src="https://razorpay.com/assets/razorpay-logo.svg"
                alt="Razorpay"
                width="100"
              />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
};

export default TurfPayment;
