import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import { authSlice } from "@/features/auth";

export const rootReducer = combineReducers({
	[baseApi.reducerPath]: baseApi.reducer,
	auth: authSlice.reducer,
});
