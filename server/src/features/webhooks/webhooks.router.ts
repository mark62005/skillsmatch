import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { verifyClerkWebhook } from "../../lib/webhook";

export const webhooksRouter: Router = Router();

webhooksRouter.post(
	"/clerk",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// 1. Verify the signature — rejects anything not from Clerk
			const event = verifyClerkWebhook(req);

			switch (event.type) {
				case "user.created": {
					const primaryEmail = event.data.email_addresses.find(
						(e) => e.id === event.data.primary_email_address_id,
					);

					if (!primaryEmail) {
						logger.warn("user.created event has no primary email", {
							clerkId: event.data.id,
						});
						// Still return 200 — returning an error causes Clerk to retry
						res.status(200).json({ received: true });
						return;
					}

					await prisma.user.create({
						data: {
							clerkId: event.data.id,
							email: primaryEmail.email_address,
							// plan defaults to FREE, analysisCount defaults to 0 per schema
						},
					});

					logger.info("User created from Clerk webhook", {
						clerkId: event.data.id,
					});
					break;
				}

				case "user.updated": {
					const primaryEmail = event.data.email_addresses.find(
						(e) => e.id === event.data.primary_email_address_id,
					);

					if (primaryEmail) {
						await prisma.user.update({
							where: { clerkId: event.data.id },
							data: { email: primaryEmail.email_address },
						});

						logger.info("User updated from Clerk webhook", {
							clerkId: event.data.id,
						});
					}
					break;
				}

				case "user.deleted": {
					// onDelete: Cascade in schema handles Analysis + Subscription cleanup
					await prisma.user.delete({
						where: { clerkId: event.data.id },
					});

					logger.info("User deleted from Clerk webhook", {
						clerkId: event.data.id,
					});
					break;
				}

				default:
					logger.warn("Unhandled webhook event type", {
						type: (event as any).type,
					});
			}

			res.status(200).json({ received: true });
		} catch (err) {
			next(err);
		}
	},
);
