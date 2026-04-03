"use client";

import { useUser } from "@clerk/nextjs";

function HomePage() {
	const { user } = useUser();

	return (
		<div>
			HomePage
			{user && <p>{user.fullName}</p>}
		</div>
	);
}
export default HomePage;
