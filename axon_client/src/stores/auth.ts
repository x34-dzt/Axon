import type { TResponse } from "@/types";
import axios, { AxiosError } from "axios";
import { create } from "zustand";

interface AuthState {
	user: { _id: string; username: string } | null;
	isAuthenticated: boolean;
	error: string | null;
	message: string | null;
	isLoading: boolean;
	checkAuth: () => Promise<void>;
	login: (email: string, password: string) => Promise<boolean>;
	signUp: (email: string, username: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	setUser: (user: User) => void;
}

interface User {
	_id: string;
	username: string;
}

export const useAuthStore = create<AuthState>()((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	message: null,
	isLoading: true,

	checkAuth: async () => {
		set({ isLoading: true });
		try {
			const response = await axios.get<TResponse>(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
				{ withCredentials: true },
			);

			if (response.data.status === "success") {
				set({
					user: response.data.data,
					isAuthenticated: true,
					isLoading: false,
				});
			} else {
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			}
		} catch (error) {
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
			});
		}
	},

	signUp: async (email: string, username: string, password: string) => {
		if (email.trim() === "" || password.trim() === "" || username.trim() === "") {
			set({ isLoading: false, error: "Incomplete details" });
			setTimeout(() => set({ error: null }), 2000);
			return false;
		}

		set({ isLoading: true, error: null });
		try {
			const response = await axios.post<TResponse>(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-up`,
				{ email, username, password },
				{ withCredentials: true },
			);
			const user = response.data.data;
			set({
				user,
				isAuthenticated: true,
				isLoading: false,
				message: "Signed up successfully",
			});
			return true;
		} catch (error) {
			if (error instanceof AxiosError) {
				set({
					error: error.response?.data.message || "An error occurred",
					isAuthenticated: false,
					isLoading: false,
				});
				setTimeout(() => set({ error: null }), 5000);
				return false;
			}
			set({
				error: "An unexpected error occurred",
				isAuthenticated: false,
				isLoading: false,
			});
			return false;
		}
	},

	login: async (email: string, password: string) => {
		if (email.trim() === "" || password.trim() === "") {
			set({ isLoading: false, error: "Incomplete details" });
			setTimeout(() => set({ error: null }), 2000);
			return false;
		}

		set({ isLoading: true, error: null });
		try {
			const response = await axios.post<TResponse>(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`,
				{ email, password },
				{ withCredentials: true },
			);
			const user = response.data.data;
			set({
				user,
				isAuthenticated: true,
				isLoading: false,
				message: "Logged in successfully",
			});
			return true;
		} catch (error) {
			if (error instanceof AxiosError) {
				set({
					error: error.response?.data.message || "An error occurred",
					isLoading: false,
				});
				setTimeout(() => set({ error: null }), 5000);
				return false;
			}
			set({ error: "An unexpected error occurred", isLoading: false });
			return false;
		}
	},

	logout: async () => {
		try {
			await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
				withCredentials: true,
			});
		} catch (error) {
			// Ignore logout errors
		}
		set({ user: null, isAuthenticated: false, error: null, message: null });
	},

	setUser: (user: User | null) => set({ user }),
}));
