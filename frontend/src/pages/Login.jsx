import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

export default function Login({ onLogin }) {
  //const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      if (onLogin) onLogin();
      window.location.href = "/";
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Effects */}
      <div className="auth-background">
        <div className="auth-grid-pattern"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      {/* Card */}
      <div className="auth-container">
        <div className="auth-form">

          {/* Brand */}
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">⚡</span>
            <span className="auth-brand-name">Alumni Network</span>
          </Link>

          <h2>Welcome <span>Back</span></h2>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            type="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />

          <button onClick={submit} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="switch-auth">
            New user?{" "}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}