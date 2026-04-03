/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { TypedUseQueryHookResult } from "@reduxjs/toolkit/query/react";

import { useEffect, useState, useRef } from "react";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 2000;

type QueryResult<T, QueryArg> = TypedUseQueryHookResult<
	T,
	QueryArg,
	BaseQueryFn<any, unknown, FetchBaseQueryError>
>;

interface UseQueryWithRetryResult<T> {
	data: T | undefined;
	isLoading: boolean;
	isError: boolean;
	isSyncing: boolean;
	error: SerializedError | FetchBaseQueryError | undefined;
}

export function useQueryWithRetry<T, QueryArg = void>(
	queryResult: QueryResult<T, QueryArg>,
	notSyncedCode: string, // e.g., 'USER_NOT_SYNCED' or 'ORG_NOT_SYNCED'
): UseQueryWithRetryResult<T> {
	const [retryCount, setRetryCount] = useState<number>(0);
	const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

	const { data, isError, error, isLoading, refetch } = queryResult;

	const errorData = (error as any)?.data;
	const isNotSyncedYet =
		isError &&
		(error as any)?.status === 404 &&
		errorData?.code === notSyncedCode;

	const isSyncing = isNotSyncedYet && retryCount < MAX_RETRIES;

	useEffect(() => {
		// Clear any existing timer on each render
		if (retryTimerRef.current) {
			clearTimeout(retryTimerRef.current);
			retryTimerRef.current = null;
		}

		if (!isSyncing) return;

		// Schedule next retry
		retryTimerRef.current = setTimeout(() => {
			setRetryCount((prev) => prev + 1);
			refetch();
		}, RETRY_INTERVAL);

		return () => {
			if (retryTimerRef.current) {
				clearTimeout(retryTimerRef.current);
				retryTimerRef.current = null;
			}
		};
	}, [isSyncing, refetch]);

	//  Reset retry count when data arrives or query changes
	useEffect(() => {
		if (data) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setRetryCount(0);
		}
	}, [data]);

	return {
		data,
		isLoading: isLoading || isSyncing,
		// Only show error if it's a real error OR sync timed out
		isError:
			(isError && !isNotSyncedYet) ||
			(isNotSyncedYet && retryCount >= MAX_RETRIES),
		isSyncing,
		error,
	};
}
