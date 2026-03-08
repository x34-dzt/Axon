import { WorkspaceRepository } from "../../repository/workspace.repository.js";
import type { TAxonResponse } from "../../utils/axonResponse.js";
import axonResponse from "../../utils/axonResponse.js";

const workspaceRepo = new WorkspaceRepository();
export const getParentWorkspacesService = async (
	userId: string,
): Promise<TAxonResponse> => {
	try {
		const workspaces = await workspaceRepo.fetchAllWorkspace(userId);

		return {
			statusCode: 200,
			response: {
				status: "success",
				message: "Workspaces fetched successfully",
				data: workspaces,
			},
		};
	} catch (error) {
		console.error("Error in getParentWorkspacesService:", error);
		return axonResponse(500, {
			status: "error",
			message: "failed to get the workspace",
			data: null,
		});
	}
};

export default getParentWorkspacesService;
