import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import PostCard from "../components/PostCard";
import "./Profile.css";
import { FaLinkedin, FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";

// Accepts any format:
//   "9876543210"      → wa.me/919876543210  (10 digits, auto-adds 91)
//   "+91 9876543210"  → wa.me/919876543210  (strips + and space)
//   "919876543210"    → wa.me/919876543210  (already has country code)
const buildWhatsAppUrl = (raw) => {
  const digits = String(raw).replace(/[^\d]/g, "");
  // If user entered just 10-digit Indian number, prepend 91
  const number = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${number}`;
};

export default function Profile() {
  const { id } = useParams();
  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser]               = useState(null);
  const [isEditing, setIsEditing]     = useState(false);
  const [editData, setEditData]       = useState({});
  const [skillsInput, setSkillsInput] = useState("");
  const [error, setError]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [userPosts, setUserPosts]     = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false);

  const isOwnProfile = loggedInUser?._id === id;

  useEffect(() => {
    setLoading(true);
    API.get(`/users/${id}`)
      .then(res => {
        setUser(res.data);
        setEditData(res.data.profile || {});
        setSkillsInput((res.data.profile?.skills || []).join(", "));
        setError(null);
        setLoading(false);
        if (loggedInUser?._id === id) fetchUserPosts(id);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [id, loggedInUser]);

  const fetchUserPosts = async (userId) => {
    setPostsLoading(true);
    try {
      const res = await API.get("/posts");
      setUserPosts(res.data.filter(post => post.postedBy._id === userId));
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const dataToSave = {
        ...editData,
        skills: skillsInput.split(",").map(s => s.trim()).filter(Boolean)
      };
      const res = await API.put("/users/update", dataToSave);
      setUser(res.data);
      setEditData(res.data.profile || {});
      setSkillsInput((res.data.profile?.skills || []).join(", "));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <div className="profile-state-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <p className="profile-state-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  const { profile } = user;

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── HEADER CARD ─────────────────────────────────────────────── */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h1>{user.name}</h1>
            <div className="user-info-row"><strong>Email</strong>{user.email}</div>
            <div className="user-info-row"><strong>Roll No</strong>{user.rollNo}</div>
            <div className="user-info-row"><strong>Reg No</strong>{user.regNo}</div>
            <div className="user-info-row"><strong>Branch</strong>{user.branch}</div>
            <div className="user-info-row"><strong>Batch</strong>{user.batchFrom}–{user.batchTo}</div>
          </div>
        </div>

        {/* ── PROFESSIONAL PROFILE ────────────────────────────────────── */}
        <div className="profile-section">
          <h2>Professional Profile</h2>

          {!isEditing ? (
            <>
              {profile?.jobRole && (
                <div className="profile-field">
                  <strong>Job Role</strong>
                  {profile.jobRole}{profile.company && ` @ ${profile.company}`}
                </div>
              )}

              {profile?.about && (
                <div className="profile-field">
                  <strong>About</strong>
                  {profile.about}
                </div>
              )}

              {profile?.skills?.length > 0 && (
                <div className="profile-field" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <strong>Skills</strong>
                  <div className="skills-list">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Icons */}
              {(profile?.linkedin || profile?.github || profile?.instagram || profile?.whatsapp) && (
                <div className="social-icons">
                  {profile?.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                      <FaLinkedin />
                    </a>
                  )}
                  {profile?.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer" title="GitHub">
                      <FaGithub />
                    </a>
                  )}
                  {profile?.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noreferrer" title="Instagram">
                      <FaInstagram />
                    </a>
                  )}
                  {profile?.whatsapp && (
                    <a
                      href={buildWhatsAppUrl(profile.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp"
                    >
                      <FaWhatsapp />
                    </a>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <button className="edit-btn" onClick={() => {
                  setIsEditing(true);
                  setSkillsInput((user.profile?.skills || []).join(", "));
                }}>
                  Edit Profile
                </button>
              )}
            </>
          ) : (
            <>
              {/* EDIT MODE */}
              <div className="edit-form">
                <input
                  placeholder="LinkedIn URL"
                  value={editData.linkedin || ""}
                  onChange={e => setEditData({ ...editData, linkedin: e.target.value })}
                />
                <input
                  placeholder="GitHub URL"
                  value={editData.github || ""}
                  onChange={e => setEditData({ ...editData, github: e.target.value })}
                />
                <input
                  placeholder="Instagram URL"
                  value={editData.instagram || ""}
                  onChange={e => setEditData({ ...editData, instagram: e.target.value })}
                />
                <input
                  placeholder="WhatsApp number (e.g. 9876543210)"
                  value={editData.whatsapp || ""}
                  onChange={e => setEditData({ ...editData, whatsapp: e.target.value })}
                />
                <input
                  placeholder="Job Role"
                  value={editData.jobRole || ""}
                  onChange={e => setEditData({ ...editData, jobRole: e.target.value })}
                />
                <input
                  placeholder="Company"
                  value={editData.company || ""}
                  onChange={e => setEditData({ ...editData, company: e.target.value })}
                />
                <textarea
                  placeholder="About"
                  value={editData.about || ""}
                  onChange={e => setEditData({ ...editData, about: e.target.value })}
                />
                <input
                  placeholder="Skills (comma separated, e.g. JavaScript, React, Node.js)"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                />
                <div className="button-group">
                  <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                  <button className="cancel-btn" onClick={() => {
                    setIsEditing(false);
                    setEditData(user.profile || {});
                    setSkillsInput((user.profile?.skills || []).join(", "));
                  }}>Cancel</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── VIEW YOUR POSTS BUTTON ───────────────────────────────────── */}
        {isOwnProfile && (
          <div className="view-posts-button-container">
            <button className="view-posts-btn" onClick={() => setShowUserPosts(!showUserPosts)}>
              {showUserPosts ? "📖 Hide Your Posts" : "📄 View Your Posts"}
            </button>
          </div>
        )}

        {/* ── YOUR POSTS SECTION ──────────────────────────────────────── */}
        {isOwnProfile && showUserPosts && (
          <div className="your-posts-section">
            <h2>Your Posts</h2>
            {postsLoading ? (
              <p className="loading-text">Loading your posts...</p>
            ) : userPosts.length > 0 ? (
              <div className="posts-list">
                {userPosts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpdate={updatedPost => setUserPosts(userPosts.map(p => p._id === updatedPost._id ? updatedPost : p))}
                    onDelete={postId => setUserPosts(userPosts.filter(p => p._id !== postId))}
                  />
                ))}
              </div>
            ) : (
              <p className="no-posts">You haven't posted any opportunities yet. Click "Post Job" to share one!</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}