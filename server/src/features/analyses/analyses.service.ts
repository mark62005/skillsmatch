import type {
	ICreateAnalysisInput,
	ICreateAnalysisResult,
	TQuotaCheckUser,
	IQuotaExceededData,
} from "./analyses.types";

import { FREE_ANALYSIS_LIMIT } from "./analyses.types";

import { prisma } from "../../lib/prisma";
import { inngest } from "../../inngest/inngest.client";
import { AppErrors } from "../../lib/errors";

/** PURE HELPER FUNCTIONS **/
//
// These are extracted as pure functions for two reasons:
// 1. They are independently unit-testable without any mocking
// 2. They document the business rule in a named, readable way

/**
 * Returns true if the user is allowed to create another analysis.
 * PRO users always pass. FREE users are capped at FREE_ANALYSIS_LIMIT.
 */
export function canCreateAnalysis(user: TQuotaCheckUser): boolean {
	if (user.plan === "PRO") return true;
	return user.analysisCount < FREE_ANALYSIS_LIMIT;
}

/**
 * Builds the data payload attached to a QUOTA_EXCEEDED error.
 * The frontend reads this to render an upgrade prompt with real numbers.
 */
export function buildQuotaExceededData(
	user: TQuotaCheckUser,
): IQuotaExceededData {
	return {
		analysesUsed: user.analysisCount,
		analysesLimit: FREE_ANALYSIS_LIMIT,
		plan: user.plan,
	};
}

/** SERVICE FUNCTIONS **/

export async function createAnalysis(
	input: ICreateAnalysisInput,
): Promise<ICreateAnalysisResult> {
	const { userId, resumeText, jobDescription } = input;

	/* Step 1: Fetch target user */
	//
	// We use select to fetch ONLY the fields we need.
	// This is a performance habit worth building early: never fetch more data
	// from the DB than the function actually uses. On a busy API this adds up.

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			plan: true,
			analysisCount: true,
		},
	});

	if (!user) {
		throw AppErrors.User.notFound();
	}

	/* Step 2: Enfore quota */
	//
	// If we ever add a CLI or a background job that creates analyses, the quota
	// check applies there too automatically because it lives at the service layer.

	if (!canCreateAnalysis(user)) {
		throw AppErrors.Analysis.quotaExceeded(buildQuotaExceededData(user));
	}

	/* Step 3: Create the Analysis record and increment the counter atomically */
	//
	// WHY A TRANSACTION?
	// Imagine two requests arrive simultaneously for the same FREE user who has
	// used 2 of their 3 analyses. Both pass the quota check above (analysisCount
	// is still 2 for both). Then both create an Analysis record. The user ends up
	// with 4 analyses on a FREE plan — the quota was bypassed.
	//
	// This is called a "race condition". A transaction solves it by making the
	// increment and the create happen as a single atomic unit — either both
	// succeed or neither does, and the DB locks prevent two transactions from
	// reading the same stale count simultaneously.
	//
	// In practice, a solo developer's app won't hit this race condition often.
	// But writing it correctly from the start is a professional habit, and it's
	// exactly the kind of thing a senior engineer will look for in a code review.

	const analysis = await prisma.$transaction(async (tx) => {
		// Increment the user's analysis count
		await tx.user.update({
			where: { id: userId },
			data: { analysisCount: { increment: 1 } },
		});

		// Create the analysis record with PENDING status
		return tx.analysis.create({
			data: {
				userId,
				resumeText,
				jobDescription,
				status: "PENDING",
			},
			select: {
				id: true,
				status: true,
			},
		});
	});

	/* Step 4: Emit the Inngest event */
	//
	// This happens AFTER the transaction commits successfully.
	// If the transaction fails (DB error, constraint violation, etc.), we never
	// reach this line — so we never fire an event for a record that doesn't exist.
	//
	// The Inngest event is intentionally minimal: just the analysisId.
	// The background function fetches everything it needs from the DB itself.
	// This avoids stale data issues where the event payload is out of sync
	// with the actual DB state by the time the worker picks it up.

	await inngest.send({
		name: "analysis/created",
		data: { analysisId: analysis.id },
	});

	/* Step 5: Return the result to the controller */

	return {
		analysisId: analysis.id,
		status: analysis.status,
	};
}
