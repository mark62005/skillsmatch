import type { Metadata } from "next";

import { Inter } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { ClerkAuthTokenBridge } from "@/features/auth";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SkillsMatch",
	description: "AI-powered resume alignment for Canadian PR pathways",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.className} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<AppProviders>
					<ClerkAuthTokenBridge />
					{children}
				</AppProviders>
			</body>
		</html>
	);
}
