// src/routes/contact/+page.server.js
import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { sendMail } from "$lib/server/mailer.js";

/* ---------- env helpers ---------- */
const ENV = (k, d = "") => env?.[k] ?? d;

/* ---------- validators / utils ---------- */
const looksLikeEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const escapeHtml = (s = "") =>
	String(s)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

const splitAddresses = (s = "") =>
	String(s)
		.split(/[,;]+/)
		.map((x) => x.trim())
		.filter(Boolean);

const isRedirect = (e) =>
	e && typeof e === "object" && "status" in e && "location" in e;

/* ---------- action handler ---------- */
async function handleSubmit({ request }) {
	const data = await request.formData();

	// Honeypot
	if (data.get("fax")) return { ok: true };

	const name = (data.get("name") ?? "").toString().trim();
	const email = (data.get("email") ?? "").toString().trim();
	const company = (data.get("company") ?? "").toString().trim();
	const phone = (data.get("phone") ?? "").toString().trim();
	const subjectI = (data.get("subject") ?? "").toString().trim();
	const interest = (data.get("interest") ?? "").toString().trim();
	const message = (data.get("message") ?? "").toString().trim();

	if (!name || !email || !message) {
		return fail(400, {
			ok: false,
			error: "Please check the required fields and try again."
		});
	}

	if (!looksLikeEmail(email)) {
		return fail(400, {
			ok: false,
			error: "Please enter a valid email address."
		});
	}

	const subject = subjectI ? `Website contact — ${subjectI}` : "Website contact";
	const msgRef = `MSG-${Date.now().toString(36).toUpperCase()}`;

	const plain = [
		`From: ${name} <${email}>`,
		company ? `Company: ${company}` : "Company: —",
		phone ? `Phone: ${phone}` : "Phone: —",
		interest ? `Interest: ${interest}` : "Interest: —",
		`Subject: ${subject}`,
		"",
		message,
		"",
		`Ref: ${msgRef}`,
		"— Sent from maramed.com/contact —"
	].join("\n");

	const html = `
		<p><b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
		<p><b>Company:</b> ${company ? escapeHtml(company) : "—"}</p>
		<p><b>Phone:</b> ${phone ? escapeHtml(phone) : "—"}</p>
		<p><b>Interest:</b> ${interest ? escapeHtml(interest) : "—"}</p>
		<p><b>Subject:</b> ${escapeHtml(subject)}</p>
		<hr>
		<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
		<hr>
		<p style="color:#64748b;font-size:12px">
			Submitted via maramed.com/contact • Ref ${escapeHtml(msgRef)}
		</p>
	`;

	const toList = splitAddresses(ENV("CONTACT_TO", "custsupport@maramed.com"));
	const ccList = splitAddresses(ENV("CONTACT_CC"));
	const bccList = splitAddresses(ENV("CONTACT_BCC"));

	const fromHdr = ENV(
		"CONTACT_FROM",
		"Maramed Website <onboarding@resend.dev>"
	);

	try {
		await sendMail({
			from: fromHdr,
			to: toList,
			cc: ccList.length ? ccList : undefined,
			bcc: bccList.length ? bccList : undefined,
			subject: `${subject} (${msgRef})`,
			text: plain,
			html,
			replyTo: `${name} <${email}>`
		});

		throw redirect(303, `/contact/thank-you?ref=${encodeURIComponent(msgRef)}`);
	} catch (err) {
		if (isRedirect(err)) throw err;

		console.error("Contact email send failed:", err);

		return fail(500, {
			ok: false,
			error: "Email service not configured"
		});
	}
}

/* ---------- named actions ---------- */
export const actions = {
	send: handleSubmit
};