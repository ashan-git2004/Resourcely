import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllTickets,
  updateTicketStatus,
  assignTechnician,
  deleteTicket,
  getTechnicians,
} from "./ticketService";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES = ["HARDWARE", "SOFTWARE", "FACILITY", "NETWORK", "OTHER"];

const STATUS_TRANSITIONS = {
  OPEN: ["IN_PROGRESS", "REJECTED", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED", "CLOSED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  REJECTED: ["OPEN"],
  CLOSED: [],
};

function statusColor(status) {
  switch (status) {
    case "OPEN": return { bg: "#dbeafe", color: "#1d4ed8" };
    case "IN_PROGRESS": return { bg: "#fef9c3", color: "#854d0e" };
    case "RESOLVED": return { bg: "#d1fae5", color: "#065f46" };
    case "CLOSED": return { bg: "#e5e7eb", color: "#374151" };
    case "REJECTED": return { bg: "#fee2e2", color: "#991b1b" };
    default: return { bg: "#f3f4f6", color: "#374151" };
  }
}

function priorityColor(priority) {
  switch (priority) {
    case "URGENT": return { bg: "#fee2e2", color: "#991b1b" };
    case "HIGH": return { bg: "#ffedd5", color: "#c2410c" };
    case "MEDIUM": return { bg: "#fef9c3", color: "#854d0e" };
    case "LOW": return { bg: "#d1fae5", color: "#065f46" };
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

export default function AdminTicketsPage() {
  const { auth } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterTech, setFilterTech] = useState("ALL");

  // Detail panel
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Status change modal
  const [statusModal, setStatusModal] = useState(null); // { ticketId, newStatus, reason }

  // Assign modal
  const [assignModal, setAssignModal] = useState(null); // { ticketId, technicianId }

  async function loadTickets() {
    setLoading(true);
    setError("");
    try {
      const filters = {
        status: filterStatus === "ALL" ? null : filterStatus,
        priority: filterPriority === "ALL" ? null : filterPriority,
        category: filterCategory === "ALL" ? null : filterCategory,
        assignedTechnicianId: filterTech === "ALL" ? null : filterTech,
      };
      const data = await getAllTickets(filters, auth?.token);
      setTickets(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTechnicians() {
    try {
      const data = await getTechnicians(auth?.token);
      setTechnicians(data || []);
    } catch {
      // non-fatal
    }
  }

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPriority, filterCategory, filterTech]);

  useEffect(() => {
    loadTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  async function handleStatusChange() {
    if (!statusModal) return;
    setBusyId(statusModal.ticketId);
    setError("");
    try {
      await updateTicketStatus(statusModal.ticketId, statusModal.newStatus, statusModal.reason, auth?.token);
      showSuccess(`✓ Ticket status updated to ${statusModal.newStatus}`);
      setStatusModal(null);
      if (selectedTicket?.id === statusModal.ticketId) setSelectedTicket(null);
      setTimeout(() => loadTickets(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleAssign() {
    if (!assignModal) return;
    setBusyId(assignModal.ticketId);
    setError("");
    try {
      await assignTechnician(assignModal.ticketId, assignModal.technicianId || null, auth?.token);
      showSuccess("✓ Technician assigned successfully");
      setAssignModal(null);
      if (selectedTicket?.id === assignModal.ticketId) setSelectedTicket(null);
      setTimeout(() => loadTickets(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(ticketId) {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    setBusyId(ticketId);
    setError("");
    try {
      await deleteTicket(ticketId, auth?.token);
      showSuccess("✓ Ticket deleted");
      if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      setTimeout(() => loadTickets(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  function openStatusModal(ticket, newStatus) {
    setStatusModal({ ticketId: ticket.id, newStatus, reason: "" });
  }

  function openAssignModal(ticket) {
    setAssignModal({ ticketId: ticket.id, technicianId: ticket.assignedTechnicianId || "" });
  }

  return (
    <section className="card">
      <h1>Ticket Management</h1>
      <p className="muted">Manage support tickets, assign technicians, and update workflow status</p>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {/* Filters */}
      <div className="ticket-filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input filter-select"
        >
          <option value="ALL">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="form-input filter-select"
        >
          <option value="ALL">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="form-input filter-select"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterTech}
          onChange={(e) => setFilterTech(e.target.value)}
          className="form-input filter-select"
        >
          <option value="ALL">All Technicians</option>
          <option value="unassigned">Unassigned</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.email}</option>
          ))}
        </select>
      </div>

      {loading && <p className="muted">Loading tickets...</p>}

      {!loading && tickets.length === 0 && (
        <p className="success">✓ No tickets found for the selected filters.</p>
      )}

      {!loading && tickets.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Reporter</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const sc = statusColor(ticket.status);
                const pc = priorityColor(ticket.priority);
                const isBusy = busyId === ticket.id;
                const allowedNext = STATUS_TRANSITIONS[ticket.status] || [];
                return (
                  <tr key={ticket.id}>
                    <td>
                      <button
                        className="ticket-title-btn"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        {ticket.title}
                      </button>
                      {ticket.location && (
                        <div className="muted" style={{ fontSize: "0.8rem" }}>
                          📍 {ticket.location}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>
                        {ticket.reporterName || ticket.reporterId?.substring(0, 8) + "..."}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>{ticket.category}</span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: pc.bg, color: pc.color }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {ticket.assignedTechnicianName || (
                        <span className="muted">Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{formatDate(ticket.createdAt)}</td>
                    <td className="actions-cell">
                      {/* Status change buttons */}
                      {allowedNext.length > 0 && (
                        <div className="action-buttons">
                          {allowedNext.map((next) => (
                            <button
                              key={next}
                              onClick={() => openStatusModal(ticket, next)}
                              disabled={isBusy || busyId !== ""}
                              className={next === "REJECTED" ? "danger-btn action-btn" : "secondary-btn action-btn"}
                            >
                              → {next.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Assign button */}
                      <button
                        onClick={() => openAssignModal(ticket)}
                        disabled={isBusy || busyId !== ""}
                        className="ghost-btn action-btn"
                      >
                        {ticket.assignedTechnicianId ? "Reassign" : "Assign"}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        disabled={isBusy || busyId !== ""}
                        className="danger-btn action-btn"
                        style={{ marginTop: "0.25rem" }}
                      >
                        Delete
                      </button>

                      {ticket.adminReason && (
                        <div className="muted" style={{ fontSize: "0.75rem", marginTop: "0.3rem" }}>
                          <strong>Note:</strong> {ticket.adminReason}
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

      {/* Ticket Detail Panel */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content detail-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ margin: 0 }}>{selectedTicket.title}</h2>
              <button className="ghost-btn" style={{ padding: "0.3rem 0.6rem", width: "auto" }} onClick={() => setSelectedTicket(null)}>✕</button>
            </div>

            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="badge" style={{ ...statusColor(selectedTicket.status), backgroundColor: statusColor(selectedTicket.status).bg }}>
                  {selectedTicket.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Priority</span>
                <span className="badge" style={{ backgroundColor: priorityColor(selectedTicket.priority).bg, color: priorityColor(selectedTicket.priority).color }}>
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span>{selectedTicket.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reporter</span>
                <span>{selectedTicket.reporterName || selectedTicket.reporterId}</span>
              </div>
              {selectedTicket.resourceName && (
                <div className="detail-row">
                  <span className="detail-label">Resource</span>
                  <span>{selectedTicket.resourceName}</span>
                </div>
              )}
              {selectedTicket.location && (
                <div className="detail-row">
                  <span className="detail-label">Location</span>
                  <span>{selectedTicket.location}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Assigned To</span>
                <span>{selectedTicket.assignedTechnicianName || "Unassigned"}</span>
              </div>
              {selectedTicket.adminReason && (
                <div className="detail-row">
                  <span className="detail-label">Admin Note</span>
                  <span>{selectedTicket.adminReason}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span>{formatDate(selectedTicket.createdAt)}</span>
              </div>
              {selectedTicket.resolvedAt && (
                <div className="detail-row">
                  <span className="detail-label">Resolved</span>
                  <span>{formatDate(selectedTicket.resolvedAt)}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <p className="detail-label" style={{ marginBottom: "0.5rem" }}>Description</p>
              <p style={{ whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.04)", padding: "0.75rem", borderRadius: "8px", margin: 0 }}>
                {selectedTicket.description}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
              {(STATUS_TRANSITIONS[selectedTicket.status] || []).map((next) => (
                <button
                  key={next}
                  onClick={() => { setSelectedTicket(null); openStatusModal(selectedTicket, next); }}
                  className={next === "REJECTED" ? "danger-btn" : "secondary-btn"}
                  style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                >
                  → {next.replace("_", " ")}
                </button>
              ))}
              <button
                onClick={() => { setSelectedTicket(null); openAssignModal(selectedTicket); }}
                className="ghost-btn"
                style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              >
                {selectedTicket.assignedTechnicianId ? "Reassign" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Set Status: {statusModal.newStatus.replace("_", " ")}</h2>

            <form onSubmit={(e) => { e.preventDefault(); handleStatusChange(); }}>
              <div className="form-group">
                <label htmlFor="statusReason">
                  {statusModal.newStatus === "REJECTED" ? "Rejection Reason *" : "Note (optional)"}
                </label>
                <textarea
                  id="statusReason"
                  value={statusModal.reason}
                  onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                  placeholder={
                    statusModal.newStatus === "REJECTED"
                      ? "Explain why this ticket is being rejected..."
                      : "Add a note about this status change..."
                  }
                  className="form-input"
                  style={{ minHeight: "90px", width: "100%" }}
                  required={statusModal.newStatus === "REJECTED"}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={busyId !== ""}
                  style={{ flex: 1, width: "auto" }}
                >
                  {busyId ? "Updating..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModal(null)}
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

      {/* Assign Technician Modal */}
      {assignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Assign Technician</h2>

            <div className="form-group">
              <label htmlFor="techSelect">Select Technician</label>
              <select
                id="techSelect"
                value={assignModal.technicianId || ""}
                onChange={(e) => setAssignModal({ ...assignModal, technicianId: e.target.value })}
                className="form-input"
              >
                <option value="">— Unassign —</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.email}</option>
                ))}
              </select>
            </div>

            {technicians.length === 0 && (
              <p className="muted" style={{ fontSize: "0.85rem" }}>No technicians found. Approve technician users first.</p>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                onClick={handleAssign}
                className="primary-btn"
                disabled={busyId !== ""}
                style={{ flex: 1, width: "auto" }}
              >
                {busyId ? "Saving..." : "Confirm"}
              </button>
              <button
                onClick={() => setAssignModal(null)}
                className="ghost-btn"
                disabled={busyId !== ""}
                style={{ flex: 1, width: "auto" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ticket-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-select {
          min-width: 150px;
          max-width: 200px;
        }

        .badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
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

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .action-btn {
          padding: 0.3rem 0.5rem !important;
          font-size: 0.75rem !important;
          width: auto !important;
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

        .danger-btn {
          border-color: #c41e3a;
          color: #c41e3a;
          background: transparent;
        }

        .danger-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}