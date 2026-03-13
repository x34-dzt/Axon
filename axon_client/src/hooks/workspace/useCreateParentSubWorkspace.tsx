import type { AxonError } from "@/types";
import axios from "axios";
import { toast } from "sonner";

// Request data for creating a sub-parent workspace
export interface CreateSubParentWorkspaceRequest {
	_id: string;
	workspace: "main" | "axonverse";
	createdBy: string;
	parentPageId: string;
	removeWorkspace: (
		workspaceId: string,
		workspaceType: "main" | "axonverse",
	) => void;
}

// Function to create a new sub-parent workspace
const createSubParentWorkspace = ({
	_id,
	workspace,
	createdBy,
	parentPageId,
	removeWorkspace,
}: CreateSubParentWorkspaceRequest) => {
	const workspaceData = {
		_id,
		workspace,
		createdBy,
		parentPageId,
	};
	// Send POST request to create a new sub-parent workspace
	axios
		.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/workspace/sub/new`,
			workspaceData,
			{
				withCredentials: true,
			},
		)
		.catch((error: AxonError) => {
			removeWorkspace(_id, workspace);
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

// Hook to expose the workspace creation function
const useCreateNewSubParentWorkspace = () => {
	return { createSubParentWorkspace };
};

export default useCreateNewSubParentWorkspace;
