import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn } from "../components/site/FadeIn";
import { IMG } from "../data/siteImages";

const gallery = [
  { image: IMG.gallery1, caption: "Main Campus", category: "Campus", tall: true },
  { image: IMG.gallery2, caption: "Student Gathering", category: "Student Activities" },
  { image: IMG.gallery3, caption: "Modern Classroom", category: "Classrooms" },
  { image: IMG.gallery4, caption: "Science Laboratory", category: "Laboratories", tall: true },
  { image: IMG.gallery5, caption: "Graduation Ceremony", category: "Graduation" },
  { image: IMG.gallery6, caption: "College Library", category: "Campus" },
  { image: IMG.gallery7, caption: "Sports Day", category: "Events", tall: true },
  { image: IMG.gallery8, caption: "Cultural Night", category: "Events" },
  { image: IMG.gallery9, caption: "Community Activity", category: "Student Activities" },
  { image: IMG.gallery10, caption: "Campus Courtyard", category: "Campus" },
  { image: IMG.gallery11, caption: "Learning Spaces", category: "Classrooms", tall: true },
  { image: IMG.gallery12, caption: "Seminar Hall", category: "Events" },
];

const filters = ["All", "Campus", "Events", "Classrooms", "Laboratories", "Graduation", "Student Activities"];

function Gallery() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);

  const items = filter === "All" ? gallery : gallery.filter((g) => g.category === filter);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments and spaces that define Aspira College"
        lead="Explore campus photos, classrooms, laboratories, events, and student life through our visual showcase."
        image={IMG.gallery1}
        breadcrumbs={[{ label: "Gallery" }]}
      />

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Campus Gallery"
            title="A closer look at life at Aspira"
          />

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item
                    ? "bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="site-masonry mt-10">
            {items.map((item, i) => (
              <FadeIn key={`${item.caption}-${i}`} className="site-masonry__item" delay={(i % 3) * 0.05}>
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="site-card group block w-full overflow-hidden !p-0 text-left"
                >
                  <div className={`site-media !rounded-none !border-0 !shadow-none ${item.tall ? "h-80" : "h-56"}`}>
                    <img src={item.image} alt={item.caption} loading="lazy" />
                  </div>
                  <div className="px-4 py-3">
                    <p className="site-card__meta">{item.category}</p>
                    <p className="site-card__title mt-1 text-sm">{item.caption}</p>
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-12 text-center">
            <SiteButton to="/contact" className="!rounded-full">
              Plan a campus visit
            </SiteButton>
          </FadeIn>
        </div>
      </section>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="site-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.caption}
          >
            <button
              type="button"
              className="absolute right-5 top-5 rounded-full bg-white/15 p-2 text-white backdrop-blur transition hover:bg-white/25"
              aria-label="Close lightbox"
              onClick={() => setActive(null)}
            >
              <X size={20} />
            </button>
            <motion.img
              key={active.image}
              src={active.image}
              alt={active.caption}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default Gallery;
