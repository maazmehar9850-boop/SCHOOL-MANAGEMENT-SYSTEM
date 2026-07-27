import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  accent = "from-[#3b5bdb] to-[#22b8cf]",
  delay = 0,
  hint,
  interactive = false,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={interactive ? { y: -5 } : undefined}
      className={`group relative h-full overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 via-white/75 to-white/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-shadow duration-300 ${
        interactive
          ? "cursor-pointer hover:border-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          : ""
      } ${className}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${accent} opacity-90`}
      />
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-[0.14] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.22]`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="font-display mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{hint}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {Icon ? (
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-slate-900/10 ring-4 ring-white/50`}
            >
              <Icon size={20} strokeWidth={2.1} />
            </div>
          ) : null}
          {interactive ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/80 text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-slate-700">
              <ArrowUpRight size={14} />
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
