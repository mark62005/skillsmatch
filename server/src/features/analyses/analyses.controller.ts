import type { Request, Response, NextFunction } from "express";

import { analysesService } from "./analyses.service";
import { createAnalysisBodySchema } from "./analyses.types";

/* CREATE ANALYSIS */

export async function createAnalysisHandler(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		/* Step 1 - Validate request body */

		const parsedBody = createAnalysisBodySchema.safeParse(req.body);

		if (!parsedBody.success) {
			// Format Zod's errors into a flat, readable array for client.
			// e.g. [{ field: "resumeText", message: "Required" }]
			const errors = parsedBody.error.errors.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			}));

			res.status(400).json({
				error: "Invalid request body.",
				code: "VALIDATION_ERROR",
				data: { errors },
			});
			return;
		}

		/* Step 2 - Extract auth user */

		const clerkId = req.user!.userId;

		/* Step 3 - Call the service */
		//
		// The controller hands off to the service and trusts it completely.
		// If the service throws an AppError, next(err) sends it to the global
		// error middleware which formats it into the correct HTTP response.

		const result = await analysesService.createAnalysis({
			clerkId,
			resumeText: parsedBody.data.resumeText,
			jobDescription: parsedBody.data.jobDescription,
		});

		/* Step 4 - Send response */
		//
		// 201 Created — not 200 OK — because we created a new resource.
		// This distinction matters for REST semantics and for clients that
		// might behave differently based on status code.

		res.status(201).json({
			success: true,
			data: result,
		});
	} catch (error) {
		next(error);
	}
}

/* GET ALL ANALYSES OWNED BY AN USER */

export async function getAnalysesHandler(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user!.userId;

		const result = await analysesService.getAnalyses({ userId });

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (err) {
		next(err);
	}
}

/* GET ANALYSIS BY ID */

export async function getAnalysisByIdHandler(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user!.userId;
		const idString = req.params.id as string;

		const result = await analysesService.getAnalysisById({
			userId,
			id: idString,
		});

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (err) {
		next(err);
	}
}

export const analysesController = {
	createAnalysisHandler,
	getAnalysesHandler,
	getAnalysisByIdHandler,
};
