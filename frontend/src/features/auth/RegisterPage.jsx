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
        "✓ Account created successfully! An admin will review your application and grant you access. Check back soon."
      );
      setForm(initialForm);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1>Create Account</h1>
      <p className="muted">
        Register to get started. After verification, admins will assign your role and permissions.
      </p>

      {error && <p className="alert">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="register-email">Email Address</label>
        <input
          id="register-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="your@email.com"
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

        <label htmlFor="register-confirm-password">Confirm Password</label>
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <a href={buildGoogleLoginUrl()} className="secondary-btn">
        Sign Up with Google
      </a>

      <p className="muted" style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "0.8rem",
          backgroundColor: "#f0f4ff",
          borderRadius: "8px",
        }}
      >
        <strong style={{ fontSize: "0.9rem", color: "#0066cc" }}>📋 Registration Process:</strong>
        <ol style={{ fontSize: "0.85rem", lineHeight: "1.7", marginTop: "0.5rem", marginBottom: 0 }}>
          <li>Complete your registration with email & password or Google account</li>
          <li>Wait for admin review and role assignment</li>
          <li>Once approved, you'll have access to resources based on your role</li>
          <li>Login anytime using your chosen authentication method</li>
        </ol>
      </div>
    </section>
  );
}
