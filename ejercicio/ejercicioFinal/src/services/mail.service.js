import nodemailer from 'nodemailer';
import { env } from '../config/index.js';
import { logger } from './logger.service.js';

const isMailConfigured = () => {
  return Boolean(env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS && env.MAIL_FROM);
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS
    }
  });
};

export const sendVerificationEmail = async ({ to, code }) => {
  if (!isMailConfigured()) {
    logger.warn({ to }, 'mail service not configured, verification email skipped');
    return { skipped: true };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: 'Codigo de verificacion BildyApp',
    text: `Tu codigo de verificacion es ${code}`,
    html: `<p>Tu codigo de verificacion es <strong>${code}</strong></p>`
  });

  return { skipped: false };
};
