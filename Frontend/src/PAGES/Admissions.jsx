import {
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  FileText,
  GraduationCap,
  Banknote,
  ScrollText,
  Wallet,
} from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import { IconBadge } from "../components/site/GlassPanel";
import { FAQS } from "../data/siteContent";
import { IMG } from "../data/siteImages";

const steps = [
  {
    step: "01",
    title: "Fill Online Form",
    text: "Create your application profile with personal, academic, and program preferences.",
    icon: ClipboardList,
  },
  {
    step: "02",
    title: "Submit Documents",
    text: "Upload transcripts, identity documents, photographs, and supporting certificates.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Entrance Review",
    text: "Admissions evaluates eligibility, academic readiness, and seat availability.",
    icon: BadgeCheck,
  },
  {
    step: "04",
    title: "Admission Confirmation",
    text: "Receive your offer, complete fee formalities, and begin orientation.",
    icon: GraduationCap,
  },
];

const requirements = [
  "Completed online admissions application",
  "Minimum academic eligibility for chosen program",
  "Valid identity document (CNIC / B-Form)",
  "Recent passport-size photographs",
  "Previous school/college mark sheets",
  "Character certificate where applicable",
];

const documents = [
  "Matric / Intermediate certificates and mark sheets",
  "CNIC or Form-B of applicant",
  "Father / guardian CNIC copy",
  "Two recent photographs",
  "Domicile (if required by program)",
  "Migration certificate (transfer cases)",
];

const fees = [
  { title: "Admission Fee", detail: "One-time at enrollment confirmation", icon: Wallet },
  { title: "Tuition Fee", detail: "Program-based semester / annual structure", icon: Banknote },
  { title: "Lab / Resource Fee", detail: "Applicable to science & computing tracks", icon: ScrollText },
];

const scholarships = [
  { title: "Merit Scholarship", text: "Awarded to high-achieving applicants based on previous academic results." },
  { title: "Need-Based Support", text: "Financial assistance for deserving students after documentation review." },
  { title: "Sibling Concession", text: "Fee relief for families with more than one student enrolled at Aspira." },
];

function Admissions() {
  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Begin your journey with a clear, supportive admissions process"
        lead="From online application to confirmation, Aspira College guides every applicant with transparency and care."
        image={IMG.admissions}
        breadcrumbs={[{ label: "Admissions" }]}
      >
        <SiteButton to="/contact" className="!rounded-full">Talk to Admissions</SiteButton>
        <SiteButton to="/academics" variant="outline" className="!rounded-full">Browse Programs</SiteButton>
      </PageHero>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Admission Workflow"
            title="Four steps from interest to enrollment"
            lead="A professional process designed to keep students and families informed at every stage."
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <StaggerItem key={item.step}>
                <article className="site-card h-full p-6">
                  <div className="flex items-center justify-between">
                    <IconBadge icon={item.icon} />
                    <span className="font-display text-2xl font-bold text-sky-500/80">{item.step}</span>
                  </div>
                  <h3 className="site-card__title mt-5 text-lg">{item.title}</h3>
                  <p className="site-card__text mt-2">{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="requirements" className="site-section site-section--soft">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <FadeIn>
            <article className="site-card h-full p-7">
              <IconBadge icon={ClipboardList} />
              <h3 className="site-card__title mt-4 text-2xl">Admission Requirements</h3>
              <ul className="mt-5 space-y-3">
                {requirements.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-600">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
          <FadeIn delay={0.08}>
            <article className="site-card h-full p-7">
              <IconBadge icon={FileText} tone="amber" />
              <h3 className="site-card__title mt-4 text-2xl">Required Documents</h3>
              <ul className="mt-5 space-y-3">
                {documents.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-600">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-[#2563EB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Fee Information"
            title="Transparent fee structure guidance"
            lead="Exact fee schedules vary by program. Contact admissions for the latest session-wise fee sheet."
          />
          <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
            {fees.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card h-full p-6">
                  <IconBadge icon={item.icon} tone="navy" />
                  <h3 className="site-card__title mt-4 text-lg">{item.title}</h3>
                  <p className="site-card__text mt-2">{item.detail}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="scholarships" className="site-section site-section--soft">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <FadeIn>
              <div className="site-media h-[360px]">
                <img src={IMG.scholarship} alt="Scholarships at Aspira College" />
              </div>
            </FadeIn>
            <div>
              <SectionHeader
                align="left"
                eyebrow="Scholarships"
                title="Support for merit and need"
                lead="We believe talented students should never miss opportunity due to financial barriers."
                className="!mx-0"
              />
              <div className="mt-8 space-y-4">
                {scholarships.map((item) => (
                  <FadeIn key={item.title}>
                    <article className="site-card p-5">
                      <h3 className="site-card__title">{item.title}</h3>
                      <p className="site-card__text mt-2">{item.text}</p>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <article className="site-card flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <IconBadge icon={CalendarClock} tone="amber" />
                <div>
                  <h3 className="site-card__title text-xl">Important Deadlines</h3>
                  <p className="site-card__text mt-2 max-w-2xl">
                    Applications for the upcoming session open each spring. Early applicants receive priority counseling
                    and scholarship review. Confirm exact dates with the admissions office.
                  </p>
                </div>
              </div>
              <SiteButton to="/contact" className="!rounded-full shrink-0">Confirm Dates</SiteButton>
            </article>
          </FadeIn>
        </div>
      </section>

      <section className="site-section site-section--soft">
        <div className="mx-auto max-w-3xl">
          <SectionHeader eyebrow="Admissions FAQ" title="Common questions from applicants" />
          <div className="site-faq mt-10 space-y-3">
            {FAQS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Admissions;
