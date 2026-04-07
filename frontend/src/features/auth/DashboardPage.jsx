import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { auth } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");
  const roles = auth?.roles || [];

  const roleList = useMemo(() => roles.join(", "), [roles]);

  if (roles.length === 0) {
    return (
      <section className="card">
        <h1>Account Pending Approval</h1>
        <p className="alert">
          Your account is awaiting administrator review. Access will be granted once a role is assigned.
        </p>

        <div className="info-stack">
          <div>
            <strong>Email:</strong> {auth?.email}
          </div>
          <div>
            <strong>Registration provider:</strong> {auth?.provider}
          </div>
          <div>
            <strong>Status:</strong> Pending approval
          </div>
        </div>

        <p className="muted" style={{ marginTop: "1rem" }}>
          If this takes longer than expected, contact your operations administrator.
        </p>

        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Workspace Access Confirmed</h1>
      <p className="muted">You are signed in and ready to continue.</p>

      <div className="info-stack">
        <div>
          <strong>Email:</strong> {auth?.email}
        </div>
        <div>
          <strong>Provider:</strong> {auth?.provider}
        </div>
        <div>
          <strong>Roles:</strong> <span className="user-pill">{roleList}</span>
        </div>
      </div>

      <h2 style={{ marginTop: "1.2rem" }}>Current Permissions</h2>
      <div className="info-stack">
        {roles.includes("ADMIN") && <div>Admin access: manage users, roles, and resource configuration.</div>}
        {roles.includes("TECHNICIAN") && <div>Technician access: manage assigned maintenance and ticket workflows.</div>}
        {roles.includes("MANAGER") && <div>Manager access: monitor operations and coordinate teams.</div>}
        {roles.includes("USER") && <div>User access: use student-facing service features.</div>}
      </div>

      {isAdmin && (
        <Link to="/admin/users" className="text-link" style={{ display: "block", marginTop: "1rem" }}>
          Open admin approvals panel
        </Link>
      )}

      <Link to="/login" className="text-link" style={{ display: "block", marginTop: "0.5rem" }}>
        Switch account
      </Link>
    </section>
  );
}
