import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GradientButton from "../components/GradientButton";
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl"
      >
        <p className="site-eyebrow">Gallery</p>
        <h1 className="site-heading mt-3 text-4xl md:text-5xl">Campus life at Aspira</h1>
        <p className="site-lead mt-5">
          A closer look at Aspira College — the campus building, classrooms, labs, library, and the
          everyday moments that shape learning in Dolat Nagar, Gujrat.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item, i) => (
          <motion.figure
            key={`${item.caption}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.05, duration: 0.45 }}
            className="site-card overflow-hidden !p-0"
          >
            <div className="site-media !rounded-none !border-0 !shadow-none h-60">
              <img src={item.image} alt={item.caption} loading="lazy" />
            </div>
            <figcaption className="px-4 py-4">
              <p className="site-card__title text-sm">{item.caption}</p>
              <p className="site-card__text mt-1 text-xs">{item.note}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 max-w-3xl"
      >
        <h2 className="site-section-title">Visit campus to feel the difference</h2>
        <p className="site-section-lead !max-w-none">
          Photos tell part of the story — walking through Aspira College shows the rest. Meet faculty,
          see classrooms, and ask about admissions for the upcoming session.
        </p>
        <Link to="/contact" className="mt-6 inline-block">
          <GradientButton className="!rounded-full !px-7 !py-3">
            Plan a visit
            <ArrowRight size={16} />
          </GradientButton>
        </Link>
      </motion.div>
    </div>
  );
}

export default Gallery;
