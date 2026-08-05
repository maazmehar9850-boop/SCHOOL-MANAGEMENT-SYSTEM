import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  Flag,
  GraduationCap,
  Heart,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import AnimatedCounter from "../components/site/AnimatedCounter";
import { IconBadge } from "../components/site/GlassPanel";
import { IMG } from "../data/siteImages";

const values = [
  { icon: Shield, title: "Integrity", text: "Honesty and responsibility in every academic and personal choice." },
  { icon: Sparkles, title: "Excellence", text: "High standards in teaching, learning, and student support." },
  { icon: Heart, title: "Respect", text: "A culture of dignity, inclusion, and mutual care across campus." },
  { icon: Flag, title: "Leadership", text: "Developing confident leaders prepared for service and impact." },
  { icon: BookOpen, title: "Curiosity", text: "Encouraging inquiry, creativity, and lifelong learning." },
  { icon: Users, title: "Community", text: "Building strong relationships among students, faculty, and families." },
];

const timeline = [
  { year: "2012", title: "Foundation", text: "Aspira College was established with a vision for quality education in Gujrat." },
  { year: "2016", title: "Campus Expansion", text: "New classrooms, labs, and student spaces strengthened the learning environment." },
  { year: "2019", title: "Digital Portal Launch", text: "Attendance, results, and academic records moved into a modern campus system." },
  { year: "2023", title: "Program Growth", text: "Expanded pathways across sciences, commerce, arts, and technology." },
  { year: "2026", title: "Future Ready", text: "Continued investment in faculty excellence, facilities, and student success." },
];

const achievements = [
  { value: 50, suffix: "+", label: "Academic Distinctions" },
  { value: 120, suffix: "+", label: "University Placements" },
  { value: 40, suffix: "+", label: "Campus Events Yearly" },
  { value: 25, suffix: "+", label: "Active Student Clubs" },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A college built on excellence, character, and opportunity"
        lead="Aspira College is dedicated to empowering students with academic strength, practical skills, and the confidence to lead in higher education and professional life."
        image={IMG.about}
        breadcrumbs={[{ label: "About Us" }]}
      />

      <section className="site-section">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <FadeIn>
            <p className="site-eyebrow">College Introduction</p>
            <h2 className="site-section-title mt-3">Learning with purpose at Aspira College</h2>
            <p className="site-lead mt-5">
              Located in Dolat Nagar, Gujrat, Aspira College provides an inspiring environment where students
              pursue academic excellence, practical knowledge, leadership development, and career-focused education.
            </p>
            <p className="mt-4 text-slate-500 leading-relaxed">
              We combine experienced faculty, modern facilities, and a supportive campus culture so every learner
              can grow with clarity, discipline, and ambition.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SiteButton to="/admissions" className="!rounded-full">Apply Now</SiteButton>
              <SiteButton to="/contact" variant="secondary" className="!rounded-full">Visit Campus</SiteButton>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="site-media h-[420px]">
              <img src={IMG.heroCampus} alt="Aspira College campus" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <FadeIn>
            <article className="site-card h-full p-8">
              <IconBadge icon={Eye} />
              <h3 className="site-card__title mt-5 text-2xl">Our Vision</h3>
              <p className="site-card__text mt-3 text-base">
                To become a trusted regional leader in quality education — developing knowledgeable, ethical, and
                future-ready graduates who contribute meaningfully to society.
              </p>
            </article>
          </FadeIn>
          <FadeIn delay={0.08}>
            <article className="site-card h-full p-8">
              <IconBadge icon={Target} tone="emerald" />
              <h3 className="site-card__title mt-5 text-2xl">Our Mission</h3>
              <p className="site-card__text mt-3 text-base">
                To deliver inspiring academic programs, practical learning experiences, and leadership development
                that prepare every student for success in higher education and professional life.
              </p>
            </article>
          </FadeIn>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Core Values"
            title="Principles that guide our campus community"
            lead="These values shape classroom culture, faculty practice, and student life at Aspira College."
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card h-full p-6">
                  <IconBadge icon={item.icon} />
                  <h3 className="site-card__title mt-4 text-lg">{item.title}</h3>
                  <p className="site-card__text mt-2">{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <FadeIn>
            <div className="site-media mx-auto h-80 w-full max-w-md overflow-hidden rounded-[1.75rem]">
              <img src={IMG.principal} alt="Principal of Aspira College" />
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <p className="site-eyebrow">Principal&apos;s Message</p>
            <h2 className="site-section-title mt-3">Education that builds character and capability</h2>
            <p className="mt-5 text-slate-500 leading-relaxed">
              Welcome to Aspira College. Our commitment is simple: provide a learning environment where students
              are challenged academically, supported personally, and prepared for meaningful futures.
            </p>
            <p className="mt-4 text-slate-500 leading-relaxed">
              With dedicated faculty, modern tools, and a culture of excellence, we invite every student to grow
              into a confident, responsible, and capable leader.
            </p>
            <p className="mt-6 font-display text-lg font-semibold text-[#0F172A]">Principal, Aspira College</p>
            <p className="text-sm text-slate-500">Dolat Nagar Campus, Gujrat</p>
          </FadeIn>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              align="left"
              eyebrow="Our History"
              title="A journey of growth and impact"
              lead="From our founding vision to a modern digital campus, Aspira continues to evolve with purpose."
              className="!mx-0"
            />
            <div className="site-timeline mt-10">
              {timeline.map((item) => (
                <FadeIn key={item.year} className="site-timeline__item">
                  <p className="text-sm font-bold text-[#2563EB]">{item.year}</p>
                  <h3 className="site-card__title mt-1">{item.title}</h3>
                  <p className="site-card__text mt-1">{item.text}</p>
                </FadeIn>
              ))}
            </div>
          </div>
          <FadeIn delay={0.1}>
            <div className="site-media h-full min-h-[420px]">
              <img src={IMG.history} alt="Aspira College history" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Why Students Choose Us"
            title="Trusted by families who value quality education"
          />
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Experienced and caring faculty",
              "Career-focused academic pathways",
              "Safe and inspiring campus environment",
              "Transparent digital academic records",
              "Scholarships and student support",
              "Active clubs, sports, and events",
            ].map((item) => (
              <StaggerItem key={item}>
                <div className="site-card flex items-start gap-3 p-5">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <p className="font-medium text-slate-700">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Achievements" title="Milestones that reflect our commitment" />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((item) => (
              <StaggerItem key={item.label}>
                <div className="site-stat text-center !py-8">
                  <p className="site-stat__value">
                    <AnimatedCounter value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="site-stat__label">{item.label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <FadeIn>
            <article className="site-card overflow-hidden !p-0 h-full">
              <div className="site-media !h-56 !rounded-none !border-0 !shadow-none">
                <img src={IMG.accreditation} alt="Accreditation" />
              </div>
              <div className="p-7">
                <IconBadge icon={Award} tone="amber" />
                <h3 className="site-card__title mt-4 text-xl">Accreditation & Standards</h3>
                <p className="site-card__text mt-2">
                  Aspira College follows recognized academic standards and continuous improvement practices to
                  maintain quality teaching, transparent assessment, and student-centered operations.
                </p>
              </div>
            </article>
          </FadeIn>
          <FadeIn delay={0.08}>
            <article className="site-card overflow-hidden !p-0 h-full">
              <div className="site-media !h-56 !rounded-none !border-0 !shadow-none">
                <img src={IMG.classroom} alt="Faculty excellence" />
              </div>
              <div className="p-7">
                <IconBadge icon={GraduationCap} />
                <h3 className="site-card__title mt-4 text-xl">Faculty Excellence</h3>
                <p className="site-card__text mt-2">
                  Our educators bring deep subject expertise, mentoring commitment, and modern pedagogy that
                  helps every student reach higher academic and personal goals.
                </p>
                <SiteButton to="/faculty" variant="secondary" className="mt-5 !rounded-full">
                  Meet our faculty
                </SiteButton>
              </div>
            </article>
          </FadeIn>
        </div>
      </section>

      <section className="site-section !pt-2">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <div className="site-card flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <div className="flex items-start gap-4">
                <IconBadge icon={Building2} tone="navy" />
                <div>
                  <h3 className="site-card__title text-2xl">Experience Aspira in person</h3>
                  <p className="site-card__text mt-2 max-w-xl">
                    Schedule a campus visit and discover classrooms, labs, and the welcoming community that defines Aspira College.
                  </p>
                </div>
              </div>
              <SiteButton to="/contact" className="!rounded-full shrink-0">Contact Admissions</SiteButton>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export default About;
