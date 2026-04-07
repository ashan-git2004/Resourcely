import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { buildGoogleLoginUrl, login } from "./authService";

const initialForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryError = params.get("error");
    if (queryError) {
      setError(queryError);
    }
  }, [location.search]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form);
      setAuth(result);
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      if (submitError.message?.includes("pending")) {
        setError("Account is pending admin approval. Please wait for admin to grant you access.");
      } else if (submitError.message?.includes("Google")) {
        setError(submitError.message + " Please use the Google sign-in option below.");
      } else if (submitError.message?.includes("credential")) {
        setError(submitError.message);
      } else {
        setError(submitError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 className="brand" style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>Smart Campus</h1>
          <p className="muted">Secure Operations Dashboard</p>
        </div>

        {error && <div className="alert show" style={{ marginBottom: "1.5rem" }}>{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="your@email.com"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your password"
          required
        />

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <a href={buildGoogleLoginUrl()} className="secondary-btn">
        Continue with Google
      </a>

      <p className="muted" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        New here? <Link to="/register">Create an account</Link>
      </p>

      <div style={{ marginTop: "1.5rem", padding: "0.8rem", backgroundColor: "#f0f7ff", borderRadius: "8px" }}>
        <strong style={{ fontSize: "0.9rem", color: "#0066cc" }}>ℹ️ Authentication Options:</strong>
        <ul style={{ fontSize: "0.85rem", lineHeight: "1.6", marginTop: "0.5rem", marginBottom: 0 }}>
          <li>Sign in with email & password (if registered with credentials)</li>
          <li>Sign in with Google (if registered with Google or you want to link existing account)</li>
          <li>After sign-in, admin approval is required before accessing campus resources</li>
        </ul>
        </div>
      </div>
    </div>
  );
}
