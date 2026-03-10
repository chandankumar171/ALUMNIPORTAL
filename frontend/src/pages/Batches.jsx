import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "./Batches.css";

export default function Batches() {
  const { branch } = useParams();
  const navigate = useNavigate();
  const [admissionYears, setAdmissionYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/users/branch/${branch}/admission-years`)
      .then(res => {
        setAdmissionYears(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admission years:", err);
        setLoading(false);
      });
  }, [branch]);

  return (
    <div className="batches-page">
      <div className="batches-container">

        {/* Header */}
        <div className="batches-header">
          <h2><span>{branch}</span> — Admission Years</h2>
          <p>Select a batch year to view alumni profiles</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="batches-loading">
            <div className="batches-loading-spinner"></div>
            <p>Loading admission years...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && admissionYears.length === 0 && (
          <div className="batches-empty">
            <div className="batches-empty-icon">🎓</div>
            <h3>No Students Found</h3>
            <p>No alumni registered under {branch} yet.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && admissionYears.length > 0 && (
          <div className="batches-grid">
            {admissionYears.map((year, index) => (
              <div
                className="batch-card"
                key={year}
                onClick={() => navigate(`/branches/${branch}/${year}`)}
              >
                <div className="batch-card-glow"></div>
                <div className="admission-year-label">Admitted</div>
                <div className="admission-year-value">{year}</div>
                <span className="batch-card-arrow">→</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}