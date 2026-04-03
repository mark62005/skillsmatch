import type { Request, Response, NextFunction } from "express";
import { getMe } from "./users.service";
import { AppErrors } from "../../lib/errors";
import { logger } from "../../lib/logger";

export async function getMeController(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const reqUser = req.user;
		if (!reqUser) throw AppErrors.User.notSynced();

		const user = await getMe(reqUser.userId);
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
}
