import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { auth } = useAuth();

  return (
    <div className="layout" style={{ maxWidth: "800px" }}>
      <div className="card">
        <div className="page-header" style={{ marginBottom: "2rem" }}>
          <div>
            <h1 className="brand" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Student Hub</h1>
            <p className="muted">Managing your campus experience at a glance.</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem", background: "rgba(0,137,123,0.03)", marginBottom: "2rem" }}>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <strong style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--accent)" }}>Student Profile</strong>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{auth?.email}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="badge badge-open">Active Scholar</span>
              </div>
           </div>
        </div>

        <h3>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div className="card" style={{ padding: "1.25rem", background: "#fff", cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📅</div>
            <strong style={{ display: "block" }}>View Schedules</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Check your class and facility hours.</p>
          </div>
          <div className="card" style={{ padding: "1.25rem", background: "#fff", cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📍</div>
            <strong style={{ display: "block" }}>Facility Finder</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Navigate laboratories and halls.</p>
          </div>
          <div className="card" style={{ padding: "1.25rem", background: "rgba(255,112,67,0.05)", border: "1px solid rgba(255,112,67,0.2)", cursor: "pointer" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚠️</div>
            <strong style={{ display: "block" }}>Report Issue</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Notify technicians of facility problems.</p>
          </div>
          <div className="card" style={{ padding: "1.25rem", background: "#fff", cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📢</div>
            <strong style={{ display: "block" }}>Announcements</strong>
            <p className="muted" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>Stay updated with campus news.</p>
          </div>
        </div>

        <p className="muted" style={{ marginTop: "2.5rem", textAlign: "center" }}>
          Not your account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>Switch user</Link>
        </p>
      </div>
    </div>
  );
}
