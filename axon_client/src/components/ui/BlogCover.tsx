"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import DynamicWorkspaceIcon from "./DynamicWorkspaceIcon";

const BlogCover = ({
	cover,
	icon,
	title,
	yPos,
	gradient,
}: { cover: string; icon: string; title: string; yPos: number; gradient?: { from: string; to: string } }) => {
	const gradientStyle = gradient
		? { background: `linear-gradient(to bottom, ${gradient.from} 0%, rgba(13, 13, 13, 0.6) 50%, #0D0D0D 83%)` }
		: {};

	return (
		<div
			className={`${cover ? "h-[290px]" : "h-[200px]"} group transition-all overflow-hidden relative max-w-[800px] mx-auto`}
		>
			<div className=" fade-in-0 animate-in relative w-full h-full">
				<div
					className="rounded-sm h-full w-full select-none absolute z-[5] top-0 left-0"
					style={gradientStyle}
				/>
				{/* remove the asset when uploading images to cloud */}
				{cover ? (
					<Image
						src={`${cover}`}
						alt={`${title}`}
						height={250}
						width={250}
						className={
							"w-full transition-all relative z-[1] h-full object-cover rounded-md"
						}
						style={{ objectPosition: `50% ${yPos}%` }}
						priority={true}
						unoptimized
					/>
				) : (
					<div
						className={
							"w-full transition-all h-[200px] relative z-[1]  object-cover"
						}
					/>
				)}
				{/* <div
					className={`-translate-y-[83px] pl-[50px] custom-transition-all currentWorkspace.workspaceWidth === "sm" ? "w-[958px]  translate-x-[-35px] pl-0"   mx-auto relative z-1  flex gap-2 items-end z-[10]`}
				>
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<div className="mr-2">
							<DynamicWorkspaceIcon
								name={icon}
								height={30}
								width={30}
								IconClassName="translate-x-[5px] -translate-y-[10px]"
							/>
						</div>
					</motion.div>
					<motion.div
						className="flex flex-col"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<div className="text-[13px] relative inline-block leading-loose ">
							Welcome to
							<img
								src="/assets/curve_line.svg"
								className="absolute top-[65%] -translate-y-[50%] -left-[20px]"
								alt="curve line"
							/>
						</div>
						<h1 className={"text-[30px] leading-tight font-semibold"}>
							{title}
						</h1>
					</motion.div>
				</div> */}
			</div>
		</div>
	);
};

export default BlogCover;
