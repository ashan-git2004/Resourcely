import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { auth } = useAuth();

  return (
    <div className="page-container" style={{ maxWidth: "980px" }}>
      <div className="card">
        <div className="page-header">
          <div>
            <h1>Student Service Hub</h1>
            <p className="muted">Manage your academic operations in one place.</p>
          </div>
        </div>

        <div className="profile-strip">
          <div>
            <strong style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--brand)" }}>
              Signed in as
            </strong>
            <div style={{ fontWeight: 700 }}>{auth?.email}</div>
          </div>
          <span className="status-pill status-open">Active</span>
        </div>

        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <div className="quick-action-card">
            <h3>View Schedules</h3>
            <p>Check lecture, lab, and facility timings.</p>
          </div>
          <div className="quick-action-card">
            <h3>Facility Finder</h3>
            <p>Locate halls, labs, and administrative units.</p>
          </div>
          <div className="quick-action-card">
            <h3>Report Issue</h3>
            <p>Submit infrastructure problems for technician action.</p>
          </div>
          <div className="quick-action-card">
            <h3>Announcements</h3>
            <p>Stay current with campus operations updates.</p>
          </div>
        </div>

        <p className="muted" style={{ marginTop: "1.5rem" }}>
          Not your account? <Link to="/login" className="text-link">Switch user</Link>
        </p>
      </div>
    </div>
  );
}
