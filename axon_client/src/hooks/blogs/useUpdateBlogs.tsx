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

type UpdateBlogParams = {
	blogId: string;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const updateBlog = async ({ blogId, setLoading }: UpdateBlogParams) => {
	setLoading(true);
	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/update`,
			{
				blogId,
			},
			{
				withCredentials: true,
			},
		);

		const { data }: BlogResponse = response;
		if (data?.message) {
			toast.success("Blog updated successfully", {
				description: data.message,
				className: "bg-neutral-900 border border-neutral-800",
			});
		}
	} catch (error) {
		const { data } = error as BlogResponse;
		const axiosError = error as AxiosError;
		if (data?.message) {
			toast.error("Failed to update the blog", {
				description: `Error: ${data.message ? data.message : "Unknown error"}`,
				className: "bg-neutral-900 border border-neutral-800",
				action: {
					label: "Close",
					onClick: () => {},
				},
			});
		} else {
			toast.error("", {
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

const useUpdateBlogs = () => {
	return {
		updateBlog,
	};
};

export default useUpdateBlogs;
