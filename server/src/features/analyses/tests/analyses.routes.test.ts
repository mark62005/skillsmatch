import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../app";
import { testPrisma } from "../../../test/setup";

/** Mock requireAuth **/
// inject a fixed clerkId, call next().

vi.mock("../../../middleware/auth.middleware", () => ({
	clerkAuthMiddleware: vi.fn((_req: any, _res: any, next: any) => next()),
	requireAuth: vi.fn((req: any, _res: any, next: any) => {
		req.user = { userId: "clerk_test_abc123" };
		next();
	}),
}));

/** Mock analysisLimiter **/
//  pass through by default.
//  Individual tests can override this for quota scenarios.

vi.mock("../../../middleware/rateLimit.middleware", () => ({
	generalLimiter: vi.fn((_req: any, _res: any, next: any) => next()),
	analysisLimiter: vi.fn((_req: any, _res: any, next: any) => next()),
}));

/** Test Factories **/
// Seed the minimum data each test needs.

const TEST_CLERK_ID = "clerk_test_abc123";
const TEST_RESUME_TEXT =
	"Software engineer with 5 years of professional experience";
const TEST_JOB_DESCRIPTION =
	"Looking for a highly skilled and experienced senior engineer";

async function seedUser(overrides = {}) {
	return testPrisma.user.create({
		data: {
			clerkId: TEST_CLERK_ID,
			email: "test@example.com",
			name: "Test User",
			plan: "FREE",
			analysisCount: 0,
			...overrides,
		},
	});
}

async function seedAnalysis(userId: string, overrides = {}) {
	return testPrisma.analysis.create({
		data: {
			userId,
			resumeText: TEST_RESUME_TEXT,
			jobDescription: TEST_JOB_DESCRIPTION,
			status: "PENDING",
			...overrides,
		},
	});
}

/** Tests **/

describe("POST /api/v1/analyses", () => {
	it("creates an analysis and returns 201", async () => {
		await seedUser();

		const res = await request(app).post("/api/v1/analyses").send({
			resumeText: TEST_RESUME_TEXT,
			jobDescription: TEST_JOB_DESCRIPTION,
		});

		expect(res.status).toBe(201);
		expect(res.body.success).toBeTruthy();
		expect(res.body).toMatchObject({
			success: true,
			data: {
				analysisId: expect.any(String),
				status: "PENDING",
			},
		});
	});

	it("returns 400 when required fields are missing", async () => {
		await seedUser();

		const res = await request(app)
			.post("/api/v1/analyses")
			.send({ resumeText: "only one field" }); // jobDescription missing

		expect(res.status).toBe(400);
	});

	it("returns 403 with QUOTA_EXCEEDED when user is at limit", async () => {
		await seedUser({ analysisCount: 3 });

		const res = await request(app).post("/api/v1/analyses").send({
			resumeText: TEST_RESUME_TEXT,
			jobDescription: TEST_JOB_DESCRIPTION,
		});

		expect(res.status).toBe(403);
		expect(res.body.code).toBe("QUOTA_EXCEEDED");
		expect(res.body.data).toMatchObject({
			analysesUsed: 3,
			analysesLimit: 3,
			plan: "FREE",
		});
	});
});

describe("GET /api/v1/analyses", () => {
	it("returns empty array when user has no analyses", async () => {
		await seedUser();

		const res = await request(app).get("/api/v1/analyses");

		expect(res.status).toBe(200);
		expect(res.body.success).toBeTruthy();
		expect(res.body).toEqual({
			success: true,
			data: {
				analyses: [],
			},
		});
	});

	it("returns all analyses belonging to the authenticated user", async () => {
		const user = await seedUser();
		await seedAnalysis(user.id);
		await seedAnalysis(user.id);

		const res = await request(app).get("/api/v1/analyses");

		expect(res.status).toBe(200);
		expect(res.body.success).toBeTruthy();
		expect(res.body.data.analyses).toHaveLength(2);
	});

	it("does not return analyses belonging to a different user", async () => {
		// Seed the authenticated user with no analyses
		await seedUser();

		// Seed a different user with an analysis
		const otherUser = await testPrisma.user.create({
			data: {
				clerkId: "other-clerk-id",
				email: "other@example.com",
				name: "Other Test User",
				plan: "FREE",
				analysisCount: 1,
			},
		});
		await seedAnalysis(otherUser.id);

		const res = await request(app).get("/api/v1/analyses");

		expect(res.status).toBe(200);
		expect(res.body.success).toBeTruthy();
		expect(res.body.data.analyses).toEqual([]); // authenticated user sees nothing
	});
});

describe("GET /api/v1/analyses/:id", () => {
	it("returns the analysis when it belongs to the authenticated user", async () => {
		const user = await seedUser();
		const analysis = await seedAnalysis(user.id);

		const res = await request(app).get(`/api/v1/analyses/${analysis.id}`);

		expect(res.status).toBe(200);
		expect(res.body.success).toBeTruthy();
		expect(res.body.data.id).toBe(analysis.id);
	});

	it("returns 404 when the analysis does not exist", async () => {
		await seedUser();

		const res = await request(app).get("/api/v1/analyses/nonexistent-id");

		expect(res.status).toBe(404);
	});

	it("returns 404 when the analysis belongs to a different user", async () => {
		await seedUser(); // authenticated user — owns nothing

		const otherUser = await testPrisma.user.create({
			data: {
				clerkId: "other-clerk-id",
				email: "other@example.com",
				name: "Other Test User",
				plan: "FREE",
				analysisCount: 1,
			},
		});
		const otherAnalysis = await seedAnalysis(otherUser.id);

		const res = await request(app).get(`/api/v1/analyses/${otherAnalysis.id}`);

		// Should be 404, not 403 — we don't reveal that the resource exists
		expect(res.status).toBe(404);
	});
});
