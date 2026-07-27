function InfoBanner({ children, variant = "info" }) {
  const styles = {
    info: "border-sky-200/80 bg-sky-50/85 text-slate-700",
    success: "border-emerald-200/80 bg-emerald-50/85 text-emerald-900",
    warning: "border-amber-200/80 bg-amber-50/85 text-amber-950",
  };

  return (
    <div
      className={`info-banner mb-5 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${styles[variant] || styles.info}`}
    >
      {children}
    </div>
  );
}

export default InfoBanner;
