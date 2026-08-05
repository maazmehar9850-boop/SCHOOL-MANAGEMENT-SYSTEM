import nodemailer from "nodemailer";

const CONTACT_TO = process.env.CONTACT_EMAIL || "maazmehar9850@gmail.com";

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
};

export const transporter = createTransporter();

const sendMail = async (req, res) => {
  try {
    const transporterInstance = createTransporter();
    if (!transporterInstance) {
      return res.status(503).json({
        message: "Email is not configured. Set EMAIL_USER and EMAIL_PASS in environment variables.",
      });
    }

    const { to, subject, text, html } = req.body;
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ message: "to, subject, and text/html are required" });
    }

    const info = await transporterInstance.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    return res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    return res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

export const sendContactMessage = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const subject = String(req.body.subject || "Aspira College contact inquiry").trim();
    const message = String(req.body.message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (message.length < 5) {
      return res.status(400).json({ message: "Message is too short" });
    }

    const transporterInstance = createTransporter();
    if (!transporterInstance) {
      return res.status(503).json({
        message: "Email is not configured. Set EMAIL_USER and EMAIL_PASS in environment variables.",
      });
    }

    const text = [
      "New contact message from Aspira College website",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2 style="margin:0 0 12px">Aspira College — Contact Form</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0" />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const info = await transporterInstance.sendMail({
      from: `"Aspira College Portal" <${process.env.EMAIL_USER}>`,
      to: CONTACT_TO,
      replyTo: email,
      subject: `[Aspira College] ${subject}`,
      text,
      html,
    });

    return res.status(200).json({
      message: "Message sent successfully. We will contact you soon.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Contact email failed:", error.message);
    return res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default sendMail;
