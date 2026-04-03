import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { getMeController } from "./users.controller";

export const usersRouter: Router = Router();

usersRouter.get("/me", requireAuth, getMeController);
