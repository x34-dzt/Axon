import axios from "axios";
import { toast } from "sonner";

export const onUpload = (file: File): Promise<string> => {
	const formData = new FormData();
	const path = window.location.pathname;
	const match = path.match(/\/workspace\/(main|axonverse)\/([^\/]+)/);
	if (!match) return new Promise((resolve, reject) => reject("error"));

	formData.append("image", file);
	formData.append("workspaceId", match[2]);
	const promise = axios.post(
		`${process.env.NEXT_PUBLIC_API_URL}/api/workspace/image/embed`,
		formData,
		{
			withCredentials: true,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);

	return new Promise((resolve) => {
		toast.promise(
			promise.then(async (res) => {
				if (res.status === 201) {
					const { data } = res.data;
					const image = new Image();
					image.src = data;
					image.onload = () => {
						resolve(data);
					};
				} else if (res.status === 401) {
					throw new Error(
						"`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.",
					);
				} else {
					throw new Error("Error uploading image. Please try again.");
				}
			}),
			{
				loading: "Uploading image...",
				success: "Image uploaded successfully.",
				error: (e) => e.message,
			},
		);
	});
};
