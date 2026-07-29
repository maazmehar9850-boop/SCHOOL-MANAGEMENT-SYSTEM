import { motion } from "framer-motion";

function GradientButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0891b2] text-white border border-sky-300/20 shadow-[0_18px_36px_rgba(37,99,235,0.28)] hover:brightness-110",
    secondary:
      "bg-slate-950/60 text-slate-100 border border-sky-200/12 shadow-[0_14px_30px_rgba(2,6,23,0.24)] hover:bg-slate-900/80",
    danger:
      "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-[0_12px_28px_rgba(225,29,72,0.22)]",
    ghost:
      "bg-slate-950/35 text-slate-100 border border-white/10 hover:bg-slate-900/55",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.015, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.985 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold tracking-tight transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default GradientButton;
