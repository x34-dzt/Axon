"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth";
import useChangePassword from "@/hooks/use-change-password";
import useChangeUsername from "@/hooks/use-change-username";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, Loader2 } from "lucide-react";

interface UserProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function UserProfileModal({
	isOpen,
	onClose,
}: UserProfileModalProps) {
	const auth = useAuthStore();
	const { changePassword } = useChangePassword();
	const { changeUsername } = useChangeUsername();
	const router = useRouter();

	const [showPasswordChange, setShowPasswordChange] = useState(false);

	// states
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [errors, setErrors] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [isEditingUsername, setIsEditingUsername] = useState(false);
	const [newUsername, setNewUsername] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isChangingUsername, setIsChangingUsername] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		validateForm();
	}, [currentPassword, newPassword, confirmPassword]);

	const handleLogout = async () => {
		await auth.logout();
		router.push("/auth/sign-in");
	};

	const validateForm = () => {
		const newErrors = {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		};

		if (newPassword.length > 0 && newPassword.length < 8) {
			newErrors.newPassword = "Password must be at least 8 characters long";
		}

		if (newPassword !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		if (Object.values(errors).some((error) => error !== "") || !isFormValid()) {
			return;
		}
		setIsChangingPassword(true);
		console.log("Password change requested");
		const { status, message } = await changePassword(
			currentPassword,
			newPassword,
		);
		setIsChangingPassword(false);
		if (status === "error") {
			setErrorMessage(message);
			setTimeout(() => {
				setErrorMessage("");
			}, 3000);
		} else if (status === "success") {
			setSuccessMessage(message);
			setTimeout(() => {
				setSuccessMessage("");
			}, 3000);
		}
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
	};

	const isFormValid = () => {
		return (
			currentPassword.length > 0 &&
			newPassword.length >= 8 &&
			confirmPassword.length > 0 &&
			newPassword === confirmPassword
		);
	};

	const handleUsernameChange = async () => {
		try {
			if (!auth.user?._id) return;
			setIsChangingUsername(true);
			const { status, message } = await changeUsername(newUsername);
			setIsChangingUsername(false);
			if (status === "error") {
				setErrorMessage(message);
				setTimeout(() => {
					setErrorMessage("");
				}, 3000);
			} else if (status === "success") {
				const user = {
					_id: auth.user._id,
					username: newUsername,
				};
				auth.setUser(user);
				setSuccessMessage("Username updated successfully");
				setIsEditingUsername(false);
				setTimeout(() => {
					setSuccessMessage("");
				}, 3000);
			}
		} catch (error) {
			setIsChangingUsername(false);
			setErrorMessage("Failed to update username");
			setTimeout(() => {
				setErrorMessage("");
			}, 3000);
		}
	};

	if (!auth) return null;
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.05 }}
						className="fixed inset-0 flex items-center z-[100000] justify-center"
					>
						<Card className="w-full bg-customMain border-neutral-800 text-white max-w-md mx-auto">
							<CardHeader>
								<CardTitle className="text-center w-full">
									User Profile
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-col items-center space-y-4">
									<Avatar className="h-24 w-24">
										<AvatarImage src={""} alt={auth.user?.username} />
										<AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-500">
											{auth.user?.username
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="text-center relative">
										{isEditingUsername ? (
											<div className="flex items-center">
												<Input
													value={newUsername}
													onChange={(e) => setNewUsername(e.target.value)}
													className="bg-neutral-900 font-semibold text-white border-neutral-700"
												/>
												<Button
													variant="axon"
													size="icon"
													onClick={handleUsernameChange}
													className="ml-2"
													disabled={isChangingUsername}
												>
													{isChangingUsername ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Check className="h-4 w-4" />
													)}
												</Button>
												<Button
													variant="axon"
													size="icon"
													onClick={() => setIsEditingUsername(false)}
													className="ml-2"
													disabled={isChangingUsername}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<p className="text-xl relative font-semibold">
												{auth.user?.username}
												<Button
													variant="axon"
													size="sm"
													onClick={() => {
														setIsEditingUsername(true);
														setNewUsername(auth.user?.username || "");
													}}
													className="ml-2 absolute top-1/2 -translate-y-1/2"
												>
													<Pencil className="h-4 w-4" />
												</Button>
											</p>
										)}
									</div>
								</div>

								{!showPasswordChange ? (
									<Button
										variant="axon"
										onClick={() => setShowPasswordChange(true)}
										className="w-full"
									>
										Change Password
									</Button>
								) : (
									<form onSubmit={handlePasswordChange} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="current-password">Current Password</Label>
											<Input
												className="bg-neutral-900 text-white border-neutral-700"
												id="current-password"
												type="password"
												value={currentPassword}
												onChange={(e) => setCurrentPassword(e.target.value)}
												required
											/>
											{errors.currentPassword && (
												<p className="text-red-500 text-sm">
													{errors.currentPassword}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="new-password">New Password</Label>
											<Input
												className="bg-neutral-900 text-white border-neutral-700"
												id="new-password"
												type="password"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												required
											/>
											{errors.newPassword && (
												<p className="text-red-500 text-sm">
													{errors.newPassword}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="confirm-password">
												Confirm New Password
											</Label>
											<Input
												className="bg-neutral-900 text-white border-neutral-700"
												id="confirm-password"
												type="password"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												required
											/>
											{errors.confirmPassword && (
												<p className="text-red-500 text-sm">
													{errors.confirmPassword}
												</p>
											)}
										</div>
										<div className="flex justify-end space-x-2">
											<Button
												variant="axon"
												type="button"
												onClick={() => setShowPasswordChange(false)}
												disabled={isChangingPassword}
											>
												Cancel
											</Button>
											<Button
												variant="axon"
												type="submit"
												disabled={
													!isFormValid() ||
													Object.values(errors).some((error) => error !== "") ||
													isChangingPassword
												}
											>
												{isChangingPassword ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Changing...
													</>
												) : (
													"Change Password"
												)}
											</Button>
										</div>
									</form>
								)}
								{errorMessage && (
									<p className="text-right text-red-600 font-semibold">
										{errorMessage}
									</p>
								)}
								{successMessage && (
									<p className="text-right text-green-400 font-semibold">
										{successMessage}
									</p>
								)}
							</CardContent>
							<CardFooter className="flex gap-2 justify-end">
								<Button
									className="font-semibold"
									variant="axon"
									onClick={() => {
										setShowPasswordChange(false);
										onClose();
									}}
								>
									Close
								</Button>
								{!showPasswordChange && (
									<Button
										className="font-semibold bg-red-900 hover:bg-red-700"
										variant="axon"
										onClick={handleLogout}
									>
										Logout
									</Button>
								)}
							</CardFooter>
						</Card>
					</motion.div>
					<motion.div
						initial={{ backdropFilter: "blur(0px)" }}
						animate={{ backdropFilter: "blur(10px)" }}
						exit={{ backdropFilter: "blur(0px)" }}
						transition={{ duration: 0.05 }}
						className="fixed inset-0 bg-customPrimary/80 z-[1000] h-screen w-full"
					/>
				</>
			)}
		</AnimatePresence>
	);
}
