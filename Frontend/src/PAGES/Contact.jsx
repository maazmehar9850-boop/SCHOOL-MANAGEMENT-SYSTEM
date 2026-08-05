import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import GradientButton from "../components/GradientButton";
import API from "../api";
import usePublicCampusData from "../hooks/usePublicCampusData";
import imgContact from "../assets/landing/landing-building.png";

function Contact() {
  const { data, loading } = usePublicCampusData();
  const college = data.college || {};
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sendingContact, setSendingContact] = useState(false);

  const onContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const onContactSubmit = async (e) => {
    e.preventDefault();
    if (sendingContact) return;
    setSendingContact(true);
    try {
      const res = await API.post("/public/contact", contactForm);
      toast.success(res.data?.message || "Message sent successfully");
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingContact(false);
    }
  };

  const contactCards = [
    { icon: MapPin, title: "Campus", text: college.campus || "Dolat Nagar, Gujrat" },
    { icon: Phone, title: "Phone", text: college.phone || "0319 8018795" },
    { icon: Mail, title: "Email", text: college.email || "maazmehar9850@gmail.com" },
    { icon: Clock, title: "Office hours", text: "Mon–Sat · 8:00 AM – 2:00 PM" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="site-eyebrow">Contact</p>
            <h1 className="site-heading mt-3 text-4xl md:text-5xl">
              Get in touch with {college.name || "Aspira College"}
            </h1>
            <p className="site-lead mt-5">
              For admissions, portal access, or general inquiries, reach the campus office during
              college hours — or send a message using the form. Campus currently serves{" "}
              {loading ? "—" : data.students} students and {loading ? "—" : data.teachers} teachers.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactCards.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
                className="site-card p-5"
              >
                <div className="site-card__icon">
                  <item.icon size={18} strokeWidth={2.1} />
                </div>
                <h3 className="site-card__title mt-3.5 text-base">{item.title}</h3>
                <p className="site-card__text mt-1.5">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="site-media h-72">
            <img src={imgContact} alt="Aspira College campus" />
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          onSubmit={onContactSubmit}
          className="site-card p-6 md:p-8"
        >
          <h2 className="site-section-title text-[1.65rem]">Send a message</h2>
          <p className="site-section-lead !mt-2">
            Your message goes to {college.email || "maazmehar9850@gmail.com"}.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lg-muted)]">
                Full name
              </label>
              <input
                name="name"
                value={contactForm.name}
                onChange={onContactChange}
                required
                className="liquid-input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lg-muted)]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={onContactChange}
                required
                className="liquid-input"
                placeholder="you@email.com"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lg-muted)]">
                  Phone
                </label>
                <input
                  name="phone"
                  value={contactForm.phone}
                  onChange={onContactChange}
                  className="liquid-input"
                  placeholder="03xx xxxxxxx"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lg-muted)]">
                  Subject
                </label>
                <input
                  name="subject"
                  value={contactForm.subject}
                  onChange={onContactChange}
                  className="liquid-input"
                  placeholder="Admissions / Portal help"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lg-muted)]">
                Message
              </label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={onContactChange}
                required
                rows={6}
                className="liquid-input resize-y"
                placeholder="Write your message..."
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <GradientButton
                type="submit"
                className="!rounded-full !px-7 !py-3"
                disabled={sendingContact}
              >
                {sendingContact ? "Sending..." : "Send message"}
                <ArrowRight size={16} />
              </GradientButton>
              <Link to="/login">
                <GradientButton
                  type="button"
                  variant="secondary"
                  className="!rounded-full !border-white/60 !bg-white/55 !px-7 !py-3 !text-[var(--lg-ink)] hover:!bg-white/80"
                >
                  Portal Login
                </GradientButton>
              </Link>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default Contact;
