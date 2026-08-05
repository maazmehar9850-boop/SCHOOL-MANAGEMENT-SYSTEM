import { motion } from "framer-motion";
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
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="site-eyebrow">Academics</p>
          <h1 className="site-heading mt-3 text-4xl md:text-5xl">
            Programs designed for real progress
          </h1>
          <p className="site-lead mt-5">
            Aspira College currently runs{" "}
            <strong className="font-semibold text-[var(--lg-ink)]">
              {loading ? "—" : data.courses}
            </strong>{" "}
            active programs with{" "}
            <strong className="font-semibold text-[var(--lg-ink)]">
              {loading ? "—" : data.enrollments}
            </strong>{" "}
            active enrollments — all loaded from the campus database.
          </p>
          <p className="site-lead mt-4">
            Students learn with clarity. Teachers teach with better tools. Administration monitors
            the full academic picture without spreadsheet chaos.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="site-media h-[380px]"
        >
          <img src={imgAcademics} alt="Classroom learning at Aspira College" />
        </motion.div>
      </div>

      <div className="mt-16">
        <p className="site-eyebrow">Courses</p>
        <h2 className="site-section-title mt-2">Courses from database</h2>
        <p className="site-section-lead">Live list of active Aspira College courses.</p>
        {loading ? (
          <div className="site-card mt-6 p-8 text-sm text-[var(--lg-muted)]">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="site-card mt-6 p-8 text-sm text-[var(--lg-muted)]">
            No active courses found yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="site-card p-5 md:p-6"
              >
                <p className="site-card__meta">
                  {course.code} · {course.className}
                </p>
                <h3 className="site-card__title mt-2.5 text-lg">{course.name}</h3>
                <p className="site-card__text mt-2">Teacher: {course.teacher || "TBA"}</p>
                {course.description ? (
                  <p className="site-card__text mt-2 line-clamp-3">{course.description}</p>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {classLabels.length > 0 ? (
        <div className="site-card mt-16 p-6 md:p-8">
          <h2 className="site-section-title text-[1.65rem]">Students by class (live)</h2>
          <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {classLabels.map((label, i) => (
              <div key={label} className="site-stat !shadow-none">
                <p className="text-sm font-semibold text-[var(--lg-ink)]">{label}</p>
                <p className="site-stat__value mt-2 !text-[1.75rem] text-[var(--lg-accent)]">
                  {classValues[i] || 0}
                </p>
                <p className="site-stat__label">active students</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03, duration: 0.4 }}
            className="site-card p-6"
          >
            <div className="site-card__icon">
              <item.icon size={20} strokeWidth={2.1} />
            </div>
            <h3 className="site-card__title mt-4 text-lg">{item.title}</h3>
            <p className="site-card__text mt-2">{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="site-eyebrow">How it works</p>
          <h2 className="site-section-title mt-2">How academic life works at Aspira</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: "Enroll & orient",
                text: "Students join their program and receive portal access for campus services.",
              },
              {
                title: "Learn & attend",
                text: "Daily classes with attendance tracked by faculty through the portal.",
              },
              {
                title: "Assess & improve",
                text: "Assignments, tests, and feedback keep progress visible.",
              },
              {
                title: "Results & guidance",
                text: "Marks and academic status remain available for students and administration.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="site-avatar !h-9 !w-9 !text-sm">{i + 1}</span>
                <div>
                  <p className="site-card__title text-base">{step.title}</p>
                  <p className="site-card__text mt-1">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="site-media h-72 md:h-80">
          <img src={imgBuilding} alt="Aspira College campus" />
        </div>
      </div>
    </div>
  );
}

export default Academics;
