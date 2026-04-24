import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBooking } from './bookingService';
import QrCodeDisplay from './QrCodeDisplay';

const badgeClass = {
  APPROVED:  'bg-[#e8f5e9] text-[#2e7d32]',
  PENDING:   'bg-[#fff3e0] text-[#e65100]',
  REJECTED:  'bg-[#ffebee] text-[#d32f2f]',
  CANCELLED: 'bg-[#f5f5f5] text-[#666]',
};

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

  const stateClass = 'max-w-[900px] mx-auto p-8 flex flex-col items-center justify-center min-h-[400px] gap-8 text-center';

  if (loading) return <div className={stateClass}>Loading booking details…</div>;

  if (error) {
    return (
      <div className={`${stateClass} text-[#d32f2f]`}>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="ghost-btn">Go Back</button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`${stateClass} text-[#d32f2f]`}>
        <p>Booking not found</p>
        <button onClick={() => navigate(-1)} className="ghost-btn">Go Back</button>
      </div>
    );
  }

  const isApproved = booking.status === 'APPROVED';

  return (
    <div className="max-w-[900px] mx-auto p-8">
      <button
        onClick={() => navigate(-1)}
        className="bg-transparent border-none text-[#1976d2] cursor-pointer text-base px-4 py-2 mb-4 hover:underline"
      >
        ← Back to Bookings
      </button>

      <div className="bg-white rounded-lg p-8 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <h1 className="mt-0 text-[#333] border-b-2 border-[#f0f0f0] pb-4">Booking Details</h1>

        <div className="flex flex-col gap-8">
          <div className="border-b border-[#f0f0f0] pb-4">
            <h2 className="m-0 mb-1 text-[#333] text-2xl">{booking.resourceName}</h2>
            <p className="text-[#666] m-0 text-sm">Booking ID: {bookingId}</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#666] text-sm uppercase tracking-wider">Status</label>
              <span className={`inline-block px-4 py-2 rounded-[20px] text-sm font-semibold w-fit ${badgeClass[booking.status] || 'bg-[#f5f5f5] text-[#666]'}`}>
                {booking.status}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#666] text-sm uppercase tracking-wider">Start Time</label>
              <span className="text-[#333]">{new Date(booking.startTime).toLocaleString()}</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#666] text-sm uppercase tracking-wider">End Time</label>
              <span className="text-[#333]">{new Date(booking.endTime).toLocaleString()}</span>
            </div>

            {booking.notes && (
              <div className="flex flex-col gap-2 col-span-full">
                <label className="font-semibold text-[#666] text-sm uppercase tracking-wider">Notes</label>
                <span className="text-[#333]">{booking.notes}</span>
              </div>
            )}
          </div>

          {isApproved && (
            <div className="bg-[#f9f9f9] border border-[#f0f0f0] rounded-lg p-8 text-center">
              <h3 className="mt-0 text-[#333]">Check-In QR Code</h3>
              <p className="text-[#666] text-sm my-4">Present this QR code at check-in</p>
              <QrCodeDisplay bookingId={bookingId} token={token} />
            </div>
          )}

          {!isApproved && (
            <div className="p-4 rounded-lg bg-[#e3f2fd] text-[#1565c0] border-l-4 border-[#1565c0]">
              <p className="m-0">QR code will be available once your booking is approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
