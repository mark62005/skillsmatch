import type { LucideIcon } from "lucide-react";

import Link from "next/link";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export type TNavUserLink = {
	Icon: LucideIcon;
	label: string;
} & (
	| { href: string; onNavLinkClick?: never }
	| { href?: never; onNavLinkClick: () => void }
);

interface NavUserLinkProps {
	link: TNavUserLink;
}

const ICON_CLASSNAME = "size-4 mr-1";

export function NavUserLink({ link }: NavUserLinkProps) {
	const { Icon, label, href, onNavLinkClick } = link;

	if (href) {
		return (
			<DropdownMenuItem asChild>
				<Link
					href={href}
					className="cursor-pointer"
				>
					<Icon className={ICON_CLASSNAME} />

					{label}
				</Link>
			</DropdownMenuItem>
		);
	}

	return (
		<DropdownMenuItem
			onClick={onNavLinkClick}
			className="cursor-pointer"
		>
			<Icon className={ICON_CLASSNAME} />

			{label}
		</DropdownMenuItem>
	);
}
