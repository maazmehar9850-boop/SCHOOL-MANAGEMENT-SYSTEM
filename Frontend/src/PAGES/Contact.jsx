import { useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-6">
          <div className="liquid-glass p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b5fff]">Contact</p>
            <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[var(--lg-ink)] md:text-5xl">
              Get in touch with {college.name || "Aspira College"}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[var(--lg-muted)]">
              For admissions, portal access, or general inquiries, reach the campus office during
              school hours — or send a message using the form. Campus currently serves{" "}
              {loading ? "—" : data.students} students and {loading ? "—" : data.teachers} teachers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactCards.map((item) => (
              <div key={item.title} className="liquid-glass p-5">
                <item.icon className="text-[#0b5fff]" size={20} />
                <h3 className="mt-3 font-display text-base font-bold text-[var(--lg-ink)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--lg-muted)]">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="liquid-media h-72">
            <img src={imgContact} alt="Aspira College campus" />
          </div>
        </div>

        <form onSubmit={onContactSubmit} className="liquid-glass p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-[var(--lg-ink)]">Send a message</h2>
          <p className="mt-2 text-sm text-[var(--lg-muted)]">
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
              <GradientButton type="submit" className="!rounded-full !px-7 !py-3" disabled={sendingContact}>
                {sendingContact ? "Sending..." : "Send message"}
                <ArrowRight size={16} />
              </GradientButton>
              <Link to="/login">
                <GradientButton
                  type="button"
                  variant="secondary"
                  className="!rounded-full !border-white/50 !bg-white/45 !px-7 !py-3 !text-[var(--lg-ink)] hover:!bg-white/70"
                >
                  Portal Login
                </GradientButton>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Contact;
