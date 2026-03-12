import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";

// General API limiter - applied globally
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	standardHeaders: true, // Returns rate limit info in `RateLimit-*` headers
	legacyHeaders: false,
	message: {
		success: false,
		error: "Too many requests, please try again later.",
	},
	handler: (req, res, _next, options) => {
		logger.warn("Rate limit exceeded", { ip: req.ip, path: req.path });
		res.status(429).json(options.message);
	},
});

// Stricter limiter for AI analysis endpoints — these call Gemini and cost money
export const analysisLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: "Analysis limit reached. Please try again in an hour.",
	},
});
