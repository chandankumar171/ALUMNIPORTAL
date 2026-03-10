import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import ProfileCard from "../components/ProfileCard";
import "./Profiles.css";

export default function Profiles() {
  const { branch, batch } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmissionYear = !batch.includes("-");

    if (isAdmissionYear) {
      API.get(`/users/branch/${branch}/admission/${batch}`)
        .then(res => { setUsers(res.data); setLoading(false); })
        .catch(err => { console.error("Error fetching users:", err); setLoading(false); });
    } else {
      const [from, to] = batch.split("-");
      API.get(`/users/branch/${branch}/batch/${from}-${to}`)
        .then(res => { setUsers(res.data); setLoading(false); })
        .catch(err => { console.error("Error fetching users:", err); setLoading(false); });
    }
  }, [branch, batch]);

  return (
    <div className="profiles-page">
      <div className="profiles-container">

        {/* Header */}
        <div className="profiles-header">
          <div>
            <h2><span>{branch}</span> — Batch {batch}</h2>
            <p>Alumni profiles for this batch</p>
          </div>
          {!loading && users.length > 0 && (
            <span className="profiles-count-badge">
              {users.length} {users.length === 1 ? "Alumni" : "Alumni"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="profiles-loading">
            <div className="profiles-loading-spinner"></div>
            <p>Loading profiles...</p>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="profiles-grid">
            {users.length === 0 ? (
              <div className="profiles-empty">
                <div className="profiles-empty-icon">👥</div>
                <h3>No Alumni Found</h3>
                <p>No students registered for {branch} — Batch {batch} yet.</p>
              </div>
            ) : (
              users.map(u => <ProfileCard key={u._id} user={u} />)
            )}
          </div>
        )}

      </div>
    </div>
  );
}