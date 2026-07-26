import nodemailer from "nodemailer";

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

export default sendMail;
