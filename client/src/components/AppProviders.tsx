import type { WithChildrenProps } from "@/types/react";

import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "./ui/tooltip";

function AppProviders({ children }: WithChildrenProps) {
	return (
		<ClerkProvider>
			<TooltipProvider>{children}</TooltipProvider>
		</ClerkProvider>
	);
}
export default AppProviders;
