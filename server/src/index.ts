import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";
import { clerkAuthMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";
import { inngestHandler } from "./inngest/serve";

/* Import routes */

/* Validate Environment variables */

const requiredEnvVars = [
	"DATABASE_URL",
	"CLERK_SECRET_KEY",
	"CLERK_PUBLISHABLE_KEY",
] as const;

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		logger.error(`Missing required environment variable: ${envVar}`);
		process.exit(1); // Non-zero exit code signals failure to Docker/ECS
	}
}

/* App Setup */
const app = express();
const PORT = process.env.PORT || 4000;

/* Security Middleware (register BEFORE routes) */

// helmet sets secure HTTP headers (X-Frame-Options, Content-Security-Policy, etc.)
app.use(helmet());

// CORS: only allow requests from frontend domain
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true, // required for Clerk's cookie-based sessions
	}),
);

// Rate limiting — applied globally before any route can be hit
app.use(generalLimiter);

// Clerk: attach auth context to every request
app.use(clerkAuthMiddleware);

/* Body Parsers */
// Webhooks need the RAW body to verify Svix/Stripe signatures — so we parse
// raw bytes for /webhooks and JSON for everything else.
app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" })); // 10mb to accommodate base64 file uploads
app.use(express.urlencoded({ extended: true }));

/* Health Check */
// AWS ECS, Docker, and load balancers ping this to know if the container is alive. No auth required.
app.get("/health", (_req, res) => {
	res.status(200).json({
		status: "ok",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || "development",
	});
});

/* Inngest Handler */
app.use("/api/inngest", inngestHandler);

/* Feature Routes */
// Routes are registered here as features are built.
// Convention: all API routes live under /api/v1/ for versioning.
// app.use("/api/v1/users", usersRouter);
// app.use("/api/v1/analyses", analysesRouter);
// app.use("/api/webhooks", webhooksRouter); // Note: no /v1 — webhooks are external contracts

/* 404 Handler */
// Catches any request that didn't match a route above
app.use((_req, res) => {
	res.status(404).json({ success: false, error: "Route not found" });
});

/* Global Error Handler */
// MUST be registered LAST — Express identifies error middleware by its 4 arguments.
// Any route/middleware that calls next(error) or throws (in async handlers) lands here.
app.use(errorMiddleware);

/* Start Server */
const server = app.listen(PORT, () => {
	logger.info(`Server running`, {
		port: PORT,
		environment: process.env.NODE_ENV || "development",
		url: `http://localhost:${PORT}`,
	});
});

/* Graceful Shutdown */
// When Docker/ECS sends SIGTERM (container stopping), finish in-flight requests
// and close the database connection cleanly instead of hard-killing the process.
const shutdown = async (signal: string) => {
	logger.info(`${signal} received — shutting down gracefully`);

	server.close(async () => {
		await prisma.$disconnect();

		logger.info("Database disconnected. Process exiting.");
		process.exit(0);
	});
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
