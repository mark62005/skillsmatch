import type { Express } from "express";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkAuthMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";
import { inngestHandler } from "./inngest/serve";
/* Import routes */
import { webhooksRouter } from "./features/webhooks/webhooks.router";
import { usersRouter } from "./features/users/users.router";
import { analysesRouter } from "./features/analyses/analyses.routes";

const app: Express = express();

/* Security Middleware */

// helmet sets secure HTTP headers (X-Frame-Options, Content-Security-Policy, etc.)
app.use(helmet());

// CORS: only allow requests from frontend domain
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
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
app.use(express.json({ limit: "10mb" }));
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

/* Ngrok */
app.set("trust proxy", 1);

/* Inngest Handler */
app.use("/api/inngest", inngestHandler);

/* Feature Routes */

// Routes are registered here as features are built.
// Convention: all API routes live under /api/v1/ for versioning.
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/analyses", analysesRouter);
app.use("/api/webhooks", webhooksRouter); // Note: no /v1 — webhooks are external contracts

/* 404 Handler */

// Catches any request that didn't match a route above
app.use((_req, res) => {
	res.status(404).json({ success: false, error: "Route not found" });
});

/* Global Error Handler */

// MUST be registered LAST — Express identifies error middleware by its 4 arguments.
// Any route/middleware that calls next(error) or throws (in async handlers) lands here.
app.use(errorMiddleware);

export { app };
