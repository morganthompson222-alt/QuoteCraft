export default function DashboardLoading() {
  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Dashboard</p>
          <h1>Workspace overview</h1>
        </div>
      </div>
      <div aria-busy="true">
        <div className="dashboard-stats">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="stat-card stat-card--skeleton" key={i}>
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--long" />
            </div>
          ))}
        </div>
        <div className="table-card" style={{ marginTop: 24 }}>
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="table-skeleton" key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
