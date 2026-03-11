import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import PostCard from "../components/PostCard";
import "./Profile.css";
import { FaLinkedin, FaGithub, FaInstagram, FaWhatsapp, FaPen } from "react-icons/fa";

const buildWhatsAppUrl = (raw) => {
  const digits = String(raw).replace(/[^\d]/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${number}`;
};

export default function Profile() {
  const { id } = useParams();
  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser]               = useState(null);
  const [isEditing, setIsEditing]     = useState(false);       // professional profile edit
  const [isEditingBasic, setIsEditingBasic] = useState(false); // basic info edit
  const [editData, setEditData]       = useState({});
  const [basicData, setBasicData]     = useState({});          // basic info form data
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
        setBasicData({
          name:      res.data.name      || "",
          email:     res.data.email     || "",
          rollNo:    res.data.rollNo    || "",
          regNo:     res.data.regNo     || "",
          branch:    res.data.branch    || "",
          batchFrom: res.data.batchFrom || "",
          batchTo:   res.data.batchTo   || "",
        });
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

  // Save professional profile
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

  // Save basic info
  const handleSaveBasicInfo = async () => {
    try {
      if (!basicData.name.trim()) {
        alert("Name cannot be empty");
        return;
      }
      if (!basicData.email.trim()) {
        alert("Email cannot be empty");
        return;
      }
      if (!basicData.branch) {
        alert("Please select a branch");
        return;
      }
      if (!basicData.batchFrom || !basicData.batchTo) {
        alert("Please enter batch years");
        return;
      }
      const res = await API.put("/users/basic-info", basicData);
      setUser(res.data);
      setBasicData({
        name:      res.data.name      || "",
        email:     res.data.email     || "",
        rollNo:    res.data.rollNo    || "",
        regNo:     res.data.regNo     || "",
        branch:    res.data.branch    || "",
        batchFrom: res.data.batchFrom || "",
        batchTo:   res.data.batchTo   || "",
      });
      setIsEditingBasic(false);
      alert("Basic info updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating basic info");
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

          {!isEditingBasic ? (
            /* VIEW MODE — basic info */
            <div className="user-info">
              <h1>{user.name}</h1>
              <div className="user-info-row"><strong>Email</strong>{user.email}</div>
              <div className="user-info-row"><strong>Roll No</strong>{user.rollNo}</div>
              {user.regNo && <div className="user-info-row"><strong>Reg No</strong>{user.regNo}</div>}
              <div className="user-info-row"><strong>Branch</strong>{user.branch}</div>
              <div className="user-info-row"><strong>Batch</strong>{user.batchFrom}–{user.batchTo}</div>

              {isOwnProfile && (
                <button
                  className="edit-basic-btn"
                  onClick={() => setIsEditingBasic(true)}
                  title="Edit basic info"
                >
                  <FaPen /> Edit Info
                </button>
              )}
            </div>
          ) : (
            /* EDIT MODE — basic info */
            <div className="user-info basic-edit-form">
              <h3 className="basic-edit-title">Edit Basic Info</h3>

              <input
                className="basic-input"
                placeholder="Full Name"
                value={basicData.name}
                onChange={e => setBasicData({ ...basicData, name: e.target.value })}
              />
              <input
                className="basic-input"
                type="email"
                placeholder="Email"
                value={basicData.email}
                onChange={e => setBasicData({ ...basicData, email: e.target.value })}
              />
              <input
                className="basic-input"
                placeholder="Roll Number"
                value={basicData.rollNo}
                onChange={e => setBasicData({ ...basicData, rollNo: e.target.value })}
              />
              <input
                className="basic-input"
                placeholder="Registration Number (optional)"
                value={basicData.regNo}
                onChange={e => setBasicData({ ...basicData, regNo: e.target.value })}
              />
              <select
                className="basic-input"
                value={basicData.branch}
                onChange={e => setBasicData({ ...basicData, branch: e.target.value })}
              >
                <option value="">Select Branch</option>
                <option value="MCA">MCA</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>
              <div className="basic-batch-row">
                <input
                  className="basic-input"
                  type="number"
                  placeholder="Batch From (e.g. 2021)"
                  value={basicData.batchFrom}
                  onChange={e => setBasicData({ ...basicData, batchFrom: e.target.value })}
                />
                <input
                  className="basic-input"
                  type="number"
                  placeholder="Batch To (e.g. 2025)"
                  value={basicData.batchTo}
                  onChange={e => setBasicData({ ...basicData, batchTo: e.target.value })}
                />
              </div>

              <div className="button-group">
                <button className="save-btn" onClick={handleSaveBasicInfo}>Save</button>
                <button className="cancel-btn" onClick={() => {
                  setIsEditingBasic(false);
                  setBasicData({
                    name: user.name || "", email: user.email || "",
                    rollNo: user.rollNo || "", regNo: user.regNo || "",
                    branch: user.branch || "",
                    batchFrom: user.batchFrom || "", batchTo: user.batchTo || "",
                  });
                }}>Cancel</button>
              </div>
            </div>
          )}
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
                    <a href={buildWhatsAppUrl(profile.whatsapp)} target="_blank" rel="noreferrer" title="WhatsApp">
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
            <div className="edit-form">
              <input placeholder="LinkedIn URL"     value={editData.linkedin  || ""} onChange={e => setEditData({ ...editData, linkedin:  e.target.value })} />
              <input placeholder="GitHub URL"       value={editData.github    || ""} onChange={e => setEditData({ ...editData, github:    e.target.value })} />
              <input placeholder="Instagram URL"    value={editData.instagram || ""} onChange={e => setEditData({ ...editData, instagram: e.target.value })} />
              <input placeholder="WhatsApp number (e.g. 9876543210)" value={editData.whatsapp || ""} onChange={e => setEditData({ ...editData, whatsapp: e.target.value })} />
              <input placeholder="Job Role"         value={editData.jobRole   || ""} onChange={e => setEditData({ ...editData, jobRole:   e.target.value })} />
              <input placeholder="Company"          value={editData.company   || ""} onChange={e => setEditData({ ...editData, company:   e.target.value })} />
              <textarea placeholder="About"         value={editData.about     || ""} onChange={e => setEditData({ ...editData, about:     e.target.value })} />
              <input placeholder="Skills (comma separated, e.g. JavaScript, React, Node.js)" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} />
              <div className="button-group">
                <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                <button className="cancel-btn" onClick={() => {
                  setIsEditing(false);
                  setEditData(user.profile || {});
                  setSkillsInput((user.profile?.skills || []).join(", "));
                }}>Cancel</button>
              </div>
            </div>
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