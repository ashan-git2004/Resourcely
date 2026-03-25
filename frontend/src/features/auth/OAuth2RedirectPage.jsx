import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { decodeRolesFromToken } from "./authService";

export default function OAuth2RedirectPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const provider = params.get("provider") || "GOOGLE";
    const error = params.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!token || !email) {
      navigate("/login", { replace: true });
      return;
    }

    const roles = decodeRolesFromToken(token);

    setAuth({
      token,
      tokenType: "Bearer",
      email,
      provider,
      roles,
    });

    navigate("/dashboard", { replace: true });
  }, [navigate, setAuth]);

  return (
    <section className="card">
      <h1>Completing sign in...</h1>
      <p className="muted">Please wait while we finalize your Google session.</p>
    </section>
  );
}
