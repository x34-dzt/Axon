import type { IUserWorkspace } from "@/stores/workspace";
import type { AxonError } from "@/types";
import axios from "axios";
import { toast } from "sonner";

// Interfaces for the response and request data for creating a parent workspace
export interface CreateParentWorkspaceResponse {
	statusCode: number;
	message: string;
	data: IUserWorkspace;
}
export interface CreateParentWorkspaceRequest {
	_id: string;
	workspace: "main" | "axonverse";
	createdBy: string;
	removeWorkspace: (
		workspaceId: string,
		workspaceType: "main" | "axonverse",
	) => void;
}

const createParentWorkspace = ({
	_id,
	workspace,
	createdBy,
	removeWorkspace,
}: CreateParentWorkspaceRequest) => {
	const workspaceData = {
		_id,
		workspace,
		createdBy,
	};

	// Send POST request to create the workspace
	axios
		.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/workspace/new`,
			workspaceData,
			{
				withCredentials: true,
			},
		)
		.catch((error: AxonError) => {
			removeWorkspace(_id, workspace); // Revert workspace on error
			toast.error("Failed to create new workspace", {
				description: `Failed to create the workspace with id: ${_id}`,
				className: "bg-neutral-900 border border-neutral-800",
				action: {
					label: "Close",
					onClick: () => {},
				},
			});
		});
};

// Hook to expose the createParentWorkspace function
const useCreateNewParentWorkspace = () => {
	return { createParentWorkspace };
};

export default useCreateNewParentWorkspace;
