import GlassCard from "./GlassCard";

function PageContentCard({
  title,
  subtitle,
  action,
  children,
  hover = false,
  delay = 0,
  className = "",
  padding = true,
}) {
  return (
    <GlassCard
      className={`page-content-card ${padding ? "p-4 sm:p-6 md:p-8" : ""} ${className}`}
      hover={hover}
      delay={delay}
    >
      {(title || subtitle || action) && (
        <div className="page-content-card__header">
          <div>
            {title ? <h2 className="card-heading">{title}</h2> : null}
            {subtitle ? <p className="card-lead mt-1.5 max-w-3xl">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </GlassCard>
  );
}

export default PageContentCard;
