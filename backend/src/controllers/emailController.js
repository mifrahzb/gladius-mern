import asyncHandler from 'express-async-handler';
import { sendEmail } from '../services/emailService.js';
import Newsletter from '../models/Newsletter.js';

// Subscribe to newsletter
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const exists = await Newsletter.findOne({ email });
  if (exists) return res.json({ message: 'Already subscribed' });

  const record = new Newsletter({ email });
  await record.save();

  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to Gladius',
      text: 'Thanks for subscribing to Gladius newsletter'
    });
  } catch (err) {
    console.warn('Welcome email failed', err.message);
  }

  res.status(201).json({ message: 'Subscribed' });
});

// Send arbitrary email (admin)
export const sendCustomEmail = asyncHandler(async (req, res) => {
  const { to, subject, html } = req.body;
  const info = await sendEmail({ to, subject, html });
  res.json({ message: 'Sent', info });
});
