import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import PageHero from "../components/site/PageHero";
import SiteButton from "../components/site/SiteButton";
import { FadeIn, Stagger, StaggerItem } from "../components/site/FadeIn";
import { IconBadge } from "../components/site/GlassPanel";
import API from "../api";
import usePublicCampusData from "../hooks/usePublicCampusData";
import { IMG } from "../data/siteImages";

function Contact() {
  const { data } = usePublicCampusData();
  const college = data.college || {};
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await API.post("/public/contact", form);
      toast.success(res.data?.message || "Message sent successfully");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const cards = [
    { icon: MapPin, title: "Address", text: college.campus || "Dolat Nagar, Gujrat" },
    { icon: Phone, title: "Phone", text: college.phone || "0319 8018795" },
    { icon: Mail, title: "Email", text: college.email || "maazmehar9850@gmail.com" },
    { icon: Clock, title: "Office Hours", text: "Mon–Sat · 8:00 AM – 2:00 PM" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We would love to hear from you"
        lead="Reach the Aspira College office for admissions guidance, campus visits, or general inquiries."
        image={IMG.contact}
        breadcrumbs={[{ label: "Contact" }]}
      />

      <section className="site-section">
        <div className="mx-auto max-w-7xl">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((item) => (
              <StaggerItem key={item.title}>
                <article className="site-card h-full p-5">
                  <IconBadge icon={item.icon} />
                  <h3 className="site-card__title mt-4">{item.title}</h3>
                  <p className="site-card__text mt-1">{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
            <FadeIn>
              <div className="space-y-5">
                <div className="site-card overflow-hidden !p-0">
                  <div className="site-media !h-64 !rounded-none !border-0 !shadow-none">
                    <img src={IMG.heroCampus} alt="Aspira College campus" />
                  </div>
                  <div className="p-6">
                    <h3 className="site-card__title text-xl">Visit Aspira College</h3>
                    <p className="site-card__text mt-2">
                      Schedule a tour to experience classrooms, labs, and the welcoming campus community in Dolat Nagar, Gujrat.
                    </p>
                    <div className="mt-4 flex gap-2">
                      {[
                        { Icon: FaFacebookF, label: "Facebook" },
                        { Icon: FaInstagram, label: "Instagram" },
                        { Icon: FaTwitter, label: "Twitter" },
                        { Icon: FaLinkedinIn, label: "LinkedIn" },
                      ].map(({ Icon, label }) => (
                        <a
                          key={label}
                          href="#"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-300 hover:text-blue-600"
                          aria-label={label}
                        >
                          <Icon size={16} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="site-card overflow-hidden !p-0">
                  <iframe
                    title="Aspira College location map"
                    src="https://maps.google.com/maps?q=Dolat%20Nagar%20Gujrat&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="h-72 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <form onSubmit={onSubmit} className="site-card p-6 md:p-8">
                <p className="site-eyebrow">Send a message</p>
                <h2 className="site-section-title mt-3 text-2xl md:text-3xl">Contact form</h2>
                <p className="site-card__text mt-2">
                  Share your question and our team will respond during office hours.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { name: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
                    { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                    { name: "phone", label: "Phone", type: "tel", placeholder: "03xx xxxxxxx" },
                    { name: "subject", label: "Subject", type: "text", placeholder: "Admissions inquiry" },
                  ].map((field) => (
                    <label key={field.name} className="block text-sm font-semibold text-slate-700">
                      {field.label}
                      <input
                        required={field.name !== "phone"}
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={onChange}
                        placeholder={field.placeholder}
                        className="liquid-input mt-2"
                      />
                    </label>
                  ))}
                </div>

                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Message
                  <textarea
                    required
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={onChange}
                    placeholder="How can we help you?"
                    className="liquid-input mt-2 resize-y"
                  />
                </label>

                <motion.div className="mt-6" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <SiteButton type="submit" disabled={sending} className="w-full !rounded-2xl !py-3.5">
                    {sending ? "Sending..." : "Send Message"}
                    <Send size={16} />
                  </SiteButton>
                </motion.div>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
