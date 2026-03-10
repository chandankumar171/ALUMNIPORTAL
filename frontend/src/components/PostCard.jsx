import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FaThumbsUp, FaComment, FaTrash } from "react-icons/fa";
import "./PostCard.css";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Normalise any like value (ObjectId, string, or populated object) to a plain string
  const normaliseId = (val) => val?._id ? String(val._id) : String(val);

  const checkIfLiked = (likesArray) => {
    if (!likesArray || !user?._id) return false;
    return likesArray.some(like => normaliseId(like) === String(user._id));
  };

  const [likes, setLikes]               = useState(post?.likes || []);
  const [comments, setComments]         = useState(post?.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState("");
  const [isLiked, setIsLiked]           = useState(checkIfLiked(post?.likes));
  const [likeLoading, setLikeLoading]   = useState(false);

  if (!user || !post || !post.postedBy) return null;

  const isOwnPost = String(user._id) === String(post.postedBy._id);
  const canDelete = isOwnPost || user?.isAdmin;

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    if (isLiked) {
      setLikes(prev => prev.filter(like => normaliseId(like) !== String(user._id)));
      setIsLiked(false);
    } else {
      setLikes(prev => [...prev, user._id]);
      setIsLiked(true);
    }

    try {
      const endpoint = isLiked ? `/posts/${post._id}/unlike` : `/posts/${post._id}/like`;
      const res = await API.post(endpoint);
      // Sync with fully-populated server response
      setLikes(res.data.likes);
      setIsLiked(checkIfLiked(res.data.likes));
      if (onUpdate) onUpdate(res.data);
    } catch (error) {
      console.error("Error toggling like:", error);
      setLikes(post.likes || []);
      setIsLiked(checkIfLiked(post.likes));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const tempComment = {
      _id: `temp-${Date.now()}`,
      text: commentText,
      user: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, tempComment]);
    setCommentText("");
    try {
      const res = await API.post(`/posts/${post._id}/comment`, { text: tempComment.text });
      setComments(res.data.comments);
      if (onUpdate) onUpdate(res.data);
    } catch (error) {
      console.error("Error adding comment:", error);
      setComments(prev => prev.filter(c => c._id !== tempComment._id));
      setCommentText(tempComment.text);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
    try {
      const res = await API.delete(`/posts/${post._id}/comment/${commentId}`);
      setComments(res.data.comments);
      if (onUpdate) onUpdate(res.data);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setComments(post.comments || []);
    }
  };

  const handleDeletePost = async () => {
    const msg = user?.isAdmin && !isOwnPost
      ? "Delete this post as admin?"
      : "Are you sure you want to delete this post?";
    if (!window.confirm(msg)) return;
    try {
      if (user?.isAdmin && !isOwnPost) {
        await API.delete(`/posts/admin/${post._id}`);
      } else {
        await API.delete(`/posts/${post._id}`);
      }
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-poster-info">
          <div className="avatar-small">
            {post.postedBy.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="poster-name" onClick={() => navigate(`/profile/${post.postedBy._id}`)}>
              {post.postedBy.name}
            </h4>
            <small>{post.postedBy.branch} • {post.postedBy.batchFrom}</small>
          </div>
        </div>
        {canDelete && (
          <button
            className={`delete-post-btn ${user?.isAdmin && !isOwnPost ? "admin-delete-btn" : ""}`}
            onClick={handleDeletePost}
            title={user?.isAdmin && !isOwnPost ? "Delete as Admin" : "Delete post"}
          >
            <FaTrash />
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <div className="post-actions">
        <button className={`action-btn ${isLiked ? "liked" : ""}`} onClick={handleLike} disabled={likeLoading}>
          <FaThumbsUp />
          {likes?.length || 0} {likes?.length === 1 ? "Like" : "Likes"}
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <FaComment />
          {comments?.length || 0} {comments?.length === 1 ? "Comment" : "Comments"}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="add-comment">
            <input type="text" placeholder="Add a comment..."
              value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleAddComment()} />
            <button onClick={handleAddComment}>Post</button>
          </div>
          <div className="comments-list">
            {comments?.length > 0 ? comments.map(comment => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <strong className="comment-author"
                    onClick={() => comment.user?._id && navigate(`/profile/${comment.user._id}`)}>
                    {comment.user?.name}
                  </strong>
                  {(String(user._id) === String(comment.user?._id) ||
                    String(user._id) === String(post.postedBy._id) ||
                    user?.isAdmin) && (
                    <button className="delete-comment-btn"
                      onClick={() => handleDeleteComment(comment._id)}>✕</button>
                  )}
                </div>
                <p>{comment.text}</p>
                <small>{formatDate(comment.createdAt)}</small>
              </div>
            )) : (
              <p className="no-comments">No comments yet</p>
            )}
          </div>
        </div>
      )}

      <div className="post-meta">
        <small>{formatDate(post.createdAt)}</small>
      </div>
    </div>
  );
}