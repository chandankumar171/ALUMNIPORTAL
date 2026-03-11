import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaHome, FaCodeBranch, FaFileAlt, FaUser, FaShieldAlt } from "react-icons/fa";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <nav className="desktop-nav">
        <Link to="/" className="nav-brand">
          <img src={logo} alt="GITA Alumni Portal" className="nav-logo" />
          <h2>Alumni Network</h2>
        </Link>

        <div className="nav-right">
          {!user?.isAdmin && (
            <>
              <Link to="/"         className={`nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
              <Link to="/branches" className={`nav-link ${isActive("/branches") ? "active" : ""}`}>Branches</Link>
              <Link to="/post-job" className="post-job-btn">📝 Post Job</Link>
            </>
          )}

          {user?.isAdmin && (
            <Link to="/admin" className={`nav-link admin-link ${isActive("/admin") ? "active" : ""}`}>
              <FaShieldAlt /> Admin Panel
            </Link>
          )}

          {user ? (
            <div className="profile-dropdown">
              <div
                className={`profile-avatar ${user.isAdmin ? "admin-avatar" : ""}`}
                title={user.isAdmin ? "Admin" : (user.name || "Profile")}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {user.isAdmin
                  ? <FaShieldAlt />
                  : (user.name || user.email || "U")?.charAt(0).toUpperCase()
                }
              </div>

              {showProfileMenu && (
                <div className="dropdown-menu">
                  {!user.isAdmin && (
                    <button className="dropdown-item"
                      onClick={() => { navigate(`/profile/${user._id}`); setShowProfileMenu(false); }}>
                      👤 My Profile
                    </button>
                  )}
                  {user.isAdmin && (
                    <button className="dropdown-item"
                      onClick={() => { navigate("/admin"); setShowProfileMenu(false); }}>
                      🛡️ Admin Panel
                    </button>
                  )}
                  <button className="dropdown-item logout-item" onClick={logout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}
        </div>
      </nav>

      {/* ── MOBILE NAVBAR ── */}
      <div className="mobile-nav-wrapper">
        <div className="mobile-top-bar">
          <img src={logo} alt="GITA Alumni Portal" className="mobile-nav-logo" />
          <h2>Alumni Network</h2>
        </div>

        <nav className="mobile-bottom-nav">
          {user?.isAdmin ? (
            <>
              <Link to="/admin" className={`mobile-nav-item ${isActive("/admin") ? "active" : ""}`}>
                <FaShieldAlt /><span>Admin</span>
              </Link>
              <button className="mobile-nav-item" onClick={logout}>
                <FaSignOutAlt /><span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={`mobile-nav-item ${isActive("/") ? "active" : ""}`}>
                <FaHome /><span>Home</span>
              </Link>
              <Link to="/branches" className={`mobile-nav-item ${isActive("/branches") ? "active" : ""}`}>
                <FaCodeBranch /><span>Branches</span>
              </Link>
              <Link to="/post-job" className="mobile-nav-item post-job-mobile">
                <div className="post-job-icon-wrap"><FaFileAlt /></div>
                <span>Post</span>
              </Link>
              {user ? (
                <div className="mobile-profile-menu">
                  <button
                    className={`mobile-nav-item profile-btn ${showProfileMenu ? "active" : ""}`}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <FaUser /><span>Profile</span>
                  </button>
                  {showProfileMenu && (
                    <div className="mobile-dropdown-menu">
                      <button className="mobile-dropdown-item"
                        onClick={() => handleNavigation(`/profile/${user._id}`)}>
                        👤 My Profile
                      </button>
                      <button className="mobile-dropdown-item logout-item" onClick={logout}>
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="mobile-nav-item">
                  <FaUser /><span>Login</span>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </>
  );
}