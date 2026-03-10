import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaUsers, FaFileAlt, FaShieldAlt } from "react-icons/fa";
import API from "../services/api";
import "./AdminPanel.css";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers]         = useState([]);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (user && !user.isAdmin) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        API.get("/users"),
        API.get("/posts/admin/all"),
      ]);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}'s profile and all their posts?`)) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setPosts(prev => prev.filter(p => p.postedBy?._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/admin/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting post");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <div className="admin-header-icon"><FaShieldAlt /></div>
            <div>
              <h2>Admin <span>Panel</span></h2>
              <p>Manage alumni profiles and posts</p>
            </div>
          </div>
          <div className="admin-stats">
            <div className="admin-stat-badge"><FaUsers /> {users.length} Alumni</div>
            <div className="admin-stat-badge"><FaFileAlt /> {posts.length} Posts</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}>
            <FaUsers /> Alumni ({users.length})
          </button>
          <button className={`admin-tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}>
            <FaFileAlt /> Posts ({posts.length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="admin-list">
                {users.length === 0 ? (
                  <div className="admin-empty"><p>No alumni registered yet.</p></div>
                ) : users.map(u => (
                  <div key={u._id} className="admin-card">
                    <div className="admin-card-avatar">{u.name?.[0]?.toUpperCase() || "?"}</div>
                    <div className="admin-card-info">
                      <h4>{u.name}</h4>
                      <p>{u.email}</p>
                      <div className="admin-card-tags">
                        <span className="admin-tag">{u.branch}</span>
                        <span className="admin-tag">{u.batchFrom}–{u.batchTo}</span>
                        <span className="admin-tag muted">Joined {formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                    <div className="admin-card-actions">
                      <button className="admin-view-btn" onClick={() => navigate(`/profile/${u._id}`)}>
                        View
                      </button>
                      <button className="admin-delete-btn" onClick={() => handleDeleteUser(u._id, u.name)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="admin-list">
                {posts.length === 0 ? (
                  <div className="admin-empty"><p>No posts yet.</p></div>
                ) : posts.map(p => (
                  <div key={p._id} className="admin-card">
                    <div className="admin-card-avatar post-avatar">
                      {p.postedBy?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="admin-card-info">
                      <h4>{p.postedBy?.name || "Unknown"}</h4>
                      <p className="admin-post-content">
                        {p.content?.slice(0, 120)}{p.content?.length > 120 ? "..." : ""}
                      </p>
                      <div className="admin-card-tags">
                        <span className="admin-tag">{p.postedBy?.branch}</span>
                        <span className="admin-tag">👍 {p.likes?.length || 0}</span>
                        <span className="admin-tag">💬 {p.comments?.length || 0}</span>
                        <span className="admin-tag muted">{formatDate(p.createdAt)}</span>
                      </div>
                    </div>
                    <div className="admin-card-actions">
                      <button className="admin-delete-btn" onClick={() => handleDeletePost(p._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}