import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function EntityInfoSkeleton() {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				size="lg"
				disabled
			>
				<Skeleton className="size-8 rounded-lg" />

				<div className="grid flex-1 gap-1">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-32" />
				</div>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

interface EntityInfoErrorProps {
	variant: "user" | "organization";
}

export function EntityInfoError({ variant }: EntityInfoErrorProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				size="lg"
				disabled
			>
				<Avatar className="size-8 rounded-lg">
					<AvatarFallback className="rounded-lg">?</AvatarFallback>
				</Avatar>
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-medium text-destructive">
						Error loading {variant}
					</span>
				</div>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

interface EntityInfoProps {
	name: string;
	email: string;
}

export function EntityInfo({ name, email }: EntityInfoProps) {
	const firstName = name.split(" ")[0];

	const nameInitials = name
		.split(" ")
		.slice(0, 2)
		.map((str: string) => str[0])
		.join("");

	return (
		<>
			<Avatar className="size-8 rounded-lg grayscale">
				<AvatarImage
					src="https://github.com/shadcn.png"
					alt={name}
				/>
				<AvatarFallback className="rounded-lg uppercase">
					{nameInitials}
				</AvatarFallback>
			</Avatar>

			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{firstName}</span>

				<span className="text-muted-foreground truncate text-xs">{email}</span>
			</div>
		</>
	);
}
