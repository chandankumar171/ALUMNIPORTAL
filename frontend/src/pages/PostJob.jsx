import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./PostJob.css";

export default function PostJob() {
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      alert("Please enter job opportunity or referral details");
      return;
    }
    setLoading(true);
    try {
      await API.post("/posts", { content: postContent });
      alert("Job opportunity posted successfully!");
      setPostContent("");
      navigate("/");
    } catch (error) {
      alert("Error creating post");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postjob-page">
      <div className="postjob-container">

        {/* Header */}
        <div className="postjob-header">
          <h2>Share an <span>Opportunity</span></h2>
          <p>Help your alumni network by sharing job opportunities and referrals</p>
        </div>

        {/* Card */}
        <div className="postjob-card">

          <div className="postjob-tips">
            <span className="tip-item">💼 Job Opening</span>
            <span className="tip-item">🤝 Referral</span>
            <span className="tip-item">📢 Internship</span>
            <span className="tip-item">🌐 Remote</span>
          </div>

          <textarea
            className="postjob-textarea"
            placeholder={`Write about a job opportunity, referral, or any update...

Example:
- Company: TechCorp
- Position: Senior Developer  
- Location: Remote
- Details: Looking for experienced React developers...`}
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            rows="9"
            disabled={loading}
          />

          <div className="postjob-char-count">
            {postContent.length} characters
          </div>

          <div className="postjob-actions">
            <button
              className="postjob-submit-btn"
              onClick={handleCreatePost}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="postjob-btn-spinner"></span>
                  Posting...
                </>
              ) : (
                <>📝 Post Opportunity</>
              )}
            </button>
            <button
              className="postjob-cancel-btn"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}