import {
  BookOpen,
  Users,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  GraduationCap,
  FlaskConical,
  Laptop,
} from "lucide-react";
import usePublicCampusData from "../hooks/usePublicCampusData";
import imgAcademics from "../assets/landing/aspira-classroom.png";
import imgBuilding from "../assets/landing/landing-building.png";

const items = [
  {
    icon: BookOpen,
    title: "Structured curriculum",
    text: "Clear subject pathways with continuous assessment and guided classroom learning.",
  },
  {
    icon: Users,
    title: "Student mentoring",
    text: "Dedicated faculty support so every student stays on track throughout the session.",
  },
  {
    icon: CalendarCheck,
    title: "Daily attendance",
    text: "Teachers mark attendance class-wise so administration and parents stay informed.",
  },
  {
    icon: ClipboardList,
    title: "Exams & results",
    text: "Marks and progress reports managed securely inside the Aspira campus portal.",
  },
  {
    icon: LayoutDashboard,
    title: "Digital campus tools",
    text: "Admin, teachers, and students each get a tailored dashboard for everyday work.",
  },
  {
    icon: GraduationCap,
    title: "Co-curricular growth",
    text: "Events, presentations, and activities that build confidence beyond textbooks.",
  },
  {
    icon: FlaskConical,
    title: "Practical learning",
    text: "Hands-on sessions and concept-focused teaching for stronger academic foundations.",
  },
  {
    icon: Laptop,
    title: "Online portal access",
    text: "Check attendance, results, assignments, and campus notices from one login.",
  },
];

function Academics() {
  const { data, loading } = usePublicCampusData();
  const courses = data.featuredCourses || [];
  const classLabels = data.classes?.labels || [];
  const classValues = data.classes?.values || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="liquid-glass p-7 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">Academics</p>
          <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[var(--lg-ink)] md:text-5xl">
            Programs designed for real progress
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--lg-muted)]">
            Aspira College currently runs{" "}
            <strong className="text-[var(--lg-ink)]">{loading ? "—" : data.courses}</strong> active
            programs with{" "}
            <strong className="text-[var(--lg-ink)]">{loading ? "—" : data.enrollments}</strong>{" "}
            active enrollments — all loaded from the campus database.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--lg-muted)]">
            Students learn with clarity. Teachers teach with better tools. Administration monitors
            the full academic picture without spreadsheet chaos.
          </p>
        </div>
        <div className="liquid-media h-[380px]">
          <img src={imgAcademics} alt="Classroom learning at Aspira College" />
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold text-[var(--lg-ink)] md:text-3xl">
          Courses from database
        </h2>
        <p className="mt-2 text-sm text-[var(--lg-muted)]">
          Live list of active Aspira College courses.
        </p>
        {loading ? (
          <div className="liquid-glass mt-6 p-8 text-sm text-[var(--lg-muted)]">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="liquid-glass mt-6 p-8 text-sm text-[var(--lg-muted)]">
            No active courses found yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="liquid-glass p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0b5fff]">
                  {course.code} · {course.className}
                </p>
                <h3 className="font-display mt-2 text-lg font-bold text-[var(--lg-ink)]">
                  {course.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--lg-muted)]">Teacher: {course.teacher || "TBA"}</p>
                {course.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{course.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {classLabels.length > 0 ? (
        <div className="mt-14 liquid-glass p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-[var(--lg-ink)]">
            Students by class (live)
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classLabels.map((label, i) => (
              <div key={label} className="rounded-xl border border-white/50 bg-white/40 px-4 py-3">
                <p className="text-sm font-semibold text-[var(--lg-ink)]">{label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-[#0b5fff]">
                  {classValues[i] || 0}
                </p>
                <p className="text-xs text-[var(--lg-muted)]">active students</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="liquid-glass p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/50 text-[#0b5fff]">
              <item.icon size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--lg-ink)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--lg-muted)]">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 liquid-glass grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="font-display text-3xl font-bold text-[var(--lg-ink)]">
            How academic life works at Aspira
          </h2>
          <ol className="mt-5 space-y-4 text-sm leading-relaxed text-[var(--lg-muted)] md:text-base">
            <li>
              <strong className="text-[var(--lg-ink)]">1. Enroll & orient</strong> — Students join
              their program and receive portal access for campus services.
            </li>
            <li>
              <strong className="text-[var(--lg-ink)]">2. Learn & attend</strong> — Daily classes
              with attendance tracked by faculty through the portal.
            </li>
            <li>
              <strong className="text-[var(--lg-ink)]">3. Assess & improve</strong> — Assignments,
              tests, and feedback keep progress visible.
            </li>
            <li>
              <strong className="text-[var(--lg-ink)]">4. Results & guidance</strong> — Marks and
              academic status remain available for students and administration.
            </li>
          </ol>
        </div>
        <div className="liquid-media h-72 md:h-80">
          <img src={imgBuilding} alt="Aspira College campus" />
        </div>
      </div>
    </div>
  );
}

export default Academics;
