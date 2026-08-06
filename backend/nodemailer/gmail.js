import nodemailer from "nodemailer";

const DEFAULT_CONTACT_TO = "maazmehar9850@gmail.com";

function getEmailUser() {
  return String(process.env.EMAIL_USER || "").trim();
}

function getEmailPass() {
  // Gmail App Passwords are often copied with spaces — strip them.
  return String(process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();
}

function getContactTo() {
  return String(process.env.CONTACT_EMAIL || DEFAULT_CONTACT_TO).trim() || DEFAULT_CONTACT_TO;
}

const createTransporter = () => {
  const user = getEmailUser();
  const pass = getEmailPass();

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

export const transporter = null;

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
      from: `"Aspira College" <${getEmailUser()}>`,
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

    const user = getEmailUser();
    const pass = getEmailPass();
    if (!user || !pass) {
      console.error("Contact email blocked: EMAIL_USER / EMAIL_PASS missing");
      const onVercel = Boolean(process.env.VERCEL);
      return res.status(503).json({
        message: onVercel
          ? "Email is not configured on the server. Add EMAIL_USER, EMAIL_PASS, and CONTACT_EMAIL in Vercel → Project → Settings → Environment Variables, then redeploy."
          : "Email is not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env and restart the backend.",
      });
    }

    const transporterInstance = createTransporter();
    const contactTo = getContactTo();

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
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px">
        <h2 style="margin:0 0 12px;color:#1d4ed8">Aspira College — Contact Form</h2>
        <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
        <p style="margin:0 0 8px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0" />
        <p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
      </div>
    `;

    const info = await transporterInstance.sendMail({
      from: `"Aspira College Contact" <${user}>`,
      to: contactTo,
      replyTo: `${name} <${email}>`,
      subject: `[Aspira College] ${subject}`,
      text,
      html,
    });

    console.log(`Contact email sent to ${contactTo} (${info.messageId})`);

    return res.status(200).json({
      message: "Message sent successfully. We will contact you soon.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Contact email failed:", error?.code || "", error.message);

    const authFailed =
      error?.code === "EAUTH" ||
      /invalid login|username and password|badcredentials/i.test(error.message || "");

    if (authFailed) {
      return res.status(500).json({
        message:
          "Gmail login failed. Use EMAIL_USER=maazmehar9850@gmail.com and a 16-digit Gmail App Password in EMAIL_PASS.",
      });
    }

    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
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
