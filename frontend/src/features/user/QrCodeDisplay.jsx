import { useEffect, useState } from "react";
import { getQrCode } from "./bookingService";
import { Alert } from "./UserUi";

export default function QrCodeDisplay({ bookingId, token }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQrCode() {
      if (!bookingId || !token) return;
      try {
        setLoading(true);
        const data = await getQrCode(bookingId, token);
        setQrCode(data.qrCodeData);
        setError("");
      } catch (fetchError) {
        setError(fetchError.message || "Failed to generate QR code.");
        setQrCode(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQrCode();
  }, [bookingId, token]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50/80 p-8 text-center dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-zinc-200 border-t-sky-500 dark:border-zinc-700 dark:border-t-sky-400" />
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">Generating QR code…</p>
      </div>
    );
  }

  if (error) {
    return <Alert tone="error">{error}</Alert>;
  }

  if (!qrCode) {
    return <Alert tone="info">No QR code is available for this booking yet.</Alert>;
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 text-center dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <img src={qrCode} alt="Booking QR Code" className="aspect-square w-full max-w-[280px] rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800" />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">Ready for check-in</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Show this code to campus staff when arriving for your booking.</p>
        </div>
      </div>
    </div>
  );
}
