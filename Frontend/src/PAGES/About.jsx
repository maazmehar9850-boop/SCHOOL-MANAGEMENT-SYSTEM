import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Building2, Shield, GraduationCap, Target, Users } from "lucide-react";
import GradientButton from "../components/GradientButton";
import usePublicCampusData from "../hooks/usePublicCampusData";
import imgAbout from "../assets/landing/aspira-library.png";
import imgBuilding from "../assets/landing/landing-building.png";

function About() {
  const { data, loading } = usePublicCampusData();
  const college = data.college || {};
  const campusName = college.name || "Aspira College";

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="site-eyebrow">About</p>
          <h1 className="site-heading mt-3 text-4xl md:text-5xl">
            {campusName} — learning with direction
          </h1>
          <p className="site-lead mt-5">
            {campusName} is an independent campus project based in{" "}
            {college.campus || "Dolat Nagar, Gujrat"}. We focus on practical academics, student
            discipline, and a modern digital portal that keeps campus operations clear.
          </p>
          <p className="site-lead mt-4">
            Right now the campus portal holds{" "}
            <strong className="font-semibold text-[var(--lg-ink)]">
              {loading ? "—" : data.students}
            </strong>{" "}
            students,{" "}
            <strong className="font-semibold text-[var(--lg-ink)]">
              {loading ? "—" : data.teachers}
            </strong>{" "}
            teachers, and{" "}
            <strong className="font-semibold text-[var(--lg-ink)]">
              {loading ? "—" : data.courses}
            </strong>{" "}
            active courses — all fetched live from the database.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact">
              <GradientButton className="!rounded-full !px-6 !py-3">
                Contact campus
                <ArrowRight size={16} />
              </GradientButton>
            </Link>
            <Link to="/portal">
              <GradientButton
                variant="secondary"
                className="!rounded-full !border-white/60 !bg-white/55 !px-6 !py-3 !text-[var(--lg-ink)] hover:!bg-white/80"
              >
                Open portal
              </GradientButton>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="site-media h-[420px]"
        >
          <img src={imgBuilding} alt="Aspira College campus building" />
        </motion.div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Target,
            title: "Our vision",
            text: "To become Gujrat’s trusted college destination for focused, future-ready education.",
          },
          {
            icon: Heart,
            title: "Our values",
            text: "Respect, discipline, honesty, and continuous improvement in every classroom.",
          },
          {
            icon: Users,
            title: "Our community",
            text: `${loading ? "—" : data.students} students and ${loading ? "—" : data.teachers} teachers connected through one portal.`,
          },
          {
            icon: Building2,
            title: "Campus focus",
            text: "Clean learning spaces designed for lectures, assessments, and student activities.",
          },
          {
            icon: Shield,
            title: "Secure portal",
            text: "Role-based access so each user only sees tools relevant to their responsibility.",
          },
          {
            icon: GraduationCap,
            title: "Academic care",
            text: `${loading ? "—" : data.attendanceAccuracy}% attendance accuracy across current records.`,
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="site-card p-6"
          >
            <div className="site-card__icon">
              <card.icon size={20} strokeWidth={2.1} />
            </div>
            <h3 className="site-card__title mt-4 text-lg">{card.title}</h3>
            <p className="site-card__text mt-2">{card.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="site-media h-80">
          <img src={imgAbout} alt="Aspira College library study area" />
        </div>
        <div>
          <p className="site-eyebrow">Our story</p>
          <h2 className="site-section-title mt-2">A campus story rooted in Gujrat</h2>
          <p className="site-section-lead !max-w-none">
            {campusName} was created as a local education brand for families seeking quality
            intermediate and college pathways. We keep communication clear, records digital, and
            student support personal.
          </p>
          <p className="mt-4 text-sm font-medium text-[var(--lg-ink)]">
            Contact: {college.phone || "0319 8018795"} ·{" "}
            {college.email || "maazmehar9850@gmail.com"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
