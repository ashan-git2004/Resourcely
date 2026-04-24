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
        setError(
          "Account is pending admin approval. Please wait until an admin grants access."
        );
      } else if (submitError.message?.includes("Google")) {
        setError(`${submitError.message} Please use Google sign-in below.`);
      } else {
        setError(submitError.message);
      }
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
              Welcome back
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Sign in to manage campus resource bookings, support tickets, and
              technician workflows from one place.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">
                What you can do after login
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Book and track campus resources</li>
                <li>• Submit and manage support tickets</li>
                <li>• Access role-based admin or technician tools</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">
                Sign-in options
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Email and password for credential-based accounts</li>
                <li>• Google sign-in for Google-based or linked accounts</li>
                <li>• Admin approval is required before resource access</li>
              </ul>
            </div>
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
              Sign In
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your Smart Campus account.
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="login-email"
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
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
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
              Continue with Google
            </a>

            <p className="mt-6 text-sm text-muted-foreground">
              New here?{" "}
              <Link
                to="/register"
                className="font-medium text-foreground underline underline-offset-4 transition hover:text-primary"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 lg:hidden">
              <p className="text-sm font-medium text-foreground">
                Authentication options
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Sign in with email and password if you registered with credentials</li>
                <li>• Use Google if your account was created with Google or linked later</li>
                <li>• Access is enabled after admin approval</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}