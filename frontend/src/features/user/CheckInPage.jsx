import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import QrCodeScanner from './QrCodeScanner';
import '../styles/CheckInPage.css';

export default function CheckInPage() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQrCodeScanned = async (data) => {
    try {
      // Parse QR code data: "BOOKING:{bookingId}:{userId}"
      const [type, bookingId, userId] = data.split(':');
      
      if (type !== 'BOOKING') {
        setError('Invalid QR code. Please scan a valid booking QR code.');
        return;
      }

      setScannedData({ bookingId, userId });
      setShowScanner(false);
      
      // Perform check-in
      await performCheckIn(bookingId, userId);
    } catch (err) {
      setError('Failed to parse QR code: ' + err.message);
    }
  };

  const performCheckIn = async (bookingId, userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/technician/bookings/${bookingId}/check-in`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Check-in failed');
      }

      setCheckInResult({
        success: true,
        bookingId: result.bookingId,
        resourceName: result.resourceName,
        userId: result.userId,
        checkedInAt: new Date(result.checkedInAt).toLocaleString()
      });
    } catch (err) {
      setError(err.message || 'Failed to perform check-in');
      setCheckInResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setScannedData(null);
    setCheckInResult(null);
    setError(null);
  };

  return (
    <div className="check-in-page">
      <h1>Booking Check-In</h1>
      
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {checkInResult && (
        <div className="alert alert-success">
          <h3>✓ Check-in Successful</h3>
          <p><strong>Resource:</strong> {checkInResult.resourceName}</p>
          <p><strong>Booking ID:</strong> {checkInResult.bookingId}</p>
          <p><strong>Checked in at:</strong> {checkInResult.checkedInAt}</p>
          <button onClick={resetForm} className="btn btn-primary mt-3">
            Scan Next Booking
          </button>
        </div>
      )}

      {!checkInResult && !showScanner && (
        <div className="check-in-controls">
          <button
            onClick={() => setShowScanner(true)}
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Scan QR Code'}
          </button>
        </div>
      )}

      {showScanner && (
        <QrCodeScanner
          onScan={handleQrCodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
