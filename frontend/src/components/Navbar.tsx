import { NavLink, useNavigate } from "react-router-dom";
import { Flag, Trophy, Clock, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import config from "../config";

export default function Navbar() {
  const { user, avatarUrl, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Trophy size={20} className="brand-icon" />
        <span>{config.appName}</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/flags" className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`}>
          <Flag size={15} />
          Flags
        </NavLink>
        <NavLink to="/ranking" className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`}>
          <Trophy size={15} />
          Classement
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`}>
          <Clock size={15} />
          Historique
        </NavLink>
      </div>

      <div className="navbar-user">
        {avatarUrl && user && (
          <div className="user-info">
            <img
              src={avatarUrl}
              alt={user.pseudo}
              className="user-avatar"
              width={32}
              height={32}
            />
            <span className="user-pseudo">{user.pseudo}</span>
          </div>
        )}
        <button className="btn-icon" onClick={handleLogout} title="Déconnexion">
          <LogOut size={17} />
        </button>
      </div>
    </nav>
  );
}
