import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TUser } from "../types/types";

const unauthorizedUserResponse = (responseValue: string) => {
	return {
		data: null,
		message: responseValue,
		status: "error",
	};
};

const authenticateJsonWebToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const secretKey = process.env.SECRET_KEY;
		if (!secretKey) {
			throw new Error("No secret key provided");
		}

		const token = req.cookies.axon_user;

		if (!token) {
			return res
				.status(401)
				.json(unauthorizedUserResponse("unauthorized user"));
		}

		const decoded = jwt.verify(token, secretKey) as TUser;
		if (!decoded) {
			return res
				.status(401)
				.json(unauthorizedUserResponse("invalid token please login again"));
		}

		req.user = decoded;

		return next();
	} catch (error) {
		console.error(error);
		return res.status(401).json(unauthorizedUserResponse("Invalid token"));
	}
};

export default authenticateJsonWebToken;
