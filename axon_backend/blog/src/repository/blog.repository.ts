import mongoose from "mongoose";
import { Blog, BlogContent } from "../models/blog.model.js";
import { Workspace, WorkspaceContent } from "../models/workspace.model.js";
import { CommonBlogParams, ErrorMessageReturn, IBlog } from "../types/types.js";
import { checkIfUserIsPrivileged } from "../utils/workspace.utils.js";
import { errorMessage } from "../validators/errorResponse.js";

type CommonBlogReturn = {
	isError: ErrorMessageReturn;
	blog: IBlog | null;
};

export class BlogRepository {
	async createBlog({
		userId,
		workspaceId,
	}: CommonBlogParams): Promise<CommonBlogReturn> {
		const workspace = await Workspace.findById(workspaceId);

		if (!workspace) {
			return {
				isError: errorMessage(true, "Workspace doesn't exist"),
				blog: null,
			};
		}

		const isUserPrivileged = checkIfUserIsPrivileged(
			workspace.privileges,
			userId,
		);

		if (isUserPrivileged.error) {
			return {
				isError: errorMessage(true, isUserPrivileged.errorMessage),
				blog: null,
			};
		}

		if (workspace.blogId !== null) {
			return {
				isError: errorMessage(true, "You cannot create multiple blogs"),
				blog: null,
			};
		}

		if (workspace.content === null) {
			return {
				isError: errorMessage(true, "No content for this workspace was found."),
				blog: null,
			};
		}

		const content = await WorkspaceContent.findById(workspace.content);
		if (!content) {
			return {
				isError: errorMessage(true, "No content for this workspace was found."),
				blog: null,
			};
		}

		const blog = new Blog({
			createdBy: workspace.createdBy,
			workspaceId: workspace._id,
		});

		const blogInstance = await blog.save();

		const blogContent = new BlogContent({
			content: content.content,
			workspaceId,
			createdBy: userId,
			blogId: blogInstance._id,
		});

		const updatedBlog = await Blog.findByIdAndUpdate(blogInstance._id, {
			content: blogContent._id,
		});

		if (!updatedBlog) {
			return {
				isError: errorMessage(true, "Failed to update blog with content."),
				blog: null,
			};
		}

		workspace.blogId = blogInstance._id as mongoose.Schema.Types.ObjectId;
		await Promise.all([await workspace.save(), await blogContent.save()]);

		return {
			isError: errorMessage(false, "blog created successfully"),
			blog: updatedBlog,
		};
	}

	async updateBlog({
		userId,
		blogId,
	}: {
		userId: string;
		blogId: string;
	}): Promise<CommonBlogReturn> {
		const blog = await Blog.findById(blogId);

		if (!blog) {
			return {
				isError: errorMessage(true, "Workspace doesn't exist"),
				blog: null,
			};
		}

		const workspace = await Workspace.findById(blog.workspaceId);
		console.log(JSON.stringify(workspace, null, 2));
		if (!workspace) {
			return {
				isError: errorMessage(true, "Workspace doesn't exist"),
				blog: null,
			};
		}

		const isUserPrivileged = checkIfUserIsPrivileged(
			workspace.privileges,
			userId,
		);

		if (isUserPrivileged.error) {
			return {
				isError: errorMessage(true, isUserPrivileged.errorMessage),
				blog: null,
			};
		}

		if (workspace.blogId === null) {
			return {
				isError: errorMessage(true, "Blog not found. "),
				blog: null,
			};
		}
		const workspaceContent = await WorkspaceContent.findById(workspace.content);
		const blogContent = await BlogContent.findOne({ blogId });

		if (!blogContent || !workspaceContent) {
			return {
				isError: errorMessage(true, "Blog not found or update failed."),
				blog: null,
			};
		}

		blogContent.content = workspaceContent?.content;
		await blogContent.save();

		return {
			isError: errorMessage(false, "updated blog successfully"),
			blog: blog,
		};
	}

	async getBlog(blogId: string): Promise<CommonBlogReturn> {
		const blog = await Blog.findById(blogId)
			.populate({
				path: "workspaceId",
				select: "icon cover title coverPos gradient",
			})
			.populate({
				path: "content",
			});

		console.log(JSON.stringify(blog, null, 2));

		if (!blog) {
			return {
				isError: errorMessage(true, "The requested blog was not found."),
				blog: null,
			};
		}

		return {
			isError: errorMessage(false, ""),
			blog: blog,
		};
	}

	async deleteABlog(blogId: string, userId: string): Promise<CommonBlogReturn> {
		const blog = await Blog.findById(blogId);
		if (!blog) {
			return {
				isError: errorMessage(true, "The requested blog was not found."),
				blog: null,
			};
		}

		if (blog.createdBy.toString() !== userId) {
			return {
				isError: errorMessage(true, "Unauthorized user"),
				blog: null,
			};
		}

		// Removing blog content
		await BlogContent.findByIdAndDelete(blog.content);
		console.log(`Blog content is deleted for the ${blogId}`);

		// deleting the blog
		await Blog.deleteOne({ _id: blog._id });
		console.log(`Blog with id ${blogId} deleted`);

		// removing the blog id from the workspace
		await Workspace.findByIdAndUpdate(blog.workspaceId, {
			blogId: null,
		});
		console.log(`workspace removed the blogId of: ${blogId}`);

		return {
			isError: errorMessage(false, ""),
			blog: null,
		};
	}
}
