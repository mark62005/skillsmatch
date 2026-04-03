"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { Show as ClerkShow } from "@clerk/nextjs";
import { LogInIcon } from "lucide-react";
import {
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AppSignInButton } from "@/features/auth/components/AuthButtons";

interface AppSidebarFooterProps {
	navNode: ReactNode;
}

export function AppSidebarFooter({ navNode }: AppSidebarFooterProps) {
	return (
		<SidebarFooter>
			<SidebarMenu>
				<ClerkShow
					when="signed-in"
					fallback={
						/* SIGNED OUT */
						<SidebarMenuItem>
							<AppSignInButton>
								<SidebarMenuButton asChild>
									<Link href="/sign-in">
										<LogInIcon />
										<span>Sign In</span>
									</Link>
								</SidebarMenuButton>
							</AppSignInButton>
						</SidebarMenuItem>
					}
				>
					{navNode}
				</ClerkShow>
			</SidebarMenu>
		</SidebarFooter>
	);
}
