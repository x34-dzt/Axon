import { Router } from "express";
import { authController } from "../../controllers/auth/auth.controller.js";
import {
	changePasswordController,
	changeUsernameController,
	userLogInController,
	userSignOutController,
	userSingUpController,
} from "../../controllers/user/user.controller.js";
import authenticateJsonWebToken from "../../middleware/auth.middleware.js";

const authRouter = Router();

//sign-in and sign-out routes
authRouter.post("/sign-up", userSingUpController);
authRouter.post("/sign-in", userLogInController);
authRouter.get("/sign-out", authenticateJsonWebToken, userSignOutController);
authRouter.post(
	"/change-password",
	authenticateJsonWebToken,
	changePasswordController,
);
authRouter.post(
	"/change-username",
	authenticateJsonWebToken,
	changeUsernameController,
);

// auth route
authRouter.get("/me", authController);

export default authRouter;
