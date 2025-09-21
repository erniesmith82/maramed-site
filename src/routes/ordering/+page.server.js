// src/routes/ordering/+page.server.js
import { fail, redirect } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import {
  MAIL_TEST,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_REQUIRE_TLS,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  CONTACT_TO,
  CONTACT_CC,
  CONTACT_BCC,
  SMTP_LOG,
  SMTP_TLS_REJECT_UNAUTHORIZED
} from "$env/static/private";

/** Build a human-readable order email from the form fields */
function buildOrderEmailText(fd, orderRef) {
  const pick = (k) => (fd.get(k) || "").toString();

  const lines = [
    "New website order request",
    "================================",
    "",
    "Customer",
    "--------------------------------",
    `Company:       ${pick("company")}`,
    `Contact:       ${pick("contactName")}`,
    `Email:         ${pick("email")}`,
    `Phone:         ${pick("phone")}`,
    "",
    "Shipping",
    "--------------------------------",
    `Address 1:     ${pick("shipAddress1")}`,
    `Address 2:     ${pick("shipAddress2")}`,
    `City/State:    ${pick("shipCity")}, ${pick("shipState")} ${pick("shipZip")}`,
    `Country:       ${pick("shipCountry") || "USA"}`,
    "",
    "Order Details",
    "--------------------------------",
    `PO Number:     ${pick("poNumber")}`,
    `Ship Method:   ${pick("shipMethod") || "UPS Ground (default)"}`,
    "",
    "Items (CSV):",
    pick("orderItems"),
    "",
    "Notes",
    "--------------------------------",
    pick("notes") || "(none)",
    "",
    `Reference:     ${orderRef}`,
    "",
    "— Sent from maramed.com ordering form —"
  ];

  return lines.join("\n");
}

/** Build a short confirmation email for the customer */
function buildCustomerConfirmationText(fd, orderRef) {
  const contact = (fd.get("contactName") || "there").toString();

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

/** Create a nodemailer transport based on env (Ethereal test vs Office 365) */
async function makeTransport() {
  const mailTest = String(MAIL_TEST || "0") === "1";

  if (mailTest) {
    const test = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass }
    });
    return { transporter, isTest: true };
  }

  // Microsoft 365 (STARTTLS on 587)
  const transporter = nodemailer.createTransport(
    {
      host: SMTP_HOST || "smtp.office365.com",
      port: Number(SMTP_PORT ?? 587),
      secure: String(SMTP_SECURE) === "true", // MUST be false for 587
      requireTLS: String(SMTP_REQUIRE_TLS ?? "true") === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: {
        rejectUnauthorized: String(SMTP_TLS_REJECT_UNAUTHORIZED ?? "true") === "true"
      }
    },
    {
      from: SMTP_FROM || SMTP_USER // default header From
    }
  );

  if (String(SMTP_LOG || "0") === "1") {
    transporter.on("log", console.log);
  }

  return { transporter, isTest: false };
}

export const actions = {
  /** POST /ordering?/send */
  send: async ({ request }) => {
    const form = await request.formData();

    // Honeypot: if 'fax' is filled, bail quietly (likely a bot)
    if (form.get("fax")) {
      return fail(400, { ok: false, error: "Bad request" });
    }

    // Basic validation for required fields
    const contactName = (form.get("contactName") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const shipAddress1 = (form.get("shipAddress1") || "").toString().trim();
    const shipCity = (form.get("shipCity") || "").toString().trim();
    const shipState = (form.get("shipState") || "").toString().trim();
    const shipZip = (form.get("shipZip") || "").toString().trim();
    const orderItems = (form.get("orderItems") || "").toString().trim();

    if (!contactName || !email || !shipAddress1 || !shipCity || !shipState || !shipZip || !orderItems) {
      return fail(400, { ok: false, error: "Please fill all required fields." });
    }

    // Generate a short reference to correlate logs/emails/UI
    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      const { transporter, isTest } = await makeTransport();

      console.log("[order] created", { orderRef, contactName, email });

      // Office 365 safety: envelope MAIL FROM should match authenticated user
      const envelopeFrom = SMTP_FROM || SMTP_USER;
      const supportTo = CONTACT_TO || envelopeFrom;

      const subject = `Website order ${orderRef}: ${(form.get("company") || contactName).toString()}`;
      const text = buildOrderEmailText(form, orderRef);

      // 1) Send to Customer Support
      const info = await transporter.sendMail({
        envelope: { from: envelopeFrom, to: supportTo },  // SMTP envelope
        from: envelopeFrom,                                // header From
        to: supportTo,
        cc: CONTACT_CC || undefined,
        bcc: CONTACT_BCC || undefined,
        replyTo: email,                                    // replies go to customer
        subject,
        text,
        dsn: {
          id: orderRef,
          return: "headers",
          notify: ["failure", "delay"],
          recipient: supportTo
        }
      });

      const accepted = Array.isArray(info.accepted) ? info.accepted : [];
      const rejected = Array.isArray(info.rejected) ? info.rejected : [];
      console.log("[order] support mail", {
        orderRef,
        messageId: info.messageId,
        accepted,
        rejected,
        response: info.response
      });

      if (!accepted.length || rejected.length) {
        return fail(502, { ok: false, error: "Mail server did not accept the message." });
      }

      if (isTest) {
        const previewUrl = nodemailer.getTestMessageUrl(info) || "";
        console.log("[order] Support email preview:", previewUrl);
      }

      // 2) Send confirmation to the customer (best-effort)
      try {
        const confirmInfo = await transporter.sendMail({
          envelope: { from: envelopeFrom, to: email },
          from: envelopeFrom,
          to: email,
          subject: "We received your order request",
          text: buildCustomerConfirmationText(form, orderRef)
        });
        if (isTest) {
          const confirmationPreview = nodemailer.getTestMessageUrl(confirmInfo) || "";
          console.log("[order] Customer confirmation preview:", confirmationPreview);
        }
      } catch (e) {
        console.warn("[order] Could not send customer confirmation:", e?.message);
      }
    } catch (err) {
      console.error("[order] send error:", err);
      return fail(500, {
        ok: false,
        error: "Email failed to send. Please try again or call Customer Service."
      });
    }

    // ✅ Success: redirect OUTSIDE the try/catch so it doesn't get swallowed
    throw redirect(303, `/ordering/thank-you?ref=${encodeURIComponent(orderRef)}`);
  }
};
