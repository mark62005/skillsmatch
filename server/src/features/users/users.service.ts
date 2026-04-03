import { prisma } from "../../lib/prisma";
import { AppErrors } from "../../lib/errors";
import { logger } from "../../lib/logger";
import { clerkClient } from "@clerk/express";

export async function getMe(clerkId: string) {
	const user = await prisma.user.findUnique({
		where: { clerkId },
	});

	if (!user) {
		logger.warn("USER_NOT_SYNCED");

		const clerkUser = await clerkClient.users.getUser(clerkId);
		if (!clerkUser) throw AppErrors.User.notFound();
		return;
	}

	const analysesRemaining =
		user.plan === "FREE" ? Math.max(0, 3 - user.analysisCount) : Infinity;

	return {
		id: user.id,
		name: user.name,
		clerkId: user.clerkId,
		email: user.email,
		plan: user.plan,
		analysisCount: user.analysisCount,
		analysesRemaining,
	};
}
