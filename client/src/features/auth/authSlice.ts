import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { TUser } from "../users";

import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
	user: TUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	user: null,
	isLoading: true,
	isAuthenticated: false,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setAuthUser: (state, action: PayloadAction<TUser>) => {
			state.user = action.payload;
			state.isAuthenticated = true;
			state.isLoading = false;
		},
		clearUser: (state) => {
			state.user = null;
			state.isAuthenticated = false;
			state.isLoading = false;
		},
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
});

export const { setAuthUser, clearUser, setIsLoading } = authSlice.actions;

/* SELECTORS */
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsAuthenticated = (state: RootState) =>
	state.auth.isAuthenticated;
export const selectAuthUser = (state: RootState) => state.auth.user;
