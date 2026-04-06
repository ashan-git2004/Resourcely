import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAssignedTickets } from "../tickets/ticketService";

export default function TechnicianDashboard() {
  const { auth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [searchQuery, setSearchQuery] = useState("");

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
      if (err.message.includes("404") || err.message.includes("403")) {
        setTickets([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const urgentCount = tickets.filter((t) => t.priority === "URGENT").length;
  const completionRate =
    tickets.length > 0
      ? Math.round(
          (tickets.filter(
            (t) => t.status === "CLOSED" || t.status === "RESOLVED",
          ).length /
            tickets.length) *
            100,
        )
      : 0;

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="tech-dashboard-single">
      {/* HEADER SECTION */}
      <header className="dashboard-hero">
        <h1>Operations Hub</h1>
        <p
          className="muted"
          style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}
        >
          Welcome back,{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>
            {auth?.email}
          </span>
        </p>
      </header>

      {/* KPI CARDS SECTION */}
      <div className="kpi-cards-section">
        <div className="glass-stat-grid">
          <div className="glass-card">
            <span className="stat-desc">Open Tasks</span>
            <span className="stat-num">{openCount}</span>
            <span className="stat-helper">Ready to start</span>
          </div>
          <div className="glass-card">
            <span className="stat-desc">In Progress</span>
            <span className="stat-num">{inProgressCount}</span>
            <span className="stat-helper">Currently working</span>
          </div>
          <div className="glass-card urgent">
            <span className="stat-desc" style={{ color: "var(--accent-2)" }}>
              Urgent
            </span>
            <span className="stat-num" style={{ color: "var(--accent-2)" }}>
              {urgentCount}
            </span>
            <span className="stat-helper" style={{ color: "var(--accent-2)" }}>
              Need attention
            </span>
          </div>
          <div className="glass-card">
            <span className="stat-desc">Completion</span>
            <span className="stat-num">{completionRate}%</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* MAINTENANCE QUEUE SECTION */}
      <main className="maintenance-queue-section">
        <div className="ops-header">
          <div>
            <h2>Maintenance Queue</h2>
            <p
              className="muted"
              style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}
            >
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} assigned
              to you
            </p>
          </div>
          <button
            onClick={loadTickets}
            className="sync-btn"
            title="Refresh data"
          >
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-and-filter">
          <div className="search-box">
            <span className="search-icon">Search</span>
            <input
              type="text"
              placeholder="Search tickets by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-bar" style={{ margin: 0 }}>
            <select
              name="status"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
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
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            className="alert"
            style={{ marginBottom: "1.5rem", borderRadius: "16px" }}
          >
            {error}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No tickets found</div>
            <h3>Queue is Empty</h3>
            <p className="muted">
              {searchQuery
                ? "No tickets match your search criteria."
                : "All assigned tasks are currently complete."}
            </p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
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
                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`priority-badge priority-${ticket.priority.toLowerCase()}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="ticket-action-btn"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTTOM ACTIONS */}
      <footer className="bottom-actions">
        <div className="action-buttons">
          <Link
            to="/login"
            className="text-link"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "0.85rem",
              padding: "0.75rem",
            }}
          >
            Logout / Switch Account
          </Link>
        </div>
      </footer>
    </div>
  );
}
