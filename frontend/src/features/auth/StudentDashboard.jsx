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

      <h2 style={{ marginTop: "1.5rem" }}>Available Actions</h2>
      <ul style={{ lineHeight: "1.8" }}>
        <li>View current schedules</li>
        <li>Access campus facilities information</li>
        <li>Request maintenance for facilities</li>
        <li>View campus announcements</li>
        <li>Report facility issues</li>
      </ul>

      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </p>
    </section>
  );
}
