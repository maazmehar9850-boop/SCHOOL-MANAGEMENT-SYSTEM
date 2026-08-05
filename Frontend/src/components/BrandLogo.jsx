import logoMark from "../assets/aspira-logo.png";

function BrandMark({ size = 40, className = "" }) {
  return (
    <img
      src={logoMark}
      alt="Aspira College"
      width={size}
      height={size}
      className={`shrink-0 rounded-md object-contain bg-white ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function BrandLogo({
  size = 44,
  showWordmark = true,
  wordmarkClassName = "font-display text-lg font-extrabold tracking-tight md:text-xl",
  className = "",
  light = false,
  name = "Aspira College",
  subtitle = "Dolat Nagar, Gujrat",
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} className="shadow-sm ring-1 ring-slate-200/80" />
      {showWordmark ? (
        <div className="min-w-0 leading-tight">
          <span className={`${wordmarkClassName} block ${light ? "text-white" : "text-[#0b2a5b]"}`}>
            {name}
          </span>
          {subtitle ? (
            <span
              className={`block text-[11px] font-semibold uppercase tracking-[0.12em] ${
                light ? "text-amber-200/90" : "text-slate-500"
              }`}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { BrandMark };
export default BrandLogo;
