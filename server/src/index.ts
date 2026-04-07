import "dotenv/config";

import { app } from "./app";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

/* Validate Environment variables */

const requiredEnvVars = [
	"DATABASE_URL",
	"CLERK_SECRET_KEY",
	"CLERK_PUBLISHABLE_KEY",
	"CLERK_WEBHOOK_SECRET",
] as const;

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		logger.error(`Missing required environment variable: ${envVar}`);
		process.exit(1); // Non-zero exit code signals failure to Docker/ECS
	}
}

/* Start Server */
const PORT = process.env.PORT || 4000;

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
