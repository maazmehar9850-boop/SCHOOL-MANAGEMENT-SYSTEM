import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  accent = "from-[#3b5bdb] to-[#22b8cf]",
  onClick,
}) {
  const inner = (
    <div className="action-card group flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl border border-white/70 bg-white/65 p-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:border-white hover:bg-white/85 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md ring-4 ring-white/40`}
        >
          {Icon ? <Icon size={18} strokeWidth={2.1} /> : null}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100/80 text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white">
          <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#3b5bdb]/40"
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full text-left outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#3b5bdb]/40"
    >
      {inner}
    </button>
  );
}

export default ActionCard;
