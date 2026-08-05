import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

function PageHero({
  eyebrow,
  title,
  lead,
  image,
  breadcrumbs = [],
  children,
  compact = false,
}) {
  return (
    <section className={`page-hero ${compact ? "page-hero--compact" : ""}`}>
      <div className="page-hero__media" aria-hidden="true">
        <img src={image} alt="" />
      </div>
      <div className="page-hero__veil" aria-hidden="true" />
      <div className="page-hero__shapes" aria-hidden="true">
        <span className="page-hero__orb page-hero__orb--1" />
        <span className="page-hero__orb page-hero__orb--2" />
        <span className="page-hero__orb page-hero__orb--3" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
        {breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            <Link to="/" className="inline-flex items-center gap-1 transition hover:text-white">
              <Home size={14} />
              Home
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                <ChevronRight size={14} className="opacity-60" />
                {crumb.to ? (
                  <Link to={crumb.to} className="transition hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {eyebrow ? <p className="site-eyebrow site-eyebrow--light">{eyebrow}</p> : null}
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {lead ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
              {lead}
            </p>
          ) : null}
          {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
        </motion.div>
      </div>
    </section>
  );
}

export default PageHero;
