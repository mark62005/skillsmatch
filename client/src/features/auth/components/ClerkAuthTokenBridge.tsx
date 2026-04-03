"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppDispatch } from "@/store/hooks";
import { useGetMeQuery } from "@/features/users";
import { useQueryWithRetry } from "../hooks/useQueryWithRetry";
import { clearUser, setAuthUser, setIsLoading } from "../authSlice";

export function ClerkAuthTokenBridge() {
	const dispatch = useAppDispatch();
	const { isSignedIn, isLoaded } = useUser();

	// Only fetch user data if Clerk user is signed in
	const { data: backendUser, isLoading: isBackendLoading } = useQueryWithRetry(
		useGetMeQuery(undefined, {
			skip: !isLoaded || !isSignedIn,
		}),
		"USER_NOT_SYNCED",
	);

	useEffect(() => {
		if (!isLoaded || isBackendLoading) {
			dispatch(setIsLoading(true));
		}

		if (!isSignedIn) {
			dispatch(clearUser());
			return;
		}

		if (backendUser) {
			dispatch(setAuthUser(backendUser));
		}
	}, [isLoaded, isSignedIn, backendUser, dispatch]);

	return null;
}
