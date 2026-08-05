import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export function FadeIn({
  children,
  className = "",
  delay = 0,
  y = 28,
  once = true,
  amount = 0.15,
  as = "div",
}) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </Component>
  );
}

export function Stagger({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
