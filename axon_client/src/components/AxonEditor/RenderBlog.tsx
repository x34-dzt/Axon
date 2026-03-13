"use client";

import React from "react";
import { EditorRoot, EditorContent } from "novel";
import { defaultExtensions } from "./extension";

const extensions = [...defaultExtensions];
const RenderBlog = ({
	blogContent,
	title,
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
}: { blogContent: Object; title: string }) => {
	return (
		<div
			spellCheck="false"
			className={
				"rounded-xl blog items-start fade-in-0 mt-[40px] max-w-[800px] animate-in custom-transition-all mx-auto flex flex-col relative   px-[16px]"
			}
		>
			<h1 className="font-bold mb-[40px] text-[40px] text-left leading-[140%]">
				{title}
			</h1>
			<EditorRoot>
				<EditorContent
					editable={false}
					immediatelyRender={false}
					//@ts-ignore
					initialContent={blogContent}
					className={"w-full"}
					extensions={extensions}
					editorProps={{
						attributes: {
							class:
								"prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
						},
					}}
				>
					<span />
				</EditorContent>
			</EditorRoot>
		</div>
	);
};

export default RenderBlog;
