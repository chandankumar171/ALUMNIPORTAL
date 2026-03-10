import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

export default function Signup({ onSignup }) {
  const navigate = useNavigate();

  const [isAdminSignup, setIsAdminSignup] = useState(false);
  const [adminKey, setAdminKey]           = useState("");
  const [loading, setLoading]             = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", rollNo: "", regNo: "",
    branch: "", batchFrom: "", batchTo: "", password: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload;

      if (isAdminSignup) {
        if (!form.email || !form.password || !adminKey) {
          alert("Please fill email, password and admin key");
          setLoading(false);
          return;
        }
        payload = { email: form.email, password: form.password, adminKey };
      } else {
        if (!form.branch || !form.batchFrom || !form.batchTo) {
          alert("Please fill all required fields");
          setLoading(false);
          return;
        }
        payload = form;
      }

      const res = await API.post("/auth/signup", payload);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        if (onSignup) onSignup();
        window.location.href = "/";
      } else {
        alert("Signup successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-grid-pattern"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-container">
        <form className="auth-form" onSubmit={submit}>

          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">⚡</span>
            <span className="auth-brand-name">Alumni Network</span>
          </Link>

          <h2>
            {isAdminSignup ? <><span>Admin</span> Signup</> : <>Alumni <span>Signup</span></>}
          </h2>

          {/* Toggle */}
          <div className="auth-toggle-row">
            <button type="button" className={`auth-toggle-btn ${!isAdminSignup ? "active" : ""}`}
              onClick={() => setIsAdminSignup(false)} disabled={loading}>
              🎓 Alumni
            </button>
            <button type="button" className={`auth-toggle-btn ${isAdminSignup ? "active" : ""}`}
              onClick={() => setIsAdminSignup(true)} disabled={loading}>
              🛡️ Admin
            </button>
          </div>

          {/* Admin Form */}
          {isAdminSignup ? (
            <>
              <input type="email" name="email" placeholder="Admin Email"
                value={form.email} onChange={handleChange} required disabled={loading} />
              <input type="password" name="password" placeholder="Password"
                value={form.password} onChange={handleChange} required disabled={loading} />
              <input type="password" placeholder="🔑 Secret Admin Key"
                value={adminKey} onChange={e => setAdminKey(e.target.value)} required disabled={loading} />
              <p className="auth-admin-note">
                🔐 A secret admin key is required to create an admin account.
              </p>
            </>
          ) : (
            /* Alumni Form */
            <>
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required disabled={loading} />
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={loading} />
              <input name="rollNo" placeholder="Roll Number" value={form.rollNo} onChange={handleChange} required disabled={loading} />
              <input name="regNo" placeholder="Registration Number" value={form.regNo} onChange={handleChange} required disabled={loading} />

              <select name="branch" value={form.branch} onChange={handleChange} required disabled={loading}>
                <option value="">Select Branch</option>
                <option value="MCA">MCA</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>

              <div className="batch-row">
                <input type="number" name="batchFrom" placeholder="Batch From (e.g. 2021)"
                  value={form.batchFrom} onChange={handleChange} required disabled={loading} />
                <input type="number" name="batchTo" placeholder="Batch To (e.g. 2025)"
                  value={form.batchTo} onChange={handleChange} required disabled={loading} />
              </div>

              <input type="password" name="password" placeholder="Create Password"
                value={form.password} onChange={handleChange} required disabled={loading} />
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : isAdminSignup ? "Create Admin Account" : "Sign Up"}
          </button>

          <p className="switch-auth">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}