import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TicketComments from "./TicketComments";
import { getTicketDetail, updateTicketPriority, updateTicketStatus } from "./ticketService";

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const { auth } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    try {
      setLoading(true);
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

  async function handlePriorityUpdate() {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      await updateTicketPriority(ticketId, selectedPriority, auth.token);
      setSuccess(`Priority updated to ${selectedPriority}.`);
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

  const isTechnicianView = (auth?.roles || []).includes("TECHNICIAN");
  const backLink = isTechnicianView ? "/technician/tickets" : "/dashboard/student";
  const backLabel = isTechnicianView ? "Back to assigned tickets" : "Back to dashboard";

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

        {isTechnicianView && (
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
              <button onClick={handlePriorityUpdate} disabled={updating} className="ghost-btn compact-action-btn">
                Update priority
              </button>
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
