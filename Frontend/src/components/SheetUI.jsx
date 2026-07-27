export function StatusBadge({ status }) {
  const present = status === "Present";
  return (
    <span className={`status-badge ${present ? "status-badge--present" : "status-badge--absent"}`}>
      {status}
    </span>
  );
}

export function StatPill({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
    brand: "bg-indigo-100 text-indigo-800",
  };

  return (
    <div className={`stat-pill ${tones[tone] || tones.default}`}>
      <span className="stat-pill__label">{label}</span>
      <span className="stat-pill__value">{value}</span>
    </div>
  );
}

export function SheetMeta({ items = [] }) {
  return (
    <div className="sheet-meta">
      {items.map((item) => (
        <div key={item.label} className="sheet-meta__item">
          <span className="sheet-meta__label">{item.label}</span>
          <span className="sheet-meta__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
