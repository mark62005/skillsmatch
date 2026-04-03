"use client";

import type { TNavUserLink } from "./NavUserLink";

import { useClerk, useUser } from "@clerk/nextjs";
import { useQueryWithRetry } from "@/features/auth";
import { useGetMeQuery } from "@/features/users";

import {
	CircleUserRoundIcon,
	EllipsisVerticalIcon,
	LogOutIcon,
	SettingsIcon,
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { AppSignOutButton } from "@/features/auth";
import { EntityInfo, EntityInfoSkeleton, EntityInfoError } from "./EntityInfo";
import { NavUserLink } from "./NavUserLink";

function NavUserContent() {
	const NAV_USER_LINKS_CONFIG: TNavUserLink[] = [
		{
			Icon: CircleUserRoundIcon,
			label: "Profile",
			onNavLinkClick: handleProfileClick,
		},
		{
			Icon: SettingsIcon,
			label: "Settings",
			href: "/users/settings",
		},
	] as const;

	const { isLoaded, isSignedIn } = useUser();
	const { openUserProfile } = useClerk();
	const { isMobile, setOpenMobile } = useSidebar();

	const {
		data: user,
		isLoading,
		isError,
		error,
	} = useQueryWithRetry(
		useGetMeQuery(undefined, {
			skip: !isLoaded || !isSignedIn,
		}),
		"USER_NOT_SYNCED",
	);

	function handleProfileClick() {
		openUserProfile();
		setOpenMobile(false);
	}

	if (isLoading || (!user && !isError)) {
		return <EntityInfoSkeleton />;
	}

	if (isError || !user) {
		console.error("Error loading user: ", error);

		return <EntityInfoError variant="user" />;
	}

	const userInfo = {
		name: user.name,
		email: user.email,
	};

	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<EntityInfo {...userInfo} />

						<EllipsisVerticalIcon className="ml-auto size-4" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
					side={isMobile ? "bottom" : "right"}
					align="end"
					sideOffset={4}
				>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<EntityInfo {...userInfo} />
						</div>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						{NAV_USER_LINKS_CONFIG.map((link) => (
							<NavUserLink
								key={link.label}
								link={link}
							/>
						))}
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<AppSignOutButton>
						<DropdownMenuItem className="cursor-pointer">
							<LogOutIcon />
							Log out
						</DropdownMenuItem>
					</AppSignOutButton>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}

export function NavUser() {
	return (
		<ErrorBoundary
			fallback={<EntityInfoError variant="user" />}
			onError={(error) => console.error("NavUser error:", error)}
		>
			<NavUserContent />
		</ErrorBoundary>
	);
}
