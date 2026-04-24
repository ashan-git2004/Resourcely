import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBooking } from "./bookingService";
import QrCodeDisplay from "./QrCodeDisplay";
import { Alert, Badge, buttonStyles, FullBleedShell, InfoList, PageHeader, SectionCard } from "./UserUi";

function statusTone(status) {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "rejected";
    case "CANCELLED":
      return "cancelled";
    default:
      return "neutral";
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId || !token) return;
      setLoading(true);
      try {
        const data = await getBooking(bookingId, token);
        setBooking(data);
        setError("");
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId, token]);

  const approved = booking?.status === "APPROVED";

  return (
    <FullBleedShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Booking details"
          title={booking?.resourceName || "Booking details"}
          description="Review the booking schedule, status, and the QR code that is used during check-in once the booking has been approved."
          actions={
            <button className={buttonStyles.secondary} onClick={() => navigate(-1)}>
              ← Back to bookings
            </button>
          }
          aside={
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Current booking</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={statusTone(booking?.status)}>{booking?.status || "Loading"}</Badge>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Booking #{bookingId}</span>
              </div>
            </div>
          }
        />

        {loading ? (
          <SectionCard title="Loading booking" description="Fetching the latest booking details.">
            <div className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
          </SectionCard>
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : !booking ? (
          <Alert tone="error">Booking not found.</Alert>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="Booking summary" description="Everything you need to verify this reservation at a glance.">
              <InfoList
                items={[
                  { label: "Status", value: <Badge tone={statusTone(booking.status)}>{booking.status}</Badge> },
                  { label: "Start time", value: formatDate(booking.startTime) },
                  { label: "End time", value: formatDate(booking.endTime) },
                  { label: "Created", value: formatDate(booking.createdAt) },
                  { label: "Expected attendees", value: booking.expectedAttendees || "—" },
                  { label: "Admin note", value: booking.adminReason || "—" },
                ]}
              />

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Purpose</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-900 dark:text-zinc-100">{booking.purpose || booking.notes || "No purpose provided."}</p>
              </div>
            </SectionCard>

            <SectionCard
              title="Check-in QR"
              description={approved ? "Present this QR code when arriving for the booking." : "The QR code becomes available after an admin approves the booking."}
            >
              {approved ? (
                <QrCodeDisplay bookingId={bookingId} token={token} />
              ) : (
                <Alert tone="info">QR code will be available once this booking is approved.</Alert>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </FullBleedShell>
  );
}
