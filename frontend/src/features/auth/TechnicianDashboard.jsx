import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TechnicianDashboard() {
  const { auth } = useAuth();

  return (
    <section className="card">
      <h1>Technician Dashboard</h1>
      <p>Manage and monitor campus infrastructure.</p>

      <div className="info-stack">
        <div>
          <strong>Email:</strong> {auth?.email}
        </div>
        <div>
          <strong>Role:</strong> Technician
        </div>
        <div>
          <strong>Registration Provider:</strong> {auth?.provider}
        </div>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Quick Access</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        <Link to="/technician/tickets" className="primary-btn">View My Assigned Tickets</Link>
        <Link to="/notifications" className="ghost-btn">View All Notifications</Link>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Service Guidelines</h2>
      <ul style={{ lineHeight: "1.8" }}>
        <li>Tickets should be moved to IN_PROGRESS upon first action.</li>
        <li>Ensure resolution notes are detailed before closing.</li>
        <li>SLA targets are monitored for first-response and resolution.</li>
        <li>Keep stakeholders updated via ticket comments.</li>
      </ul>

      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </p>
    </section>
  );
}
