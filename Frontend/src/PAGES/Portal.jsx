import { CheckCircle2 } from "lucide-react";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import { IMG } from "../data/siteImages";

const roles = [
  {
    role: "Administration",
    title: "Lead the campus",
    text: "Oversee students, teachers, courses, fees, and college-wide academic records from one dashboard.",
    points: ["Student & faculty records", "Fees overview", "Campus-wide reports"],
    image: IMG.portalAdmin,
  },
  {
    role: "Teachers",
    title: "Guide every class",
    text: "Take attendance, enter marks, share assignments, and support assigned students with clarity.",
    points: ["Class attendance", "Marks entry", "Assignments & resources"],
    image: IMG.portalTeacher,
  },
  {
    role: "Students",
    title: "Track your progress",
    text: "View attendance, results, subjects, fees, and learning resources from one secure login.",
    points: ["Personal dashboard", "Results & attendance", "Course materials"],
    image: IMG.portalStudent,
  },
];

function Portal() {
  return (
    <>
      <PageHero
        eyebrow="Campus Portal"
        title="One campus. Three tailored portals."
        lead="Sign in with your Aspira College account to access tools for administration, teaching, and student learning."
        image={IMG.corridor}
        breadcrumbs={[{ label: "Portal" }]}
      >
        <SiteButton to="/login" className="!rounded-full">
          Portal Login
        </SiteButton>
      </PageHero>

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Portal Access"
            title="Built for clarity, speed, and academic accuracy"
            lead="Reduce paperwork, improve communication, and keep academic records transparent for every role."
          />

          <div className="mt-14 space-y-12">
            {roles.map((r, index) => (
              <FadeIn key={r.role}>
                <div
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                    index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <p className="site-eyebrow">{r.role}</p>
                    <h2 className="site-section-title mt-2">{r.title}</h2>
                    <p className="site-section-lead !max-w-none">{r.text}</p>
                    <ul className="mt-5 space-y-2.5">
                      {r.points.map((p) => (
                        <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                          <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <SiteButton to="/login" className="mt-6 !rounded-full">
                      Sign in as {r.role.slice(0, -1)}
                    </SiteButton>
                  </div>
                  <div className="site-media h-72 md:h-80">
                    <img src={r.image} alt={r.role} loading="lazy" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section site-section--soft !pt-0">
        <div className="mx-auto max-w-7xl">
          <Stagger className="grid gap-5 md:grid-cols-3">
            {[
              { title: "Secure access", text: "Role-based login keeps student and staff data protected." },
              { title: "Always available", text: "Check attendance, results, and notices from any device." },
              { title: "Campus connected", text: "Admins, teachers, and students stay aligned in one system." },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card h-full p-6">
                  <h3 className="site-card__title text-lg">{item.title}</h3>
                  <p className="site-card__text mt-2">{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

export default Portal;
