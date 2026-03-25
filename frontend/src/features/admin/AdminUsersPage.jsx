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
      <h1>Pending User Approvals</h1>
      <p className="muted">Review pending accounts and assign role-based access permissions.</p>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {loading && <p className="muted">Loading pending users...</p>}

      {!loading && users.length === 0 && (
        <p className="success">✓ No pending users. All accounts have been reviewed.</p>
      )}

      {!loading && users.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Assign Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <span 
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        backgroundColor: user.provider === "GOOGLE" ? "#f0f7ff" : "#f8f8f8",
                        fontSize: "0.85rem"
                      }}
                    >
                      {user.provider}
                    </span>
                  </td>
                  <td>{user.approvalStatus}</td>
                  <td>
                    <select
                      value={selectedRoles[user.id] || "USER"}
                      onChange={(event) =>
                        setSelectedRoles((prev) => ({
                          ...prev,
                          [user.id]: event.target.value,
                        }))
                      }
                      style={{ padding: "0.5rem", borderRadius: "4px" }}
                    >
                      {availableRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="primary-btn"
                      disabled={busyUserId === user.id}
                      onClick={() => handleApprove(user.id)}
                    >
                      {busyUserId === user.id ? "..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={busyUserId === user.id}
                      onClick={() => handleReject(user.id)}
                    >
                      {busyUserId === user.id ? "..." : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
        <h3 style={{ marginTop: 0 }}>Role Descriptions</h3>
        <ul style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
          <li><strong>User (Student):</strong> Can access campus facilities, view schedules, and report issues</li>
          <li><strong>Technician:</strong> Can manage infrastructure, handle maintenance requests, monitor systems</li>
          <li><strong>Manager:</strong> Can oversee operations, view analytics, manage resource allocation</li>
          <li><strong>Admin:</strong> Full system access, can approve users and manage all permissions</li>
        </ul>
      </div>
    </section>
  );
}
