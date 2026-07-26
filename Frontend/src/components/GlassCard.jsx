import { motion } from "framer-motion";

function GlassCard({ children, className = "", hover = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover
          ? {
              y: -3,
              boxShadow: "0 28px 64px rgba(15, 23, 42, 0.18)",
            }
          : undefined
      }
      className={`glass-panel rounded-[1.35rem] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
