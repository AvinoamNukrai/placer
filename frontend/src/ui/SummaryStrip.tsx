type Props = { total_venues: number; total_foot_traffic: number }

export function SummaryStrip({ total_venues, total_foot_traffic }: Props) {
  const fmt = (n: number) => n.toLocaleString()
  return (
    <div className="summary">
      <div className="summary-card">
        <div className="summary-label">Total Venues</div>
        <div className="summary-value">{fmt(total_venues)}</div>
      </div>
      <div className="summary-card">
        <div className="summary-label">Total Foot Traffic</div>
        <div className="summary-value">{fmt(total_foot_traffic)}</div>
      </div>
    </div>
  )
}
