import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { approveUser, getPendingUsers, rejectUser } from "../auth/authService";

const availableRoles = [
  { value: "USER", label: "User (Student)" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
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
  }, []);

  async function handleApprove(userId) {
    setBusyUserId(userId);
    setError("");
    setSuccessMessage("");
    try {
      const user = users.find((u) => u.id === userId);
      await approveUser(userId, selectedRoles[userId] || "USER", auth?.token);
      setSuccessMessage(`Approved ${user.email} with role ${selectedRoles[userId] || "USER"}`);
      setTimeout(() => loadPendingUsers(), 600);
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
      const user = users.find((u) => u.id === userId);
      await rejectUser(userId, auth?.token);
      setSuccessMessage(`Rejected account for ${user.email}`);
      setTimeout(() => loadPendingUsers(), 600);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyUserId("");
    }
  }

  return (
    <section className="card">
      <div className="page-header">
        <div>
          <h1>User Approvals</h1>
          <p className="muted">Review pending accounts and assign the correct operational role.</p>
        </div>
      </div>

      {error && <div className="alert" style={{ marginBottom: "1rem" }}>{error}</div>}
      {successMessage && <div className="success" style={{ marginBottom: "1rem" }}>{successMessage}</div>}

      {loading ? (
        <div className="muted" style={{ padding: "2rem", textAlign: "center" }}>
          Loading pending users...
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">No pending users</span>
          <h3 style={{ margin: "0 0 0.4rem" }}>Everything is up to date</h3>
          <p className="muted" style={{ margin: 0 }}>All registrations have already been processed.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="modern-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Provider</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{user.email}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>ID: {user.id.substring(0, 8)}</div>
                  </td>
                  <td>
                    <span className="badge">{user.provider}</span>
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
                    >
                      {availableRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={busyUserId === user.id}
                        onClick={() => handleApprove(user.id)}
                      >
                        {busyUserId === user.id ? "Working..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        disabled={busyUserId === user.id}
                        onClick={() => handleReject(user.id)}
                      >
                        {busyUserId === user.id ? "Working..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="glass-card" style={{ marginTop: "1.2rem" }}>
        <h3 style={{ marginTop: 0 }}>Role Guide</h3>
        <div className="quick-actions-grid">
          <div className="quick-action-card">
            <h3>Student</h3>
            <p>Access student operations and request services.</p>
          </div>
          <div className="quick-action-card">
            <h3>Technician</h3>
            <p>Manage tickets, maintenance updates, and resolution notes.</p>
          </div>
          <div className="quick-action-card">
            <h3>Manager</h3>
            <p>Monitor operational performance and coordinate teams.</p>
          </div>
          <div className="quick-action-card">
            <h3>Admin</h3>
            <p>Manage accounts, permissions, and resource governance.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
