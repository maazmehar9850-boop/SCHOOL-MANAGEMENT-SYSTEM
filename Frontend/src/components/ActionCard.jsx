import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  accent = "from-[#22d3ee] to-[#3b82f6]",
  onClick,
}) {
  const inner = (
    <div className="action-card group flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white shadow-[0_0_18px_rgba(34,211,238,0.28)]`}
        >
          {Icon ? <Icon size={18} strokeWidth={2.1} /> : null}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-500 transition-colors group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
          <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="mt-4">
        <h3 className="card-heading text-[1.05rem]">{title}</h3>
        {description ? <p className="card-lead mt-1.5">{description}</p> : null}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full text-left outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-cyan-400/40"
    >
      {inner}
    </button>
  );
}

export default ActionCard;
