import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAssignedTickets } from "./ticketService";

export default function TechnicianTicketsPage() {
  const { auth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadTickets();
  }, [filters]);

  async function loadTickets() {
    try {
      setLoading(true);
      // VIVA: Technician assigned-ticket list API call with backend status/priority filtering.
      const data = await getAssignedTickets(auth.token, filters);
      setTickets(data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  // VIVA: Search bar logic runs on the already fetched assigned-ticket list by title or ticket ID.
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // VIVA: Client-side sorting for the technician queue cards.
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "priority": {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Assigned Tickets</h1>
          <p className="muted">Track, sort, and complete active maintenance requests.</p>
        </div>
        <button onClick={loadTickets} className="sync-btn" title="Refresh tickets">
          Refresh
        </button>
      </div>

      <div className="search-and-filter">
        <div className="search-box">
          <span className="search-icon">Search</span>
          <input
            type="text"
            placeholder="Search by ticket title or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          {/* VIVA: Technician ticket filters passed to the backend as query params. */}
          <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange} className="filter-select">
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority order</option>
          </select>
        </div>
      </div>

      {!loading && tickets.length > 0 && (
        <>
          {/* VIVA: Ticket progress mini-dashboard showing technician workload breakdown. */}
          <div className="ticket-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{tickets.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Open</span>
            <span className="stat-value">{tickets.filter((t) => t.status === "OPEN").length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In progress</span>
            <span className="stat-value">{tickets.filter((t) => t.status === "IN_PROGRESS").length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High</span>
            <span className="stat-value">{tickets.filter((t) => t.priority === "HIGH").length}</span>
          </div>
          </div>
        </>
      )}

      {error && <div className="alert" style={{ marginBottom: "1rem" }}>{error}</div>}

      {loading ? (
        <div className="loading-skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : sortedTickets.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">No tickets found</span>
          <h3 style={{ margin: "0 0 0.4rem" }}>Nothing to show</h3>
          <p className="muted" style={{ margin: 0 }}>
            {searchQuery ? "Try adjusting your search criteria." : "You currently have no assigned tickets."}
          </p>
        </div>
      ) : (
        <div className="tickets-grid">
          {sortedTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-title-section">
                  <div className={`priority-indicator priority-${ticket.priority.toLowerCase()}`}></div>
                  <div>
                    <h4 className="ticket-title">{ticket.title}</h4>
                    <span className="ticket-id">#{ticket.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>

              <div className="ticket-meta">
                <span className="meta-item">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
              </div>

              <div className="ticket-footer">
                <Link to={`/tickets/${ticket.id}`} className="ticket-action-btn">
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
