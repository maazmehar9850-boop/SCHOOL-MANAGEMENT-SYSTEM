import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Users,
  GraduationCap,
  Award,
  Building2,
} from "lucide-react";
import GradientButton from "../components/GradientButton";
import usePublicCampusData from "../hooks/usePublicCampusData";
import imgBuilding from "../assets/landing/landing-building.png";
import imgCampus from "../assets/landing/aspira-students.png";
import imgClass from "../assets/landing/aspira-classroom.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

function Home() {
  const { data, loading } = usePublicCampusData();
  const college = data.college || {};
  const campusName = college.name || "Aspira College";

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
      <section className="site-hero">
        <div className="site-hero__media" aria-hidden="true">
          <img
            src={imgBuilding}
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className="site-hero__veil" aria-hidden="true" />
        <div className="site-hero__content">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <h1 className="site-hero__brand">
                {campusName}
                <span>Gujrat Campus</span>
              </h1>
              <p className="site-hero__copy">
                Strong academics, caring faculty, and a digital campus portal for attendance,
                results, and daily learning — at {college.campus || "Dolat Nagar, Gujrat"}.
              </p>
              <div className="site-hero__actions">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
        <motion.div
          {...fadeUp}
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {stats.map((item) => (
            <div key={item.label} className="site-stat">
              <p className="site-stat__value">{loading ? "—" : item.value}</p>
              <p className="site-stat__label">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <motion.div
          {...fadeUp}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="site-eyebrow">Programs</p>
            <h2 className="site-section-title mt-2">Active courses this session</h2>
            <p className="site-section-lead">
              Programs currently offered at {campusName}.
            </p>
          </div>
          <Link to="/academics" className="site-link inline-flex items-center gap-1">
            View academics <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="site-card p-8 text-sm text-[var(--lg-muted)]">Loading courses...</div>
        ) : featuredCourses.length === 0 ? (
          <div className="site-card p-8 text-sm text-[var(--lg-muted)]">
            No active courses yet. Add courses from the admin portal.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.slice(0, 6).map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="site-card p-5 md:p-6"
              >
                <p className="site-card__meta">
                  {course.code} · {course.className}
                </p>
                <h3 className="site-card__title mt-2.5 text-lg">{course.name}</h3>
                <p className="site-card__text mt-2">Teacher: {course.teacher || "TBA"}</p>
                {course.duration ? (
                  <p className="mt-1.5 text-xs font-medium text-slate-500">
                    Duration: {course.duration}
                  </p>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <motion.div {...fadeUp} className="mb-8">
          <p className="site-eyebrow">Faculty</p>
          <h2 className="site-section-title mt-2">Our faculty</h2>
          <p className="site-section-lead">
            Experienced teachers guiding students across every program.
          </p>
        </motion.div>
        {loading ? (
          <div className="site-card p-8 text-sm text-[var(--lg-muted)]">Loading faculty...</div>
        ) : faculty.length === 0 ? (
          <div className="site-card p-8 text-sm text-[var(--lg-muted)]">
            No faculty records yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="site-card p-5 md:p-6"
              >
                <div className="site-avatar">{(t.name || "T").slice(0, 1).toUpperCase()}</div>
                <h3 className="site-card__title mt-3.5 text-base">{t.name}</h3>
                <p className="site-card__text mt-1.5">{t.subject}</p>
                {t.experience ? (
                  <p className="mt-1.5 text-xs font-medium text-slate-500">{t.experience}</p>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
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
          ].map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <Link to={card.to} className="site-card group block h-full p-6 md:p-7">
                <div className="site-card__icon">
                  <card.icon size={20} strokeWidth={2.1} />
                </div>
                <h3 className="site-card__title mt-4 text-xl">{card.title}</h3>
                <p className="site-card__text mt-2">{card.text}</p>
                <span className="site-link mt-5 inline-flex items-center gap-1">
                  Learn more
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pb-24 md:pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <motion.div {...fadeUp}>
            <p className="site-eyebrow">Why Aspira</p>
            <h2 className="site-section-title mt-3">
              A college environment designed for focus and growth
            </h2>
            <p className="site-section-lead mt-4 !max-w-none">
              From first-day orientation to final results, {campusName} supports every stage of
              student life at {college.campus || "Dolat Nagar, Gujrat"}.
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
                <div key={item.title} className="site-card p-5">
                  <div className="site-card__icon">
                    <item.icon size={18} strokeWidth={2.1} />
                  </div>
                  <h3 className="site-card__title mt-3.5 text-base">{item.title}</h3>
                  <p className="site-card__text mt-1.5">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="site-media h-64 sm:h-full sm:min-h-[420px]">
              <img src={imgCampus} alt="Aspira College students on campus" />
            </div>
            <div className="site-media h-64 sm:mt-10 sm:h-[360px]">
              <img src={imgClass} alt="Aspira College classroom" />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Home;
