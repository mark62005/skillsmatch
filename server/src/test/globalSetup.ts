import { execSync } from "child_process";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

export default async function globalSetup() {
	console.log("\nRunning test database migrations...");

	const serverRoot = resolve(process.cwd());

	try {
		execSync("pnpm prisma migrate deploy", {
			cwd: serverRoot,
			env: {
				...process.env,
				DATABASE_URL: process.env.DATABASE_TEST_URL,
			},
			stdio: "inherit", // pipe subprocess output to terminal so we can see what's happening
		});

		console.log("✅ Test database migrations applied successfully.\n");
	} catch (error) {
		console.error("❌ Failed to apply test database migrations:", error);
		// If migrations fail, every single test will fail anyway
		throw error;
	}
}
