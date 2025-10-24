import { createTransport } from '../config/email.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransport();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};
