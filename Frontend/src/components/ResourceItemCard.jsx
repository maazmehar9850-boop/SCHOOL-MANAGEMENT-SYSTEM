function ResourceItemCard({
  title,
  meta = [],
  badge,
  children,
  actions,
  accent = "from-sky-500 to-blue-600",
}) {
  return (
    <article className="resource-item-card">
      <div className={`resource-item-card__stripe bg-gradient-to-r ${accent}`} />
      <div className="resource-item-card__inner">
        <header className="resource-item-card__header">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="resource-item-card__title">{title}</h3>
              {badge ? (
                <span className="resource-item-card__badge">{badge}</span>
              ) : null}
            </div>
            {meta.length > 0 ? (
              <div className="resource-item-card__meta">
                {meta.map((item) => (
                  <span key={item} className="resource-item-card__pill">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {actions ? (
            <div className="resource-item-card__actions">{actions}</div>
          ) : null}
        </header>
        {children ? <div className="resource-item-card__content">{children}</div> : null}
      </div>
    </article>
  );
}

export default ResourceItemCard;
