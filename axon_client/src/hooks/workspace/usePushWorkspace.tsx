import { AxonError } from "@/types";
import axios from "axios";
import { toast } from "sonner";

type PushToWorkspace = {
	currentWorkspaceId: string;
	toWorkspaceId: string;
	toWorkspaceType: "axonverse" | "main";
};

const pushWorkspace = async ({
	currentWorkspaceId,
	toWorkspaceId,
	toWorkspaceType,
}: PushToWorkspace) => {
	try {
		// Send POST request to initiate workspace push transaction
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/workspace/push/transaction`,
			{
				currentWorkspaceId,
				toWorkspaceId,
				toWorkspaceType,
			},
			{
				withCredentials: true,
			},
		);

		toast.success("Workspace moved successfully", {
			className: "bg-neutral-900 border border-neutral-800",
		});
	} catch (error) {
		const axonError = error as AxonError;
		// console.log(axonError.response?.data.message);
		// Display error toast notification with fallback message if available
		toast.error("Failed to push workspace", {
			description: `Error: ${axonError.response?.data.message || axonError.message}`,
			className: "bg-neutral-900 border border-neutral-800",
			action: {
				label: "Close",
				onClick: () => {},
			},
		});
	}
};

const usePushWorkspace = () => {
	return pushWorkspace;
};

export default usePushWorkspace;
