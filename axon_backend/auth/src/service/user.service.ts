import { UserRepository } from "../repository/user.repository.js";
import type { TUser } from "../types/types.js";
import type { TAxonResponse, TResponse } from "../utils/axonResponse.js";
import axonResponse from "../utils/axonResponse.js";
import { checkHashPassword } from "../utils/hash.utils.js";
import { generateJsonWebToken } from "../utils/jwt.utils.js";
import {
	validateSingUpDetails,
	validateUserLogin,
} from "../validators/user.validator.js";

const userRepo = new UserRepository();

interface IUserServiceReturn {
	jwtToken: string;
	axonResponse: TAxonResponse;
}

export const userSignUpService = async (
	userData: TUser,
): Promise<IUserServiceReturn> => {
	try {
		// validate user data
		const validation = validateSingUpDetails(userData);
		if (validation.error) {
			const response: TResponse = {
				message: validation.errorMessage,
				status: "error",
				data: null,
			};
			return {
				jwtToken: "",
				axonResponse: axonResponse(400, response),
			};
		}

		// check if the user exists
		const userExist = await userRepo.getUserByEmail(userData.email);
		if (userExist?._id) {
			const response: TResponse = {
				message: "user already exists",
				status: "error",
				data: userExist,
			};
			return {
				jwtToken: "",
				axonResponse: axonResponse(400, response),
			};
		}

		// create a new user
		const newUser = await userRepo.createUser(userData);
		const response: TResponse = {
			message: "new user created",
			status: "success",
			data: newUser,
		};

		const jwtToken = generateJsonWebToken(response.data);
		return {
			jwtToken,
			axonResponse: axonResponse(201, response),
		};
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in sign up service", error.message);
		const response: TResponse = {
			message:
				error instanceof Error ? error.message : "An unknown error occurred",
			status: "error",
			data: null,
		};
		return {
			jwtToken: "",
			axonResponse: axonResponse(500, response),
		};
	}
};

//logging in service
export const userSignInService = async (
	userData: TUser,
): Promise<IUserServiceReturn> => {
	try {
		//validating user data
		const validation = validateUserLogin(userData);
		if (validation.error) {
			const response: TResponse = {
				message: validation.errorMessage,
				status: "error",
				data: null,
			};
			return {
				jwtToken: "",
				axonResponse: axonResponse(400, response),
			};
		}

		//checking if user exist first
		const userExist = await userRepo.getUserByEmailWithPassword(userData.email);
		if (!userExist) {
			const response: TResponse = {
				message: "user doesn't exists",
				status: "error",
				data: null,
			};
			return {
				jwtToken: "",
				axonResponse: axonResponse(400, response),
			};
		}

		// checking the password
		if (!(await checkHashPassword(userData.password, userExist.password))) {
			const response: TResponse = {
				message: "invalid credentials",
				status: "error",
				data: null,
			};
			return {
				jwtToken: "",
				axonResponse: axonResponse(403, response),
			};
		}

		const userDataResponse: Omit<TUser, "password"> = {
			_id: userExist._id as string,
			username: userExist.username,
			email: userExist.email,
			userImage: userExist.userImage,
		};

		// generating a jwt token
		const jwtToken = generateJsonWebToken(userDataResponse);

		const response: TResponse = {
			message: "signed in successfully",
			status: "success",
			data: userDataResponse,
		};
		return {
			jwtToken: jwtToken,
			axonResponse: axonResponse(200, response),
		};
	} catch (error) {
		if (error instanceof Error)
			console.log("Error occurred in logging service", error.message);
		const response: TResponse = {
			message:
				error instanceof Error ? error.message : "An unknown error occurred",
			status: "error",
			data: null,
		};
		return {
			jwtToken: "",
			axonResponse: axonResponse(500, response),
		};
	}
};

export const changePasswordService = async (
	userId: string,
	currentPassword: string,
	newPassword: string,
) => {
	try {
		const changePassword = await userRepo.changePassword(
			userId,
			currentPassword,
			newPassword,
		);
		if (changePassword.error) {
			return axonResponse(400, {
				status: "error",
				message: changePassword.errorMessage,
				data: {},
			});
		}
		return axonResponse(201, {
			status: "success",
			message: "successfully changed the password",
			data: {},
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in the changePasswordService: ${error.message}`);
			throw new Error(error.message);
		}
		throw new Error("unknown error ocurred");
	}
};

export const changeUsernameService = async (
	userId: string,
	username: string,
) => {
	try {
		const response = await userRepo.changeUsername(userId, username);
		if (response.error) {
			return axonResponse(400, {
				status: "error",
				message: response.errorMessage,
				data: {},
			});
		}
		return axonResponse(201, {
			status: "success",
			message: "successfully changed the username",
			data: {},
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in the change username service: ${error.message}`);
			throw new Error(error.message);
		}
		throw new Error("unknown error occurred");
	}
};
