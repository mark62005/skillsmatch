import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rootReducer } from "./rootReducer";
import { baseApi } from "./baseApi";

/* REDUX STORE */
export const makeStore = (getToken?: () => Promise<string | null>) => {
	return configureStore({
		reducer: rootReducer,
		middleware(getDefaultMiddleware) {
			return getDefaultMiddleware({
				thunk: {
					extraArgument: { getToken },
				},
			}).concat(baseApi.middleware);
		},
	});
};

export const setupStore = (getToken?: () => Promise<string | null>) => {
	const store = makeStore(getToken);
	setupListeners(store.dispatch);

	return store;
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
