import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export function errorMiddleware(
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	if (err instanceof AppError) {
		logger.warn("Operational error", {
			code: err.code,
			statusCode: err.statusCode,
			path: req.path,
			method: req.method,
		});

		res.status(err.statusCode).json({
			error: err.message,
			code: err.code, // consistent shape = frontend can switch on "code"
			...(err.data && { data: err.data }),
		});
		return;
	}

	// Unknow error = a bug, not an expected failure
	logger.error("Unhandled error", {
		message: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method,
	});

	res.status(500).json({
		error:
			process.env.NODE_ENV === "production"
				? "Internal server error."
				: err.message,
		code: "INTERNAL_SERVER_ERROR",
	});
}
