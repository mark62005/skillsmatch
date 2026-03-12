import { ClerkUser } from "../middleware/auth.middleware";

declare global {
	namespace Express {
		interface Request {
			user?: ClerkUser; // populated by auth.middleware after JWT verification
		}
	}
}
