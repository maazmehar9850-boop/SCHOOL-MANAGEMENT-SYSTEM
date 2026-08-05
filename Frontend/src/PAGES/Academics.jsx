import { useMemo } from "react";
import { Clock3, GraduationCap } from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import usePublicCampusData from "../hooks/usePublicCampusData";
import { PROGRAMS } from "../data/siteContent";
import { IMG } from "../data/siteImages";

const programImages = [
  IMG.intermediate,
  IMG.undergrad,
  IMG.cs,
  IMG.business,
  IMG.commerce,
  IMG.arts,
  IMG.premed,
  IMG.preeng,
  IMG.shortCourses,
];

function Academics() {
  const { data, loading } = usePublicCampusData();

  const programs = useMemo(() => {
    const fromDb = (data.featuredCourses || []).map((course, i) => ({
      id: course.id || course.code || i,
      title: course.name,
      category: course.className || course.code || "Program",
      duration: course.duration || "Session based",
      eligibility: course.teacher ? `Faculty: ${course.teacher}` : "Open enrollment",
      description:
        course.description ||
        `${course.name} is offered at Aspira College with structured teaching and continuous assessment.`,
      image: programImages[i % programImages.length],
    }));
    return fromDb.length > 0 ? fromDb : PROGRAMS;
  }, [data.featuredCourses]);

  return (
    <>
      <PageHero
        eyebrow="Academic Programs"
        title="Programs designed for academic strength and career readiness"
        lead={
          loading
            ? "Loading academic programs from the campus database..."
            : `Explore ${data.courses || programs.length} active pathways crafted for ambitious learners.`
        }
        image={IMG.undergrad}
        breadcrumbs={[{ label: "Academic Programs" }]}
      >
        <SiteButton to="/admissions" className="!rounded-full">
          Apply Now
        </SiteButton>
        <SiteButton to="/contact" variant="outline" className="!rounded-full">
          Ask about a program
        </SiteButton>
      </PageHero>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="All Programs"
            title="Choose the pathway that fits your goals"
            lead="Live program data from the Aspira campus portal, including duration and faculty assignment."
          />

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <StaggerItem key={program.id}>
                <article className="site-card group flex h-full flex-col overflow-hidden !p-0">
                  <div className="site-media !h-52 !rounded-none !border-0 !shadow-none">
                    <img src={program.image} alt={program.title} loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="site-card__meta">{program.category}</p>
                    <h3 className="site-card__title mt-2 text-xl">{program.title}</h3>
                    <p className="site-card__text mt-3 flex-1">{program.description}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/90 p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Clock3 size={16} className="mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                          <p className="font-medium text-slate-700">{program.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <GraduationCap size={16} className="mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
                          <p className="font-medium text-slate-700 line-clamp-2">{program.eligibility}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <SiteButton to="/admissions" className="flex-1 !rounded-xl !py-2.5">
                        Apply
                      </SiteButton>
                      <SiteButton to="/contact" variant="secondary" className="flex-1 !rounded-xl !py-2.5">
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

      <section className="site-section site-section--soft !pt-0">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <img src={IMG.lab} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 to-blue-600/55" />
              <div className="relative px-6 py-14 text-center md:px-10 md:py-16">
                <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                  Need help choosing the right program?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-slate-200">
                  Our counselors can guide you through eligibility, career pathways, and admissions timelines.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <SiteButton to="/admissions" className="!rounded-full">
                    Start Application
                  </SiteButton>
                  <SiteButton to="/contact" variant="outline" className="!rounded-full">
                    Talk to Counselor
                  </SiteButton>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export default Academics;
