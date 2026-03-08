import type { Request, Response } from "express";
import { checkAuthService } from "../../service/auth/auth.service.js";

export const authController = (req: Request, res: Response) => {
	try {
		const axonToken = req.cookies.axon_user;
		const { error, message, statusCode, user } = checkAuthService(axonToken);

		if (error) {
			return res.status(statusCode).json({
				data: null,
				message,
				status: "error",
			});
		}

		return res.status(200).json({
			data: user,
			message: "User authenticated",
			status: "success",
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in auth controller ${error.message}`);
		}

		return res.status(500).json({ error: "Internal server error" });
	}
};
