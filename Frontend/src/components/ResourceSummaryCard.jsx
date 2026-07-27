import { motion } from "framer-motion";

function ResourceSummaryCard({
  title,
  value,
  icon: Icon,
  accent = "from-[#3b5bdb] to-[#22b8cf]",
  hint,
  actions,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="resource-summary-card group"
    >
      <div className={`resource-summary-card__accent bg-gradient-to-r ${accent}`} />
      <div
        className={`resource-summary-card__glow bg-gradient-to-br ${accent}`}
        aria-hidden
      />

      <div className="resource-summary-card__body">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="resource-summary-card__label">{title}</p>
            <p className="resource-summary-card__value">{value}</p>
            {hint ? <p className="resource-summary-card__hint">{hint}</p> : null}
          </div>
          {Icon ? (
            <div
              className={`resource-summary-card__icon bg-gradient-to-br ${accent}`}
            >
              <Icon size={20} strokeWidth={2.1} />
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="resource-summary-card__actions">{actions}</div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default ResourceSummaryCard;
