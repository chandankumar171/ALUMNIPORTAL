import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1980;

export default function Signup({ onSignup }) {
  const navigate = useNavigate();

  const [isAdminSignup, setIsAdminSignup] = useState(false);
  const [adminKey, setAdminKey]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [batchError, setBatchError]       = useState("");

  const [form, setForm] = useState({
    name: "", email: "", rollNo: "", regNo: "",
    branch: "", batchFrom: "", batchTo: "", password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear batch error when user edits batch fields
    if (e.target.name === "batchFrom" || e.target.name === "batchTo") {
      setBatchError("");
    }
  };

  const validateBatchYears = () => {
    const from = parseInt(form.batchFrom);
    const to   = parseInt(form.batchTo);

    if (isNaN(from) || from < MIN_YEAR || from > CURRENT_YEAR + 1) {
      return `Batch From must be a valid year between ${MIN_YEAR} and ${CURRENT_YEAR + 1}`;
    }
    if (isNaN(to) || to < MIN_YEAR || to > CURRENT_YEAR + 6) {
      return `Batch To must be a valid year between ${MIN_YEAR} and ${CURRENT_YEAR + 6}`;
    }
    if (to < from) {
      return "Batch To must be after Batch From";
    }
    if (to - from > 6) {
      return "Batch duration cannot exceed 6 years";
    }
    return null; // no error
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBatchError("");

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

        const batchValidationError = validateBatchYears();
        if (batchValidationError) {
          setBatchError(batchValidationError);
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
              <input name="regNo" placeholder="Registration Number (optional)" value={form.regNo} onChange={handleChange} disabled={loading} />

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
                <input
                  type="number"
                  name="batchFrom"
                  placeholder={`From (e.g. ${CURRENT_YEAR - 2})`}
                  value={form.batchFrom}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min={MIN_YEAR}
                  max={CURRENT_YEAR + 1}
                />
                <input
                  type="number"
                  name="batchTo"
                  placeholder={`To (e.g. ${CURRENT_YEAR + 1})`}
                  value={form.batchTo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min={MIN_YEAR}
                  max={CURRENT_YEAR + 6}
                />
              </div>

              {/* Batch year error message */}
              {batchError && (
                <p className="batch-error-msg">⚠️ {batchError}</p>
              )}

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