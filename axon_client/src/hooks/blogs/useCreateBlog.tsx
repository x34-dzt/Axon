import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

type BlogResponse = {
	data: {
		status: "error" | "success";
		message: string;
		data: {
			blogId: string;
			workspaceId: string;
		};
	};
};

type TurnToBlogParams = {
	workspaceId: string;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const turnToBlog = async ({ workspaceId, setLoading }: TurnToBlogParams) => {
	setLoading(true);
	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/create`,
			{
				workspaceId,
			},
			{
				withCredentials: true,
			},
		);

		const { data }: BlogResponse = response;
		if (data?.message) {
			toast.success("Blog created successfully", {
				description: data.message,
				className: "bg-neutral-900 border border-neutral-800",
				action: {
					label: "Open",
					onClick: () =>
						window.open(
							`${process.env.NEXT_PUBLIC_WEB_URL}/blog/${data.data.blogId}`,
							"_blank",
						),
				},
			});
		}
		return { blogId: data.data.blogId };
	} catch (error) {
		const { data } = error as BlogResponse;
		const axiosError = error as AxiosError;
		if (data?.message) {
			toast.error("Failed to turn into a blog", {
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
		return { blogId: undefined };
	} finally {
		setLoading(false);
	}
};

const useCreateBlog = () => {
	return {
		turnToBlog,
	};
};

export default useCreateBlog;
