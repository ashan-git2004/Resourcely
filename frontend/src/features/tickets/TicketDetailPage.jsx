import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TicketComments from "./TicketComments";
import { getTicketDetail, updateResolutionNotes, updateTicketStatus } from "./ticketService";

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const { auth } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    try {
      setLoading(true);
      const data = await getTicketDetail(ticketId, auth.token);
      setTicket(data);
      setResolutionNotes(data.resolutionNotes || "");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      await updateTicketStatus(ticketId, newStatus, auth.token);
      setSuccess(`Status updated to ${newStatus.replace("_", " ")}.`);
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleResolutionNotesUpdate() {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      await updateResolutionNotes(ticketId, resolutionNotes, auth.token);
      setSuccess("Resolution notes updated successfully.");
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  const allowedTransitions =
    {
      OPEN: ["IN_PROGRESS"],
      IN_PROGRESS: ["RESOLVED"],
      RESOLVED: ["CLOSED"],
      CLOSED: [],
      REJECTED: [],
    }[ticket?.status] || [];

  if (loading && !ticket) return <div className="layout">Loading ticket details...</div>;

  if (error && !ticket) {
    return (
      <div className="layout">
        <div className="alert">{error}</div>
        <Link to="/technician/tickets" className="text-link">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: "920px" }}>
      <div style={{ marginBottom: "0.8rem" }}>
        <Link to="/technician/tickets" className="text-link">
          Back to assigned tickets
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
            <span>{ticket?.owner?.email}</span>
          </div>
          <div className="info-row">
            <label>Assigned technician</label>
            <span>{ticket?.assignedTechnician?.email || "Unassigned"}</span>
          </div>
          <div className="info-row">
            <label>Description</label>
            <span>{ticket?.description || "No description provided."}</span>
          </div>
        </section>

        <section className="sla-grid">
          <div className="sla-item">
            <span className="sla-label">First response</span>
            <span className="sla-value">
              {ticket?.timeToFirstResponseMinutes !== null ? `${ticket.timeToFirstResponseMinutes}m` : "Pending"}
            </span>
          </div>
          <div className="sla-item">
            <span className="sla-label">Resolution time</span>
            <span className="sla-value">
              {ticket?.timeToResolutionMinutes !== null ? `${ticket.timeToResolutionMinutes}m` : "Pending"}
            </span>
          </div>
        </section>

        {error && <div className="alert" style={{ marginTop: "0.9rem" }}>{error}</div>}
        {success && <div className="success" style={{ marginTop: "0.9rem" }}>{success}</div>}

        <footer className="form-section">
          <h3 style={{ marginTop: 0 }}>Update Ticket Status</h3>
          <div className="filter-controls" style={{ marginTop: "0.5rem" }}>
            {allowedTransitions.map((newStatus) => (
              <button
                key={newStatus}
                onClick={() => handleStatusUpdate(newStatus)}
                disabled={updating}
                className="primary-btn"
              >
                Mark as {newStatus.replace("_", " ")}
              </button>
            ))}
            {allowedTransitions.length === 0 && (
              <p className="muted" style={{ margin: 0 }}>No further status transitions available.</p>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="resolution-notes">Resolution notes</label>
            <textarea
              id="resolution-notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Document findings, actions taken, and final outcome"
              rows={4}
            />
            <button onClick={handleResolutionNotesUpdate} disabled={updating} className="ghost-btn" style={{ marginTop: "0.5rem" }}>
              Save resolution notes
            </button>
          </div>
        </footer>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <TicketComments ticketId={ticketId} />
      </section>
    </div>
  );
}
