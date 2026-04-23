import { useEffect, useState } from "react";
import {
  getAllBookings,
  getBookingsByStatus,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  adminCancelBooking,
  checkConflicts,
} from "./bookingService";
import { useAuth } from "../../context/AuthContext";

export default function AdminBookingsPage() {
  const { auth } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [busyBookingId, setBusyBookingId] = useState("");
  const [actionModal, setActionModal] = useState(null); // { bookingId, action, reason, conflicts }
  const [checkedConflicts, setCheckedConflicts] = useState(false);

  const bookingStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const data =
        filterStatus === "ALL"
          ? await getAllBookings(auth?.token)
          : await getBookingsByStatus(filterStatus, auth?.token);
      setBookings(data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  async function handleApprove(bookingId, reason) {
    setBusyBookingId(bookingId);
    setError("");
    setSuccessMessage("");
    try {
      await approveBooking(bookingId, reason, auth?.token);
      setSuccessMessage("✓ Booking approved successfully");
      setActionModal(null);
      setTimeout(() => loadBookings(), 800);
    } catch (approveError) {
      setError(approveError.message);
    } finally {
      setBusyBookingId("");
    }
  }

  async function handleReject(bookingId, reason) {
    setBusyBookingId(bookingId);
    setError("");
    setSuccessMessage("");
    try {
      await rejectBooking(bookingId, reason, auth?.token);
      setSuccessMessage("✓ Booking rejected successfully");
      setActionModal(null);
      setTimeout(() => loadBookings(), 800);
    } catch (rejectError) {
      setError(rejectError.message);
    } finally {
      setBusyBookingId("");
    }
  }

  async function handleCancel(bookingId, reason) {
    setBusyBookingId(bookingId);
    setError("");
    setSuccessMessage("");
    try {
      await adminCancelBooking(bookingId, reason, auth?.token);
      setSuccessMessage("✓ Booking cancelled successfully");
      setActionModal(null);
      setTimeout(() => loadBookings(), 800);
    } catch (cancelError) {
      setError(cancelError.message);
    } finally {
      setBusyBookingId("");
    }
  }

  function openActionModal(bookingId, action) {
    const booking = bookings.find((b) => b.id === bookingId);
    setActionModal({ bookingId, action, reason: "", conflicts: [] });
    setCheckedConflicts(false);

    // If approving, check for conflicts
    if (action === "approve" && booking) {
      setBusyBookingId(bookingId);
      checkConflicts(booking.resourceId, booking.startTime, booking.endTime, auth?.token)
        .then((conflicts) => {
          setActionModal((prev) => ({
            ...prev,
            conflicts: conflicts || [],
          }));
          setCheckedConflicts(true);
        })
        .catch((err) => {
          console.error("Error checking conflicts:", err);
          setCheckedConflicts(true);
        })
        .finally(() => {
          setBusyBookingId("");
        });
    }
  }

  function closeActionModal() {
    setActionModal(null);
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusColor(status) {
    switch (status) {
      case "PENDING":
        return "#fff3cd";
      case "APPROVED":
        return "#d4edda";
      case "REJECTED":
        return "#f8d7da";
      case "CANCELLED":
        return "#e2e3e5";
      default:
        return "#f8f9fa";
    }
  }

  return (
    <section className="card">
      <h1>Booking Management</h1>
      <p className="muted">Review and approve booking requests</p>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="filter-container" style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input"
          style={{ maxWidth: "200px" }}
        >
          <option value="ALL">All Bookings</option>
          {bookingStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="muted">Loading bookings...</p>}

      {!loading && bookings.length === 0 && (
        <p className="success">✓ No bookings found.</p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Resource</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.userName}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {booking.userId?.substring(0, 8)}...
                    </div>
                  </td>
                  <td>
                    <strong>{booking.resourceName}</strong>
                  </td>
                  <td>{formatDateTime(booking.startTime)}</td>
                  <td>{formatDateTime(booking.endTime)}</td>
                  <td>{booking.purpose || "—"}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        backgroundColor: getStatusColor(booking.status),
                        color: booking.status === "PENDING" ? "#856404" : "inherit",
                      }}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => openActionModal(booking.id, "approve")}
                          className="secondary-btn"
                          disabled={busyBookingId !== ""}
                          style={{ padding: "0.4rem 0.5rem", fontSize: "0.8rem", width: "auto" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(booking.id, "reject")}
                          className="danger-btn"
                          disabled={busyBookingId !== ""}
                          style={{ padding: "0.4rem 0.5rem", fontSize: "0.8rem", width: "auto" }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === "APPROVED" && (
                      <button
                        onClick={() => openActionModal(booking.id, "cancel")}
                        className="ghost-btn"
                        disabled={busyBookingId !== ""}
                        style={{ padding: "0.4rem 0.5rem", fontSize: "0.8rem", width: "auto" }}
                      >
                        Cancel
                      </button>
                    )}
                    {booking.adminReason && (
                      <div className="muted" style={{ fontSize: "0.75rem", marginTop: "0.3rem" }}>
                        <strong>Reason:</strong> {booking.adminReason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {actionModal.action === "approve" && "Approve Booking"}
              {actionModal.action === "reject" && "Reject Booking"}
              {actionModal.action === "cancel" && "Cancel Booking"}
            </h2>

            {/* Conflict Warning for Approval */}
            {actionModal.action === "approve" && checkedConflicts && actionModal.conflicts && actionModal.conflicts.length > 0 && (
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffc107",
                  borderRadius: "4px",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <strong style={{ color: "#856404" }}>⚠️ Conflict Warning</strong>
                <p style={{ margin: "0.5rem 0 0 0", color: "#856404" }}>
                  This booking conflicts with {actionModal.conflicts.length} approved booking(s):
                </p>
                <ul style={{ margin: "0.5rem 0 0 1.5rem", color: "#856404" }}>
                  {actionModal.conflicts.map((conflict) => (
                    <li key={conflict.id}>
                      <strong>{conflict.resourceName}</strong> - {formatDateTime(conflict.startTime)} to {formatDateTime(conflict.endTime)}
                    </li>
                  ))}
                </ul>
                <p style={{ margin: "0.5rem 0 0 0", color: "#856404", fontSize: "0.9rem" }}>
                  <strong>Action:</strong> Please reject this booking or have the user reschedule.
                </p>
              </div>
            )}

            {actionModal.action === "approve" && checkedConflicts && (!actionModal.conflicts || actionModal.conflicts.length === 0) && (
              <div
                style={{
                  backgroundColor: "#d4edda",
                  border: "1px solid #28a745",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  color: "#155724",
                }}
              >
                ✓ No conflicts detected. Safe to approve.
              </div>
            )}

            {actionModal.action === "approve" && !checkedConflicts && (
              <p style={{ color: "#6c757d", marginBottom: "1rem" }}>Checking for conflicts...</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (actionModal.action === "approve") {
                  handleApprove(actionModal.bookingId, actionModal.reason);
                } else if (actionModal.action === "reject") {
                  handleReject(actionModal.bookingId, actionModal.reason);
                } else if (actionModal.action === "cancel") {
                  handleCancel(actionModal.bookingId, actionModal.reason);
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="reason">
                  {actionModal.action === "reject" ? "Rejection Reason *" : "Reason (optional)"}
                </label>
                <textarea
                  id="reason"
                  value={actionModal.reason}
                  onChange={(e) =>
                    setActionModal({ ...actionModal, reason: e.target.value })
                  }
                  placeholder={
                    actionModal.action === "reject"
                      ? "Explain why this booking is being rejected..."
                      : "Add a note about this action..."
                  }
                  className="form-input"
                  style={{ minHeight: "100px", width: "100%" }}
                  required={actionModal.action === "reject"}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={busyBookingId !== "" || (actionModal.action === "approve" && !checkedConflicts)}
                  style={{ flex: 1, width: "auto" }}
                >
                  {busyBookingId ? "Processing..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="ghost-btn"
                  disabled={busyBookingId !== ""}
                  style={{ flex: 1, width: "auto" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .filter-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-container label {
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(48, 35, 8, 0.15);
          color: #2c2c2c;
        }

        .modal-content h2 {
          margin-top: 0;
          color: #1a1a1a;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333333;
        }

        textarea {
          padding: 0.6rem 0.7rem;
          border: 1px solid #baa97e;
          border-radius: 9px;
          font-family: inherit;
          background: #fff;
          resize: vertical;
          color: #2c2c2c;
        }

        textarea::placeholder {
          color: #999999;
        }

        textarea:focus {
          outline: 2px solid #6fa89f;
          outline-offset: 1px;
        }

        .danger-btn {
          border-color: #c41e3a;
          color: #c41e3a;
          background: transparent;
          padding: 0.4rem 0.5rem;
          font-size: 0.8rem;
          width: auto;
        }

        .danger-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}