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

      <h2 style={{ marginTop: "1.5rem" }}>Available Actions</h2>
      <ul style={{ lineHeight: "1.8" }}>
        <li>Monitor system status and alerts</li>
        <li>Manage maintenance requests</li>
        <li>Update infrastructure logs</li>
        <li>Report technical issues</li>
      </ul>

      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/login" className="text-link">
          Switch account
        </Link>
      </p>
    </section>
  );
}
