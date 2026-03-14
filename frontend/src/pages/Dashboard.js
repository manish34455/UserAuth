import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleClass = {
  Client: "role-client",
  Reseller: "role-reseller",
  SuperAdmin: "role-superadmin",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="brand">
          <div className="brand-icon">🔐</div>
          <span className="brand-name">AuthFlow</span>
        </div>
        <button className="btn-secondary" onClick={handleLogout} style={{ width: "auto", padding: "10px 20px" }}>
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="dashboard-card">
          <h2>👋 Welcome back!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "24px" }}>
            You are logged in and your session is protected by HttpOnly cookies.
          </p>

          <div className="info-row">
            <span className="info-label">Status</span>
            <span className="info-value">
              <span className="status-dot" />
              Active Session
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Role</span>
            <span className={`role-badge ${roleClass[user?.role] || "role-client"}`}>
              {user?.role}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Authentication</span>
            <span className="info-value" style={{ color: "var(--success)" }}>
              JWT · HttpOnly Cookies
            </span>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="dashboard-card">
          <h2>🛡️ Security</h2>
          <div className="info-row">
            <span className="info-label">Access Token</span>
            <span className="info-value">HttpOnly Cookie · 5 min</span>
          </div>
          <div className="info-row">
            <span className="info-label">Refresh Token</span>
            <span className="info-value">HttpOnly Cookie · 1 day</span>
          </div>
          <div className="info-row">
            <span className="info-label">Token Rotation</span>
            <span className="info-value" style={{ color: "var(--success)" }}>Enabled</span>
          </div>
          <div className="info-row">
            <span className="info-label">XSS Protection</span>
            <span className="info-value" style={{ color: "var(--success)" }}>HttpOnly Flag</span>
          </div>
        </div>
      </div>
    </div>
  );
}
