"use client";

import type { INavLink } from "./NavMain";

import { FileTextIcon, LayoutDashboardIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./AppSidebarHeader";
import { NavMain } from "./NavMain";
import { AppSidebarFooter } from "./footer/AppSidebarFooter";
import { NavUser } from "./footer/NavUser";

const navLinks: INavLink[] = [
	{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
	{ title: "New Analysis", href: "/analyses/new", icon: FileTextIcon },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			collapsible="icon"
			{...props}
		>
			<AppSidebarHeader />

			<SidebarContent>
				<NavMain navLinks={navLinks} />
			</SidebarContent>

			<AppSidebarFooter navNode={<NavUser />} />

			<SidebarRail />
		</Sidebar>
	);
}
