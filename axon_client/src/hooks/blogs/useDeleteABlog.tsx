import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

type BlogResponse = {
	data: {
		status: "error" | "success";
		message: string;
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		data: Object;
	};
};

type DeleteBlogParams = {
	blogId: string;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const deleteBlog = async ({ blogId, setLoading }: DeleteBlogParams) => {
	setLoading(true);
	try {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/delete/${blogId}`,
			{
				withCredentials: true,
			},
		);

		const { data }: BlogResponse = response;

		if (data?.status === "success") {
			toast.success("Blog deleted successfully", {
				description: data.message,
				className: "bg-neutral-900 border border-neutral-800",
				action: {
					label: "Undo",
					onClick: () => {},
				},
			});
		}
	} catch (error) {
		const { data } = error as BlogResponse;
		const axiosError = error as AxiosError;

		if (data?.message) {
			toast.error("Failed to delete the blog", {
				description: `Error: ${data.message ? data.message : "Unknown error"}`,
				className: "bg-neutral-900 border border-neutral-800",
				action: {
					label: "Close",
					onClick: () => {},
				},
			});
		} else {
			toast.error("Unknown error", {
				description: `Error: ${axiosError.response ? axiosError.response : "Unknown error"}`,
				className: "bg-neutral-900 border border-neutral-800",
				action: {
					label: "Close",
					onClick: () => {},
				},
			});
		}
	} finally {
		setLoading(false);
	}
};

const useDeleteBlog = () => {
	return {
		deleteBlog,
	};
};

export default useDeleteBlog;
