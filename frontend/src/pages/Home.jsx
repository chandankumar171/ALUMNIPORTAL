import { useEffect, useState } from "react";
import API from "../services/api";
import PostCard from "../components/PostCard";
import "./Home.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      if (localStorage.getItem("token")) {
        const res = await API.get("/posts");
        setPosts(res.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  return (
    <div className="home-page">
      <div className="home-container">

        {/* Header */}
        <div className="home-header">
          <div className="home-header-left">
            <h2>Opportunities <span>Feed</span></h2>
            <p>Latest jobs, internships & referrals from the alumni network</p>
          </div>
          {!loading && posts.length > 0 && (
            <span className="post-count-badge">
              {posts.length} {posts.length === 1 ? "Opportunity" : "Opportunities"}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="home-loading">
            <div className="loading-spinner"></div>
            <p>Loading opportunities...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((p, index) => (
              <div className="post-card-wrapper" key={p._id}>
                <PostCard
                  post={p}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="posts-grid">
            <div className="no-posts-card">
              <div className="no-posts-icon">💼</div>
              <h3>No Opportunities Yet</h3>
              <p>Click "Post Job" to share the first opportunity with the network!</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}