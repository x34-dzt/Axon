import type { Request, Response } from "express";
import {
	deleteImagesByUrlService,
	removeImageService,
	uploadImageService,
} from "../../service/workspace/uploadImage.service.js";
import type { UploadedFile } from "../../types/types.js";
import {
	validateCommonValues,
	validateUploadImage,
} from "../../validators/workspace.validator.js";

type UploadImageBody = {
	workspaceId: string;
	file: UploadedFile;
};

export const uploadImageController = async (req: Request, res: Response) => {
	try {
		const { workspaceId }: UploadImageBody = req.body;
		const file = req.file as UploadedFile;
		const user = req.user;

		const validate = validateUploadImage(user, workspaceId, file);
		if (validate.error) {
			return res.status(400).json({ error: validate.errorMessage });
		}

		const { statusCode, response } = await uploadImageService(
			user._id,
			workspaceId,
			file,
		);

		return res.status(statusCode).json(response);
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in uploadImageController ${error.message}`);
			return res.status(500).json({ error: "Internal server error." });
		}

		console.log(`Error in uploadImageController ${error}`);
		return res.status(500).json({ error: "Internal server error." });
	}
};

// Todo list
/*
[] - remove the image and also delete from the sanity
[] - Check if the user has made the blog if yes don't let him make another, validate the blog data, and also make the get blog data endpoint, with the icon, tile and cover from the workspace   
*/

export const removeImageController = async (req: Request, res: Response) => {
	try {
		const { workspaceId } = req.params;
		const user = req.user;

		const validate = validateCommonValues(user._id, workspaceId);
		if (validate.error) {
			return res.status(400).json({ error: validate.errorMessage });
		}

		const { statusCode, response } = await removeImageService(
			user._id,
			workspaceId,
		);

		return res.status(statusCode).json(response);
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in remove image controller ${error.message}`);
			return res.status(500).json({ error: "Internal server error." });
		}

		console.log(`Error in remove image controller ${error}`);
		return res.status(500).json({ error: "Internal server error." });
	}
};

type DeleteImagesBody = {
	imageUrls: string[];
};

export const deleteImagesByUrlController = async (
	req: Request,
	res: Response,
) => {
	try {
		const { imageUrls }: DeleteImagesBody = req.body;

		if (!imageUrls || !Array.isArray(imageUrls)) {
			return res.status(400).json({ error: "imageUrls array is required" });
		}

		const { statusCode, response } = await deleteImagesByUrlService(imageUrls);

		return res.status(statusCode).json(response);
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in deleteImagesByUrlController ${error.message}`);
			return res.status(500).json({ error: "Internal server error." });
		}

		console.log(`Error in deleteImagesByUrlController ${error}`);
		return res.status(500).json({ error: "Internal server error." });
	}
};
