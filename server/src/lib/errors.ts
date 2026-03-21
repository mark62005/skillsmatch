export class AppError extends Error {
	constructor(
		public message: string,
		public statusCode: number,
		public code: string, // machine-readable, for frontend to act on
	) {
		super(message);
		this.name = "AppError";
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

export const AppErrors = {
	Auth: {
		unauthorized: () => new AppError("Unauthorized.", 401, "UNAUTHORIZED"),
		noToken: () =>
			new AppError("No auth token provided.", 401, "NO_AUTH_TOKEN"),
		noUserId: () => new AppError("No auth user ID.", 401, "NO_AUTH_USER_ID"),
		missingSvixHeaders: () =>
			new AppError("Missing svix headers.", 401, "MISSING_SVIX_HEADERS"),
		invalidWebhookSignature: () =>
			new AppError(
				"Invalid webhook signature",
				401,
				"INVALID_WEBHOOK_SIGNATURE",
			),
	},
	User: {
		notFound: () => new AppError("User not found.", 404, "USER_NOT_FOUND"),
		notSynced: () =>
			new AppError("User not synced from Clerk yet.", 404, "USER_NOT_SYNCED"),
	},
	Analysis: {
		notFound: () =>
			new AppError("Analysis not found.", 404, "ANALYSIS_NOT_FOUND"),
		quotaExceeded: () =>
			new AppError("Free analysis limit reached.", 403, "QUOTA_EXCEEDED"),
		forbidden: () =>
			new AppError("You don't have access to this analysis.", 403, "FORBIDDEN"),
	},
	General: {
		internalError: () =>
			new AppError("Internal server error.", 500, "INTERNAL_SERVER_ERROR"),
		forbidden: () => new AppError("Forbidden.", 403, "FORBIDDEN"),
	},
} as const;
