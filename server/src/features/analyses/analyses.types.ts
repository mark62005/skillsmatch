import type { Analysis, User } from "../../generated/prisma";
import { z } from "zod";

/* CREATE ANALYSIS */

/**
 * What the client sends when creating a new analysis.
 * TODO: Paste-only for now — no S3 file uploads yet.
 */
export const createAnalysisBodySchema = z.object({
	resumeText: z
		.string()
		.min(50, "Resume text must be at least 50 characters")
		.max(20_000, "Resume text must be under 20,000 characters"),
	jobDescription: z
		.string()
		.min(50, "Job description must be at least 50 characters")
		.max(10_000, "Job description must be under 10,000 characters"),
});

export type TCreateAnalysisBody = z.infer<typeof createAnalysisBodySchema>;

/**
 * What the service function receives.
 * The controller extracts these from req.user + validated req.body.
 */
export interface ICreateAnalysisInput {
	clerkId: string;
	resumeText: string;
	jobDescription: string;
}

/**
 * The user snapshot the service needs to enforce quota.
 * We pick only what we need — no over-fetching.
 */
export type TQuotaCheckUser = Pick<User, "id" | "plan" | "analysisCount">;

/**
 * What the service returns on success.
 * The controller serialises this into the HTTP response.
 */
export interface ICreateAnalysisResult {
	analysisId: string;
	status: Analysis["status"]; // "PENDING" — the Prisma enum value
}

/** QUOTA ERROR DATA **/
/**
 * Extra structured data attached to a QUOTA_EXCEEDED AppError.
 * The frontend can read this to render an upgrade prompt with real numbers.
 */
export interface IQuotaExceededData {
	analysesUsed: number;
	analysesLimit: number;
	plan: User["plan"];
}

/** CONSTANTS **/
export const FREE_ANALYSIS_LIMIT = 3;

/* GET ANALYSES */

export interface IGetAnalysesInput {
	userId: string;
}

// Summary shape — no AI output JSON, just dashboard card data
export interface IAnalysisSummary {
	id: string;
	status: Analysis["status"];
	matchScore: number | null;
	nocCode: string | null;
	nocTitle: string | null;
	teerLevel: number | null;
	createdAt: Date;
}

export interface IGetAnalysesResult {
	analyses: IAnalysisSummary[];
}

/* GET ANALYSIS BY ID */

export interface IGetAnalysisByIdInput {
	userId: string;
	id: string;
}

// Full shape — includes all AI output JSON for the results page
export interface IGetAnalysisByIdResult {
	id: string;
	status: Analysis["status"];
	resumeText: string;
	jobDescription: string;
	matchScore: number | null;
	nocCode: string | null;
	nocTitle: string | null;
	teerLevel: number | null;
	parsedResume: unknown; // Stored as Json? in Prisma - validate the shape in the AI pipeline
	parsedJD: unknown;
	matchResult: unknown;
	rewriteResult: unknown;
	createdAt: Date;
}
