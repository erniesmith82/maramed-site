// src/lib/server/mailer.js
import nodemailer from "nodemailer";

function bool(v, def = false) {
  if (v === undefined || v === null || v === "") return def;
  return String(v).toLowerCase() === "true" || String(v) === "1";
}

const {
  MAIL_TEST,
  SMTP_HOST = "smtp.office365.com",
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  SMTP_LOG,
} = process.env;

// Real Office 365 transporter (STARTTLS on 587)
const realTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,            // 587 uses STARTTLS upgrade (not SMTPS)
  requireTLS: true,         // ensure STARTTLS before AUTH
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  authMethod: "LOGIN",      // prefer LOGIN to avoid AUTH PLAIN pre-TLS
  tls: {
    minVersion: "TLSv1.2",
    servername: SMTP_HOST,  // SNI
    rejectUnauthorized: bool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true),
  },
  logger: bool(SMTP_LOG, false),
  debug:  bool(SMTP_LOG, false),
});

export async function getTransport() {
  if (bool(MAIL_TEST, false)) {
    const test = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass },
    });
    return { transporter: t, isTest: true, testAccount: test };
  }
  return { transporter: realTransporter, isTest: false };
}

export function fromHeader(kind = "orders") {
  if (kind === "noreply" && process.env.NOREPLY_FROM) return process.env.NOREPLY_FROM;
  return process.env.ORDERS_FROM || SMTP_FROM || SMTP_USER || "orders@example.com";
}

export async function sendMail(opts) {
  const { transporter, isTest } = await getTransport();

  const info = await transporter.sendMail({
    from: fromHeader("orders"),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  });

  if (isTest) {
    const url = nodemailer.getTestMessageUrl(info);
    console.log("[SMTP][ETHEREAL] Preview:", url);
  } else if (bool(SMTP_LOG, false)) {
    console.log("[SMTP] Message ID:", info.messageId);
    if (info.response) console.log("[SMTP] Response:", info.response);
  }
  return info;
}
