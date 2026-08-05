import { Star } from "lucide-react";

export function Stars({ rating = 5, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

export function IconBadge({ icon: Icon, className = "", tone = "blue" }) {
  const tones = {
    blue: "border-blue-200/70 bg-gradient-to-br from-blue-50 to-sky-50 text-[#2563EB]",
    emerald: "border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600",
    amber: "border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600",
    navy: "border-slate-200/70 bg-gradient-to-br from-slate-50 to-blue-50 text-[#0F172A]",
  };

  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${tones[tone] || tones.blue} ${className}`}
    >
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}

export function GlassPanel({ children, className = "", hover = true }) {
  return (
    <div className={`site-card ${hover ? "" : "!transform-none"} ${className}`}>{children}</div>
  );
}

export default GlassPanel;
