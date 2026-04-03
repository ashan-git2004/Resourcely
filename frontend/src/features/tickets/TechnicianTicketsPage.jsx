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

  useEffect(() => {
    loadTickets();
  }, [filters]);

  async function loadTickets() {
    try {
      setLoading(true);
      const data = await getAssignedTickets(auth.token, filters);
      setTickets(data);
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

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1>My Assigned Tickets</h1>
        <button onClick={loadTickets} className="ghost-btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
          Refresh
        </button>
      </div>

      <div className="filter-bar">
        <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select name="priority" value={filters.priority} onChange={handleFilterChange} className="filter-select">
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="muted">No tickets found matches your filters.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table" style={{ minWidth: "100%" }}>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{ticket.title}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>#{ticket.id.substring(0, 8)}</div>
                  </td>
                  <td>
                    <span className={`badge status-${ticket.status.toLowerCase()}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="primary-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
