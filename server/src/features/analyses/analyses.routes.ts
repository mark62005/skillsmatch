import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { analysisLimiter } from "../../middleware/rateLimit.middleware";
import { analysesController } from "./analyses.controller";

const router: Router = Router();

// POST /api/v1/analyses
router.post(
	"/",
	requireAuth,
	analysisLimiter,
	analysesController.createAnalysisHandler,
);

// GET /api/v1/analyses
router.get("/", requireAuth, analysesController.getAnalysesHandler);

// GET /api/v1/analyses/:id
router.get("/:id", requireAuth, analysesController.getAnalysisByIdHandler);

export { router as analysesRouter };
