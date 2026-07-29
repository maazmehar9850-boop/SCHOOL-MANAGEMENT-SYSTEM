import bgLogin from "../assets/backgrounds/bg-login.png";
import bgAdmin from "../assets/backgrounds/bg-admin.png";
import bgTeacher from "../assets/backgrounds/bg-teacher.png";
import bgStudent from "../assets/backgrounds/bg-student.png";
import bgCourses from "../assets/backgrounds/bg-courses.png";
import bgProfile from "../assets/backgrounds/bg-profile.png";
import bgLanding from "../assets/landing/landing-hero.png";

const BACKGROUNDS = {
  landing: bgLanding,
  login: bgLogin,
  admin: bgAdmin,
  teacher: bgTeacher,
  student: bgStudent,
  courses: bgCourses,
  profile: bgProfile,
  default: bgLogin,
};

const TINTS = {
  landing: "from-[#071018]/55 via-[#0c2840]/40 to-[#0a3d4a]/60",
  login: "from-[#0b1b3a]/75 via-[#12305c]/45 to-[#0e4d6e]/70",
  admin: "from-[#0a1628]/80 via-[#1e293b]/50 to-[#0f3d5c]/65",
  teacher: "from-[#1a1430]/70 via-[#2a1f4a]/45 to-[#0f3a4a]/65",
  student: "from-[#0c1a2e]/75 via-[#16324f]/48 to-[#0d4a5c]/68",
  courses: "from-[#1a120c]/70 via-[#2a2218]/45 to-[#0f2a3a]/65",
  profile: "from-[#0c1224]/78 via-[#1a2440]/50 to-[#123048]/70",
  default: "from-[#0b1220]/75 via-[#162033]/50 to-[#0e3a4a]/65",
};

function Background({ variant = "default", children, className = "" }) {
  const image = BACKGROUNDS[variant] || BACKGROUNDS.default;
  const tint = TINTS[variant] || TINTS.default;
  const isLanding = variant === "landing";

  return (
    <div className={`page-shell page-shell--${variant} ${className}`}>
      <div
        className={`bg-layer bg-image ${isLanding ? "!scale-100 !brightness-95" : ""}`}
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden
      />
      <div
        className={`bg-layer ${isLanding ? "bg-black/25" : "bg-blur-veil"}`}
        aria-hidden
      />
      <div className={`bg-layer bg-gradient-to-br ${tint}`} aria-hidden />
      <div className="bg-layer bg-vignette" aria-hidden />
      {!isLanding && <div className="bg-layer bg-noise" aria-hidden />}
      {children}
    </div>
  );
}

export default Background;
export { BACKGROUNDS };
