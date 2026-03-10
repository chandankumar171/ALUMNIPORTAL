import { useNavigate } from "react-router-dom";
import BranchCard from "../components/BranchCard";
import "./Branches.css";

const branches = ["MCA", "CSE", "ECE", "EEE", "ME", "CE"];

export default function Branches() {
  const navigate = useNavigate();

  return (
    <div className="branches-page">
      <div className="branches-container">

        {/* Header */}
        <div className="branches-header">
          <h2>Explore <span>Branches</span></h2>
          <p>Select a branch to view alumni and opportunities</p>
        </div>

        {/* Grid */}
        <div className="branches-grid">
          {branches.map(b => (
            <BranchCard
              key={b}
              branch={b}
              onClick={() => navigate(`/branches/${b}`)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}