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
      "bg-gradient-to-r from-[#3b5bdb] via-[#4c6ef5] to-[#22b8cf] text-white shadow-[0_12px_28px_rgba(59,91,219,0.28)] hover:brightness-110",
    secondary:
      "bg-white/75 text-slate-800 border border-white/60 shadow-sm hover:bg-white/95",
    danger:
      "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-[0_12px_28px_rgba(225,29,72,0.22)]",
    ghost:
      "bg-white/10 text-white border border-white/15 hover:bg-white/18",
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
