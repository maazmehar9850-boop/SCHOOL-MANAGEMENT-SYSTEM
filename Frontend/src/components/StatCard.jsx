import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  accent = "from-[#22d3ee] to-[#3b82f6]",
  glow = "rgba(34, 211, 238, 0.35)",
  hint,
  trend,
  trendUp = true,
  interactive = false,
  className = "",
}) {
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <div
      className={`stat-card group relative h-full overflow-hidden rounded-2xl p-5 transition-transform duration-200 ${
        interactive ? "cursor-pointer hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow eyebrow--muted">{title}</p>
          <p className="stat-card__value font-display mt-2.5 text-[1.85rem] font-bold leading-none tracking-tight text-white sm:text-[2.05rem]">
            {value}
          </p>
          {trend ? (
            <p
              className={`mt-2.5 flex items-center gap-1 text-xs font-medium ${
                trendUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <TrendIcon size={13} strokeWidth={2.4} />
              {trend}
            </p>
          ) : hint ? (
            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{hint}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {Icon ? (
            <div
              className={`stat-card__icon flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white`}
              style={{ boxShadow: `0 0 20px ${glow}` }}
            >
              <Icon size={20} strokeWidth={2.1} />
            </div>
          ) : null}
          {interactive ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:text-cyan-300">
              <ArrowUpRight size={14} />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
