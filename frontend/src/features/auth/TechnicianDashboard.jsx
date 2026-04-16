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

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const highCount = tickets.filter((t) => t.priority === "HIGH").length;
  const completionRate =
    tickets.length > 0
      ? Math.round(
          (tickets.filter((t) => t.status === "CLOSED" || t.status === "RESOLVED").length /
            tickets.length) *
            100
        )
      : 0;

  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tech-dashboard-single">
      <header className="dashboard-hero">
        <h1>Technician Operations Hub</h1>
        <p className="muted" style={{ marginTop: "0.45rem" }}>
          Signed in as <strong>{auth?.email}</strong>
        </p>
      </header>

      <div className="kpi-cards-section">
        <div className="glass-stat-grid">
          <div className="glass-card">
            <span className="stat-desc">Open tasks</span>
            <span className="stat-num">{openCount}</span>
            <span className="stat-helper">Awaiting action</span>
          </div>
          <div className="glass-card">
            <span className="stat-desc">In progress</span>
            <span className="stat-num">{inProgressCount}</span>
            <span className="stat-helper">Actively handled</span>
          </div>
          <div className="glass-card">
            <span className="stat-desc">High priority</span>
            <span className="stat-num">{highCount}</span>
            <span className="stat-helper">Needs closer attention</span>
          </div>
          <div className="glass-card">
            <span className="stat-desc">Completion</span>
            <span className="stat-num">{completionRate}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <main className="maintenance-queue-section">
        <div className="ops-header">
          <div>
            <h2>Assigned Maintenance Queue</h2>
            <p className="muted" style={{ margin: "0.4rem 0 0" }}>
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} currently assigned
            </p>
          </div>
          <button onClick={loadTickets} className="sync-btn" title="Refresh">
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
          <div className="filter-bar">
            <select
              name="status"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="filter-select"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              name="priority"
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
              className="filter-select"
            >
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {error && <div className="alert" style={{ marginBottom: "1rem" }}>{error}</div>}

        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">No matching tickets</span>
            <h3 style={{ margin: "0 0 0.4rem" }}>Queue is clear</h3>
            <p className="muted" style={{ margin: 0 }}>
              {searchQuery ? "Try changing your search filters." : "All assigned tasks are currently completed."}
            </p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
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
                  <span className="meta-item">Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </div>
                <Link to={`/tickets/${ticket.id}`} className="ticket-action-btn">
                  View details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <Link to="/login" className="text-link">
          Logout or switch account
        </Link>
      </footer>
    </div>
  );
}
