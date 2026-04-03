import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const customBaseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	// Get the getToken function from the extra context
	const { getToken } = api.extra as { getToken?: () => Promise<string | null> };

	const rawBaseQuery = fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
		prepareHeaders: async (headers) => {
			if (getToken) {
				try {
					const token = await getToken();
					if (token) {
						headers.set("Authorization", `Bearer ${token}`);
					}
				} catch (error) {
					console.error("Error fetching token:", error);
				}
			}
			return headers;
		},
	});

	return rawBaseQuery(args, api, extraOptions);
};

export const baseApi = createApi({
	baseQuery: customBaseQuery,
	reducerPath: "baseApi",
	tagTypes: ["Me"],
	endpoints: () => ({}),
});
