// src/routes/ordering/+page.server.js
import { fail } from "@sveltejs/kit";
import nodemailer from "nodemailer";

/** Build a human-readable order email from the form fields */
function buildOrderEmailText(fd) {
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
    "— Sent from skymedicalco.com ordering form —"
  ];

  return lines.join("\n");
}

/** Build a short confirmation email for the customer */
function buildCustomerConfirmationText(fd) {
  const contact = (fd.get("contactName") || "there").toString();

  return [
    `Hi ${contact},`,
    "",
    "Thanks for your order request — we’ve received it.",
    "A member of our Customer Service team will reach out shortly to confirm details (items, sizes, quantities) and shipping.",
    "",
    "If you need to add or change anything, just reply to this email.",
    "",
    "Best,",
    "Sky Medical Customer Service",
    "custsupport@maramed.com",
    ""
  ].join("\n");
}

/** Create a nodemailer transport based on your env */
async function makeTransport() {
  const MAIL_TEST = String(process.env.MAIL_TEST || "0") === "1";

  if (MAIL_TEST) {
    const test = await nodemailer.createTestAccount();
    console.log("[order] Using Ethereal test account:", test.user);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: test.user, pass: test.pass }
    });
  }

  // Real Microsoft 365 (STARTTLS on 587)
  const {
    SMTP_HOST,
    SMTP_PORT = "587",
    SMTP_SECURE = "false",
    SMTP_REQUIRE_TLS = "true",
    SMTP_USER,
    SMTP_PASS,
    SMTP_TLS_REJECT_UNAUTHORIZED = "true",
    SMTP_LOG = "0"
  } = process.env;

  const transporter = nodemailer.createTransport(
    {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE) === "true", // must be false for 587
      requireTLS: String(SMTP_REQUIRE_TLS) === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: String(SMTP_TLS_REJECT_UNAUTHORIZED) === "true" }
    },
    {
      // default sender (envelope + header)
      from: process.env.SMTP_FROM
    }
  );

  if (String(SMTP_LOG) === "1") {
    transporter.on("log", console.log);
  }

  return transporter;
}

export const actions = {
  /** POST /ordering?/send */
  send: async ({ request }) => {
    try {
      const form = await request.formData();

      // Honeypot: if 'fax' is filled, bail quietly (likely a bot)
      if (form.get("fax")) {
        return fail(400, { ok: false, error: "Bad request" });
      }

      // Basic validation for the fields your UI marks required
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

      const transporter = await makeTransport();

      const to = process.env.CONTACT_TO || process.env.SMTP_FROM;
      const subject =
        `Website order: ${form.get("company") || contactName}`;

      const text = buildOrderEmailText(form);

      // 1) Send to Customer Support
      const info = await transporter.sendMail({
        to,
        replyTo: email, // so support can reply straight to the customer
        subject,
        text
      });

      let previewUrl = "";
      if (String(process.env.MAIL_TEST || "0") === "1") {
        previewUrl = nodemailer.getTestMessageUrl(info) || "";
        console.log("[order] Support email preview:", previewUrl);
      }

      // 2) Send a confirmation to the customer (polite, no PHI)
      let confirmationPreview = "";
      try {
        const confirmInfo = await transporter.sendMail({
          to: email,
          subject: "We received your order request",
          text: buildCustomerConfirmationText(form)
        });

        if (String(process.env.MAIL_TEST || "0") === "1") {
          confirmationPreview = nodemailer.getTestMessageUrl(confirmInfo) || "";
          console.log("[order] Customer confirmation preview:", confirmationPreview);
        }
      } catch (e) {
        console.warn("[order] Could not send customer confirmation:", e?.message);
      }

      return {
        ok: true,
        messageId: info.messageId,
        previewUrl,
        confirmationPreview
      };
    } catch (err) {
      console.error("[order] send error:", err);
      // Make sure the client gets a structured failure (so your UI can stop “Sending…”)
      return fail(500, { ok: false, error: "Email failed to send. Please try again or call Customer Service." });
    }
  }
};
