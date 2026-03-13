import { AxonError } from "@/types";
import axios from "axios";

const changePassword = async (
	currentPassword: string,
	newPassword: string,
): Promise<{ status: "error" | "success"; message: string }> => {
	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
			{
				currentPassword,
				newPassword,
			},
			{
				withCredentials: true,
			},
		);

		const { data } = response;
		return {
			status: data.status,
			message: data.message,
		};
	} catch (error) {
		const axiosError = error as AxonError;
		return {
			status: "error",
			message: axiosError.response?.data.message || axiosError.message,
		};
	}
};

const useChangePassword = () => {
	return {
		changePassword,
	};
};

export default useChangePassword;
