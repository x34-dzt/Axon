"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

const Auth = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		if (!isLoading) {
			const isAuthPage = pathname.startsWith("/auth");
			
			if (!isAuthenticated && !isAuthPage) {
				router.push("/auth/sign-in");
			} else if (isAuthenticated && isAuthPage) {
				router.push("/");
			}
		}
	}, [pathname, isAuthenticated, isLoading, router]);

	return null;
};

export default Auth;
