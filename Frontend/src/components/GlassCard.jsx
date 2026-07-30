function GlassCard({ children, className = "", hover = true, ...props }) {
  return (
    <div
      className={`glass-panel rounded-[1.35rem] transition-transform duration-150 ${
        hover ? "hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
