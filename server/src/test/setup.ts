import { PrismaPg } from "@prisma/adapter-pg";
import { beforeAll, beforeEach, afterAll } from "vitest";
import { execSync } from "child_process";
import { resolve } from "path";
import { PrismaClient } from "../generated/prisma";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

const connectionString = `${process.env.DATABASE_TEST_URL}`;

const adapter = new PrismaPg({ connectionString });
const testPrisma = new PrismaClient({ adapter });

// Runs before each test FILE (not each test case)
beforeAll(async () => {
	await testPrisma.$connect();
});

// Truncate all tables in the correct order (respecting foreign keys)
// RESTART IDENTITY resets auto-increment sequences
// CASCADE handles FK constraints automatically
beforeEach(async () => {
	await testPrisma.$executeRawUnsafe(
		`TRUNCATE TABLE "Subscription", "Analysis", "User" RESTART IDENTITY CASCADE`,
	);
});

afterAll(async () => {
	await testPrisma.$disconnect();
});

// Export so individual test files can use it to create test data
export { testPrisma };
