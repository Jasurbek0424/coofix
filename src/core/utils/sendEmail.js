const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

module.exports = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Coofix Uz" <${process.env.EMAIL}>`,
    to,
    subject,
    html
  });
};
