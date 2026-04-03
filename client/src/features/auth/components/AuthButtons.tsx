import type { ComponentProps } from "react";

import {
	SignUpButton as ClerkSignUpButton,
	SignInButton as ClerkSignInButton,
	SignOutButton as ClerkSignOutButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AppSignUpButton({
	children = <Button>Sign Up</Button>,
	...props
}: ComponentProps<typeof ClerkSignOutButton>) {
	return <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>;
}

export function AppSignInButton({
	children = <Button>Sign In</Button>,
	...props
}: ComponentProps<typeof ClerkSignOutButton>) {
	return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>;
}

export function AppSignOutButton({
	children = <Button>Sign Out</Button>,
	...props
}: ComponentProps<typeof ClerkSignOutButton>) {
	return <ClerkSignOutButton {...props}>{children}</ClerkSignOutButton>;
}
