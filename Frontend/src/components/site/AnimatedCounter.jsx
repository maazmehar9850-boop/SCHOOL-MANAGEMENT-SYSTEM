import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

function AnimatedCounter({ value, suffix = "", prefix = "", duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === "number" ? value : parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

  useEffect(() => {
    if (!inView) return undefined;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, numeric, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

export default AnimatedCounter;
