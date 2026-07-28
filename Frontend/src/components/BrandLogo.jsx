function BrandMark({ size = 40, className = "" }) {
  const id = `sms-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b5bdb" />
          <stop offset="1" stopColor="#22b8cf" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${id})`} />
      <path fill="#fff" d="M12 24.5 32 14l20 10.5-20 9.5-20-9.5Z" />
      <path
        fill="#fff"
        fillOpacity="0.92"
        d="M46.5 26.2v8.4c0 1.2-6.2 3.4-14.5 3.4S17.5 35.8 17.5 34.6v-8.4l14.5 6.9 14.5-6.9Z"
      />
      <rect x="45.2" y="25.4" width="2.2" height="12.2" rx="1.1" fill="#e0f7fa" />
      <circle cx="46.3" cy="38.4" r="2.2" fill="#e0f7fa" />
      <path fill="#fff" d="M16 42.5c4.8-2.2 9.2-2.4 16-2.4v12.8c-6.2.2-11.2.8-16 3.2V42.5Z" />
      <path
        fill="#f0f9ff"
        d="M48 42.5c-4.8-2.2-9.2-2.4-16-2.4v12.8c6.2.2 11.2.8 16 3.2V42.5Z"
      />
      <path fill="#3b5bdb" fillOpacity="0.35" d="M31.2 40.1h1.6v15.2h-1.6z" />
    </svg>
  );
}

function BrandLogo({
  size = 40,
  showWordmark = true,
  wordmarkClassName = "font-display text-xl font-extrabold tracking-tight",
  className = "",
  light = false,
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <BrandMark size={size} className="shrink-0 shadow-lg shadow-cyan-500/20" />
      {showWordmark ? (
        <div className="min-w-0">
          <span className={`${wordmarkClassName} ${light ? "text-white" : "text-slate-900"}`}>
            SchoolMS
          </span>
        </div>
      ) : null}
    </div>
  );
}

export { BrandMark };
export default BrandLogo;
