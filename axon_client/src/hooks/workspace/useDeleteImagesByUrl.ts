import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const deleteImagesByUrl = async (imageUrls: string[]) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/workspace/image/delete-by-url`,
    { imageUrls },
    { withCredentials: true }
  );
  return response.data;
};

const useDeleteImagesByUrl = () => {
  return useMutation({
    mutationFn: deleteImagesByUrl,
  });
};

export default useDeleteImagesByUrl;
