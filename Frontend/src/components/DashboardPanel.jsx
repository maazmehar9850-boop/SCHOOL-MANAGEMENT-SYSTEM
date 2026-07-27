import GlassCard from "./GlassCard";

function DashboardPanel({
  title,
  subtitle,
  children,
  action,
  hover = false,
  delay = 0,
  className = "",
}) {
  return (
    <GlassCard className={`p-6 md:p-8 ${className}`} hover={hover} delay={delay}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </GlassCard>
  );
}

export default DashboardPanel;
