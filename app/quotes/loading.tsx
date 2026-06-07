export default function QuotesLoading() {
  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Quotes</p>
          <h1>Quote records</h1>
        </div>
      </div>
      <div className="table-card" aria-busy="true">
        <div className="table-skeleton table-skeleton--header" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="table-skeleton" key={i} />
        ))}
      </div>
    </section>
  );
}
