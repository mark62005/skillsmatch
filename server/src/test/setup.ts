import { PrismaPg } from "@prisma/adapter-pg";
import { beforeAll, beforeEach, afterAll, vi } from "vitest";
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

/* Mock Prisma */
vi.mock("../lib/prisma", async () => {
	const actual = await vi.importActual<any>("../lib/prisma");

	return {
		...actual,
		prisma: testPrisma,
	};
});

/* Mock Inngest */
vi.mock("../inngest/inngest.client", () => ({
	inngest: {
		send: vi.fn().mockResolvedValue({ ids: ["test_event_id"] }),
	},
}));

// Export so individual test files can use it to create test data
export { testPrisma };
