import 'dotenv/config';
import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_REQUIRE_TLS,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  CONTACT_TO
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || 'smtp-mail.outlook.com',
  port: Number(SMTP_PORT ?? 587),
  secure: false,                       // false for STARTTLS on 587
  requireTLS: String(SMTP_REQUIRE_TLS ?? 'true') === 'true',
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

try {
  console.log('Connecting to SMTP as', SMTP_USER);
  const info = await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,      // MUST match the authenticated user for Outlook
    to: CONTACT_TO || SMTP_USER,       // send to yourself for the test
    subject: 'SMTP test (SvelteKit order form)',
    text: 'If you received this, Outlook SMTP + app password is working.'
  });
  console.log('✅ Sent!', info.messageId, info.response);
} catch (err) {
  console.error('❌ SMTP send failed:', err);
  process.exit(1);
}
