const branchMeta = {
  MCA: { icon: "💻", desc: "Master of Computer Applications" },
  CSE: { icon: "🖥️", desc: "Computer Science & Engineering" },
  ECE: { icon: "📡", desc: "Electronics & Communication Engg." },
  EEE: { icon: "⚡", desc: "Electrical & Electronics Engg." },
  ME:  { icon: "⚙️", desc: "Mechanical Engineering" },
  CE:  { icon: "🏗️", desc: "Civil Engineering" },
  IT:  { icon: "🌐", desc: "Information Technology" },
};

export default function BranchCard({ branch, onClick }) {
  const meta = branchMeta[branch] || { icon: "🎓", desc: "Engineering Branch" };

  return (
    <div className="branch-card" onClick={onClick}>
      <div className="branch-card-glow"></div>
      <span className="branch-icon">{meta.icon}</span>
      <h3>{branch}</h3>
      <p>{meta.desc}</p>
      <span className="branch-card-arrow">→</span>
    </div>
  );
}