import { ArrowRight, Calendar, MapPin } from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import { EVENTS, NEWS } from "../data/siteContent";
import { IMG } from "../data/siteImages";

function News() {
  return (
    <>
      <PageHero
        eyebrow="News & Events"
        title="Stay connected with campus stories and upcoming moments"
        lead="Read the latest academic highlights, student achievements, and events shaping life at Aspira College."
        image={IMG.news3}
        breadcrumbs={[{ label: "News & Events" }]}
      />

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Latest News"
            title="Stories from across Aspira campus"
          />
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NEWS.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card group flex h-full flex-col overflow-hidden !p-0">
                  <div className="site-media !h-52 !rounded-none !border-0 !shadow-none">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                      <span>{item.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{item.date}</span>
                    </div>
                    <h3 className="site-card__title mt-3 text-lg">{item.title}</h3>
                    <p className="site-card__text mt-2 flex-1">{item.excerpt}</p>
                    <button
                      type="button"
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] transition hover:gap-2"
                    >
                      Read More
                      <ArrowRight size={15} />
                    </button>
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
            eyebrow="Upcoming Events"
            title="Plan your next campus visit"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {EVENTS.map((event) => (
              <FadeIn key={event.title}>
                <article className="site-card flex gap-4 p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e40af] to-[#38BDF8] text-white">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">{event.category}</p>
                    <h3 className="site-card__title mt-1 text-lg">{event.title}</h3>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{event.date}</span>
                      <span>{event.time}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} />
                        {event.place}
                      </span>
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
          <div className="mt-10 text-center">
            <SiteButton to="/contact" className="!rounded-full">
              Request event details
            </SiteButton>
          </div>
        </div>
      </section>
    </>
  );
}

export default News;
