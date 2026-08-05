import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl"
      >
        <p className="site-eyebrow">Portal</p>
        <h1 className="site-heading mt-3 text-4xl md:text-5xl">One campus. Three portals.</h1>
        <p className="site-lead mt-5">
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
      </motion.div>

      <div className="mt-14 space-y-10">
        {roles.map((r, index) => (
          <motion.div
            key={r.role}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
              index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div>
              <p className="site-eyebrow">{r.role}</p>
              <h2 className="site-section-title mt-2">{r.title}</h2>
              <p className="site-section-lead !max-w-none">{r.text}</p>
              <ul className="mt-5 space-y-2.5">
                {r.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-[var(--lg-ink)]">
                    <CheckCircle2 size={16} className="shrink-0 text-[var(--lg-accent)]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-media h-64 md:h-80">
              <img src={r.image} alt={r.role} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Portal;
