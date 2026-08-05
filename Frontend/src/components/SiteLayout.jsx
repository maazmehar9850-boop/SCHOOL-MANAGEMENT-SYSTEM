import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";
import BrandLogo from "./BrandLogo";
import SiteButton from "./site/SiteButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import usePublicCampusData from "../hooks/usePublicCampusData";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Programs" },
  { to: "/admissions", label: "Admissions" },
  { to: "/faculty", label: "Faculty" },
  { to: "/campus-life", label: "Campus" },
  { to: "/news", label: "News" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const PAGE_TITLES = {
  "/": "Home",
  "/about": "About Us",
  "/academics": "Academic Programs",
  "/admissions": "Admissions",
  "/faculty": "Faculty",
  "/campus-life": "Campus Life",
  "/news": "News & Events",
  "/gallery": "Gallery",
  "/portal": "Portal",
  "/contact": "Contact",
};

const footerCols = [
  {
    title: "Quick Links",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/academics", label: "Programs" },
      { to: "/faculty", label: "Faculty" },
      { to: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Admissions",
    links: [
      { to: "/admissions", label: "How to Apply" },
      { to: "/admissions#requirements", label: "Requirements" },
      { to: "/admissions#scholarships", label: "Scholarships" },
      { to: "/contact", label: "Visit Campus" },
    ],
  },
  {
    title: "Student Resources",
    links: [
      { to: "/portal", label: "Campus Portal" },
      { to: "/campus-life", label: "Campus Life" },
      { to: "/news", label: "News & Events" },
      { to: "/login", label: "Portal Login" },
    ],
  },
];

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const { pathname } = useLocation();
  const { data } = usePublicCampusData();
  const college = data.college || {};
  useDocumentTitle(PAGE_TITLES[pathname] || "Aspira College");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname]);

  const onNewsletter = (e) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <div className="site-shell min-h-screen">
      <header className={`site-nav ${scrolled || menuOpen ? "site-nav--scrolled" : ""}`}>
        <div className="site-nav__bar mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-[1.4rem] px-3 py-2.5 md:gap-3 md:px-5 md:py-3">
          <Link to="/" onClick={() => setMenuOpen(false)} aria-label="Aspira College home" className="min-w-0 shrink">
            <BrandLogo
              size={38}
              light={false}
              name={college.name || "Aspira College"}
              subtitle={college.campus || "Gujrat"}
            />
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `liquid-nav-link ${isActive ? "is-active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <SiteButton to="/login" className="!hidden !rounded-full !px-4 !py-2 !text-xs sm:!inline-flex sm:!px-5 sm:!py-2.5 sm:!text-sm">
              Portal Login
              <ArrowRight size={14} />
            </SiteButton>
            <button
              type="button"
              className="site-nav__menu-btn rounded-full border p-2.5 backdrop-blur xl:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="site-nav__mobile mx-auto mt-2 max-w-7xl rounded-[1.25rem] px-3 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <SiteButton to="/login" className="mt-2 w-full !rounded-full" onClick={() => setMenuOpen(false)}>
                Portal Login
              </SiteButton>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer mt-8">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <BrandLogo size={42} light name={college.name || "Aspira College"} subtitle={college.campus || "Gujrat"} />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Aspira College provides an inspiring learning environment where students gain academic
                excellence, practical knowledge, leadership skills, and career-focused education.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { Icon: FaFacebookF, label: "Facebook" },
                  { Icon: FaInstagram, label: "Instagram" },
                  { Icon: FaTwitter, label: "Twitter" },
                  { Icon: FaLinkedinIn, label: "LinkedIn" },
                  { Icon: FaYoutube, label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {footerCols.map((col) => (
              <div key={col.title} className="lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">{col.title}</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Contact</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li className="flex gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-sky-400" />
                  {college.campus || "Dolat Nagar, Gujrat"}
                </li>
                <li className="flex gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0 text-sky-400" />
                  {college.phone || "0319 8018795"}
                </li>
                <li className="flex gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-sky-400" />
                  {college.email || "maazmehar9850@gmail.com"}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-white">Stay informed</p>
                <p className="mt-1 text-sm text-slate-400">
                  Subscribe for admissions updates, events, and campus news.
                </p>
              </div>
              <form onSubmit={onNewsletter} className="flex w-full max-w-md gap-2">
                <label className="sr-only" htmlFor="newsletter-email">
                  Email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                />
                <SiteButton type="submit" variant="primary" className="!rounded-2xl !px-5">
                  Subscribe
                </SiteButton>
              </form>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {college.name || "Aspira College"},{" "}
              {college.campus || "Dolat Nagar Gujrat"}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to="/portal">Portal</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/admissions">Apply</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
