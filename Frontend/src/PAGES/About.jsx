import { Link } from "react-router-dom";
import { ArrowRight, Heart, Building2, Shield, GraduationCap, Target, Users } from "lucide-react";
import GradientButton from "../components/GradientButton";
import usePublicCampusData from "../hooks/usePublicCampusData";
import imgAbout from "../assets/landing/aspira-library.png";
import imgBuilding from "../assets/landing/landing-building.png";

function About() {
  const { data, loading } = usePublicCampusData();
  const college = data.college || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="liquid-glass p-7 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">About</p>
          <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[var(--lg-ink)] md:text-5xl">
            {college.name || "Aspira College"} — learning with direction
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--lg-muted)]">
            {college.name || "Aspira College"} is an independent campus project based in{" "}
            {college.campus || "Dolat Nagar, Gujrat"}. We focus on practical academics, student
            discipline, and a modern digital portal that keeps campus operations clear.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--lg-muted)]">
            Right now the campus portal holds{" "}
            <strong className="text-[var(--lg-ink)]">{loading ? "—" : data.students}</strong>{" "}
            students,{" "}
            <strong className="text-[var(--lg-ink)]">{loading ? "—" : data.teachers}</strong>{" "}
            teachers, and{" "}
            <strong className="text-[var(--lg-ink)]">{loading ? "—" : data.courses}</strong> active
            courses — all fetched live from the database.
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
                className="!rounded-full !border-white/50 !bg-white/45 !px-6 !py-3 !text-[var(--lg-ink)] hover:!bg-white/70"
              >
                Open portal
              </GradientButton>
            </Link>
          </div>
        </div>

        <div className="liquid-media h-[420px]">
          <img src={imgBuilding} alt="Aspira College campus building" />
        </div>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        ].map((card) => (
          <div key={card.title} className="liquid-glass p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/50 text-[#0b5fff]">
              <card.icon size={20} />
            </div>
            <h3 className="font-display mt-4 text-lg font-bold text-[var(--lg-ink)]">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--lg-muted)]">{card.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid items-center gap-8 lg:grid-cols-2">
        <div className="liquid-media h-80">
          <img src={imgAbout} alt="Aspira College library study area" />
        </div>
        <div className="liquid-glass p-7 md:p-9">
          <h2 className="font-display text-3xl font-bold text-[var(--lg-ink)]">
            A campus story rooted in Gujrat
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--lg-muted)]">
            {college.name || "Aspira College"} was created as a local education brand for families
            seeking quality intermediate and college pathways. We keep communication clear, records
            digital, and student support personal.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--lg-muted)]">
            Contact: {college.phone || "0319 8018795"} · {college.email || "maazmehar9850@gmail.com"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
