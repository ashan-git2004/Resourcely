import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ManagerDashboard() {
  const { auth } = useAuth();

  return (
    <section className="card">
      <h1>Manager Dashboard</h1>
      <p>Oversee campus operations and resource allocation.</p>

      <div className="info-stack">
        <div>
          <strong>Email:</strong> {auth?.email}
        </div>
        <div>
          <strong>Role:</strong> Manager
        </div>
        <div>
          <strong>Registration Provider:</strong> {auth?.provider}
        </div>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Available Actions</h2>
      <ul style={{ lineHeight: "1.8" }}>
        <li>View campus analytics and reports</li>
        <li>Manage resource allocation</li>
        <li>Review technician assignments</li>
        <li>Approve operational requests</li>
        <li>Generate performance reports</li>
      </ul>

      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </p>
    </section>
  );
}
