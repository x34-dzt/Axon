import fs from "node:fs";
import { client } from "../db/sanity.js";
import type { UploadImageParams, UploadImageReturn } from "../types/types.js";

export class SanityRepository {
	async uploadImage({
		file,
		workspaceId,
		userId,
	}: UploadImageParams): Promise<UploadImageReturn> {
		const imageFile = fs.createReadStream(file.path);
		try {
			const imageAsset = await client.assets.upload("image", imageFile, {
				filename: file.originalname,
			});

			fs.unlinkSync(file.path);

			const doc = await client.create({
				_type: "imageSchema",
				workspaceImage: {
					_type: "image",
					asset: {
						_type: "reference",
						_ref: imageAsset._id,
					},
				},
				workspaceId,
				uploadedBy: userId,
			});

			return { imageId: doc._id, url: imageAsset.url };
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`🔴 Error ocurred in the uploadImage - sanity SanityRepository  ${error.message}`,
				);
			}
			throw new Error("An unknown error occurred in uploadImage");
		} finally {
			imageFile.destroy();
		}
	}
	async deleteImages(workspaceId: string): Promise<void> {
		try {
			const query = `*[_type == "imageSchema" && workspaceId == $workspaceId]`;
			const imageDocs = await client.fetch(query, { workspaceId });

			for (const imageDoc of imageDocs) {
				await client.delete(imageDoc._id);
				console.log(`deleted images for ${imageDoc._id}`);
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`🔴 Error occurred in deleteImages - SanityRepository: ${error.message}`,
				);
			}
			throw new Error("An unknown error occurred in deleteImages");
		}
	}

	async deleteImageById(imageIds: string[]): Promise<void> {
		try {
			const promises = [];
			for (const imageId of imageIds) {
				promises.push(client.delete(imageId));
			}

			await Promise.all(promises);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`🔴 Error occurred in deleteImageById - SanityRepository: ${error.message}`,
				);
			}
			throw new Error("An unknown error occurred in deleteImages");
		}
	}

	async deleteImageByUrl(imageUrls: string[]): Promise<void> {
		try {
			for (const url of imageUrls) {
				const query = `*[_type == "imageSchema" && workspaceImage.asset->url == $url][0]`;
				const imageDoc = await client.fetch(query, { url });
				if (imageDoc) {
					await client.delete(imageDoc._id);
					console.log(`deleted image by url: ${url}`);
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`🔴 Error occurred in deleteImageByUrl - SanityRepository: ${error.message}`,
				);
			}
			throw new Error("An unknown error occurred in deleteImageByUrl");
		}
	}
}
