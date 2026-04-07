import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buildGoogleLoginUrl, register } from "./authService";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register({
        email: form.email,
        password: form.password,
      });
      setSuccess(
        "Account created successfully. An administrator will review your request and assign access permissions."
      );
      setForm(initialForm);
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="card">
        <div className="auth-title-block">
          <h1>Create Your Account</h1>
          <p className="muted">Join the university operations platform.</p>
        </div>

        {error && <div className="alert">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@university.edu"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="At least 6 characters"
            required
          />

          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            minLength={6}
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Re-enter password"
            required
          />

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <a href={buildGoogleLoginUrl()} className="google-btn auth-oauth-btn" style={{ marginTop: "0.5rem" }}>
          <span className="google-mark" aria-hidden="true">G</span>
          Sign up with Google
        </a>

        <p className="muted" style={{ marginTop: "0.9rem" }}>
          Already have an account? <Link to="/login" className="text-link">Sign in</Link>
        </p>

        <div className="auth-help">
          <strong>Registration Flow</strong>
          <ol style={{ margin: 0, paddingLeft: "1.1rem" }}>
            <li>Register using email/password or Google.</li>
            <li>Wait for admin review and role assignment.</li>
            <li>Sign in to access role-specific operations tools.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
