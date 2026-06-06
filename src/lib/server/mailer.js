// src/lib/server/mailer.js
import { Resend } from "resend";
import { env } from "$env/dynamic/private";

function getResend() {
	console.log("RESEND_API_KEY exists?", !!env.RESEND_API_KEY);
	console.log("RESEND_API_KEY length:", env.RESEND_API_KEY?.length ?? 0);

	if (!env.RESEND_API_KEY) {
		throw new Error("[mailer] Missing RESEND_API_KEY");
	}

	return new Resend(env.RESEND_API_KEY);
}

export function fromHeader(kind = "orders") {
	if (kind === "noreply" && env.NOREPLY_FROM) return env.NOREPLY_FROM;
	if (kind === "contact" && env.CONTACT_FROM) return env.CONTACT_FROM;
	if (kind === "orders" && env.ORDERS_FROM) return env.ORDERS_FROM;

	return "Maramed Website <info@maramed.com>";
}

export async function sendMail(opts) {
	const resend = getResend();

	const { data, error } = await resend.emails.send({
		from: opts.from || fromHeader(opts.kind || "orders"),
		to: opts.to,
		cc: opts.cc,
		bcc: opts.bcc,
		subject: opts.subject,
		text: opts.text,
		html: opts.html,
		reply_to: opts.replyTo
	});

	if (error) {
		console.error("[RESEND] send failed:", error);
		throw new Error(error.message || "Resend email failed");
	}

	console.log("[RESEND] Message ID:", data?.id);

	return {
		messageId: data?.id,
		accepted: Array.isArray(opts.to) ? opts.to : [opts.to],
		rejected: []
	};
}