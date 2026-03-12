import { serve } from "inngest/express";
import { inngest } from "./inngest.client";

// Inngest needs its own Express route to receive event callbacks from its cloud.
// All background job functions are registered here.
export const inngestHandler = serve({
	client: inngest,
	functions: [],
});
