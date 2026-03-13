import type { Request, Response } from "express";
import { internalServerErrorResponse } from "../../constant.js";
import {
	changePasswordService,
	changeUsernameService,
	userSignInService,
	userSignUpService,
} from "../../service/user.service.js";
import type { TUser } from "../../types/types.js";
import type { TResponse } from "../../utils/axonResponse.js";
import { changePasswordValidator } from "../../validators/user.validator.js";

const AXON_USER: string = "axon_user";

export const userSingUpController = async (req: Request, res: Response) => {
	try {
		const user: TUser = req.body;
		const { jwtToken, axonResponse } = await userSignUpService(user);

		const isDev = process.env.NODE_ENV !== "production";
		console.log(isDev);

		if (jwtToken !== "") {
			res.cookie(AXON_USER, jwtToken, {
				httpOnly: true,
				secure: !isDev,
				sameSite: isDev ? "lax" : "strict",
				maxAge: 30 * 24 * 60 * 60 * 1000,
			});
		}

		return res.status(axonResponse.statusCode).json(axonResponse.response);
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in controller", error.message);
		return res.status(500).json(internalServerErrorResponse);
	}
};

export const userSignOutController = async (req: Request, res: Response) => {
	try {
		const user = req.user;
		if (!user?._id) {
			return res.status(401).json({ error: "unauthorized user." });
		}
		const isDev = process.env.NODE_ENV !== "production";
		res.cookie(AXON_USER, "", {
			httpOnly: true,
			secure: !isDev,
			sameSite: isDev ? "lax" : "strict",
			expires: new Date(0),
		});
		const response: TResponse = {
			message: "signed out successfully",
			data: null,
			status: "success",
		};

		return res.status(200).json({ response });
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in controller", error.message);
		return res.status(500).json(internalServerErrorResponse);
	}
};

// logging in controllers
export const userLogInController = async (req: Request, res: Response) => {
	try {
		const userData: TUser = req.body;
		const { jwtToken, axonResponse } = await userSignInService(userData);

		const isDev = process.env.NODE_ENV !== "production";
		if (jwtToken !== "") {
			res.cookie(AXON_USER, jwtToken, {
				httpOnly: true,
				secure: !isDev,
				sameSite: isDev ? "lax" : "strict",
				maxAge: 30 * 24 * 60 * 60 * 1000,
			});
		}

		return res.status(axonResponse.statusCode).json(axonResponse.response);
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in userLogIn controller", error.message);
		return res.status(500).json(internalServerErrorResponse);
	}
};

export const changePasswordController = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (!user) {
			return res.status(401).json({
				status: "error",
				message: "user not found",
				data: {},
			});
		}

		const { currentPassword, newPassword } = req.body;
		const validate = changePasswordValidator(
			user._id,
			currentPassword,
			newPassword,
		);
		if (validate.error) {
			return res.status(400).json({
				status: "error",
				message: validate.errorMessage,
				data: {},
			});
		}

		const { statusCode, response } = await changePasswordService(
			user._id,
			currentPassword,
			newPassword,
		);
		return res.status(statusCode).json(response);
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in changePassword controller", error.message);

		return res.status(400).json(internalServerErrorResponse);
	}
};
export const changeUsernameController = async (req: Request, res: Response) => {
	try {
		const user = req.user;
		const { username } = req.body;
		if (!user?._id || !username) {
			return res.status(400).json({
				status: "error",
				message: "Incomplete information provided",
				data: {},
			});
		}

		const { statusCode, response } = await changeUsernameService(
			user._id,
			username,
		);
		return res.status(statusCode).json(response);
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in changePassword controller", error.message);

		return res.status(400).json(internalServerErrorResponse);
	}
};
