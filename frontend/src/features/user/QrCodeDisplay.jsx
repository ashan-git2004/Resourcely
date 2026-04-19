import React, { useState, useEffect } from 'react';
import { getQrCode } from './bookingService';
import '../styles/QrCodeDisplay.css';

export default function QrCodeDisplay({ bookingId, token }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId || !token) return;

    const fetchQrCode = async () => {
      try {
        setLoading(true);
        const data = await getQrCode(bookingId, token);
        setQrCode(data.qrCodeData);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to generate QR code');
        setQrCode(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [bookingId, token]);

  if (loading) {
    return <div className="qr-code-display loading">Generating QR code...</div>;
  }

  if (error) {
    return <div className="qr-code-display error">{error}</div>;
  }

  if (!qrCode) {
    return <div className="qr-code-display empty">No QR code available</div>;
  }

  return (
    <div className="qr-code-display">
      <img 
        src={qrCode} 
        alt="Booking QR Code" 
        className="qr-code-image"
      />
      <p className="qr-code-instructions">
        Show this QR code for check-in
      </p>
    </div>
  );
}
