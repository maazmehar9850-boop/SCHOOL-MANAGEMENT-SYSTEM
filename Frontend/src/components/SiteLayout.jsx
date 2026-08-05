import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import GradientButton from "./GradientButton";
import BrandLogo from "./BrandLogo";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/portal", label: "Portal" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const PAGE_TITLES = {
  "/": "Home",
  "/about": "About",
  "/academics": "Academics",
  "/portal": "Portal",
  "/gallery": "Gallery",
  "/contact": "Contact",
};

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useDocumentTitle(PAGE_TITLES[pathname] || "Campus");


  return (
    <div className="site-shell min-h-screen">
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
        <div className="liquid-nav mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.4rem] px-4 py-3 md:px-5">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <BrandLogo size={42} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
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

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block">
              <GradientButton className="!rounded-full !px-5 !py-2.5">
                Portal Login
                <ArrowRight size={16} />
              </GradientButton>
            </Link>
            <button
              type="button"
              className="rounded-full border border-white/60 bg-white/50 p-2.5 text-slate-700 backdrop-blur lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="liquid-glass mx-auto mt-2 max-w-7xl p-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `liquid-nav-link ${isActive ? "is-active" : ""}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2">
                <GradientButton className="w-full !rounded-full !py-2.5">Portal Login</GradientButton>
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="px-3 pb-6 pt-8 md:px-5">
        <div className="liquid-glass mx-auto max-w-7xl p-8 md:p-10">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div>
              <BrandLogo size={40} />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--lg-muted)]">
                Aspira College — Dolat Nagar, Gujrat. Intermediate & degree pathways with a modern
                campus portal for students, teachers, and administration.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <div>
                <p className="site-eyebrow mb-3">Explore</p>
                <ul className="space-y-2 text-sm text-[var(--lg-muted)]">
                  {navLinks.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="transition hover:text-[var(--lg-ink)]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="site-eyebrow mb-3">Portal</p>
                <ul className="space-y-2 text-sm text-[var(--lg-muted)]">
                  <li>
                    <Link to="/login" className="transition hover:text-[var(--lg-ink)]">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/forgot-password" className="transition hover:text-[var(--lg-ink)]">
                      Reset password
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="site-eyebrow mb-3">Contact</p>
                <ul className="space-y-2 text-sm text-[var(--lg-muted)]">
                  <li>Dolat Nagar, Gujrat</li>
                  <li>0319 8018795</li>
                  <li>maazmehar9850@gmail.com</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-white/40 pt-5 text-xs text-slate-400">
            © {new Date().getFullYear()} Aspira College, Dolat Nagar Gujrat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
