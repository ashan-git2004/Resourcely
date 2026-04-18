import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { auth } = useAuth();

  return (
    <section className="card">
      <h1>Student Dashboard</h1>
      <p>Access campus resources and services.</p>

      <div className="info-stack">
        <div>
          <strong>Email:</strong> {auth?.email}
        </div>
        <div>
          <strong>Role:</strong> Student
        </div>
        <div>
          <strong>Registration Provider:</strong> {auth?.provider}
        </div>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Quick Links</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
        <Link to="/dashboard/student/bookings" className="dashboard-link">
          📅 My Bookings — view, filter, and manage your resource requests
        </Link>
        <Link to="/dashboard/student/tickets" className="dashboard-link">
          🎫 My Tickets — report issues and track campus incident tickets
        </Link>
      </div>

      <p className="muted" style={{ marginTop: "1.5rem" }}>
        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </p>
    </section>
  );
}
