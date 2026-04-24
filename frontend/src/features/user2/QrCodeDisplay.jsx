import React, { useState, useEffect } from 'react';
import { getQrCode } from './bookingService';

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

  const base = 'flex flex-col items-center gap-4 p-8 rounded-lg';

  if (loading)
    return <div className={`${base} bg-[#f5f5f5] min-h-[300px] justify-center font-medium text-[#666]`}>Generating QR code…</div>;

  if (error)
    return <div className={`${base} bg-[#ffebee] min-h-[300px] justify-center font-medium text-[#d32f2f]`}>{error}</div>;

  if (!qrCode)
    return <div className={`${base} bg-[#f5f5f5] min-h-[300px] justify-center font-medium text-[#666]`}>No QR code available</div>;

  return (
    <div className={`${base} bg-[#f5f5f5]`}>
      <img
        src={qrCode}
        alt="Booking QR Code"
        className="max-w-[300px] w-full border-2 border-[#ddd] rounded p-4 bg-white"
      />
      <p className="text-[#666] text-sm text-center m-0">Show this QR code for check-in</p>
    </div>
  );
}
