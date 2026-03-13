import type { AxonError, CommonWorkspaceResponse } from "@/types";
import axios from "axios";
import { toast } from "sonner";

type UpdateWorkspaceContentParams = {
	workspaceId: string;
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	content: Object;
};

const updateWorkspaceContentOnServer = async ({
	workspaceId,
	content,
}: UpdateWorkspaceContentParams) => {
	try {
		const response = await axios.post<CommonWorkspaceResponse>(
			`${process.env.NEXT_PUBLIC_API_URL}/api/workspace/content`,
			{
				workspaceId,
				content,
			},
			{
				withCredentials: true,
			},
		);

		return response.data;
	} catch (error) {
		const axiosError = error as AxonError;
		toast.error("Failed to update the content", {
			description: `Error: ${axiosError.response?.data.message || "Unknown error"}`,
			className: "bg-neutral-900 border border-neutral-800",
			action: {
				label: "Close",
				onClick: () => {},
			},
		});
	}
};

const useUpdateWorkspaceContent = () => {
	return {
		updateWorkspaceContentOnServer,
	};
};

export default useUpdateWorkspaceContent;
