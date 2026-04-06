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

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "priority":
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>🎫 My Assigned Tickets</h1>
          <p className="muted">
            Track and manage your maintenance tasks efficiently
          </p>
        </div>
        <button
          onClick={loadTickets}
          className="sync-btn"
          title="Refresh tickets"
        >
          🔄
        </button>
      </div>

      {/* Search and Tools */}
      <div className="search-and-filter">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by ticket title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && tickets.length > 0 && (
        <div className="ticket-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{tickets.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Open</span>
            <span className="stat-value">
              {tickets.filter((t) => t.status === "OPEN").length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">
              {tickets.filter((t) => t.status === "IN_PROGRESS").length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Urgent</span>
            <span className="stat-value urgent">
              {tickets.filter((t) => t.priority === "URGENT").length}
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          className="alert"
          style={{ marginBottom: "1.5rem", borderRadius: "16px" }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="loading-skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : sortedTickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Tickets Found</h3>
          <p className="muted">
            {searchQuery
              ? "Try adjusting your search criteria."
              : "Great! You have no assigned tickets."}
          </p>
        </div>
      ) : (
        <div className="tickets-grid">
          {sortedTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-title-section">
                  <div
                    className={`priority-indicator priority-${ticket.priority.toLowerCase()}`}
                  ></div>
                  <div>
                    <h4 className="ticket-title">{ticket.title}</h4>
                    <span className="ticket-id">
                      #{ticket.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
                <span
                  className={`status-badge status-${ticket.status.toLowerCase()}`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
              </div>

              <div className="ticket-meta">
                <span className="meta-item">
                  📅 {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`priority-badge priority-${ticket.priority.toLowerCase()}`}
                >
                  {ticket.priority}
                </span>
              </div>

              <div className="ticket-footer">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="ticket-action-btn"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
