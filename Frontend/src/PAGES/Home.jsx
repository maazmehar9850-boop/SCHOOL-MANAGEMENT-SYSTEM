import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  BookOpen,
  Users,
  GraduationCap,
  Award,
  Building2,
  Sparkles,
} from "lucide-react";
import GradientButton from "../components/GradientButton";
import usePublicCampusData from "../hooks/usePublicCampusData";
import imgBuilding from "../assets/landing/landing-building.png";
import imgCampus from "../assets/landing/aspira-students.png";
import imgClass from "../assets/landing/aspira-classroom.png";

function Home() {
  const { data, loading } = usePublicCampusData();
  const college = data.college || {};

  const stats = [
    { value: String(data.students), label: "Students" },
    { value: String(data.teachers), label: "Faculty" },
    { value: String(data.courses), label: "Programs" },
    { value: `${data.attendanceAccuracy}%`, label: "Attendance" },
    { value: String(data.enrollments), label: "Enrollments" },
    { value: String(data.avgMarks), label: "Avg. marks" },
  ];

  const featuredCourses = data.featuredCourses || [];
  const faculty = data.faculty || [];

  return (
    <>
      <section className="relative overflow-hidden px-3 pb-6 pt-4 md:px-5">
        <div className="relative mx-auto min-h-[88vh] max-w-7xl overflow-hidden rounded-[2rem] border border-white/25 shadow-[0_35px_90px_rgba(2,12,30,0.4)]">
          <img
            src={imgBuilding}
            alt={`${college.name || "Aspira College"} campus building`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020b18]/88 via-[#071829]/62 to-[#071829]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b18]/80 via-transparent to-[#020b18]/30" />

          <div className="relative z-10 grid min-h-[88vh] items-end gap-8 px-5 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center md:px-10 lg:px-14 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl text-white"
            >
              <p className="liquid-chip mb-5">
                <MapPin size={12} />
                {college.campus || "Dolat Nagar · Gujrat"}
              </p>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-sky-200/90">
                Admissions open · Portal online
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {college.name || "Aspira College"}
                <span className="mt-2 block bg-gradient-to-r from-amber-100 via-white to-sky-200 bg-clip-text text-transparent">
                  Gujrat Campus
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200/95 sm:text-lg">
                A modern college experience for ambitious students — strong academics, caring
                faculty, and a digital campus portal for attendance, results, and daily learning.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/login">
                  <GradientButton className="!rounded-full !px-8 !py-3.5 !text-base">
                    Portal Login
                    <ArrowRight size={18} />
                  </GradientButton>
                </Link>
                <Link to="/about">
                  <GradientButton
                    variant="secondary"
                    className="!rounded-full !border-white/25 !bg-white/10 !px-8 !py-3.5 !text-base !text-white hover:!bg-white/18"
                  >
                    Explore campus
                  </GradientButton>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="liquid-glass-dark p-6 text-white md:p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                Campus at a glance
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {stats.slice(0, 4).map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="font-display text-2xl font-extrabold">
                      {loading ? "—" : s.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">{s.label}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-200/90">
                {[
                  `${loading ? "—" : data.assignments} assignments in system`,
                  `${loading ? "—" : data.enrollments} active enrollments`,
                  college.phone || "0319 8018795",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-sky-300" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((item) => (
            <div key={item.label} className="liquid-glass p-5">
              <p className="font-display text-3xl font-extrabold text-[var(--lg-ink)]">
                {loading ? "—" : item.value}
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--lg-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">
              Programs
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-[var(--lg-ink)] md:text-4xl">
              Active courses this session
            </h2>
            <p className="mt-3 text-[var(--lg-muted)]">
              Programs currently offered at Aspira College.
            </p>
          </div>
          <Link to="/academics" className="text-sm font-semibold text-[#0b5fff]">
            View academics →
          </Link>
        </div>

        {loading ? (
          <div className="liquid-glass p-8 text-sm text-[var(--lg-muted)]">Loading courses...</div>
        ) : featuredCourses.length === 0 ? (
          <div className="liquid-glass p-8 text-sm text-[var(--lg-muted)]">
            No active courses yet. Add courses from the admin portal.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.slice(0, 6).map((course) => (
              <div key={course.id} className="liquid-glass p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0b5fff]">
                  {course.code} · {course.className}
                </p>
                <h3 className="font-display mt-2 text-lg font-bold text-[var(--lg-ink)]">
                  {course.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--lg-muted)]">
                  Teacher: {course.teacher || "TBA"}
                </p>
                {course.duration ? (
                  <p className="mt-1 text-xs text-slate-500">Duration: {course.duration}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">Faculty</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-[var(--lg-ink)] md:text-4xl">
            Our faculty
          </h2>
        </div>
        {loading ? (
          <div className="liquid-glass p-8 text-sm text-[var(--lg-muted)]">Loading faculty...</div>
        ) : faculty.length === 0 ? (
          <div className="liquid-glass p-8 text-sm text-[var(--lg-muted)]">
            No faculty records yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.map((t) => (
              <div key={t.id} className="liquid-glass p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b5fff]/10 text-sm font-bold text-[#0b5fff]">
                  {(t.name || "T").slice(0, 1).toUpperCase()}
                </div>
                <h3 className="font-display mt-3 text-base font-bold text-[var(--lg-ink)]">
                  {t.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--lg-muted)]">{t.subject}</p>
                {t.experience ? (
                  <p className="mt-1 text-xs text-slate-500">{t.experience}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              to: "/academics",
              icon: BookOpen,
              title: "Strong academics",
              text: `${loading ? "—" : data.courses} active programs with live enrollment tracking.`,
            },
            {
              to: "/portal",
              icon: Users,
              title: "Digital campus portal",
              text: `Serving ${loading ? "—" : data.students} students and ${loading ? "—" : data.teachers} teachers.`,
            },
            {
              to: "/contact",
              icon: GraduationCap,
              title: "Admissions guidance",
              text: `Call ${college.phone || "0319 8018795"} or visit ${college.campus || "Dolat Nagar, Gujrat"}.`,
            },
          ].map((card) => (
            <Link key={card.to} to={card.to} className="liquid-glass group block p-6 md:p-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/50 text-[#0b5fff] shadow-sm">
                <card.icon size={20} />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--lg-ink)]">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--lg-muted)]">{card.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0b5fff]">
                Learn more <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="liquid-glass p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">
              Why Aspira
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-[var(--lg-ink)] md:text-4xl">
              A college environment designed for focus and growth
            </h2>
            <p className="mt-4 text-[var(--lg-muted)] leading-relaxed">
              From first-day orientation to final results, {college.name || "Aspira College"} supports
              every stage of student life at {college.campus || "Dolat Nagar, Gujrat"}.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Building2,
                  title: "Modern campus",
                  text: "Clean learning spaces and student-focused facilities.",
                },
                {
                  icon: Award,
                  title: "Result culture",
                  text: `Current average marks in portal: ${loading ? "—" : data.avgMarks}`,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/50 bg-white/35 p-4">
                  <item.icon className="text-[#0b5fff]" size={20} />
                  <h3 className="mt-3 font-display font-bold text-[var(--lg-ink)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--lg-muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="liquid-media h-64 sm:h-full sm:min-h-[420px]">
              <img src={imgCampus} alt="Aspira College students on campus" />
            </div>
            <div className="liquid-media h-64 sm:mt-10 sm:h-[360px]">
              <img src={imgClass} alt="Aspira College classroom" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
