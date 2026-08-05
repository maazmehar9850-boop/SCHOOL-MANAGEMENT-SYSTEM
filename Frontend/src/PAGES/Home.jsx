import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  Laptop,
  Lightbulb,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import SiteButton from "../components/site/SiteButton";
import SectionHeader from "../components/site/SectionHeader";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import AnimatedCounter from "../components/site/AnimatedCounter";
import { IconBadge, Stars } from "../components/site/GlassPanel";
import { IMG } from "../data/siteImages";
import { EVENTS, FAQS, NEWS, PROGRAMS, TESTIMONIALS } from "../data/siteContent";

const whyChoose = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    text: "Rigorous programs guided by experienced faculty and continuous assessment.",
    tone: "blue",
  },
  {
    icon: Lightbulb,
    title: "Practical Learning",
    text: "Labs, projects, and applied skills that prepare students for real careers.",
    tone: "amber",
  },
  {
    icon: Users,
    title: "Leadership Growth",
    text: "Clubs, mentoring, and leadership activities that build confident graduates.",
    tone: "emerald",
  },
  {
    icon: Laptop,
    title: "Digital Campus Portal",
    text: "Modern tools for attendance, results, fees, and learning resources.",
    tone: "navy",
  },
  {
    icon: HeartHandshake,
    title: "Supportive Community",
    text: "A caring campus culture focused on wellbeing, discipline, and success.",
    tone: "blue",
  },
  {
    icon: Award,
    title: "Career Pathways",
    text: "Counseling, internships exposure, and higher-education readiness.",
    tone: "amber",
  },
];

const admissionsSteps = [
  { step: "01", title: "Fill Online Form", text: "Submit your application with personal and academic details." },
  { step: "02", title: "Submit Documents", text: "Upload transcripts, photos, and required certificates." },
  { step: "03", title: "Entrance Review", text: "Admissions team reviews eligibility and readiness." },
  { step: "04", title: "Confirmation", text: "Receive offer letter and complete enrollment." },
];

const campusHighlights = [
  { title: "Modern Classrooms", image: IMG.classroom, text: "Bright, focused learning spaces." },
  { title: "Science Laboratories", image: IMG.lab, text: "Hands-on experimental learning." },
  { title: "Central Library", image: IMG.library, text: "Quiet study and research resources." },
  { title: "Student Life", image: IMG.campusLife, text: "Clubs, events, and friendships." },
];

const successStories = [
  {
    name: "Zainab Fatima",
    result: "Top University Admission",
    text: "Mentorship and focused pre-medical preparation helped me secure my preferred medical college seat.",
    image: IMG.success1,
  },
  {
    name: "Omar Farooq",
    result: "Tech Internship Offer",
    text: "Computer Science projects and faculty guidance opened doors to a competitive software internship.",
    image: IMG.success2,
  },
  {
    name: "Hira Siddiqui",
    result: "Business Leadership Award",
    text: "Campus leadership programs and business studies shaped my confidence for entrepreneurship.",
    image: IMG.success3,
  },
];

const stats = [
  { value: 10000, suffix: "+", label: "Students", icon: Users },
  { value: 150, suffix: "+", label: "Faculty Members", icon: GraduationCap },
  { value: 50, suffix: "+", label: "Academic Programs", icon: BookOpen },
  { value: 95, suffix: "%", label: "Student Satisfaction", icon: Sparkles },
];

function Home() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const active = TESTIMONIALS[testimonialIndex];

  const nextTestimonial = () => setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
  const prevTestimonial = () =>
    setTestimonialIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <>
      <section className="site-hero">
        <div className="site-hero__media" aria-hidden="true">
          <img src={IMG.hero} alt="" fetchPriority="high" />
        </div>
        <div className="site-hero__veil" aria-hidden="true" />
        <div className="site-hero__shapes" aria-hidden="true">
          <span className="site-hero__orb site-hero__orb--1" />
          <span className="site-hero__orb site-hero__orb--2" />
          <span className="site-hero__orb site-hero__orb--3" />
        </div>

        <div className="site-hero__content">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <p className="site-hero__brand">Aspira College</p>
              <h1 className="site-hero__title">
                Empowering Future Leaders Through Quality Education
              </h1>
              <p className="site-hero__copy">
                Aspira College provides an inspiring learning environment where students gain academic
                excellence, practical knowledge, leadership skills, and career-focused education. Our
                mission is to prepare every student for success in higher education and professional life.
              </p>
              <div className="site-hero__actions">
                <SiteButton to="/admissions" className="!rounded-full !px-8 !py-3.5 !text-base">
                  Apply Now
                  <ArrowRight size={18} />
                </SiteButton>
                <SiteButton
                  to="/academics"
                  variant="outline"
                  className="!rounded-full !px-8 !py-3.5 !text-base"
                >
                  Explore Programs
                </SiteButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 md:-mt-20 md:px-8">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="site-stat flex items-center gap-4 !p-5">
                <IconBadge icon={stat.icon} />
                <div>
                  <p className="site-stat__value">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="site-stat__label">{stat.label}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Why Choose Aspira"
            title="A premium learning experience built for ambitious students"
            lead="From academics to campus culture, every detail is designed to help students excel with confidence."
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyChoose.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card h-full p-6">
                  <IconBadge icon={item.icon} tone={item.tone} />
                  <h3 className="site-card__title mt-4 text-lg">{item.title}</h3>
                  <p className="site-card__text mt-2">{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              align="left"
              eyebrow="Featured Programs"
              title="Explore pathways that shape your future"
              lead="Intermediate, undergraduate, and short courses designed for academic strength and career readiness."
              className="!mx-0"
            />
            <SiteButton to="/academics" variant="secondary" className="shrink-0 !rounded-full">
              View all programs
              <ArrowRight size={16} />
            </SiteButton>
          </div>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.slice(0, 6).map((program) => (
              <StaggerItem key={program.id}>
                <article className="site-card group h-full overflow-hidden !p-0">
                  <div className="site-media h-48 !rounded-none !border-0 !shadow-none">
                    <img src={program.image} alt={program.title} loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="site-card__meta">{program.category}</p>
                    <h3 className="site-card__title mt-2 text-lg">{program.title}</h3>
                    <p className="site-card__text mt-2 line-clamp-2">{program.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{program.duration}</span>
                      <span>{program.eligibility}</span>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <SiteButton to="/admissions" className="!rounded-xl !px-4 !py-2.5 text-xs">
                        Apply
                      </SiteButton>
                      <SiteButton
                        to="/academics"
                        variant="secondary"
                        className="!rounded-xl !px-4 !py-2.5 text-xs"
                      >
                        Learn More
                      </SiteButton>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Student Success"
            title="Stories of ambition, growth, and achievement"
            lead="Our students go on to universities, careers, and leadership roles with confidence."
          />
          <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
            {successStories.map((story) => (
              <StaggerItem key={story.name}>
                <article className="site-card h-full overflow-hidden !p-0">
                  <div className="site-media h-52 !rounded-none !border-0 !shadow-none">
                    <img src={story.image} alt={story.name} loading="lazy" />
                  </div>
                  <div className="p-6">
                    <p className="site-card__meta">{story.result}</p>
                    <h3 className="site-card__title mt-2 text-lg">{story.name}</h3>
                    <p className="site-card__text mt-2">{story.text}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Campus Life"
            title="A vibrant community beyond the classroom"
            lead="Discover spaces and experiences that make Aspira feel like a second home."
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {campusHighlights.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card group overflow-hidden !p-0">
                  <div className="site-media h-56 !rounded-none !border-0 !shadow-none">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h3 className="site-card__title text-base">{item.title}</h3>
                    <p className="site-card__text mt-1 text-sm">{item.text}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 text-center">
            <SiteButton to="/campus-life" variant="secondary" className="!rounded-full">
              Explore campus life
              <ArrowRight size={16} />
            </SiteButton>
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Admissions Process"
            title="Four clear steps to join Aspira College"
            lead="A transparent admissions journey designed to be simple, supportive, and student-friendly."
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {admissionsSteps.map((item) => (
              <StaggerItem key={item.step}>
                <article className="site-card h-full p-6">
                  <p className="font-display text-3xl font-bold text-blue-600">{item.step}</p>
                  <h3 className="site-card__title mt-3 text-lg">{item.title}</h3>
                  <p className="site-card__text mt-2">{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10 text-center">
            <SiteButton to="/admissions" className="!rounded-full !px-8">
              Start your application
              <ArrowRight size={16} />
            </SiteButton>
          </div>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader
                align="left"
                eyebrow="Latest News"
                title="Campus updates and academic highlights"
                className="!mx-0"
              />
              <div className="mt-8 space-y-4">
                {NEWS.slice(0, 3).map((item) => (
                  <FadeIn key={item.title}>
                    <article className="site-card flex gap-4 overflow-hidden !p-0">
                      <div className="site-media h-28 w-28 shrink-0 !rounded-none !border-0 !shadow-none">
                        <img src={item.image} alt="" loading="lazy" />
                      </div>
                      <div className="py-3 pr-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                          {item.category} - {item.date}
                        </p>
                        <h3 className="site-card__title mt-1 text-sm md:text-base">{item.title}</h3>
                        <p className="site-card__text mt-1 line-clamp-2 text-xs md:text-sm">{item.excerpt}</p>
                      </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader
                align="left"
                eyebrow="Upcoming Events"
                title="Mark your calendar"
                className="!mx-0"
              />
              <div className="mt-8 space-y-4">
                {EVENTS.map((event) => (
                  <FadeIn key={event.title}>
                    <article className="site-card flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                          {event.category}
                        </p>
                        <h3 className="site-card__title mt-1">{event.title}</h3>
                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                          <span>{event.date}</span>
                          <span>{event.time}</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} />
                            {event.place}
                          </span>
                        </p>
                      </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <SiteButton to="/news" variant="secondary" className="!rounded-full">
              View news and events
            </SiteButton>
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="Testimonials"
            title="What our students say"
            lead="Real voices from Aspira learners who grew academically and personally."
          />
          <FadeIn className="mt-10">
            <div className="site-card relative overflow-hidden p-8 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.name}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <img
                    src={active.photo}
                    alt={active.name}
                    className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-sky-100"
                  />
                  <Stars rating={active.rating} className="mt-4 justify-center" />
                  <p className="mt-5 text-lg leading-relaxed text-slate-600 md:text-xl">
                    &ldquo;{active.review}&rdquo;
                  </p>
                  <p className="mt-5 font-display text-lg font-semibold text-slate-900">{active.name}</p>
                  <p className="text-sm text-slate-500">{active.program}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-sky-300 hover:text-blue-600"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextTestimonial}
                  className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-sky-300 hover:text-blue-600"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="FAQ"
            title="Answers to common questions"
            lead="Everything you need to know about applying and studying at Aspira College."
          />
          <div className="site-faq mt-10 space-y-3">
            {FAQS.map((item) => (
              <details key={item.q}>
                <summary className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-blue-600">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section !pt-4">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20">
              <img src={IMG.cta} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-blue-600/55" />
              <div className="relative px-6 py-14 text-center md:px-12 md:py-20">
                <p className="site-eyebrow site-eyebrow--light">Begin your journey</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
                  Ready to join Aspira College?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-slate-200">
                  Take the next step toward academic excellence, leadership, and a future filled with
                  opportunity. Admissions for the upcoming session are open.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <SiteButton to="/admissions" className="!rounded-full !px-8">
                    Apply Now
                    <ArrowRight size={16} />
                  </SiteButton>
                  <SiteButton to="/contact" variant="outline" className="!rounded-full !px-8">
                    Talk to admissions
                  </SiteButton>
                </div>
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-sky-200">
                  <CheckCircle2 size={16} />
                  Transparent process - Supportive counselors - Modern campus
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export default Home;
