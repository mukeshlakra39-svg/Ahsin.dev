const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`\n===== OTP FOR ${to}: ${text} =====\n`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Ahsin.dev" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text,
  });

  return true;
};

module.exports = sendEmail;
