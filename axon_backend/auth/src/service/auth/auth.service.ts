import jwt from "jsonwebtoken";
import type { IJwtUser } from "../../middleware/auth.middleware";

type TAuthResponse = {
	statusCode: number;
	error: boolean;
	message: string;
	user: IJwtUser | null;
};

export const checkAuthService = (token: string): TAuthResponse => {
	try {
		if (!token) {
			const errorResponse: TAuthResponse = {
				error: true,
				message: "unauthorized user",
				statusCode: 401,
				user: null,
			};
			return errorResponse;
		}
		const secretKey = process.env.SECRET_KEY;
		if (!secretKey) {
			const errorResponse: TAuthResponse = {
				error: true,
				message: "Internal server error",
				statusCode: 401,
				user: null,
			};
			return errorResponse;
		}
		const decoded = jwt.verify(token, secretKey) as IJwtUser;

		if (!decoded) {
			const errorResponse: TAuthResponse = {
				error: true,
				message: "unauthorized user error",
				statusCode: 401,
				user: null,
			};
			return errorResponse;
		}

		const successResponse: TAuthResponse = {
			error: false,
			message: "authorized successfully",
			statusCode: 200,
			user: {
				_id: decoded._id,
				username: decoded.username,
			},
		};

		return successResponse;
	} catch (error) {
		const errorResponse: TAuthResponse = {
			error: true,
			message: "Unauthorized",
			statusCode: 401,
			user: null,
		};
		return errorResponse;
	}
};
