// src/routes/ordering/+page.server.js
import { fail, redirect } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "$env/dynamic/private";

/* -------- env helpers -------- */
const ENV  = (k, d) => (env?.[k] ?? process?.env?.[k] ?? d);
const bool = (v, d=false) => typeof v === "string" ? ["1","true","yes","on"].includes(v.toLowerCase()) : (v ?? d);
const num  = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
const pickStr = (fd, k, f="") => ((fd.get(k) ?? f) + "");

/* -------- email bodies -------- */
function buildOrderEmailText(fd, orderRef) {
  return [
    "New website order request",
    "================================",
    "",
    "Customer",
    "--------------------------------",
    `Company:       ${pickStr(fd, "company")}`,
    `Contact:       ${pickStr(fd, "contactName")}`,
    `Email:         ${pickStr(fd, "email")}`,
    `Phone:         ${pickStr(fd, "phone")}`,
    "",
    "Shipping",
    "--------------------------------",
    `Address 1:     ${pickStr(fd, "shipAddress1")}`,
    `Address 2:     ${pickStr(fd, "shipAddress2")}`,
    `City/State:    ${pickStr(fd, "shipCity")}, ${pickStr(fd, "shipState")} ${pickStr(fd, "shipZip")}`,
    `Country:       ${pickStr(fd, "shipCountry", "USA")}`,
    "",
    "Order Details",
    "--------------------------------",
    `PO Number:     ${pickStr(fd, "poNumber")}`,
    `Ship Method:   ${pickStr(fd, "shipMethod", "UPS Ground (default)")}`,
    "",
    "Items (CSV):",
    pickStr(fd, "orderItems"),
    "",
    "Notes",
    "--------------------------------",
    pickStr(fd, "notes") || "(none)",
    "",
    `Reference:     ${orderRef}`,
    "",
    "— Sent from maramed.com ordering form —"
  ].join("\n");
}

function buildCustomerConfirmationText(fd, orderRef) {
  const contact = pickStr(fd, "contactName", "there");
  return [
    `Hi ${contact},`,
    "",
    "Thanks for your order request — we’ve received it.",
    "A member of our Customer Service team will reach out shortly to confirm details (items, sizes, quantities) and shipping.",
    "",
    "If you need to add or change anything, just reply to this email.",
    "",
    `Reference: ${orderRef}`,
    "",
    "Best,",
    "Maramed Customer Service",
    "custsupport@maramed.com",
    ""
  ].join("\n");
}

/* -------- Resend (API mode) -------- */
async function sendWithResend({ from, to, cc, bcc, replyTo, subject, text }) {
  const key = ENV("RESEND_API_KEY", "");
  if (!key) throw new Error("RESEND_API_KEY missing");
  const resend = new Resend(key);

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to].filter(Boolean),
    subject,
    text
  };
  if (cc)  payload.cc  = Array.isArray(cc)  ? cc  : [cc];
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  if (replyTo) payload.reply_to = replyTo;

  const result = await resend.emails.send(payload);
  if (result?.error) {
    throw new Error(`Resend error: ${result.error.message || JSON.stringify(result.error)}`);
  }
  return result;
}

/* -------- SMTP transport (STRICT + JSON local mode) -------- */
async function makeTransport() {
  // 0) Local JSON mode — no network; logs messages as JSON
  if (bool(ENV("MAIL_LOCAL_JSON"), false)) {
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    console.log("[smtp][local] JSON transport active — emails will be logged only.");
    return { transporter, isTest: true };
  }

  // 1) Ethereal test mode
  if (bool(ENV("MAIL_TEST"), false)) {
    try {
      const test = await nodemailer.createTestAccount();

      // Prefer SMTPS 465 to avoid STARTTLS stripping
      try {
        const t465 = nodemailer.createTransport({
          host: test.smtp.host,
          port: 465,
          secure: true,
          auth: { user: test.user, pass: test.pass },
          logger: true,
          debug: true
        });
        await t465.verify();
        console.log("[smtp][test] Ethereal SMTPS (465) as", test.user);
        return { transporter: t465, isTest: true };
      } catch (e465) {
        console.warn("[smtp][test] 465 failed, trying 587 STARTTLS:", e465?.message);
      }

      // Fallback: 587 STARTTLS
      try {
        const t587 = nodemailer.createTransport({
          host: test.smtp.host,
          port: test.smtp.port,   // usually 587
          secure: false,
          requireTLS: true,       // do not AUTH before TLS
          auth: { user: test.user, pass: test.pass },
          tls: { minVersion: "TLSv1.2", servername: test.smtp.host, rejectUnauthorized: true },
          logger: true,
          debug: true
        });
        await t587.verify();
        console.log("[smtp][test] Ethereal STARTTLS (587) as", test.user);
        return { transporter: t587, isTest: true };
      } catch (e587) {
        console.warn("[smtp][test] 587 failed, using JSON:", e587?.message);
      }
    } catch (eAcc) {
      console.warn("[smtp][test] createTestAccount failed, using JSON:", eAcc?.message);
    }

    // Final fallback: JSON (no network)
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    console.log("[smtp][test] JSON transport active — emails will be logged only.");
    return { transporter, isTest: true };
  }

  // 2) Production O365 (587 STARTTLS, AUTH LOGIN after TLS)
  const host = ENV("SMTP_HOST", "smtp.office365.com");
  const port = num(ENV("SMTP_PORT"), 587);
  const user = String(ENV("SMTP_USER", ""));
  const pass = String(ENV("SMTP_PASS", ""));
  if (!user || !pass) throw new Error("SMTP_USER / SMTP_PASS missing");

  const transporter = nodemailer.createTransport(
    {
      host, port,
      secure: false,          // STARTTLS
      requireTLS: true,       // do not AUTH before TLS
      auth: { user, pass },
      authMethod: "LOGIN",    // avoid AUTH PLAIN pre-TLS
      tls: {
        minVersion: "TLSv1.2",
        servername: host,
        rejectUnauthorized: bool(ENV("SMTP_TLS_REJECT_UNAUTHORIZED"), true)
      },
      logger: bool(ENV("SMTP_LOG"), false),
      debug: bool(ENV("SMTP_LOG"), false)
    },
    { from: ENV("SMTP_FROM", "") || user }
  );

  try {
    await transporter.verify();
    console.log("[smtp] verify ok (STARTTLS negotiated before AUTH)");
  } catch (e) {
    console.error("[smtp] verify failed:", e?.message);
  }
  return { transporter, isTest: false };
}

/* -------- action -------- */
export const actions = {
  send: async ({ request }) => {
    const form = await request.formData();
    if (form.get("fax")) return fail(400, { ok: false, error: "Bad request" });

    // Required fields (mirror client)
    const contactName = pickStr(form, "contactName").trim();
    const email       = pickStr(form, "email").trim();
    const shipAddress1= pickStr(form, "shipAddress1").trim();
    const shipCity    = pickStr(form, "shipCity").trim();
    const shipState   = pickStr(form, "shipState").trim();
    const shipZip     = pickStr(form, "shipZip").trim();
    const orderItems  = pickStr(form, "orderItems").trim();
    const agree       = form.get("agree"); // ensure terms accepted

    if (!contactName || !email || !shipAddress1 || !shipCity || !shipState || !shipZip || !orderItems || !agree) {
      return fail(400, { ok: false, error: "Please check the required fields and try again." });
    }

    // IDs & addressing
    const orderRef     = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const envelopeFrom = ENV("SMTP_FROM") || ENV("SMTP_USER") || ENV("FROM_EMAIL");
    const ordersTo     = ENV("ORDERS_TO") || ENV("CONTACT_TO") || envelopeFrom; // distro ok
    const ordersFrom   = ENV("ORDERS_FROM") || envelopeFrom;                    // pretty From for support
    const noReplyFrom  = ENV("NOREPLY_FROM") || envelopeFrom;                   // pretty From for confirmation

    const subject = `Website order ${orderRef}: ${pickStr(form, "company", contactName)}`;
    const text    = buildOrderEmailText(form, orderRef);

    try {
      console.log("[order] created", { orderRef, contactName, email });

      if (bool(ENV("USE_EMAIL_API"), false)) {
        // --- Resend path (API mode) ---
        await sendWithResend({
          from: ordersFrom,
          to: ordersTo,
          cc: ENV("CONTACT_CC") || undefined,
          bcc: ENV("CONTACT_BCC") || undefined,
          replyTo: email,
          subject,
          text
        });

        try {
          await sendWithResend({
            from: noReplyFrom,
            to: email,
            subject: "We received your order request",
            text: buildCustomerConfirmationText(form, orderRef)
          });
        } catch (e) {
          console.warn("[order] API confirmation failed:", e?.message);
        }

        throw redirect(303, `/ordering/thank-you?ref=${encodeURIComponent(orderRef)}`);
      }

      // --- SMTP/JSON path ---
      const { transporter, isTest } = await makeTransport();
      const usesJson = !!transporter?.options?.jsonTransport;

      // 1) Team notification
      const info = await transporter.sendMail({
        envelope: usesJson ? undefined : { from: envelopeFrom, to: ordersTo }, // envelope only when real SMTP
        from: ordersFrom,
        to: ordersTo,
        cc: ENV("CONTACT_CC") || undefined,
        bcc: ENV("CONTACT_BCC") || undefined,
        replyTo: email,
        subject,
        text,
        dsn: usesJson ? undefined : { id: orderRef, return: "headers", notify: ["failure","delay"], recipient: ordersTo }
      });

      if (usesJson) {
        const snippet = typeof info?.message === "string"
          ? info.message
          : info?.message?.toString?.() ?? "";
        console.log("[order] Support mail (JSON):", snippet.slice(0, 2000));
      } else {
        const accepted = Array.isArray(info.accepted) ? info.accepted : [];
        const rejected = Array.isArray(info.rejected) ? info.rejected : [];
        console.log("[order] support mail", { orderRef, messageId: info.messageId, accepted, rejected, response: info.response });
        if (!accepted.length || rejected.length) {
          return fail(502, { ok: false, error: "Mail server did not accept the message." });
        }
        if (isTest) {
          const previewUrl = nodemailer.getTestMessageUrl(info) || "";
          if (previewUrl) console.log("[order] Support preview:", previewUrl);
        }
      }

      // 2) Customer confirmation (best-effort)
      try {
        const confirmInfo = await transporter.sendMail({
          envelope: usesJson ? undefined : { from: envelopeFrom, to: email },
          from: noReplyFrom,
          to: email,
          subject: "We received your order request",
          text: buildCustomerConfirmationText(form, orderRef)
        });

        if (usesJson) {
          const snippet = typeof confirmInfo?.message === "string"
            ? confirmInfo.message
            : confirmInfo?.message?.toString?.() ?? "";
          console.log("[order] Customer confirmation (JSON):", snippet.slice(0, 2000));
        } else if (isTest) {
          const previewUrl = nodemailer.getTestMessageUrl(confirmInfo) || "";
          if (previewUrl) console.log("[order] Customer confirmation preview:", previewUrl);
        }
      } catch (e) {
        console.warn("[order] confirmation failed:", e?.message);
      }

      // Success → redirect
      throw redirect(303, `/ordering/thank-you?ref=${encodeURIComponent(orderRef)}`);
    } catch (err) {
      // Allow SvelteKit redirects through
      if (err?.status && err?.location) throw err;
      console.error("[order] send error:", err);
      return fail(500, { ok: false, error: "Email failed to send. Please try again or call Customer Service." });
    }
  }
};
