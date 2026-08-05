import GlassCard from "./GlassCard";

function DashboardPanel({
  title,
  subtitle,
  children,
  action,
  hover = false,
  className = "",
}) {
  return (
    <GlassCard className={`dashboard-panel p-6 md:p-8 ${className}`} hover={hover}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="card-heading">{title}</h2>
          {subtitle ? <p className="card-lead mt-1.5 max-w-2xl">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </GlassCard>
  );
}

export default DashboardPanel;
