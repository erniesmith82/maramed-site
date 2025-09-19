import nodemailerOrig from 'nodemailer';

const MAIL_DEBUG = process.env.MAIL_DEBUG === '1' || process.env.SMTP_LOG === '1';
const FORCE_TEST = process.env.MAIL_TEST === '1';

function hasRealSMTP() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function getTransport(nodemailer = nodemailerOrig) {
  if (hasRealSMTP() && !FORCE_TEST) {
    const isSecure =
      String(process.env.SMTP_SECURE ?? 'false') === 'true' ||
      Number(process.env.SMTP_PORT) === 465;

    const requireTls = String(process.env.SMTP_REQUIRE_TLS ?? 'true') === 'true';
    const rejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? 'true') === 'true';

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? (isSecure ? 465 : 587)),
      secure: isSecure,
      requireTLS: !isSecure && requireTls,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { minVersion: 'TLSv1.2', rejectUnauthorized },
      logger: MAIL_DEBUG,
      debug: MAIL_DEBUG
    });

    await transport.verify();
    return { transport, mode: 'smtp' };
  }

  const test = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: test.smtp.host,
    port: test.smtp.port,
    secure: test.smtp.secure,
    auth: { user: test.user, pass: test.pass },
    logger: MAIL_DEBUG,
    debug: MAIL_DEBUG
  });
  return { transport, mode: 'ethereal' };
}

export async function sendMail({ to, cc, bcc, subject, html, text, replyTo, headers, fromName = 'Website' }) {
  const nm = nodemailerOrig;
  const { transport, mode } = await getTransport(nm);

  const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
  const info = await transport.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to, ...(cc ? { cc } : {}), ...(bcc ? { bcc } : {}),
    subject, html, text, replyTo, headers
  });

  const previewUrl = mode === 'ethereal' ? nm.getTestMessageUrl(info) : undefined;
  return { mode, info, previewUrl };
}
