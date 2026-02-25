import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/api";

export default function CallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const raw = params.get("user");

    console.log("CallbackPage params:", { hasToken: !!token, rawUser: raw });

    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        console.log("Parsed user:", user);
        
        if (user?.id) {
          login(token, user);
          navigate("/ranking", { replace: true });
          return;
        } else {
          console.error("User object missing ID");
        }
      } catch (e) {
        console.error("Failed to parse user data from query string", raw, e);
      }
    } else {
      console.warn("Missing token or user in callback URL");
    }

    navigate("/", { replace: true });
  }, []);

  return (
    <div className="callback-page">
      <Loader size={32} className="spin" />
      <p>Connexion en cours...</p>
    </div>
  );
}
