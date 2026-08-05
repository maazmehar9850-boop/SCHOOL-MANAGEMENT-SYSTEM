import logoMark from "../assets/aspira-logo.png";

function BrandMark({ size = 40, className = "", framed = true }) {
  return (
    <span
      className={`brand-mark ${framed ? "brand-mark--framed" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoMark}
        alt="Aspira College"
        width={size}
        height={size}
        className="brand-mark__img"
      />
    </span>
  );
}

function BrandLogo({
  size = 44,
  showWordmark = true,
  wordmarkClassName = "",
  className = "",
  light = false,
  name = "Aspira College",
  subtitle = "Dolat Nagar, Gujrat",
}) {
  return (
    <div className={`brand-logo inline-flex items-center gap-3 ${className}`}>
      <BrandMark size={size} />
      {showWordmark ? (
        <div className="brand-logo__text min-w-0 leading-tight">
          <span
            className={`brand-logo__name font-display block text-lg font-extrabold tracking-tight md:text-xl ${
              light ? "brand-logo__name--light" : ""
            } ${wordmarkClassName}`}
          >
            {name}
          </span>
          {subtitle ? (
            <span
              className={`brand-logo__subtitle block text-[10px] font-semibold uppercase tracking-[0.16em] ${
                light ? "brand-logo__subtitle--light" : ""
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
