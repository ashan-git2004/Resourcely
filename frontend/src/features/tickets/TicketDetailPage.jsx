import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TicketComments from "./TicketComments";
import {
  getTicketDetail,
  updateResolutionNotes,
  updateTicketPriority,
  updateTicketStatus,
} from "./ticketService";

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const { auth } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  function formatDurationFromDates(startAt, endAt, fallbackMinutes) {
    if (startAt && endAt) {
      const startMs = new Date(startAt).getTime();
      const endMs = new Date(endAt).getTime();

      if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs >= startMs) {
        return formatDuration(Math.floor((endMs - startMs) / 1000));
      }
    }

    if (typeof fallbackMinutes === "number" && fallbackMinutes >= 0) {
      return formatDuration(fallbackMinutes * 60);
    }

    return "Pending";
  }

  function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    try {
      setLoading(true);
      // Technician detail view uses the technician-only endpoint; others use the general ticket endpoint.
      const data = await getTicketDetail(ticketId, auth.token, auth.roles);
      setTicket(data);
      setSelectedPriority(data.priority || "MEDIUM");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    const requiresResolutionNotes = newStatus === "RESOLVED" || newStatus === "CLOSED";

    if (requiresResolutionNotes && !hasSavedResolutionNotes) {
      setError(
        hasUnsavedResolutionNotes
          ? "Save the resolution notes before resolving or closing the ticket."
          : "Add and save resolution notes before resolving or closing the ticket."
      );
      setSuccess("");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      // Status transition request for OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED.
      await updateTicketStatus(ticketId, newStatus, auth.token);
      setSuccess(`Status updated to ${newStatus.replace("_", " ")}.`);
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handlePriorityUpdate() {
    if (!isPriorityChanged) {
      setError("Choose a different priority before updating.");
      setSuccess("");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      // Technician priority update request.
      await updateTicketPriority(ticketId, selectedPriority, auth.token);
      setSuccess(`Priority updated to ${selectedPriority}.`);
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleResolutionNotesUpdate() {
    if (!trimmedResolutionNotes) {
      setError("Resolution notes cannot be empty.");
      setSuccess("");
      return;
    }

    if (trimmedResolutionNotes === savedResolutionNotes) {
      setError("Update the resolution notes before saving again.");
      setSuccess("");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      // Resolution notes save request. Notes must exist before resolving/closing the ticket.
      await updateResolutionNotes(ticketId, trimmedResolutionNotes, auth.token);
      setResolutionNotes("");
      setSuccess("Resolution notes saved.");
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  const allowedTransitions =
    // UI guard for the allowed technician status flow.
    {
      OPEN: ["IN_PROGRESS"],
      IN_PROGRESS: ["RESOLVED"],
      RESOLVED: ["CLOSED"],
      CLOSED: [],
      REJECTED: [],
    }[ticket?.status] || [];

  const isTechnicianView = (auth?.roles || []).includes("TECHNICIAN");
  const backLink = isTechnicianView ? "/technician/tickets" : "/dashboard/student";
  const backLabel = isTechnicianView ? "Back to assigned tickets" : "Back to dashboard";
  const trimmedResolutionNotes = resolutionNotes.trim();
  const savedResolutionNotes = ticket?.resolutionNotes?.trim() || "";
  const hasSavedResolutionNotes = savedResolutionNotes.length > 0;
  const hasUnsavedResolutionNotes = trimmedResolutionNotes.length > 0;
  const isPriorityChanged = selectedPriority !== ticket?.priority;

  if (loading && !ticket) return <div className="layout">Loading ticket details...</div>;

  if (error && !ticket) {
    return (
      <div className="layout">
        <div className="alert">{error}</div>
        <Link to={backLink} className="text-link">
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: "920px" }}>
      <div style={{ marginBottom: "0.8rem" }}>
        <Link to={backLink} className="text-link">
          {backLabel}
        </Link>
      </div>

      <section className="card">
        <header className="page-header" style={{ marginBottom: "1rem" }}>
          <div>
            <h1 style={{ marginBottom: "0.3rem" }}>{ticket?.title}</h1>
            <div className="muted">#{ticket?.id}</div>
          </div>
          <div className="filter-controls">
            <span className={`badge status-${ticket?.status.toLowerCase()}`}>{ticket?.status.replace("_", " ")}</span>
            <span className={`badge priority-${ticket?.priority.toLowerCase()}`}>Priority: {ticket?.priority}</span>
          </div>
        </header>

        <section className="resource-details-grid">
          <div className="info-row">
            <label>Reporter</label>
            <span>{ticket?.ownerEmail}</span>
          </div>
          <div className="info-row">
            <label>Assigned technician</label>
            <span>{ticket?.assignedTechnicianEmail || "Unassigned"}</span>
          </div>
          <div className="info-row">
            <label>Description</label>
            <span>{ticket?.description || "No description provided."}</span>
          </div>
          <div className="info-row">
            <label>Resolution notes</label>
            <span>{ticket?.resolutionNotes || "No resolution notes added yet."}</span>
          </div>
        </section>

        <section className="sla-grid">
          {/* SLA metrics display based on timestamps and stored duration values from the backend. */}
          <div className="sla-item">
            <span className="sla-label">First response</span>
            <span className="sla-value">
              {formatDurationFromDates(
                ticket?.createdAt,
                ticket?.firstResponseAt,
                ticket?.timeToFirstResponseMinutes
              )}
            </span>
          </div>
          <div className="sla-item">
            <span className="sla-label">Resolution time</span>
            <span className="sla-value">
              {formatDurationFromDates(
                ticket?.createdAt,
                ticket?.resolvedAt,
                ticket?.timeToResolutionMinutes
              )}
            </span>
          </div>
        </section>

        {error && <div className="alert" style={{ marginTop: "0.9rem" }}>{error}</div>}
        {success && <div className="success" style={{ marginTop: "0.9rem" }}>{success}</div>}

        {isTechnicianView && (
          <footer className="form-section">
            <h3 style={{ marginTop: 0 }}>Update Ticket Status</h3>
            <div className="ticket-control-row">
              <div className="status-action-group">
                {/* Status action buttons generated from the allowed transition list. */}
                {allowedTransitions.map((newStatus) => (
                  <button
                    key={newStatus}
                    onClick={() => handleStatusUpdate(newStatus)}
                    disabled={updating || ((newStatus === "RESOLVED" || newStatus === "CLOSED") && !hasSavedResolutionNotes)}
                    className="primary-btn compact-primary-btn"
                  >
                    Mark as {newStatus.replace("_", " ")}
                  </button>
                ))}
                {allowedTransitions.length === 0 && (
                  <p className="muted" style={{ margin: 0 }}>No further status transitions available.</p>
                )}
              </div>

              <div className="compact-priority-editor">
                <label htmlFor="ticket-priority">Priority</label>
                <select
                  className="compact-select"
                  id="ticket-priority"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  disabled={updating}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <button
                  onClick={handlePriorityUpdate}
                  disabled={updating || !isPriorityChanged}
                  className="ghost-btn compact-action-btn"
                >
                  Update priority
                </button>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              {/* Resolution note editor with 2000-character limit and pre-resolution enforcement. */}
              <label htmlFor="resolution-notes" style={{ display: "block", marginBottom: "0.45rem", fontWeight: 600 }}>
                Resolution notes
              </label>
              <textarea
                id="resolution-notes"
                className="input"
                rows="5"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add the fix performed, root cause, or follow-up instructions."
                disabled={updating}
                maxLength={2000}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginTop: "0.75rem" }}>
                <span className="muted">{resolutionNotes.length}/2000 characters</span>
                <button
                  onClick={handleResolutionNotesUpdate}
                  disabled={updating || !trimmedResolutionNotes}
                  className="ghost-btn compact-action-btn"
                >
                  Save notes
                </button>
              </div>
              {!hasSavedResolutionNotes && (
                <p className="muted" style={{ marginTop: "0.6rem", marginBottom: 0 }}>
                  Resolution notes must be saved before you can mark this ticket as resolved or closed.
                </p>
              )}
            </div>
          </footer>
        )}
      </section>

      <section style={{ marginTop: "1rem" }}>
        <TicketComments ticketId={ticketId} />
      </section>
    </div>
  );
}
