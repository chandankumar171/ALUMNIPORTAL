// BatchCard is rendered inline in Batches.jsx for full theme control.
// This component is kept for any standalone usage if needed.

export default function BatchCard({ batch, onClick }) {
  return (
    <div className="batch-card" onClick={onClick}>
      <div className="batch-card-glow"></div>
      <div className="admission-year-label">Admitted</div>
      <div className="admission-year-value">{batch}</div>
      <span className="batch-card-arrow">→</span>
    </div>
  );
}