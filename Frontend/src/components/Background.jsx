import bgLogin from "../assets/backgrounds/bg-login.png";

const AUTH_IMAGES = {
  login: bgLogin,
  landing: null,
};

const TINTS = {
  landing: "from-[#071018]/55 via-[#0c2840]/40 to-[#0a3d4a]/60",
  login: "from-[#0b1b3a]/75 via-[#12305c]/45 to-[#0e4d6e]/70",
  admin: "from-[#0a1628]/88 via-[#1e293b]/72 to-[#0f3d5c]/80",
  teacher: "from-[#1a1430]/86 via-[#2a1f4a]/70 to-[#0f3a4a]/80",
  student: "from-[#0c1a2e]/86 via-[#16324f]/70 to-[#0d4a5c]/80",
  courses: "from-[#1a120c]/86 via-[#2a2218]/70 to-[#0f2a3a]/80",
  profile: "from-[#0c1224]/88 via-[#1a2440]/72 to-[#123048]/80",
  default: "from-[#0b1220]/88 via-[#162033]/72 to-[#0e3a4a]/80",
};

const SOLID = {
  landing: "#050a12",
  login: "#071225",
  admin: "#07111f",
  teacher: "#120f1f",
  student: "#0a1422",
  courses: "#14100c",
  profile: "#0a1020",
  default: "#0a1220",
};

function Background({ variant = "default", children, className = "" }) {
  const key = TINTS[variant] ? variant : "default";
  const tint = TINTS[key];
  const isLanding = key === "landing";
  const isLogin = key === "login";
  const image = AUTH_IMAGES[key] || null;

  return (
    <div
      className={`page-shell page-shell--${key} ${className}`}
      style={{ backgroundColor: SOLID[key] || SOLID.default }}
    >
      {image ? (
        <div
          className={`bg-layer bg-image ${isLanding ? "!scale-100 !brightness-95" : ""}`}
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden
        />
      ) : (
        <div
          className="bg-layer"
          style={{
            background: `radial-gradient(ellipse 90% 60% at 15% 0%, rgba(56,189,248,0.16), transparent 55%),
              radial-gradient(ellipse 70% 50% at 100% 100%, rgba(37,99,235,0.18), transparent 50%),
              ${SOLID[key] || SOLID.default}`,
          }}
          aria-hidden
        />
      )}
      <div className={`bg-layer ${isLanding || isLogin ? "bg-black/25" : "bg-blur-veil"}`} aria-hidden />
      <div className={`bg-layer bg-gradient-to-br ${tint}`} aria-hidden />
      <div className="bg-layer bg-vignette" aria-hidden />
      {children}
    </div>
  );
}

export default Background;
