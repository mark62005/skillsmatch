"use client";

import type { WithChildrenProps } from "@/types/react";
import type { AppStore } from "@/store";

import { useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { setupStore } from "@/store";

import { Provider } from "react-redux";

function StoreProvider({ children }: WithChildrenProps) {
	const { getToken } = useAuth();

	const getTokenRef = useRef(getToken);

	getTokenRef.current = getToken;

	const storeRef = useRef<AppStore | null>(null);

	if (!storeRef.current) {
		storeRef.current = setupStore(() => getTokenRef.current());
	}

	return <Provider store={storeRef.current}>{children}</Provider>;
}
export default StoreProvider;
