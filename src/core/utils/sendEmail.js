const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY
  }
});

module.exports = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Coofix Uz" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("SENDGRID ERROR:", err);
    throw err;
  }
};
