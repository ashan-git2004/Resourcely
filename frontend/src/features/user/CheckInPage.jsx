import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import QrCodeScanner from "./QrCodeScanner";
import { Alert, buttonStyles, FullBleedShell, PageHeader, SectionCard } from "./UserUi";

export default function CheckInPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleQrCodeScanned(data) {
    try {
      const [type, bookingId, userId] = data.split(":");
      if (type !== "BOOKING") {
        setError("Invalid QR code. Please scan a valid booking QR code.");
        return;
      }
      setScannedData({ bookingId, userId });
      setShowScanner(false);
      await performCheckIn(bookingId, userId);
    } catch (scanError) {
      setError(`Failed to parse QR code: ${scanError.message}`);
    }
  }

  // async function performCheckIn(bookingId, userId) {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const response = await fetch(`/api/technician/bookings/${bookingId}/check-in`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ userId }),
  //     });
  //     const result = await response.json();
  //     console.log("Check-in response:", result);
  //     if (!response.ok) throw new Error(result.message || "Check-in failed");

  //     setCheckInResult({
  //       success: true,
  //       bookingId: result.bookingId,
  //       resourceName: result.resourceName,
  //       userId: result.userId,
  //       checkedInAt: new Date(result.checkedInAt).toLocaleString(),
  //     });
  //   } catch (checkInError) {
  //     setError(checkInError.message || "Failed to perform check-in");
  //     setCheckInResult(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleQrCodeScanned(data) {
    try {
      const [type, bookingId, userId] = data.split(":");
      if (type !== "BOOKING") {
        setError("Invalid QR code. Please scan a valid booking QR code.");
        return;
      }

      setScannedData({ bookingId, userId });
      setShowScanner(false);
      await performCheckIn(data);
    } catch (scanError) {
      setError(`Failed to parse QR code: ${scanError.message}`);
    }
  }

  // async function performCheckIn(rawQrData) {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     const response = await fetch("/api/user/bookings/verify-qr", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ qrData: rawQrData }),
  //     });

  //     const result = await response.json();
  //     if (!response.ok) throw new Error(result.message || "Check-in failed");

  //     setCheckInResult({
  //       success: true,
  //       bookingId: result.id,
  //       resourceName: result.resourceName,
  //       userId: result.userId,
  //       checkedInAt: new Date(result.checkedInAt).toLocaleString(),
  //     });
  //   } catch (err) {
  //     setError(err.message || "Failed to perform check-in");
  //     setCheckInResult(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function performCheckIn(rawQrData) {
    try {
      setLoading(true);
      setError("");

      console.log("Calling backend...");
      console.log("URL:", "/api/user/bookings/verify-qr");
      console.log("Payload:", { qrData: rawQrData });

      const response = await fetch("/api/user/bookings/verify-qr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData: rawQrData }),
      });

      console.log("HTTP status:", response.status);

      const result = await response.json();
      console.log("Backend response body:", result);

      if (!response.ok) throw new Error(result.message || "Check-in failed");

      setCheckInResult({
        success: true,
        bookingId: result.id,
        resourceName: result.resourceName,
        userId: result.userId,
        checkedInAt: new Date(result.checkedInAt).toLocaleString(),
      });
    } catch (err) {
      console.error("Check-in error:", err);
      setError(err.message || "Failed to perform check-in");
      setCheckInResult(null);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setScannedData(null);
    setCheckInResult(null);
    setError("");
  }

  return (
    <FullBleedShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Technician workspace"
          title="Booking check-in"
          description="Scan approved booking QR codes and verify access in a fast, field-friendly workflow."
          actions={
            !checkInResult ? (
              <button className={buttonStyles.primary} onClick={() => setShowScanner(true)} disabled={loading}>
                {loading ? "Processing…" : "Scan QR code"}
              </button>
            ) : null
          }
          aside={
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Before scanning</p>
              <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li>• Use the device camera in good lighting.</li>
                <li>• Ask the user to open the QR code from their approved booking.</li>
                <li>• Start a new scan after each successful check-in.</li>
              </ul>
            </div>
          }
        />

        {error ? <Alert tone="error">{error}</Alert> : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Scanner"
            description="Launch the camera scanner whenever you are ready to verify a booking."
            actions={
              !checkInResult ? (
                <button className={buttonStyles.primary} onClick={() => setShowScanner(true)} disabled={loading}>
                  {loading ? "Processing…" : "Open scanner"}
                </button>
              ) : null
            }
          >
            {checkInResult ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Check-in successful</h3>
                <div className="mt-4 space-y-2 text-sm text-emerald-900 dark:text-emerald-200">
                  <p><strong>Resource:</strong> {checkInResult.resourceName}</p>
                  <p><strong>Booking ID:</strong> {checkInResult.bookingId}</p>
                  <p><strong>User ID:</strong> {checkInResult.userId}</p>
                  <p><strong>Checked in at:</strong> {checkInResult.checkedInAt}</p>
                </div>
                <div className="mt-6">
                  <button className={buttonStyles.primary} onClick={resetForm}>Scan next booking</button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-zinc-900">📷</div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">Ready to scan</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Open the scanner when the attendee is ready to present their booking QR code.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Latest scan" description="Useful for quick verification while processing multiple arrivals.">
            {scannedData ? (
              <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <p><strong>Booking ID:</strong> {scannedData.bookingId}</p>
                <p><strong>User ID:</strong> {scannedData.userId}</p>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">No QR code has been scanned in this session yet.</p>
            )}
          </SectionCard>
        </div>
      </div>

      {showScanner ? <QrCodeScanner onScan={handleQrCodeScanned} onClose={() => setShowScanner(false)} /> : null}
    </FullBleedShell>
  );
}
