// src/routes/contact/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import {
  MAIL_LOCAL_JSON, MAIL_LOCAL_FILE, MAIL_LOCAL_DIR,
  MAIL_TEST, USE_EMAIL_API,
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_REQUIRE_TLS, SMTP_TLS_REJECT_UNAUTHORIZED, SMTP_LOG,
  SMTP_USER, SMTP_PASS, SMTP_FROM,
  CONTACT_TO, CONTACT_CC, CONTACT_BCC, CONTACT_FROM,
  RESEND_API_KEY
} from '$env/static/private';

/* ---------- helpers ---------- */
const StaticEnv = {
  MAIL_LOCAL_JSON, MAIL_LOCAL_FILE, MAIL_LOCAL_DIR,
  MAIL_TEST, USE_EMAIL_API,
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_REQUIRE_TLS, SMTP_TLS_REJECT_UNAUTHORIZED, SMTP_LOG,
  SMTP_USER, SMTP_PASS, SMTP_FROM,
  CONTACT_TO, CONTACT_CC, CONTACT_BCC, CONTACT_FROM,
  RESEND_API_KEY
};
const ENV  = (k, d) => (process?.env?.[k] ?? StaticEnv?.[k] ?? d);
const bool = (v, d=false) => typeof v === 'string' ? ['1','true','yes','on'].includes(v.toLowerCase()) : (v ?? d);
const num  = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

const looksLikeEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const escapeHtml = (s = '') => s
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const splitAddresses = (s = '') =>
  String(s).split(/[,;]+/).map((x) => x.trim()).filter(Boolean);
const isRedirect = (e) => e && typeof e === 'object' && 'status' in e && 'location' in e;

/* ---------- transports ---------- */
async function makeTransport() {
  // 0) Local JSON (no network; logs payload)
  if (bool(ENV('MAIL_LOCAL_JSON'), false)) {
    const t = nodemailer.createTransport({ jsonTransport: true });
    console.log('[contact][local] JSON transport active — emails will be logged only.');
    return { transporter: t, usesJson: true, isTest: true };
  }

  // 1) Ethereal test (try 465 SMTPS, then 587 STARTTLS)
  if (bool(ENV('MAIL_TEST'), false)) {
    try {
      const test = await nodemailer.createTestAccount();
      // 465 SMTPS (avoids STARTTLS stripping)
      try {
        const t465 = nodemailer.createTransport({
          host: test.smtp.host, port: 465, secure: true,
          auth: { user: test.user, pass: test.pass },
          logger: true, debug: true
        });
        await t465.verify();
        console.log('[contact][test] Ethereal SMTPS (465) as', test.user);
        return { transporter: t465, usesJson: false, isTest: true };
      } catch (e465) {
        console.warn('[contact][test] 465 failed, trying 587:', e465?.message);
      }
      // 587 STARTTLS
      try {
        const t587 = nodemailer.createTransport({
          host: test.smtp.host, port: test.smtp.port, secure: false, requireTLS: true,
          auth: { user: test.user, pass: test.pass },
          tls: { minVersion: 'TLSv1.2', servername: test.smtp.host, rejectUnauthorized: true },
          logger: true, debug: true
        });
        await t587.verify();
        console.log('[contact][test] Ethereal STARTTLS (587) as', test.user);
        return { transporter: t587, usesJson: false, isTest: true };
      } catch (e587) {
        console.warn('[contact][test] 587 failed, using JSON:', e587?.message);
      }
    } catch (eAcc) {
      console.warn('[contact][test] createTestAccount failed, using JSON:', eAcc?.message);
    }
    const tJson = nodemailer.createTransport({ jsonTransport: true });
    console.log('[contact][test] JSON transport active.');
    return { transporter: tJson, usesJson: true, isTest: true };
  }

  // 2) Production O365 (587 STARTTLS; LOGIN after TLS)
  const host = ENV('SMTP_HOST', 'smtp.office365.com');
  const port = num(ENV('SMTP_PORT'), 587);
  const transporter = nodemailer.createTransport(
    {
      host, port,
      secure: false,                // STARTTLS
      requireTLS: true,             // do not AUTH before TLS
      auth: { user: ENV('SMTP_USER'), pass: ENV('SMTP_PASS') },
      authMethod: 'LOGIN',          // avoid AUTH PLAIN pre-TLS
      tls: {
        minVersion: 'TLSv1.2',
        servername: host,
        rejectUnauthorized: bool(ENV('SMTP_TLS_REJECT_UNAUTHORIZED'), true)
      },
      logger: bool(ENV('SMTP_LOG'), false),
      debug: bool(ENV('SMTP_LOG'), false)
    },
    { from: ENV('SMTP_FROM') || ENV('SMTP_USER') }
  );
  try { await transporter.verify(); } catch (e) {
    console.error('[contact][smtp] verify failed:', e?.message);
  }
  return { transporter, usesJson: false, isTest: false };
}

/* ---------- API sender (Resend) ---------- */
async function sendWithResend({ from, to, cc, bcc, replyTo, subject, text, html }) {
  const key = ENV('RESEND_API_KEY');
  if (!key) throw new Error('RESEND_API_KEY missing');
  const resend = new Resend(key);

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to].filter(Boolean),
    subject
  };
  if (text) payload.text = text;
  if (html) payload.html = html;
  if (cc)  payload.cc  = Array.isArray(cc)  ? cc  : [cc];
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  if (replyTo) payload.reply_to = replyTo;

  const res = await resend.emails.send(payload);
  if (res?.error) throw new Error(`Resend error: ${res.error.message || JSON.stringify(res.error)}`);
  return res;
}

/* ---------- action handler ---------- */
async function handleSubmit({ request }) {
  const data = await request.formData();

  // Honeypot
  if (data.get('fax')) return { ok: true };

  const name     = (data.get('name')     ?? '').toString().trim();
  const email    = (data.get('email')    ?? '').toString().trim();
  const company  = (data.get('company')  ?? '').toString().trim();
  const phone    = (data.get('phone')    ?? '').toString().trim();
  const subjectI = (data.get('subject')  ?? '').toString().trim();
  const interest = (data.get('interest') ?? '').toString().trim();
  const message  = (data.get('message')  ?? '').toString().trim();

  if (!name || !email || !message) {
    return fail(400, { ok: false, error: 'Please check the required fields and try again.' });
  }
  if (!looksLikeEmail(email)) {
    return fail(400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const subject = subjectI
    ? `Website contact — ${subjectI}`
    : 'Website contact';

  const msgRef = `MSG-${Date.now().toString(36).toUpperCase()}`;

  const plain = [
    `From: ${name} <${email}>`,
    company ? `Company: ${company}` : `Company: —`,
    phone   ? `Phone: ${phone}`     : `Phone: —`,
    interest? `Interest: ${interest}`: `Interest: —`,
    `Subject: ${subject}`,
    '',
    message,
    '',
    `Ref: ${msgRef}`,
    '— Sent from maramed.com/contact —'
  ].join('\n');

  const html = `
    <p><b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><b>Company:</b> ${company ? escapeHtml(company) : '—'}</p>
    <p><b>Phone:</b> ${phone ? escapeHtml(phone) : '—'}</p>
    <p><b>Interest:</b> ${interest ? escapeHtml(interest) : '—'}</p>
    <p><b>Subject:</b> ${escapeHtml(subject)}</p>
    <hr>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    <hr>
    <p style="color:#64748b;font-size:12px">
      Submitted via maramed.com/contact • Ref ${escapeHtml(msgRef)}
    </p>
  `;

  const toList  = splitAddresses(ENV('CONTACT_TO', 'custsupport@maramed.com'));
  const ccList  = splitAddresses(ENV('CONTACT_CC', ''));
  const bccList = splitAddresses(ENV('CONTACT_BCC', ''));
  const fromHdr = ENV('CONTACT_FROM', ENV('SMTP_FROM', 'Maramed Website <no-reply@localhost>'));
  const envFrom = ENV('SMTP_FROM', ENV('SMTP_USER', 'no-reply@localhost'));

  try {
    // API mode (bypasses SMTP/firewall)
    if (bool(ENV('USE_EMAIL_API'), false)) {
      await sendWithResend({
        from: fromHdr,
        to: toList,
        cc: ccList.length ? ccList : undefined,
        bcc: bccList.length ? bccList : undefined,
        replyTo: email,
        subject: `${subject} (${msgRef})`,
        text: plain,
        html
      });
      throw redirect(303, `/contact/thank-you?ref=${encodeURIComponent(msgRef)}`);
    }

    // SMTP/JSON mode
    const { transporter, usesJson, isTest } = await makeTransport();
    const info = await transporter.sendMail({
      envelope: usesJson ? undefined : { from: envFrom, to: [...toList, ...ccList, ...bccList] },
      from: fromHdr,
      to: toList,
      ...(ccList.length  ? { cc:  ccList }  : {}),
      ...(bccList.length ? { bcc: bccList } : {}),
      subject: `${subject} (${msgRef})`,
      text: plain,
      html,
      replyTo: `${name} <${email}>`,
      headers: {
        'X-Website-Form': 'maramed.com',
        'X-Form-Page': '/contact',
        'X-Message-Ref': msgRef
      }
    });

    if (usesJson) {
      const snippet = typeof info?.message === 'string'
        ? info.message
        : info?.message?.toString?.() ?? '';
      console.log('[contact] JSON:', snippet.slice(0, 2000));
    } else {
      const accepted = Array.isArray(info.accepted) ? info.accepted : [];
      const rejected = Array.isArray(info.rejected) ? info.rejected : [];
      if (!accepted.length || rejected.length) {
        return fail(502, { ok: false, error: 'Mail server did not accept the message.' });
      }
      if (isTest) {
        const url = nodemailer.getTestMessageUrl(info) || '';
        if (url) console.log('[contact] preview:', url);
      }
    }

    // success
    throw redirect(303, `/contact/thank-you?ref=${encodeURIComponent(msgRef)}`);

  } catch (err) {
    if (isRedirect(err)) throw err;

    const msg = String(err?.response || err?.message || '');
    if (err?.code === 'EAUTH' || /Encryption required/i.test(msg)) {
      console.error('Auth/TLS failed for SMTP (check port/TLS settings).', err);
      return fail(502, { ok: false, error: 'Email server requires TLS/auth configuration.' });
    }
    if (/ECONNECTION|ETIMEDOUT|ENOTFOUND/.test(err?.code || '')) {
      console.error('SMTP connection failed:', err);
      return fail(502, { ok: false, error: 'Unable to reach email server.' });
    }
    console.error('Mail send failed:', err);
    return fail(500, { ok: false, error: 'Email service not configured' });
  }
}

/* ---------- named actions ---------- */
export const actions = {
  send: handleSubmit
};
