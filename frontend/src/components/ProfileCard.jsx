import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaTrash } from "react-icons/fa";
import API from "../services/api";

export default function ProfileCard({ user, onDelete }) {
  const { user: loggedInUser } = useContext(AuthContext);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${user.name}'s profile and all their posts?`)) return;
    try {
      await API.delete(`/users/${user._id}`);
      if (onDelete) onDelete(user._id);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-card-glow"></div>

      {loggedInUser?.isAdmin && (
        <button className="profile-card-delete-btn" onClick={handleDelete} title="Delete user">
          <FaTrash />
        </button>
      )}

      <div className="profile-avatar">
        {user.name[0].toUpperCase()}
      </div>

      <h3>{user.name}</h3>

      <p className="profile-card-meta">
        <span>{user.branch}</span> &nbsp;•&nbsp; {user.batchFrom}–{user.batchTo}
      </p>

      <Link to={`/profile/${user._id}`} className="profile-view-btn">
        View Profile
      </Link>
    </div>
  );
}