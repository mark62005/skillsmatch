"use client";

import type { LucideIcon } from "lucide-react";

import Link from "next/link";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface INavLink {
	title: string;
	href: string;
	icon?: LucideIcon;
	isActive?: boolean;
}

export function NavMain({ navLinks }: { navLinks: INavLink[] }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu>
					{navLinks.map((link) => (
						<SidebarMenuItem key={link.title}>
							<SidebarMenuButton asChild>
								<Link href={link.href}>
									{link.icon && <link.icon />}
									<span>{link.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
