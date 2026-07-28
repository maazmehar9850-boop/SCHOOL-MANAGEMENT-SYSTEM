export function getTableValue(row, key) {
  if (!key) return undefined;
  if (!key.includes(".")) return row[key];
  return key.split(".").reduce((acc, part) => acc?.[part], row);
}

function MobileDataCards({
  columns = [],
  rows = [],
  emptyMessage = "No records found",
  getRowId = (row, idx) => row._id || row.id || idx,
}) {
  if (rows.length === 0) {
    return (
      <div className="mobile-data-card mobile-data-card--empty md:hidden">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mobile-data-cards md:hidden">
      {rows.map((row, idx) => (
        <article key={getRowId(row, idx)} className="mobile-data-card">
          {columns.map((col) => (
            <div key={col.key} className="mobile-data-card__field">
              <span className="mobile-data-card__label">{col.label}</span>
              <div className={`mobile-data-card__value ${col.tdClassName || ""}`}>
                {col.render ? col.render(row) : getTableValue(row, col.key) ?? "—"}
              </div>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}

export default MobileDataCards;
