import type { WithChildrenProps } from "@/types/react";

import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "./ui/tooltip";
import StoreProvider from "@/store/provider";

function AppProviders({ children }: WithChildrenProps) {
	return (
		<ClerkProvider>
			<StoreProvider>
				<TooltipProvider>{children}</TooltipProvider>
			</StoreProvider>
		</ClerkProvider>
	);
}
export default AppProviders;
