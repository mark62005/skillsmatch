import type { Request } from "express";
import type { AppError } from "./errors";

import { Webhook } from "svix";
import { AppErrors } from "./errors";
import "dotenv/config";

export function verifyClerkWebhook(req: Request) {
	const secret = process.env.CLERK_WEBHOOK_SECRET;
	if (!secret) throw new Error("CLERK_WEBHOOK_SECRET is not set.");

	const svixId = req.headers["svix-id"] as string;
	const svixTimestamp = req.headers["svix-timestamp"] as string;
	const svixSignature = req.headers["svix-signature"] as string;

	if (!svixId || !svixTimestamp || !svixSignature) {
		throw AppErrors.Auth.unauthorized();
	}

	const wh = new Webhook(secret);

	try {
		return wh.verify(req.body, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		}) as WebhookEvent;
	} catch {
		throw AppErrors.Auth.invalidWebhookSignature();
	}
}

export type WebhookEvent =
	| { type: "user.created"; data: ClerkUserData }
	| { type: "user.updated"; data: ClerkUserData }
	| { type: "user.deleted"; data: { id: string } };

type ClerkUserData = {
	id: string;
	first_name: string;
	last_name: string;
	email_addresses: { email_address: string; id: string }[];
	primary_email_address_id: string;
};
