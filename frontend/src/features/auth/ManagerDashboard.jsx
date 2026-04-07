import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ManagerDashboard() {
  const { auth } = useAuth();

  return (
    <section className="card">
      <h1>Manager Operations Console</h1>
      <p className="muted">Oversee service quality, team throughput, and campus resource coordination.</p>

      <div className="profile-strip">
        <div>
          <strong style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--brand)" }}>
            Account
          </strong>
          <div style={{ fontWeight: 700 }}>{auth?.email}</div>
        </div>
        <span className="status-pill status-resolved">Manager</span>
      </div>

      <h2 className="section-title">Core Responsibilities</h2>
      <div className="quick-actions-grid">
        <div className="quick-action-card">
          <h3>Performance Monitoring</h3>
          <p>Review resolution rates, SLA trends, and escalations.</p>
        </div>
        <div className="quick-action-card">
          <h3>Resource Allocation</h3>
          <p>Balance staff assignments and operational demand.</p>
        </div>
        <div className="quick-action-card">
          <h3>Request Approvals</h3>
          <p>Approve operational changes and high-priority requests.</p>
        </div>
        <div className="quick-action-card">
          <h3>Reporting</h3>
          <p>Generate summaries for leadership and departmental teams.</p>
        </div>
      </div>

      <p className="muted" style={{ marginTop: "1.2rem" }}>
        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </p>
    </section>
  );
}
