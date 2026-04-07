import { useEffect, useState } from "react";
import { approveUser, getPendingUsers, rejectUser } from "../auth/authService";
import { useAuth } from "../../context/AuthContext";

const availableRoles = [
  { value: "USER", label: "User (Student)" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" }
];

export default function AdminUsersPage() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadPendingUsers() {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const data = await getPendingUsers(auth?.token);
      setUsers(data);
      const nextSelected = {};
      data.forEach((user) => {
        nextSelected[user.id] = selectedRoles[user.id] || "USER";
      });
      setSelectedRoles(nextSelected);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(userId) {
    setBusyUserId(userId);
    setError("");
    setSuccessMessage("");
    try {
      const user = users.find(u => u.id === userId);
      await approveUser(userId, selectedRoles[userId] || "USER", auth?.token);
      setSuccessMessage(`Approved ${user.email} with role ${selectedRoles[userId] || "USER"}`);
      setTimeout(() => loadPendingUsers(), 800);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyUserId("");
    }
  }

  async function handleReject(userId) {
    setBusyUserId(userId);
    setError("");
    setSuccessMessage("");
    try {
      const user = users.find(u => u.id === userId);
      await rejectUser(userId, auth?.token);
      setSuccessMessage(`Rejected account for ${user.email}`);
      setTimeout(() => loadPendingUsers(), 800);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyUserId("");
    }
  }

  return (
    <section className="card">
      <div className="page-header" style={{ marginBottom: "2.5rem" }}>
        <div>
          <h1>User Approvals</h1>
          <p className="muted">Review pending accounts and delegate role-based access.</p>
        </div>
      </div>

      {error && <div className="alert show" style={{ marginBottom: "1.5rem" }}>{error}</div>}
      {successMessage && <div className="alert success show" style={{ marginBottom: "1.5rem" }}>{successMessage}</div>}

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center" }} className="muted">Synchronizing user database...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
           <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
           <h3>No Pending Users</h3>
           <p className="muted">All accounts have been reviewed and processed.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="modern-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Provider</th>
                <th>Access Level</th>
                <th style={{ textAlign: "right" }}>Operation</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink)" }}>{user.email}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>UID: {user.id.substring(0, 8)}</div>
                  </td>
                  <td>
                    <span className={`badge`} style={{ background: user.provider === "GOOGLE" ? "rgba(0,102,204,0.08)" : "rgba(0,0,0,0.05)", color: user.provider === "GOOGLE" ? "#0066cc" : "inherit" }}>
                      {user.provider}
                    </span>
                  </td>
                  <td>
                    <select
                      value={selectedRoles[user.id] || "USER"}
                      onChange={(event) =>
                        setSelectedRoles((prev) => ({
                          ...prev,
                          [user.id]: event.target.value,
                        }))
                      }
                      className="filter-select"
                      style={{ padding: "0.5rem", borderRadius: "10px", width: "100%" }}
                    >
                      {availableRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex-center" style={{ justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                        disabled={busyUserId === user.id}
                        onClick={() => handleApprove(user.id)}
                      >
                        {busyUserId === user.id ? "..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                        disabled={busyUserId === user.id}
                        onClick={() => handleReject(user.id)}
                      >
                        {busyUserId === user.id ? "..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="glass-card" style={{ marginTop: "3rem", background: "rgba(0,137,123,0.03)" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "var(--accent)" }}>Role Governance</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>STUDENT</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Campus issue reporting and schedule oversight.</p>
          </div>
          <div>
            <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>TECHNICIAN</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Infrastructure repairs and maintenance hub usage.</p>
          </div>
          <div>
            <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>MANAGER</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Operational analytics and resource management.</p>
          </div>
          <div>
            <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>ADMIN</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Primary security and role delegation authority.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
