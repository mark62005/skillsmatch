import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { logger } from "./logger";

// Prevents database connection pool exhaustion during hot reload in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL environment variable is not set.");
	}

	const adapter = new PrismaPg({ connectionString });

	return new PrismaClient({
		adapter,
		log: [
			{ emit: "stdout", level: "error" },
			{ emit: "stdout", level: "warn" },
		],
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

logger.info("Prisma client initialized.");
