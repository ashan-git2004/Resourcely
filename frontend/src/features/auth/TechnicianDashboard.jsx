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
    <div className="ai-dashboard">
      {/* LEFT SIDEBAR */}
      <aside className="ai-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-nav">
            <button className="nav-icon active" title="Dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button className="nav-icon" title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <button className="nav-icon" title="Add">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button className="nav-icon" title="Apps">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button className="nav-icon" title="History">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </button>
          </div>
          <div className="sidebar-footer">
            <div className="user-avatar">
              <span>{auth?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ai-main">
        {/* TOP BAR */}
        <header className="ai-topbar">
          <div className="topbar-left">
            <select className="version-dropdown">
              <option>Assistant v2.6</option>
              <option>Assistant v2.5</option>
              <option>Assistant v2.4</option>
            </select>
          </div>
          <div className="topbar-center">
            <h1 className="page-title">Operations Hub</h1>
          </div>
          <div className="topbar-right">
            <button className="cta-button">Upgrade</button>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="ai-hero">
          <div className="hero-content">
            <h2 className="hero-greeting">
              Hi {auth?.email?.split('@')[0]}, Ready to Achieve Great Things?
            </h2>
            <p className="hero-subtitle">
              Your AI-powered maintenance assistant is here to help you manage tickets efficiently.
            </p>
          </div>
          <div className="hero-bot">
            <div className="bot-avatar">
              <div className="bot-face">🤖</div>
            </div>
            <div className="bot-speech">
              <div className="speech-bubble">
                Hey there! Need a boost?
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="ai-cards">
          <div className="cards-grid">
            <div className="feature-card">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
              </div>
              <h3 className="card-title">Ticket Management</h3>
              <p className="card-description">Efficiently track and manage all maintenance tickets in one place.</p>
              <span className="card-label">Fast Start</span>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10,8 16,12 10,16 10,8"></polygon>
                </svg>
              </div>
              <h3 className="card-title">Priority Analysis</h3>
              <p className="card-description">AI-powered insights to prioritize urgent maintenance tasks.</p>
              <span className="card-label">Smart Planning</span>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                  <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
                </svg>
              </div>
              <h3 className="card-title">Performance Metrics</h3>
              <p className="card-description">Track completion rates and maintenance efficiency with detailed analytics.</p>
              <span className="card-label">Analytics</span>
            </div>
          </div>
        </section>

        {/* MAINTENANCE QUEUE SECTION */}
        <section className="maintenance-section">
          <div className="section-header">
            <h3>Maintenance Queue</h3>
            <p className="section-subtitle">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} assigned to you</p>
          </div>

          <div className="search-and-filter">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tickets by title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-bar">
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
              <button onClick={loadTickets} className="refresh-btn" title="Refresh data">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23,4 23,10 17,10"></polyline>
                  <path d="M20.49,15A9,9,0,1,1,5.64,5.64L23,10"></path>
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
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
              <div className="empty-icon">📋</div>
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
        </section>

        {/* BOTTOM INPUT SECTION */}
        <section className="ai-input-section">
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ask me anything about your maintenance tasks..."
                className="ai-input"
              />
              <button className="send-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
            <div className="action-buttons">
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Deep Research
              </button>
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
                Make an Image
              </button>
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Search
              </button>
              <button className="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
                Create Music
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
