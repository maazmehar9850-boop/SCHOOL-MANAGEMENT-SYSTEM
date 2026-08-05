import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-gradient-to-r from-[#1e40af] via-[#2563EB] to-[#0ea5e9] text-white shadow-[0_14px_32px_rgba(37,99,235,0.32)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.4)] border border-white/20",
  secondary:
    "bg-white text-[#0F172A] border border-slate-200/80 shadow-[0_10px_28px_rgba(15,23,42,0.08)] hover:border-sky-200 hover:shadow-[0_14px_36px_rgba(37,99,235,0.12)]",
  outline:
    "bg-white/10 text-white border border-white/35 backdrop-blur-md hover:bg-white/18",
  ghost:
    "bg-transparent text-[#2563EB] border border-transparent hover:bg-sky-50",
  gold:
    "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white shadow-[0_14px_32px_rgba(245,158,11,0.3)] border border-amber-300/30",
};

function SiteButton({
  children,
  className = "",
  variant = "primary",
  to,
  href,
  type = "button",
  disabled = false,
  onClick,
  ...props
}) {
  const classes = `site-btn inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant] || variants.primary} ${className}`;

  const motionProps = {
    whileHover: disabled ? undefined : { scale: 1.02, y: -1 },
    whileTap: disabled ? undefined : { scale: 0.985 },
  };

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link to={to} className={classes} onClick={onClick} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default SiteButton;
