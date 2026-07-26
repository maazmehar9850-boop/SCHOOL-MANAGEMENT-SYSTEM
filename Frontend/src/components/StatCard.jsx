import { motion } from "framer-motion";

function StatCard({
  title,
  value,
  icon: Icon,
  accent = "from-[#3b5bdb] to-[#22b8cf]",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass-panel group relative overflow-hidden rounded-[1.35rem] p-5"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-[0.12] blur-2xl transition group-hover:opacity-25`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <p className="font-display mt-2.5 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-indigo-500/20`}
          >
            <Icon size={20} strokeWidth={2.1} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
