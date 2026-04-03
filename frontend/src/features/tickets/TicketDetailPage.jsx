import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTicketDetail, updateTicketStatus, updateResolutionNotes } from "./ticketService";
import TicketComments from "./TicketComments";

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
      setSuccess(`Status updated to ${newStatus.replace("_", " ")}`);
      loadTicket(); // Reload ticket to get updated status and potentially SLA metrics
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
      setSuccess("Resolution notes updated successfully");
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  const allowedTransitions = {
    "OPEN": ["IN_PROGRESS"],
    "IN_PROGRESS": ["RESOLVED"],
    "RESOLVED": ["CLOSED"],
    "CLOSED": [],
    "REJECTED": []
  }[ticket?.status] || [];

  if (loading && !ticket) return <div className="layout">Loading ticket details...</div>;
  if (error && !ticket) return <div className="layout"><div className="alert">{error}</div><Link to="/technician/tickets" className="text-link">Back to tickets</Link></div>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/technician/tickets" className="text-link">← Back to Assigned Tickets</Link>
      </div>

      <section className="card">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ marginBottom: "0.25rem" }}>{ticket?.title}</h1>
            <div className="muted">#{ticket?.id}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <span className={`badge status-${ticket?.status.toLowerCase()}`}>
              {ticket?.status.replace("_", " ")}
            </span>
            <span className={`badge priority-${ticket?.priority.toLowerCase()}`}>
              Priority: {ticket?.priority}
            </span>
          </div>
        </header>

        <section className="info-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="muted">Reporter</label>
            <div>{ticket?.owner?.email}</div>
          </div>
          <div>
            <label className="muted">Assigned To</label>
            <div>{ticket?.assignedTechnician?.email || "Unassigned"}</div>
          </div>
        </section>

        <section style={{ marginTop: "1rem" }}>
          <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
          <div style={{ padding: "0.75rem", background: "#fff", border: "1px solid var(--border)", borderRadius: "8px" }}>
            {ticket?.description || "No description provided."}
          </div>
        </section>

        {/* SLA METRICS (Business Goal 3) */}
        <section className="sla-grid">
          <div className="sla-item">
            <span className="sla-label">First Response Time</span>
            <span className="sla-value">
              {ticket?.timeToFirstResponseMinutes !== null 
                ? `${ticket.timeToFirstResponseMinutes}m` 
                : "PENDING"}
            </span>
          </div>
          <div className="sla-item">
            <span className="sla-label">Resolution Time</span>
            <span className="sla-value">
              {ticket?.timeToResolutionMinutes !== null 
                ? `${ticket.timeToResolutionMinutes}m` 
                : "PENDING"}
            </span>
          </div>
        </section>

        {error && <div className="alert" style={{ marginTop: "1rem" }}>{error}</div>}
        {success && <div className="success" style={{ marginTop: "1rem" }}>{success}</div>}

        {/* CONTROLS (Business Goal 1) */}
        <footer style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <h3>Update Ticket Status</h3>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            {allowedTransitions.map(newStatus => (
              <button 
                key={newStatus} 
                onClick={() => handleStatusUpdate(newStatus)}
                disabled={updating}
                className="primary-btn"
                style={{ padding: "0.5rem 1rem" }}
              >
                Mark as {newStatus.replace("_", " ")}
              </button>
            ))}
            {allowedTransitions.length === 0 && (
              <p className="muted" style={{ fontStyle: "italic" }}>No further status transitions available.</p>
            )}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>Resolution Notes</label>
            <textarea 
              style={{ 
                width: "100%", 
                minHeight: "100px", 
                padding: "0.75rem", 
                border: "1px solid #baa97e", 
                borderRadius: "8px", 
                font: "inherit" 
              }}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add details about the solution..."
            />
            <button 
              onClick={handleResolutionNotesUpdate}
              disabled={updating}
              className="ghost-btn"
              style={{ marginTop: "0.5rem" }}
            >
              Update Resolution Notes
            </button>
          </div>
        </footer>
      </section>

      {/* COMMENTS (Business Goal 2) */}
      <section style={{ marginTop: "2rem" }}>
        <TicketComments ticketId={ticketId} />
      </section>
    </div>
  );
}
