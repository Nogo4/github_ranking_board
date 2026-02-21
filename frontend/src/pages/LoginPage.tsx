import { Github } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Github size={48} />
        </div>
        <h1>GitHub Ranking Board</h1>
        <p>Connecte-toi avec ton compte GitHub pour participer au classement.</p>
        <a href={`${API_URL}/auth/github`} className="btn btn-primary btn-login">
          <Github size={18} />
          Connexion avec GitHub
        </a>
      </div>
    </div>
  );
}
