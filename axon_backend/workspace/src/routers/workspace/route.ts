import { Router } from "express";
import multer from "multer";
import embedImageController from "../../controllers/embedImage.controller.js";
import getWorkspaceContentController from "../../controllers/workspace/content/getWorkspaceContent.controller.js";
import updateWorkspaceContentController from "../../controllers/workspace/content/updateWorkspaceContent.controller.js";
import { createParentWorkspaceController } from "../../controllers/workspace/createParentWorkspace.controller.js";
import { createSubParentWorkspaceController } from "../../controllers/workspace/createSubWorkspace.controller.js";
import deleteWorkspaceController from "../../controllers/workspace/deleteWorkspace.controller.js";
import { getParentWorkspacesController } from "../../controllers/workspace/getParentWorkspaces.controller.js";
import pushWorkspaceController from "../../controllers/workspace/pushWorkspaceController.js";
import updateWorkspaceCoverIconController, {
	updateCoverYPositionController,
	updateWorkspaceWidthController,
} from "../../controllers/workspace/updateWorkspace.controllers.js";
import updateWorkspaceTitleController from "../../controllers/workspace/updateWorkspaceTitle.controller.js";
import {
	deleteImagesByUrlController,
	removeImageController,
	uploadImageController,
} from "../../controllers/workspace/uploadImage.controller.js";
import authenticateJsonWebToken from "../../middleware/auth.middleware.js";

const upload = multer({ dest: "uploads/" });
const workspaceRouter = Router();

//handle GET
workspaceRouter.get(
	"/workspaces",
	authenticateJsonWebToken,
	getParentWorkspacesController,
);

//handle post
workspaceRouter.post(
	"/new",
	authenticateJsonWebToken,
	createParentWorkspaceController,
);
workspaceRouter.post(
	"/delete/:workspaceId",
	authenticateJsonWebToken,
	deleteWorkspaceController,
);
workspaceRouter.post(
	"/title/transaction",
	authenticateJsonWebToken,
	updateWorkspaceTitleController,
);
workspaceRouter.post(
	"/width/transaction",
	authenticateJsonWebToken,
	updateWorkspaceWidthController,
);
workspaceRouter.post(
	"/push/transaction",
	authenticateJsonWebToken,
	pushWorkspaceController,
);
workspaceRouter.post(
	"/image/embed",
	authenticateJsonWebToken,
	upload.single("image"),
	embedImageController,
);

// workspace content
//get
workspaceRouter.get(
	"/content",
	authenticateJsonWebToken,
	getWorkspaceContentController,
);

workspaceRouter.post(
	"/icon/transaction",
	authenticateJsonWebToken,
	updateWorkspaceCoverIconController,
);

//post
workspaceRouter.post(
	"/content",
	authenticateJsonWebToken,
	updateWorkspaceContentController,
);

//handle Post
// handle workspace image uploads
workspaceRouter.post(
	"/cover/upload/transaction",
	authenticateJsonWebToken,
	upload.single("image"),
	uploadImageController,
);

workspaceRouter.post(
	"/cover/yPos/transaction",
	authenticateJsonWebToken,
	updateCoverYPositionController,
);

workspaceRouter.delete(
	"/cover/remove/:workspaceId",
	authenticateJsonWebToken,
	removeImageController,
);

workspaceRouter.post(
	"/image/delete-by-url",
	authenticateJsonWebToken,
	deleteImagesByUrlController,
);

// sub workspace routes
workspaceRouter.post(
	"/sub/new",
	authenticateJsonWebToken,
	createSubParentWorkspaceController,
);

export default workspaceRouter;
