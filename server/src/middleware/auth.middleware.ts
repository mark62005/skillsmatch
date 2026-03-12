import type { Request, Response, NextFunction, RequestHandler } from "express";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { logger } from "../lib/logger";
import { AppErrors } from "../lib/errors";

export interface ClerkUser {
	userId: string;
	sessionId: string;
}

export const clerkAuthMiddleware: RequestHandler =
	clerkMiddleware() as RequestHandler;

// Reads the auth context Clerk attached and rejects if missing
export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const auth = getAuth(req);

	if (!auth.userId) {
		logger.warn("Unauthorized request", {
			path: req.path,
			method: req.method,
			ip: req.ip,
		});

		next(AppErrors.Auth.unauthorized());
		return;
	}

	req.user = {
		userId: auth.userId,
		sessionId: auth.sessionId,
	};

	next();
}
