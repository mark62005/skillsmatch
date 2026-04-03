import type { WithChildrenProps } from "@/types/react";

import { auth } from "@clerk/nextjs/server";

import { RedirectToSignIn } from "@clerk/nextjs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

export default async function DashboardLayout({ children }: WithChildrenProps) {
	const { userId } = await auth();

	if (!userId) {
		return <RedirectToSignIn />;
	}

	return (
		<SidebarProvider>
			<AppSidebar />

			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
