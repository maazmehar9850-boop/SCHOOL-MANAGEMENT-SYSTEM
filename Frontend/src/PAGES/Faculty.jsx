import { useMemo } from "react";
import { Mail } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import PageHero from "../components/site/PageHero";
import SectionHeader from "../components/site/SectionHeader";
import SiteButton from "../components/site/SiteButton";
import { Stagger, StaggerItem } from "../components/site/FadeIn";
import usePublicCampusData from "../hooks/usePublicCampusData";
import { FACULTY } from "../data/siteContent";
import { IMG } from "../data/siteImages";

const facultyPhotos = [
  IMG.faculty1,
  IMG.faculty2,
  IMG.faculty3,
  IMG.faculty4,
  IMG.faculty5,
  IMG.faculty6,
];

function Faculty() {
  const { data, loading } = usePublicCampusData();

  const members = useMemo(() => {
    const fromDb = (data.faculty || []).map((member, i) => ({
      id: member.id || member.name || i,
      name: member.name,
      department: member.subject || "Faculty",
      qualification: member.subject ? `${member.subject} Specialist` : "Faculty Member",
      experience: member.experience || "Aspira College",
      bio:
        member.bio ||
        `${member.name} supports student learning and academic excellence at Aspira College.`,
      photo: facultyPhotos[i % facultyPhotos.length],
      email: member.email || "",
    }));
    return fromDb.length > 0 ? fromDb : FACULTY.map((m, i) => ({ ...m, id: m.name || i }));
  }, [data.faculty]);

  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Meet the educators who mentor Aspira students"
        lead={
          loading
            ? "Loading faculty profiles from the campus database..."
            : `${data.teachers || members.length} faculty members dedicated to academic excellence and student growth.`
        }
        image={IMG.classroom}
        breadcrumbs={[{ label: "Faculty" }]}
      />

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Our Educators"
            title="Expertise across disciplines"
            lead="Faculty profiles are fetched live from the Aspira College campus portal."
          />

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <StaggerItem key={member.id}>
                <article className="site-card group h-full overflow-hidden !p-0">
                  <div className="site-media !h-72 !rounded-none !border-0 !shadow-none">
                    <img src={member.photo} alt={member.name} loading="lazy" />
                  </div>
                  <div className="p-6">
                    <p className="site-card__meta">{member.department}</p>
                    <h3 className="site-card__title mt-2 text-xl">{member.name}</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600">{member.qualification}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      {member.experience}
                    </p>
                    <p className="site-card__text mt-3">{member.bio}</p>
                    <div className="mt-5 flex gap-2">
                      {[
                        { Icon: Mail, label: "Email", href: member.email ? `mailto:${member.email}` : "#" },
                        { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
                        { Icon: FaTwitter, label: "Twitter", href: "#" },
                        { Icon: FaFacebookF, label: "Facebook", href: "#" },
                      ].map(({ Icon, label, href }) => (
                        <a
                          key={label}
                          href={href}
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
