import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import GradientButton from "../components/GradientButton";
import BrandLogo from "../components/BrandLogo";
import API from "../api";

import imgHero from "../assets/landing/landing-hero.png";
import imgFeatures from "../assets/landing/landing-features.png";
import imgAdmin from "../assets/landing/landing-admin.png";
import imgTeacher from "../assets/landing/landing-teacher.png";
import imgStudent from "../assets/landing/landing-student.png";
import imgDashboard from "../assets/landing/landing-dashboard.png";
import imgTrust from "../assets/landing/landing-trust.png";
import imgFooter from "../assets/landing/landing-footer.png";

const features = [
  {
    icon: Users,
    title: "Student Management",
    text: "Enroll students, manage profiles, and keep records organized in one place.",
  },
  {
    icon: LayoutDashboard,
    title: "Teacher Dashboard",
    text: "Track classes, assigned students, and daily teaching workflows at a glance.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance Tracking",
    text: "Mark, update, and review attendance with clear filters by course.",
  },
  {
    icon: ClipboardList,
    title: "Marks & Reports",
    text: "Enter marks, upload CSV files, and print results in seconds.",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    text: "Create courses, assign teachers, and enroll students with role-aware access.",
  },
];

const roles = [
  {
    role: "Admin",
    title: "Orchestrate the school",
    text: "Users, courses, enrollments, and live system overview — all under control.",
    image: imgAdmin,
    step: "01",
  },
  {
    role: "Teacher",
    title: "Teach with clarity",
    text: "Attendance, marks, assignments, and resources for every class you lead.",
    image: imgTeacher,
    step: "02",
  },
  {
    role: "Student",
    title: "Learn with focus",
    text: "See attendance, results, subjects, and materials built around your progress.",
    image: imgStudent,
    step: "03",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

function SectionScene({ image, overlay = "default", children, className = "", id }) {
  const overlays = {
    default:
      "bg-gradient-to-b from-[#061018]/55 via-[#0a1c2e]/48 to-[#071018]/78",
    hero: "bg-gradient-to-r from-[#050d16]/78 via-[#071820]/45 to-transparent",
    soft: "bg-gradient-to-b from-[#071018]/62 via-[#0c2438]/50 to-[#061018]/82",
    deep: "bg-gradient-to-t from-[#040a12]/88 via-[#071624]/55 to-[#061018]/40",
    split: "bg-gradient-to-t from-[#040a12]/90 via-[#071624]/35 to-[#061018]/25",
  };

  return (
    <section id={id} className={`landing-section relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden
      />
      <div className={`absolute inset-0 ${overlays[overlay] || overlays.default}`} aria-hidden />
      <div className="landing-section-veil absolute inset-0" aria-hidden />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function Landing() {
  const [live, setLive] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    enrollments: 0,
    attendanceAccuracy: 0,
    avgMarks: 0,
    assignments: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/public/stats");
        setLive(res.data);
      } catch {
        /* API offline */
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { value: String(live.students), label: "Students in database" },
    { value: String(live.teachers), label: "Teachers onboarded" },
    { value: `${live.attendanceAccuracy}%`, label: "Attendance accuracy" },
    { value: String(live.courses), label: "Active courses" },
  ];

  const previewCards = [
    { label: "Students", value: statsLoading ? "—" : String(live.students), hint: "Live from MongoDB" },
    { label: "Attendance", value: statsLoading ? "—" : `${live.attendanceAccuracy}%`, hint: "Present rate across records" },
    { label: "Avg. Marks", value: statsLoading ? "—" : String(live.avgMarks), hint: "Across published results" },
  ];

  return (
    <div className="page-shell bg-[#050a12] text-white">
      {/* Nav floats over hero */}
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BrandLogo size={44} light wordmarkClassName="font-display text-xl font-extrabold tracking-tight" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Link
              to="/forgot-password"
              className="hidden text-sm font-semibold text-cyan-100/90 transition hover:text-white sm:inline"
            >
              Reset password
            </Link>
            <Link to="/login">
              <GradientButton className="!py-2.5 !px-5">
                Login
                <ArrowRight size={16} />
              </GradientButton>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ——— HERO ——— */}
      <SectionScene
        image={imgHero}
        overlay="hero"
        className="flex min-h-screen items-center"
      >
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
              <Sparkles size={14} className="text-cyan-300" />
              SchoolMS
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Smart School
              <span className="block bg-gradient-to-r from-white via-cyan-100 to-teal-200 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-200/90 sm:text-lg">
              One premium workspace for admins, teachers, and students — attendance,
              marks, courses, and resources, beautifully connected.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/login">
                <GradientButton className="!px-7 !py-3.5">
                  Login
                  <ArrowRight size={16} />
                </GradientButton>
              </Link>
              <Link to="/forgot-password">
                <GradientButton variant="secondary" className="!px-7 !py-3.5">
                  Reset password
                </GradientButton>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050a12] to-transparent" />
      </SectionScene>

      {/* ——— FEATURES ——— */}
      <SectionScene image={imgFeatures} overlay="soft" id="features" className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Capabilities
            </p>
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Everything your school needs
            </h2>
            <p className="mt-4 text-slate-200/85">
              Built for daily operations — clear roles, live data, and a calm modern UI.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="landing-soft-panel group p-6 md:p-7"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b5bdb] to-[#22b8cf] text-white shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
                  <f.icon size={22} />
                </div>
                <h3 className="font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050a12] to-transparent" />
      </SectionScene>

      {/* ——— HOW IT WORKS (role imagery) ——— */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-20 md:px-8">
          <motion.div {...fadeUp} className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
              Three roles. One system.
            </h2>
            <p className="mt-4 text-slate-300">
              Each experience is designed around the people who use it every day.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3">
          {roles.map((r, i) => (
            <motion.article
              key={r.role}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative min-h-[28rem] overflow-hidden md:min-h-[34rem]"
            >
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center transition duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${r.image})` }}
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#040a12] via-[#071624]/55 to-[#061018]/20"
                aria-hidden
              />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#050a12]/40 to-transparent md:from-[#050a12]/25" />
              <div className="relative z-10 flex h-full flex-col justify-end p-7 md:p-9">
                <span className="font-display text-5xl font-bold text-white/15">{r.step}</span>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  {r.role}
                </p>
                <h3 className="font-display mt-2 text-2xl font-bold text-white md:text-3xl">
                  {r.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">{r.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ——— DASHBOARD PREVIEW ——— */}
      <SectionScene image={imgDashboard} overlay="deep" className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Live intelligence
            </p>
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Dashboards that feel effortless
            </h2>
            <p className="mt-4 text-slate-200/85">
              Role-aware stats, glass surfaces, and real API data — never hardcoded vanity numbers.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {previewCards.map((card, i) => (
              <motion.div
                key={card.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="landing-soft-panel p-6 md:p-8"
              >
                <p className="text-sm font-medium text-cyan-100/80">{card.label}</p>
                <p className="font-display mt-2 text-4xl font-extrabold text-white md:text-5xl">
                  {card.value}
                </p>
                <p className="mt-3 text-xs text-slate-400">{card.hint}</p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-cyan-400/50 via-white/20 to-transparent" />
                <div className="mt-5 space-y-2.5 opacity-70">
                  <div className="h-1.5 rounded-full bg-white/20" />
                  <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
                  <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionScene>

      {/* ——— TRUST / STATS ——— */}
      <SectionScene image={imgTrust} overlay="split" className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              <Shield size={14} />
              Trusted workflows
            </p>
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Built for schools that are growing
            </h2>
            <p className="mt-4 text-slate-200/90">
              JWT security, role-based access, and operations that replace spreadsheet chaos.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              >
                <p className="font-display text-4xl font-extrabold text-white md:text-5xl">
                  {statsLoading ? "—" : s.value}
                </p>
                <p className="mt-2 text-sm text-slate-300">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.blockquote
            {...fadeUp}
            className="mt-16 max-w-2xl text-lg leading-relaxed text-slate-100/95 md:text-xl"
          >
            “SchoolMS replaced spreadsheets with a clean dashboard our teachers
            actually enjoy using every morning.”
            <footer className="mt-4 text-sm font-semibold tracking-wide text-cyan-200">
              — Principal, Greenfield Academy
            </footer>
          </motion.blockquote>
        </div>
      </SectionScene>

      {/* ——— FOOTER ——— */}
      <SectionScene image={imgFooter} overlay="deep" className="pt-20 pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:flex-row md:justify-between md:px-8">
          <div>
            <BrandLogo size={36} light wordmarkClassName="font-display text-lg font-bold" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
              Smart school operations for admins, teachers, and students — designed to feel
              premium from the first login.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login">
                <GradientButton className="!py-2.5">
                  Login
                  <ArrowRight size={14} />
                </GradientButton>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                Product
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="#features" className="transition hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <Link to="/login" className="transition hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="transition hover:text-white">
                    Reset password
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                Roles
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Admin</li>
                <li>Teacher</li>
                <li>Student</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                Contact
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>support@schoolms.app</li>
                <li>+1 (555) 012-3456</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-14 max-w-7xl px-4 text-xs text-slate-500 md:px-8">
          © {new Date().getFullYear()} SchoolMS. All rights reserved.
        </p>
      </SectionScene>
    </div>
  );
}

export default Landing;
