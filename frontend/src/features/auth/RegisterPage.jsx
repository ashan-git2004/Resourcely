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
        "Account created successfully. An admin will review your application and grant access soon."
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
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-2">
        <section className="hidden border-r border-border bg-muted/40 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Smart Campus
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-card-foreground">
              Create your account
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Register once, wait for approval, and then access resources based on
              your assigned campus role.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-foreground">
              Registration process
            </p>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Register with email and password or continue with Google</li>
              <li>2. Wait for admin review and role assignment</li>
              <li>3. Log in once your access has been approved</li>
            </ol>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <div className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Smart Campus
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-card-foreground">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Register to get started. Admins will review and assign your role and
              permissions after signup.
            </p>

            {error && (
              <div
                className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
                role="status"
                aria-live="polite"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  minLength={6}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="At least 6 characters"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 6 characters.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  minLength={6}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Re-enter password"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <a
              href={buildGoogleLoginUrl()}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign Up with Google
            </a>

            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4 transition hover:text-primary"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 lg:hidden">
              <p className="text-sm font-medium text-foreground">
                Registration process
              </p>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Register with credentials or Google</li>
                <li>2. Wait for admin approval and role assignment</li>
                <li>3. Sign in anytime after approval</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}