export type Plan = "FREE" | "PRO";

export interface UserProfile {
	id: string;
	clerkId: string;
	email: string;
	plan: Plan;
	analysisCount: number;
	analysesRemaining: number; // computed: FREE = max(0, 3 - count), PRO = Infinity
}
