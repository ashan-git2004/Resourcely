import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import QrCodeScanner from './QrCodeScanner';

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
      const [type, bookingId, userId] = data.split(':');
      if (type !== 'BOOKING') {
        setError('Invalid QR code. Please scan a valid booking QR code.');
        return;
      }
      setScannedData({ bookingId, userId });
      setShowScanner(false);
      await performCheckIn(bookingId, userId);
    } catch (err) {
      setError('Failed to parse QR code: ' + err.message);
    }
  };

  const performCheckIn = async (bookingId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/technician/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Check-in failed');
      setCheckInResult({
        success: true,
        bookingId: result.bookingId,
        resourceName: result.resourceName,
        userId: result.userId,
        checkedInAt: new Date(result.checkedInAt).toLocaleString(),
      });
    } catch (err) {
      setError(err.message || 'Failed to perform check-in');
      setCheckInResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setScannedData(null); setCheckInResult(null); setError(null); };

  return (
    <div className="max-w-[800px] mx-auto p-8">
      <h1 className="text-[#333] mb-8 text-center">Booking Check-In</h1>

      {error && (
        <div className="flex justify-between items-start gap-4 p-6 rounded-lg bg-[#ffebee] text-[#d32f2f] border-l-4 border-[#d32f2f] mb-8">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="bg-transparent border-none text-2xl cursor-pointer p-0 leading-none flex-shrink-0 hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {checkInResult && (
        <div className="p-6 rounded-lg bg-[#e8f5e9] text-[#2e7d32] border-l-4 border-[#2e7d32] mb-8">
          <h3 className="m-0 mb-2">✓ Check-in Successful</h3>
          <p className="m-0 my-1"><strong>Resource:</strong> {checkInResult.resourceName}</p>
          <p className="m-0 my-1"><strong>Booking ID:</strong> {checkInResult.bookingId}</p>
          <p className="m-0 my-1"><strong>Checked in at:</strong> {checkInResult.checkedInAt}</p>
          <button onClick={resetForm} className="primary-btn mt-4">
            Scan Next Booking
          </button>
        </div>
      )}

      {!checkInResult && !showScanner && (
        <div className="flex justify-center gap-4 my-8">
          <button
            onClick={() => setShowScanner(true)}
            className="primary-btn px-8 py-4 text-[1.1rem] min-w-[300px]"
            disabled={loading}
          >
            {loading ? 'Processing…' : 'Scan QR Code'}
          </button>
        </div>
      )}

      {showScanner && (
        <QrCodeScanner onScan={handleQrCodeScanned} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
