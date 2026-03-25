import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { auth } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");
  const roles = auth?.roles || [];

  const roleList = useMemo(() => roles.join(", "), [roles]);

  // Check if user has no assigned role (pending approval)
  if (roles.length === 0) {
    return (
      <section className="card">
        <h1>Account Pending Approval</h1>
        <p className="alert">
          Your account is awaiting admin approval. Once approved with a role assigned, you'll have access to resources based on your role.
        </p>

        <div className="info-stack">
          <div>
            <strong>Email:</strong> {auth?.email}
          </div>
          <div>
            <strong>Registration Provider:</strong> {auth?.provider}
          </div>
          <div>
            <strong>Status:</strong> Pending Admin Approval
          </div>
        </div>

        <p className="muted" style={{ marginTop: "1rem" }}>
          Please wait for an administrator to review your account and assign appropriate permissions.
        </p>

        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Welcome back</h1>
      <p>You are logged in successfully.</p>

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

      <h2 style={{ marginTop: "1.5rem" }}>Your Permissions</h2>
      <div className="info-stack">
        {roles.includes("ADMIN") && (
          <div>✓ Admin access - manage user approvals and permissions</div>
        )}
        {roles.includes("TECHNICIAN") && (
          <div>✓ Technician access - manage campus infrastructure</div>
        )}
        {roles.includes("MANAGER") && (
          <div>✓ Manager access - oversee operations and analytics</div>
        )}
        {roles.includes("USER") && (
          <div>✓ User access - access campus facilities and services</div>
        )}
      </div>

      {isAdmin && (
        <Link to="/admin/users" className="text-link" style={{ display: "block", marginTop: "1rem" }}>
          → Go to admin approvals panel
        </Link>
      )}

      <Link to="/login" className="text-link" style={{ display: "block", marginTop: "0.5rem" }}>
        Switch account
      </Link>
    </section>
  );
}
