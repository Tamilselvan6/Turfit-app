import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaReceipt, 
  FaShare, 
  FaPrint, 
  FaHome,
  FaQrcode,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import "../styles/ConfirmationPage.css";

const ConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking || {};
  const [isMobile, setIsMobile] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    // Check if mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    // Add analytics event or tracking here if needed
  }, []);

  // Default values if booking data is not available
  const {
    turfName = booking.turfName || state?.turfName || "Turf Name",
    date = new Date().toISOString(),
    slot = "10:00 AM - 11:00 AM",
    hours = 1,
    paymentId = "PAY" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    paymentMethod = "UPI",
    amount = 1000,
    userName = "Guest User",
    userEmail = "guest@example.com",
  } = booking;

  // Format date and time
  const bookingDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time slot
  const formatSlot = (slot) => {
    if (!slot) return "Not specified";
    return slot.replace(" - ", " to ");
  };

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: 'My Turf Booking Confirmation',
      text: `I've booked ${turfName} on ${bookingDate} from ${formatSlot(slot)}. Booking ID: ${paymentId}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `Booking Confirmation\nTurf: ${turfName}\nDate: ${bookingDate}\nTime: ${formatSlot(slot)}\nBooking ID: ${paymentId}`
        );
        alert('Booking details copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle download as image
  const handleDownload = () => {
    setDownloading(true);
    const element = document.querySelector('.confirmation-card');
    
    html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      canvas.toBlob((blob) => {
        saveAs(blob, `TurfBooking_${paymentId}.png`);
        setDownloading(false);
      });
    }).catch(err => {
      console.error('Error generating image:', err);
      setDownloading(false);
    });
  };

  // Generate calendar event download link
  const generateCalendarEvent = () => {
    const startTime = new Date(date);
    const [startHour, endHour] = slot.split(' - ')[0].split(':');
    startTime.setHours(parseInt(startHour), 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + hours);
    
    const calendarEvent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Turf Booking at ${turfName}
DESCRIPTION:Your turf booking is confirmed for ${formatSlot(slot)}. Booking ID: ${paymentId}
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
UID:${paymentId}@turfit.com
END:VEVENT
END:VCALENDAR
    `.trim();
    
    const blob = new Blob([calendarEvent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TurfBooking_${paymentId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <FaCheckCircle className="success-icon" />
          <h1>Booking Confirmed!</h1>
          <p className="confirmation-text">Your payment was successful and your slot is reserved.</p>
          <p className="reference-number">Booking ID: #{paymentId}</p>
          
          {/* QR Code for quick check-in */}
          <div className="qr-code-container">
            <QRCode 
              value={JSON.stringify({
                bookingId: paymentId,
                turfName,
                date: bookingDate,
                slot: formatSlot(slot),
                userName
              })} 
              size={140} 
              level="H" 
              fgColor="#4caf50"
            />
            <p className="qr-code-label">Scan for check-in</p>
          </div>
        </div>

        <div className="user-details-section">
          <h2><FaUser /> User Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Name:</strong>
              <span>{userName}</span>
            </div>
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{userEmail}</span>
            </div>
          </div>
        </div>

        <div className="booking-details-section">
          <div className="booking-details">
            <h2><FaMapMarkerAlt /> Booking Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Turf Name:</strong>
                <span>{turfName}</span>
              </div>
              <div className="detail-item">
                <strong>Date:</strong>
                <span>{bookingDate}</span>
              </div>
              <div className="detail-item">
                <strong>Time Slot:</strong>
                <span>{formatSlot(slot)}</span>
              </div>
              <div className="detail-item">
                <strong>Duration:</strong>
                <span>{hours} {hours > 1 ? 'hours' : 'hour'}</span>
              </div>
            </div>
          </div>

          <div className="payment-details">
            <h2><FaReceipt /> Payment Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Amount Paid:</strong>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <strong>Payment Method:</strong>
                <span>{paymentMethod}</span>
              </div>
              <div className="detail-item">
                <strong>Transaction ID:</strong>
                <span className="truncate-id">{paymentId}</span>
              </div>
              <div className="detail-item">
                <strong>Payment Status:</strong>
                <span className="status-success">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h2>What's Next?</h2>
          <ul>
            <li><FaInfoCircle className="info-icon" /> A confirmation has been sent to your registered email</li>
            <li><FaInfoCircle className="info-icon" /> Please arrive 15 minutes before your scheduled time</li>
            <li><FaInfoCircle className="info-icon" /> Bring your ID proof and this confirmation</li>
            <li><FaInfoCircle className="info-icon" /> Show the QR code at the reception for check-in</li>
            {isMobile && (
              <li><FaInfoCircle className="info-icon" /> Add this event to your calendar for reminders</li>
            )}
          </ul>
        </div>

        <div className="support-section">
          <h1>Need Assistance?</h1>
          <div className="support-contacts">
            <a href="tel:+919384870052" className="support-link">
              <FaPhone /> +91 9384870052
            </a>
            <a href="mailto:sritamilselvan@gmail.com" className="support-link">
              <FaEnvelope /> sritamilselvan@gmail.com
            </a>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="action-btn share-btn"
            onClick={handleShare}
          >
            <FaShare /> Share Booking
          </button>
          <button 
            className="action-btn print-btn"
            onClick={handlePrint}
          >
            <FaPrint /> Print Receipt
          </button>
          <button 
            className="action-btn download-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            <FaQrcode /> {downloading ? 'Downloading...' : 'Save as Image'}
          </button>
          {isMobile && (
            <button 
              className="action-btn calendar-btn"
              onClick={generateCalendarEvent}
            >
              <FaCalendarAlt /> Add to Calendar
            </button>
          )}
          <button 
            className="action-btn home-btn"
            onClick={() => navigate('/')}
          >
            <FaHome /> Back to Home
          </button>
        </div>

        <div className="important-notes">
          <h3><FaExclamationTriangle /> Important Notes</h3>
          <ul>
            <li>This confirmation serves as your booking receipt</li>
            <li>Modifications to bookings are subject to availability</li>
            <li>Please carry valid ID proof matching the booking name</li>
            <li>Turf rules and regulations must be followed</li>
          </ul>
        </div>

        <div className="cancellation-policy">
          <h3>Cancellation Policy</h3>
          <ul>
            <li>Full refund if cancelled 24 hours before booking</li>
            <li>50% refund if cancelled 12 hours before booking</li>
            <li>No refund for cancellations within 2 hours of booking</li>
            <li>In case of rain, credit will be provided for future booking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;