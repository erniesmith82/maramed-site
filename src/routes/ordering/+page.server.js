// src/routes/ordering/+page.server.js
import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { sendMail } from "$lib/server/mailer.js";

/* -------- env helpers -------- */
const ENV = (k, d = "") => env?.[k] ?? d;
const pickStr = (fd, k, f = "") => ((fd.get(k) ?? f) + "");

/* -------- utils -------- */
const splitAddresses = (s = "") =>
	String(s)
		.split(/[,;]+/)
		.map((x) => x.trim())
		.filter(Boolean);

const isRedirect = (e) =>
	e && typeof e === "object" && "status" in e && "location" in e;

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
		"A member of our Customer Service team will reach out shortly to confirm details, items, sizes, quantities, and shipping.",
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

/* -------- action -------- */
export const actions = {
	send: async ({ request }) => {
		const form = await request.formData();

		// Honeypot
		if (form.get("fax")) {
			return fail(400, { ok: false, error: "Bad request" });
		}

		const contactName = pickStr(form, "contactName").trim();
		const email = pickStr(form, "email").trim();
		const shipAddress1 = pickStr(form, "shipAddress1").trim();
		const shipCity = pickStr(form, "shipCity").trim();
		const shipState = pickStr(form, "shipState").trim();
		const shipZip = pickStr(form, "shipZip").trim();
		const orderItems = pickStr(form, "orderItems").trim();
		const agree = form.get("agree");

		if (
			!contactName ||
			!email ||
			!shipAddress1 ||
			!shipCity ||
			!shipState ||
			!shipZip ||
			!orderItems ||
			!agree
		) {
			return fail(400, {
				ok: false,
				error: "Please check the required fields and try again."
			});
		}

		const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;

		const ordersTo = splitAddresses(
			ENV("ORDERS_TO", ENV("CONTACT_TO", "custsupport@maramed.com"))
		);

		const ccList = splitAddresses(ENV("ORDERS_CC", ENV("CONTACT_CC")));
		const bccList = splitAddresses(ENV("ORDERS_BCC", ENV("CONTACT_BCC")));

		const ordersFrom = ENV(
			"ORDERS_FROM",
			"Maramed Orders <onboarding@resend.dev>"
		);

		const noReplyFrom = ENV(
			"NOREPLY_FROM",
			"Maramed <onboarding@resend.dev>"
		);

		const subject = `Website order ${orderRef}: ${pickStr(
			form,
			"company",
			contactName
		)}`;

		const text = buildOrderEmailText(form, orderRef);

		try {
			console.log("[order] created", {
				orderRef,
				contactName,
				email,
				ordersTo
			});

			// 1) Team notification
			await sendMail({
				from: ordersFrom,
				to: ordersTo,
				cc: ccList.length ? ccList : undefined,
				bcc: bccList.length ? bccList : undefined,
				replyTo: email,
				subject,
				text
			});

			// 2) Customer confirmation
			try {
				await sendMail({
					from: noReplyFrom,
					to: email,
					subject: "We received your order request",
					text: buildCustomerConfirmationText(form, orderRef),
					replyTo: ordersTo[0] || "custsupport@maramed.com"
				});
			} catch (e) {
				console.warn("[order] customer confirmation failed:", e?.message);
			}

			throw redirect(
				303,
				`/ordering/thank-you?ref=${encodeURIComponent(orderRef)}`
			);
		} catch (err) {
			if (isRedirect(err)) throw err;

			console.error("[order] send error:", err);

			return fail(500, {
				ok: false,
				error:
					"Email failed to send. Please try again or call Customer Service."
			});
		}
	}
};