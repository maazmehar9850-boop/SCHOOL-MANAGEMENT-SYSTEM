import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import GradientButton from "../components/GradientButton";
import imgAdmin from "../assets/landing/aspira-corridor.png";
import imgTeacher from "../assets/landing/aspira-classroom.png";
import imgStudent from "../assets/landing/aspira-students.png";

const roles = [
  {
    role: "Administration",
    title: "Lead the campus",
    text: "Oversee students, teachers, courses, fees, and college-wide academic records from one dashboard.",
    points: ["Student & faculty records", "Fees overview", "Campus-wide reports"],
    image: imgAdmin,
  },
  {
    role: "Teachers",
    title: "Guide every class",
    text: "Take attendance, enter marks, share assignments, and support assigned students with clarity.",
    points: ["Class attendance", "Marks entry", "Assignments & resources"],
    image: imgTeacher,
  },
  {
    role: "Students",
    title: "Track your progress",
    text: "View attendance, results, subjects, fees, and learning resources from one secure login.",
    points: ["Personal dashboard", "Results & attendance", "Course materials"],
    image: imgStudent,
  },
];

function Portal() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="liquid-glass max-w-3xl p-7 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">Portal</p>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[var(--lg-ink)] md:text-5xl">
          One campus. Three portals.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[var(--lg-muted)]">
          Sign in with your Aspira College account to access tools for your role. The portal is
          built to reduce paperwork, improve communication, and keep academic records accurate.
        </p>
        <div className="mt-7">
          <Link to="/login">
            <GradientButton className="!rounded-full !px-7 !py-3.5">
              Portal Login
              <ArrowRight size={16} />
            </GradientButton>
          </Link>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        {roles.map((r, index) => (
          <div
            key={r.role}
            className={`liquid-glass grid items-center gap-8 p-5 md:grid-cols-2 md:gap-10 md:p-8 ${
              index % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b5fff]">
                {r.role}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-[var(--lg-ink)] md:text-3xl">
                {r.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--lg-muted)] md:text-base">
                {r.text}
              </p>
              <ul className="mt-5 space-y-2">
                {r.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-[var(--lg-ink)]">
                    <CheckCircle2 size={16} className="text-[#0b5fff]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="liquid-media h-64 md:h-80">
              <img src={r.image} alt={r.role} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Portal;
