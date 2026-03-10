import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Welcome.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function Welcome() {
  const [stats, setStats] = useState({ totalAlumni: 0, totalJobs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/public/stats`);
        const data = await response.json();
        setStats({
          totalAlumni: data.totalAlumni || 0,
          totalJobs: data.totalJobs || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const [displayAlumni, setDisplayAlumni] = useState(0);
  const [displayJobs, setDisplayJobs] = useState(0);

  useEffect(() => {
    if (stats.totalAlumni > 0) {
      let currentAlumni = 0;
      const interval = setInterval(() => {
        currentAlumni += Math.ceil(stats.totalAlumni / 50);
        if (currentAlumni >= stats.totalAlumni) {
          currentAlumni = stats.totalAlumni;
          clearInterval(interval);
        }
        setDisplayAlumni(currentAlumni);
      }, 30);
    }

    if (stats.totalJobs > 0) {
      let currentJobs = 0;
      const interval = setInterval(() => {
        currentJobs += Math.ceil(stats.totalJobs / 50);
        if (currentJobs >= stats.totalJobs) {
          currentJobs = stats.totalJobs;
          clearInterval(interval);
        }
        setDisplayJobs(currentJobs);
      }, 30);
    }
  }, [stats]);

  return (
    <div className="welcome-page">
      {/* NAVBAR */}
      <nav className="welcome-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <h1>Alumni Network</h1>
          </div>
          <div className="navbar-links">
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/signup" className="nav-btn signup-btn">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="grid-pattern"></div>
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          <div className="ambient-orb orb-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-title">
            <h2 className="main-heading">
              Connect. <span className="highlight">Network.</span> Grow.
            </h2>
            <p className="hero-subtitle">
              Join the most advanced alumni network platform designed for tech-forward professionals. Share opportunities, build connections, and accelerate your career.
            </p>
          </div>

          <div className="hero-cta">
            <Link to="/signup" className="cta-btn primary-btn">Get Started Free</Link>
            <Link to="/login" className="cta-btn secondary-btn">Already a Member?</Link>
          </div>
        </div>
      </section>

      {/* COUNTER SECTION */}
      <section className="counter-section">
        <h2 className="section-title">Our Impact</h2>
        <div className="counter-grid">
          <div className="counter-card">
            <div className="counter-icon">👥</div>
            <div className="counter-display">
              <span className="counter-number">{displayAlumni.toLocaleString()}</span>
              <span className="counter-label">Active Alumni</span>
            </div>
            <div className="counter-glow"></div>
          </div>

          <div className="counter-card">
            <div className="counter-icon">💼</div>
            <div className="counter-display">
              <span className="counter-number">{displayJobs.toLocaleString()}</span>
              <span className="counter-label">Job Opportunities</span>
            </div>
            <div className="counter-glow"></div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <h2 className="section-title">What We Provide</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Global Network</h3>
            <p>Connect with alumni across all batches, branches, and specializations worldwide.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Job Opportunities</h3>
            <p>Access exclusive job postings, internships, and referrals from trusted companies.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Mentorship</h3>
            <p>Get guidance from experienced alumni and mentor the next generation of professionals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Industry Insights</h3>
            <p>Share knowledge, discuss trends, and stay updated with the latest industry developments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Career Growth</h3>
            <p>Accelerate your career with connections, collaborations, and opportunities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure & Private</h3>
            <p>Your data is protected with enterprise-grade security and privacy controls.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="welcome-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Alumni Network</h3>
            <p>Building connections. Creating opportunities.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </div>
          <div className="footer-socials">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">f</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">in</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">tw</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Alumni Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}