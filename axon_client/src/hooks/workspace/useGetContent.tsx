import axios from "axios";
import { toast } from "sonner";
import type { AxonError, CommonWorkspaceResponse } from "@/types";

const fetchWorkspaceContent = async (workspaceId: string) => {
  try {
    // Make GET request to fetch workspace content
    const response = await axios.get<CommonWorkspaceResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workspace/content`,
      { params: { workspaceId }, withCredentials: true },
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxonError;
    toast.error("Failed to fetch workspace content", {
      description: `Error: ${axiosError.response?.data.message || "Unknown error"}`,
      className: "bg-neutral-900 border border-neutral-800",
      action: {
        label: "Close",
        onClick: () => {},
      },
    });
  }
};

// Custom hook to access fetchWorkspaceContent function
const useGetWorkspaceContent = () => {
  return {
    fetchWorkspaceContent,
  };
};

export default useGetWorkspaceContent;
