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
        setError("Your account is pending admin approval. Please try again later.");
      } else if (submitError.message?.includes("Google")) {
        setError(`${submitError.message} Please use Google sign in below.`);
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
        <div className="auth-title-block">
          <h1>Welcome Back</h1>
          <p className="muted">Sign in to continue to the university operations workspace.</p>
        </div>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@university.edu"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <a href={buildGoogleLoginUrl()} className="google-btn auth-oauth-btn" style={{ marginTop: "0.5rem" }}>
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </a>

        <p className="muted" style={{ marginTop: "0.9rem" }}>
          New here? <Link to="/register" className="text-link">Create an account</Link>
        </p>

        <div className="auth-help">
          <strong>Sign-in Notes</strong>
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            <li>Use credentials if you registered with email and password.</li>
            <li>Use Google if your account is linked with Google SSO.</li>
            <li>Access starts after administrator role assignment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
