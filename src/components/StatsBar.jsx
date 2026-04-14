export default function StatsBar({ stats }) {
  const pct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)

  return (
    <div className="stats-bar">
      <div className="stats-numbers">
        <span className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">전체</span>
        </span>
        <span className="stat-divider" aria-hidden="true" />
        <span className="stat">
          <span className="stat-value active">{stats.active}</span>
          <span className="stat-label">진행 중</span>
        </span>
        <span className="stat-divider" aria-hidden="true" />
        <span className="stat">
          <span className="stat-value done">{stats.completed}</span>
          <span className="stat-label">완료</span>
        </span>
      </div>
      <div className="progress-wrap" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`진행률 ${pct}%`}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-label">{pct}%</span>
      </div>
    </div>
  )
}
