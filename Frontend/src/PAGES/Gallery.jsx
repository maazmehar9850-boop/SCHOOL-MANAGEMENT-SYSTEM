import imgBuilding from "../assets/landing/landing-building.png";
import imgStudents from "../assets/landing/aspira-students.png";
import imgClassroom from "../assets/landing/aspira-classroom.png";
import imgLibrary from "../assets/landing/aspira-library.png";
import imgAuditorium from "../assets/landing/aspira-auditorium.png";
import imgLab from "../assets/landing/aspira-lab.png";
import imgCorridor from "../assets/landing/aspira-corridor.png";

const gallery = [
  { image: imgBuilding, caption: "Main campus building", note: "Aspira College · Dolat Nagar, Gujrat" },
  { image: imgStudents, caption: "Campus courtyard", note: "Student life on campus" },
  { image: imgClassroom, caption: "Modern classrooms", note: "Focused teaching spaces" },
  { image: imgLibrary, caption: "College library", note: "Quiet study environment" },
  { image: imgAuditorium, caption: "Seminar hall", note: "Events & presentations" },
  { image: imgLab, caption: "Science lab", note: "Practical learning" },
  { image: imgCorridor, caption: "Campus corridors", note: "Daily academic flow" },
  { image: imgStudents, caption: "Student community", note: "Learning together" },
];

function Gallery() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="liquid-glass max-w-3xl p-7 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">Gallery</p>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[var(--lg-ink)] md:text-5xl">
          Campus life at Aspira
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[var(--lg-muted)]">
          A closer look at Aspira College — the campus building, classrooms, labs, library, and the
          everyday moments that shape learning in Dolat Nagar, Gujrat.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item, i) => (
          <figure key={`${item.caption}-${i}`} className="liquid-glass overflow-hidden !p-0">
            <div className="h-60 overflow-hidden">
              <img
                src={item.image}
                alt={item.caption}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>
            <figcaption className="px-4 py-4">
              <p className="text-sm font-semibold text-[var(--lg-ink)]">{item.caption}</p>
              <p className="mt-1 text-xs text-[var(--lg-muted)]">{item.note}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="liquid-glass mt-14 p-7 md:p-10">
        <h2 className="font-display text-2xl font-bold text-[var(--lg-ink)] md:text-3xl">
          Visit campus to feel the difference
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--lg-muted)]">
          Photos tell part of the story — walking through Aspira College shows the rest. Meet faculty,
          see classrooms, and ask about admissions for the upcoming session.
        </p>
      </div>
    </div>
  );
}

export default Gallery;
