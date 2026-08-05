import { Mail } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { Stagger, StaggerItem } from "../components/site/FadeIn";
import { FACULTY } from "../data/siteContent";
import { IMG } from "../data/siteImages";

function Faculty() {
  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Meet the educators who mentor Aspira students"
        lead="Experienced faculty dedicated to academic excellence, student growth, and inspiring classroom leadership."
        image={IMG.classroom}
        breadcrumbs={[{ label: "Faculty" }]}
      />

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Our Educators"
            title="Expertise across disciplines"
            lead="From sciences and computing to business, commerce, and arts - Aspira faculty bring depth and care to every class."
          />

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {FACULTY.map((member) => (
              <StaggerItem key={member.name}>
                <article className="site-card group h-full overflow-hidden !p-0">
                  <div className="site-media !h-72 !rounded-none !border-0 !shadow-none">
                    <img src={member.photo} alt={member.name} loading="lazy" />
                  </div>
                  <div className="p-6">
                    <p className="site-card__meta">{member.department}</p>
                    <h3 className="site-card__title mt-2 text-xl">{member.name}</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600">{member.qualification}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      {member.experience} experience
                    </p>
                    <p className="site-card__text mt-3">{member.bio}</p>
                    <div className="mt-5 flex gap-2">
                      {[
                        { Icon: Mail, label: "Email" },
                        { Icon: FaLinkedinIn, label: "LinkedIn" },
                        { Icon: FaTwitter, label: "Twitter" },
                        { Icon: FaFacebookF, label: "Facebook" },
                      ].map(({ Icon, label }) => (
                        <a
                          key={label}
                          href="#"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-300 hover:text-blue-600"
                          aria-label={`${member.name} ${label}`}
                        >
                          <Icon size={15} />
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-12 text-center">
            <SiteButton to="/contact" variant="secondary" className="!rounded-full">
              Inquire about academic departments
            </SiteButton>
          </div>
        </div>
      </section>
    </>
  );
}

export default Faculty;
