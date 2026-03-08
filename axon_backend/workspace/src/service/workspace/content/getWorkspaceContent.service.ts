import { WorkspaceRepository } from "../../../repository/workspace.repository.js";
import axonResponse from "../../../utils/axonResponse.js";

const workspaceRepo = new WorkspaceRepository();
const getWorkspaceContentService = async (
	userId: string,
	workspaceId: string,
) => {
	try {
		console.log("=== GET WORKSPACE CONTENT SERVICE ===");
		console.log("userId:", userId);
		console.log("workspaceId:", workspaceId);

		const { isError, content } =
			await workspaceRepo.getWorkspaceContentByIdSecure(workspaceId, userId);

		console.log("isError:", isError);
		console.log("content:", content);
		console.log("=====================================");

		if (isError.error) {
			return axonResponse(400, {
				data: null,
				status: "error",
				message: isError.errorMessage,
			});
		}

		return axonResponse(200, {
			data: content,
			status: "success",
			message: "successfully received workspace content",
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error in getWorkspaceContentService${error.message}`);
			throw new Error(error.message);
		}
		throw new Error(`internal server error ${error}`);
	}
};

export default getWorkspaceContentService;
