import type { WithChildrenProps } from "@/types/react";

function AuthLayout({ children }: WithChildrenProps) {
	return (
		<div className="flex min-h-screen w-screen items-center justify-center">
			{children}
		</div>
	);
}
export default AuthLayout;
