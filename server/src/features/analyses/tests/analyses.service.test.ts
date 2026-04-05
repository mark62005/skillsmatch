import { FREE_ANALYSIS_LIMIT } from "../analyses.types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppErrors } from "../../../lib/errors";

/** MOCK PRISMA **/

vi.mock("../../../lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
		},
		analysis: {
			create: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

/** MOCK INNGEST **/

vi.mock("../../../inngest/inngest.client", () => ({
	inngest: {
		send: vi.fn(),
	},
}));

/** Import MOCKS AFTER vi.mock DECLARATIONS **/

import { prisma } from "../../../lib/prisma";
import { inngest } from "../../../inngest/inngest.client";
import { createAnalysis } from "../analyses.service";

/** TEST FACTORIES **/
//
// Factory functions build the minimal valid data shape for each test.
// One place to update if the schema gains a required field.

function buildUser(
	overrides: Partial<{
		id: string;
		plan: "FREE" | "PRO";
		analysisCount: number;
		name: string;
	}> = {},
) {
	return {
		id: "user_test_123",
		plan: "FREE" as const,
		analysisCount: 0,
		name: "Test User",
		...overrides,
	};
}

function buildInput(
	overrides: Partial<{
		userId: string;
		resumeText: string;
		jobDescription: string;
	}> = {},
) {
	return {
		userId: "user_test_123",
		resumeText: "A".repeat(100), // satisfies 50 char minimum from Zod schema
		jobDescription: "B".repeat(100),
		...overrides,
	};
}

/** TESTS **/

describe("createAnalysis service", () => {
	beforeEach(() => {
		// Reset all mock state between tests.
		vi.clearAllMocks();
	});

	/* USER NOT FOUND */

	it("throws USER_NOT_FOUND when the user does not exist in the DB", async () => {
		// Arrange: simulate the case where Clerk webhook hasn't synced yet
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

		// Act + Assert
		await expect(createAnalysis(buildInput())).rejects.toMatchObject({
			code: "USER_NOT_FOUND",
			statusCode: 404,
		});
	});

	/* QUOTA EXCEEDED */

	it("throws QUOTA_EXCEEDED when FREE user is at the limit", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "FREE", analysisCount: FREE_ANALYSIS_LIMIT }) as any,
		);

		await expect(createAnalysis(buildInput())).rejects.toMatchObject({
			code: "QUOTA_EXCEEDED",
			statusCode: 403,
		});
	});

	it("attaches quota data payload to the QUOTA_EXCEEDED error", async () => {
		// Why catch manually instead of .rejects.toMatchObject?
		// .toMatchObject only checks top-level enumerable properties.
		// Our AppError stores .data separately — catching lets us inspect it directly.
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "FREE", analysisCount: 3 }) as any,
		);

		let caught: unknown;
		try {
			await createAnalysis(buildInput());
		} catch (err) {
			caught = err;
		}

		expect(caught).toMatchObject({
			code: "QUOTA_EXCEEDED",
			data: {
				analysesUsed: 3,
				analysesLimit: FREE_ANALYSIS_LIMIT,
				plan: "FREE",
			},
		});
	});

	/* BOUNDARY VALUE TESTS */
	//
	// Off-by-one errors (>= vs >) are the most common bug in quota logic.
	// These two tests pin down the exact boundary your implementation must use.

	it("blocks FREE user at exactly analysisCount === FREE_ANALYSIS_LIMIT", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "FREE", analysisCount: FREE_ANALYSIS_LIMIT }) as any,
		);

		await expect(createAnalysis(buildInput())).rejects.toMatchObject({
			code: "QUOTA_EXCEEDED",
		});
	});

	it("allows FREE user at analysisCount === FREE_ANALYSIS_LIMIT - 1", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({
				plan: "FREE",
				analysisCount: FREE_ANALYSIS_LIMIT - 1,
			}) as any,
		);

		vi.mocked(prisma.analysis.create).mockResolvedValue({
			id: "analysis_boundary",
			status: "PENDING",
		} as any);

		vi.mocked(inngest.send).mockResolvedValue({ ids: ["evt_1"] } as any);

		await expect(createAnalysis(buildInput())).resolves.toBeDefined();
	});

	/* PRO TIER */

	it("allows PRO user regardless of analysisCount", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "PRO", analysisCount: 9999 }) as any,
		);

		vi.mocked(prisma.analysis.create).mockResolvedValue({
			id: "analysis_pro",
			status: "PENDING",
		} as any);

		vi.mocked(inngest.send).mockResolvedValue({ ids: ["evt_1"] } as any);

		await expect(createAnalysis(buildInput())).resolves.toBeDefined();
	});

	/* HAPPY PATHS */

	it("returns analysisId and PENDING status on success", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "FREE", analysisCount: 0 }) as any,
		);

		vi.mocked(prisma.analysis.create).mockResolvedValue({
			id: "analysis_happy",
			status: "PENDING",
		} as any);

		vi.mocked(inngest.send).mockResolvedValue({ ids: ["evt_1"] } as any);

		const result = await createAnalysis(buildInput());

		expect(result).toEqual({
			analysisId: "analysis_happy",
			status: "PENDING",
		});
	});

	it("emits analysis/created Inngest event with the correct analysisId", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "FREE", analysisCount: 0 }) as any,
		);

		vi.mocked(prisma.analysis.create).mockResolvedValue({
			id: "analysis_inngest_test",
			status: "PENDING",
		} as any);

		vi.mocked(inngest.send).mockResolvedValue({ ids: ["evt_1"] } as any);

		await createAnalysis(buildInput());

		// Assert the exact event shape Inngest will receive
		expect(inngest.send).toHaveBeenCalledOnce();
		expect(inngest.send).toHaveBeenCalledWith({
			name: "analysis/created",
			data: { analysisId: "analysis_inngest_test" },
		});
	});

	it("does not emit Inngest event if analysis creation fails", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(
			buildUser({ plan: "FREE", analysisCount: 0 }) as any,
		);

		// Simulate a DB failure mid-operation
		vi.mocked(prisma.analysis.create).mockRejectedValue(
			new Error("DB connection lost"),
		);

		await expect(createAnalysis(buildInput())).rejects.toThrow(
			"DB connection lost",
		);

		// Inngest must NOT fire if the record was never created
		expect(inngest.send).not.toHaveBeenCalled();
	});
});

/** MOCK PRISMA **/

/** MOCK PRISMA **/
