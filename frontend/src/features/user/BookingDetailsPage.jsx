import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBooking } from './bookingService';
import QrCodeDisplay from './QrCodeDisplay';
import '../styles/BookingDetailsPage.css';

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId || !token) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await getBooking(bookingId, token);
        setBooking(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, token]);

  if (loading) {
    return <div className="booking-details-page loading">Loading booking details...</div>;
  }

  if (error) {
    return (
      <div className="booking-details-page error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-details-page empty">
        <p>Booking not found</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  const isApproved = booking.status === 'APPROVED';
  const startDate = new Date(booking.startTime).toLocaleString();
  const endDate = new Date(booking.endTime).toLocaleString();

  return (
    <div className="booking-details-page">
      <button onClick={() => navigate(-1)} className="btn btn-link">
        ← Back to Bookings
      </button>

      <div className="booking-details-container">
        <h1>Booking Details</h1>

        <div className="booking-info">
          <div className="info-section">
            <h2>{booking.resourceName}</h2>
            <p className="booking-id">Booking ID: {bookingId}</p>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label>Status</label>
              <span className={`badge badge-${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </div>

            <div className="info-item">
              <label>Start Time</label>
              <span>{startDate}</span>
            </div>

            <div className="info-item">
              <label>End Time</label>
              <span>{endDate}</span>
            </div>

            {booking.notes && (
              <div className="info-item full-width">
                <label>Notes</label>
                <span>{booking.notes}</span>
              </div>
            )}
          </div>

          {isApproved && (
            <div className="qr-code-section">
              <h3>Check-In QR Code</h3>
              <p className="qr-instructions">
                Present this QR code at check-in
              </p>
              <QrCodeDisplay bookingId={bookingId} token={token} />
            </div>
          )}

          {!isApproved && (
            <div className="alert alert-info">
              <p>QR code will be available once your booking is approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
