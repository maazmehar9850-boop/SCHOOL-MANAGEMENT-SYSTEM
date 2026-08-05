import { BookOpen, Dumbbell, FlaskConical, Music2, PartyPopper, Users } from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import { IconBadge } from "../components/site/GlassPanel";
import { IMG } from "../data/siteImages";

const areas = [
  {
    title: "Clubs",
    text: "Debate, tech, entrepreneurship, and literary clubs that grow skills and friendships.",
    image: IMG.clubs,
    icon: Users,
  },
  {
    title: "Sports",
    text: "Fitness, teamwork, and competitive spirit through organized sports and recreation.",
    image: IMG.sports,
    icon: Dumbbell,
  },
  {
    title: "Events",
    text: "Open days, summits, competitions, and celebrations that energize campus life.",
    image: IMG.events,
    icon: PartyPopper,
  },
  {
    title: "Library",
    text: "Quiet study spaces, academic resources, and guided research support.",
    image: IMG.library,
    icon: BookOpen,
  },
  {
    title: "Laboratories",
    text: "Hands-on science and computing labs that turn theory into practice.",
    image: IMG.lab,
    icon: FlaskConical,
  },
  {
    title: "Cultural Programs",
    text: "Music, drama, art, and cultural showcases celebrating student talent.",
    image: IMG.cultural,
    icon: Music2,
  },
];

function CampusLife() {
  return (
    <>
      <PageHero
        eyebrow="Campus Life"
        title="A vibrant community where learning meets belonging"
        lead="Clubs, sports, cultural programs, labs, and student activities create a complete Aspira experience."
        image={IMG.campusLife}
        breadcrumbs={[{ label: "Campus Life" }]}
      />

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Student Experience"
            title="Spaces and activities that inspire every day"
            lead="Beyond academics, Aspira students build confidence, creativity, and lifelong connections."
          />

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card group overflow-hidden !p-0 h-full">
                  <div className="site-media relative !h-56 !rounded-none !border-0 !shadow-none">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    <div className="absolute left-4 top-4">
                      <IconBadge icon={item.icon} className="!bg-white/95" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="site-card__title text-xl">{item.title}</h3>
                    <p className="site-card__text mt-2">{item.text}</p>
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
            eyebrow="Student Activities"
            title="Moments that make campus memorable"
          />
          <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { image: IMG.activities, title: "Community Projects", text: "Service initiatives that build empathy and leadership." },
              { image: IMG.graduation, title: "Milestone Celebrations", text: "Convocations and award days that honor achievement." },
              { image: IMG.auditorium, title: "Seminars & Talks", text: "Guest speakers and workshops for career inspiration." },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card overflow-hidden !p-0">
                  <div className="site-media !h-52 !rounded-none !border-0 !shadow-none">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div className="p-5">
                    <h3 className="site-card__title">{item.title}</h3>
                    <p className="site-card__text mt-2">{item.text}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn className="mt-12 text-center">
            <SiteButton to="/gallery" className="!rounded-full">
              View campus gallery
            </SiteButton>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export default CampusLife;
