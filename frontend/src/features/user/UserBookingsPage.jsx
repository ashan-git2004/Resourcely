import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createBooking,
  getUserBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
} from "./bookingService";

const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const RESOURCE_TYPES = [
  "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT",
  "LIBRARY", "COMPUTER_LAB", "AUDITORIUM", "SEMINAR_ROOM",
  "PARKING", "SPORTS_FACILITY",
];

function statusColor(status) {
  switch (status) {
    case "PENDING": return { bg: "#fef9c3", color: "#854d0e" };
    case "APPROVED": return { bg: "#d1fae5", color: "#065f46" };
    case "REJECTED": return { bg: "#fee2e2", color: "#991b1b" };
    case "CANCELLED": return { bg: "#e5e7eb", color: "#374151" };
    default: return { bg: "#f3f4f6", color: "#374151" };
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function UserBookingsPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Create booking modal
  const [createModal, setCreateModal] = useState(null); // { resourceId, startTime, endTime, purpose, expectedAttendees }

  // Edit booking modal
  const [editModal, setEditModal] = useState(null); // { bookingId, purpose, startTime, endTime, expectedAttendees }

  // Detail panel
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Server-side: filters by resourceType/location (requires DB join).
  // Status and date range are applied client-side after fetch for instant, reliable filtering.
  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const filters = {
        resourceType: filterType === "ALL" ? null : filterType,
        location: filterLocation.trim() || null,
      };
      const data = await getUserBookings(filters, auth?.token);
      setBookings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  // Client-side filtering for status and date range — instant, no round-trip needed.
  // Dates are compared using the LOCAL date string (YYYY-MM-DD) to avoid UTC offset issues
  // (a booking at 3 AM local time may be stored as the previous day in UTC).
  const displayBookings = useMemo(() => {
    let result = bookings;
    if (filterStatus !== "ALL") {
      result = result.filter((b) => b.status === filterStatus);
    }
    if (filterStartDate) {
      result = result.filter((b) => {
        const localDate = new Date(b.startTime).toLocaleDateString("sv"); // "sv" locale → YYYY-MM-DD
        return localDate >= filterStartDate;
      });
    }
    if (filterEndDate) {
      result = result.filter((b) => {
        const localDate = new Date(b.startTime).toLocaleDateString("sv");
        return localDate <= filterEndDate;
      });
    }
    return result;
  }, [bookings, filterStatus, filterStartDate, filterEndDate]);

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  async function handleCreateBooking() {
    if (!createModal) return;
    setBusyId("create");
    setError("");
    try {
      const payload = {
        resourceId: createModal.resourceId,
        startTime: createModal.startTime,
        endTime: createModal.endTime,
        purpose: createModal.purpose,
        expectedAttendees: createModal.expectedAttendees || null,
      };
      await createBooking(payload, auth?.token);
      showSuccess("✓ Booking request created successfully");
      setCreateModal(null);
      setTimeout(() => loadBookings(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleUpdateBooking() {
    if (!editModal) return;
    setBusyId(editModal.bookingId);
    setError("");
    try {
      const payload = {
        purpose: editModal.purpose || undefined,
        startTime: editModal.startTime || undefined,
        endTime: editModal.endTime || undefined,
        expectedAttendees: editModal.expectedAttendees || undefined,
      };
      await updateBooking(editModal.bookingId, payload, auth?.token);
      showSuccess("✓ Booking updated successfully");
      setEditModal(null);
      if (selectedBooking?.id === editModal.bookingId) setSelectedBooking(null);
      setTimeout(() => loadBookings(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteBooking(bookingId) {
    if (!window.confirm("Delete this booking? This cannot be undone.")) return;
    setBusyId(bookingId);
    setError("");
    try {
      await deleteBooking(bookingId, auth?.token);
      showSuccess("✓ Booking deleted");
      if (selectedBooking?.id === bookingId) setSelectedBooking(null);
      setTimeout(() => loadBookings(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;
    setBusyId(bookingId);
    setError("");
    try {
      await cancelBooking(bookingId, auth?.token);
      showSuccess("✓ Booking cancelled");
      if (selectedBooking?.id === bookingId) setSelectedBooking(null);
      setTimeout(() => loadBookings(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="card">
      <h1>My Bookings</h1>
      <p className="muted">Create and manage your resource booking requests</p>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setCreateModal({ resourceId: "", startTime: "", endTime: "", purpose: "", expectedAttendees: null })}
          className="primary-btn"
          style={{ width: "auto" }}
        >
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bookings-filter-panel">
        <div className="filter-row">
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input filter-input">
              <option value="ALL">All Statuses</option>
              {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Resource Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="form-input filter-input">
              <option value="ALL">All Types</option>
              {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="e.g. Building A"
              className="form-input filter-input"
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date (from)</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="form-input filter-input" />
          </div>
          <div className="filter-group">
            <label>End Date (to)</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="form-input filter-input" />
          </div>
          <div className="filter-group filter-actions">
            <button onClick={loadBookings} className="primary-btn filter-btn">Apply</button>
            <button
              onClick={() => { setFilterStatus("ALL"); setFilterType("ALL"); setFilterLocation(""); setFilterStartDate(""); setFilterEndDate(""); }}
              className="ghost-btn filter-btn"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="muted">Loading bookings...</p>}

      {!loading && displayBookings.length === 0 && (
        <p className="success">✓ No bookings found.</p>
      )}

      {!loading && displayBookings.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date & Time</th>
                <th>Purpose</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayBookings.map((booking) => {
                const sc = statusColor(booking.status);
                const isBusy = busyId === booking.id;
                const isPending = booking.status === "PENDING";
                const isApproved = booking.status === "APPROVED";
                return (
                  <tr key={booking.id}>
                    <td>
                      <button
                        className="ticket-title-btn"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        {booking.resourceName || booking.resourceId}
                      </button>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                    </td>
                    <td style={{ fontSize: "0.85rem", maxWidth: "200px" }}>
                      {booking.purpose}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {booking.expectedAttendees || "—"}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {isPending && (
                        <>
                          <button
                            onClick={() => setEditModal({
                              bookingId: booking.id,
                              purpose: booking.purpose,
                              startTime: booking.startTime,
                              endTime: booking.endTime,
                              expectedAttendees: booking.expectedAttendees,
                            })}
                            disabled={isBusy || busyId !== ""}
                            className="secondary-btn action-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={isBusy || busyId !== ""}
                            className="danger-btn action-btn"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {isApproved && (
                        <>
                          <button
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            className="primary-btn action-btn"
                          >
                            View QR
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isBusy || busyId !== ""}
                            className="danger-btn action-btn"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.adminReason && (
                        <div className="muted" style={{ fontSize: "0.75rem", marginTop: "0.3rem" }}>
                          <strong>Reason:</strong> {booking.adminReason}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Detail Panel */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content detail-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ margin: 0 }}>{selectedBooking.resourceName || selectedBooking.resourceId}</h2>
              <button className="ghost-btn" style={{ padding: "0.3rem 0.6rem", width: "auto" }} onClick={() => setSelectedBooking(null)}>✕</button>
            </div>

            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="badge" style={{ backgroundColor: statusColor(selectedBooking.status).bg, color: statusColor(selectedBooking.status).color }}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Purpose</span>
                <span>{selectedBooking.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Time</span>
                <span>{formatDate(selectedBooking.startTime)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">End Time</span>
                <span>{formatDate(selectedBooking.endTime)}</span>
              </div>
              {selectedBooking.expectedAttendees && (
                <div className="detail-row">
                  <span className="detail-label">Expected Attendees</span>
                  <span>{selectedBooking.expectedAttendees}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span>{formatDate(selectedBooking.createdAt)}</span>
              </div>
              {selectedBooking.approvedAt && (
                <div className="detail-row">
                  <span className="detail-label">Approved</span>
                  <span>{formatDate(selectedBooking.approvedAt)}</span>
                </div>
              )}
              {selectedBooking.adminReason && (
                <div className="detail-row">
                  <span className="detail-label">Admin Reason</span>
                  <span>{selectedBooking.adminReason}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
              {selectedBooking.status === "PENDING" && (
                <>
                  <button
                    onClick={() => { setSelectedBooking(null); setEditModal({ bookingId: selectedBooking.id, purpose: selectedBooking.purpose, startTime: selectedBooking.startTime, endTime: selectedBooking.endTime, expectedAttendees: selectedBooking.expectedAttendees }); }}
                    className="secondary-btn"
                    style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setSelectedBooking(null); handleDeleteBooking(selectedBooking.id); }}
                    className="danger-btn"
                    style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                  >
                    Delete
                  </button>
                </>
              )}
              {selectedBooking.status === "APPROVED" && (
                <button
                  onClick={() => { setSelectedBooking(null); handleCancelBooking(selectedBooking.id); }}
                  className="danger-btn"
                  style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {createModal !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Booking</h2>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateBooking(); }}>
              <div className="form-group">
                <label htmlFor="resourceId">Resource ID *</label>
                <input
                  id="resourceId"
                  type="text"
                  value={createModal.resourceId}
                  onChange={(e) => setCreateModal({ ...createModal, resourceId: e.target.value })}
                  placeholder="Resource ID"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  id="startTime"
                  type="datetime-local"
                  value={createModal.startTime ? new Date(createModal.startTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setCreateModal({ ...createModal, startTime: new Date(e.target.value).toISOString() })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  id="endTime"
                  type="datetime-local"
                  value={createModal.endTime ? new Date(createModal.endTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setCreateModal({ ...createModal, endTime: new Date(e.target.value).toISOString() })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose *</label>
                <textarea
                  id="purpose"
                  value={createModal.purpose}
                  onChange={(e) => setCreateModal({ ...createModal, purpose: e.target.value })}
                  placeholder="Why are you booking this resource?"
                  className="form-input"
                  style={{ minHeight: "70px", width: "100%" }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expectedAttendees">Expected Attendees (optional)</label>
                <input
                  id="expectedAttendees"
                  type="number"
                  value={createModal.expectedAttendees || ""}
                  onChange={(e) => setCreateModal({ ...createModal, expectedAttendees: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Number of attendees"
                  className="form-input"
                  min="1"
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={busyId !== ""}
                  style={{ flex: 1, width: "auto" }}
                >
                  {busyId ? "Creating..." : "Create Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModal(null)}
                  className="ghost-btn"
                  disabled={busyId !== ""}
                  style={{ flex: 1, width: "auto" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editModal !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Booking (PENDING)</h2>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateBooking(); }}>
              <div className="form-group">
                <label htmlFor="editPurpose">Purpose</label>
                <textarea
                  id="editPurpose"
                  value={editModal.purpose}
                  onChange={(e) => setEditModal({ ...editModal, purpose: e.target.value })}
                  placeholder="Why are you booking this resource?"
                  className="form-input"
                  style={{ minHeight: "70px", width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="editStartTime">Start Time</label>
                <input
                  id="editStartTime"
                  type="datetime-local"
                  value={editModal.startTime ? new Date(editModal.startTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditModal({ ...editModal, startTime: new Date(e.target.value).toISOString() })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="editEndTime">End Time</label>
                <input
                  id="editEndTime"
                  type="datetime-local"
                  value={editModal.endTime ? new Date(editModal.endTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditModal({ ...editModal, endTime: new Date(e.target.value).toISOString() })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="editAttendees">Expected Attendees</label>
                <input
                  id="editAttendees"
                  type="number"
                  value={editModal.expectedAttendees || ""}
                  onChange={(e) => setEditModal({ ...editModal, expectedAttendees: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Number of attendees"
                  className="form-input"
                  min="1"
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={busyId !== ""}
                  style={{ flex: 1, width: "auto" }}
                >
                  {busyId ? "Updating..." : "Update Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="ghost-btn"
                  disabled={busyId !== ""}
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
        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .detail-row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .detail-label {
          font-weight: 600;
          font-size: 0.85rem;
          min-width: 110px;
          color: #6b7280;
        }

        .badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--panel, #fff8de);
          border: 1px solid var(--border, #d7cdaa);
          border-radius: 14px;
          padding: 2rem;
          max-width: 540px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(48,35,8,0.15);
          max-height: 90vh;
          overflow-y: auto;
          color: #2c2c2c;
        }

        .modal-content h2 {
          margin-top: 0;
          color: #1a1a1a;
        }

        .detail-panel {
          max-width: 600px;
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

        textarea, input[type="text"], input[type="number"], input[type="datetime-local"] {
          padding: 0.6rem 0.7rem;
          border: 1px solid #baa97e;
          border-radius: 9px;
          font-family: inherit;
          background: #fff;
          width: 100%;
          box-sizing: border-box;
          color: #2c2c2c;
        }

        textarea::placeholder, input::placeholder {
          color: #999999;
        }

        .modal-content input,
        .modal-content select {
          padding: 0.6rem 0.7rem;
          border: 1px solid #baa97e;
          border-radius: 9px;
          font-family: inherit;
          background: #fff;
          color: #2c2c2c;
          width: 100%;
          box-sizing: border-box;
        }

        .modal-content input::placeholder {
          color: #999999;
        }

        .modal-content input:focus,
        .modal-content select:focus,
        .modal-content textarea:focus {
          outline: 2px solid #6fa89f;
          outline-offset: 1px;
        }

        .action-btn {
          padding: 0.3rem 0.5rem !important;
          font-size: 0.75rem !important;
          width: auto !important;
        }

        .ticket-title-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--accent, #005c53);
          font-weight: 600;
          font-family: inherit;
          font-size: 0.9rem;
          text-align: left;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .ticket-title-btn:hover {
          opacity: 0.8;
        }

        .bookings-filter-panel {
          background: rgba(0,0,0,0.03);
          border: 1px solid var(--border, #d7cdaa);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .filter-row:last-child { margin-bottom: 0; }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          flex: 1;
          min-width: 130px;
        }

        .filter-group > label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 0;
        }

        .filter-input { min-width: 130px; }

        .filter-actions {
          flex-direction: row !important;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .filter-btn {
          width: auto !important;
          padding: 0.45rem 0.9rem !important;
          font-size: 0.88rem !important;
        }
      `}</style>
    </section>
  );
}