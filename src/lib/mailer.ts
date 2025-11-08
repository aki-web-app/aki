import Resend from '@tryresend/resend';
import nodemailer from 'nodemailer';

export async function sendMail({to, subject, html}: {to:string, subject:string, html:string}) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({from: process.env.MAIL_FROM!, to, subject, html});
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true' }
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html });
}
