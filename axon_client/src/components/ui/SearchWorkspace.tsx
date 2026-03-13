"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { AnimatePresence, motion } from "framer-motion";
import { IUserWorkspace, useWorkspaceStore } from "@/stores/workspace";
import DynamicIcon from "./DynamicIcon";
import { useRouter } from "next/navigation";

const SearchWorkspace = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const listRef = useRef<HTMLDivElement | null>(null);
	const workspaces = useWorkspaceStore();
	const router = useRouter();

	const toggleSearch = useCallback(() => {
		setIsOpen((prev) => !prev);
		setSearchQuery("");
		setSelectedIndex(-1);
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSearch();
			} else if (event.key === "Escape" && isOpen) {
				toggleSearch();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, toggleSearch]);

	useEffect(() => {
		if (!inputRef.current) return;
		if (isOpen) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const findWorkspaceByTitle = (
		query: string,
		workspaceList: IUserWorkspace[],
	): IUserWorkspace[] => {
		return workspaceList.reduce<IUserWorkspace[]>((accumulator, workspace) => {
			const matchesTitle = workspace.title
				.toLocaleLowerCase()
				.includes(query.toLocaleLowerCase());

			if (matchesTitle) {
				accumulator.push(workspace);
			}

			if (workspace.subPages) {
				const foundInSubPages = findWorkspaceByTitle(query, workspace.subPages);
				accumulator.push(...foundInSubPages);
			}

			return accumulator;
		}, []);
	};

	const foundedMainWorkspaces = searchQuery
		? findWorkspaceByTitle(
				searchQuery,
				workspaces.workspace.main ? workspaces.workspace.main : [],
			)
		: [];

	const foundedAxonWorkspaces = searchQuery
		? findWorkspaceByTitle(
				searchQuery,
				workspaces.workspace.axonverse ? workspaces.workspace.axonverse : [],
			)
		: [];

	const allWorkspaces = [
		...foundedMainWorkspaces,
		...foundedAxonWorkspaces,
		...(workspaces.workspace.main || []),
		...(workspaces.workspace.axonverse || []),
	];

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prevIndex) =>
				prevIndex < allWorkspaces.length - 1 ? prevIndex + 1 : prevIndex,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
		} else if (e.key === "Enter" && selectedIndex !== -1) {
			e.preventDefault();
			const selectedWorkspace = allWorkspaces[selectedIndex];
			router.push(
				`${process.env.NEXT_PUBLIC_WEB_URL}/workspace/${selectedWorkspace.workspace}/${selectedWorkspace._id}`,
			);
			toggleSearch();
		}
	};

	useEffect(() => {
		if (selectedIndex !== -1 && listRef.current) {
			const selectedElement = listRef.current.children[
				selectedIndex
			] as HTMLElement;
			if (selectedElement) {
				selectedElement.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				});
			}
		}
	}, [selectedIndex]);

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<>
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							className="fixed inset-0 flex flex-col items-center justify-center z-[500] bg-black/50 h-screen"
						>
							<Input
								ref={inputRef}
								placeholder="Enter a workspace name"
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setSelectedIndex(-1);
								}}
								onKeyDown={handleKeyDown}
								className="w-[60%] mt-[10vh] text-[20px] ring-0 rounded-t-2xl rounded-b-none p-8 animate-in fade-in-0 border-0 bg-neutral-900 backdrop-blur-md focus-visible:ring-offset-0 focus-visible:ring-0"
							/>
							<div className="w-[60%] bg-neutral-900 rounded-b-2xl h-[50vh] overflow-y-auto">
								<div className="p-2" ref={listRef}>
									{(foundedMainWorkspaces.length !== 0 ||
										foundedAxonWorkspaces.length !== 0) && (
										<div className="px-2 py-2 text-xs font-medium text-white/50 uppercase">
											Searched results
										</div>
									)}
									{foundedAxonWorkspaces.length === 0 &&
										foundedMainWorkspaces.length === 0 &&
										searchQuery.length > 1 && (
											<div className="p-2">
												<span className="text-neutral-400">
													No search results found for
												</span>{" "}
												{searchQuery}
											</div>
										)}
									{foundedMainWorkspaces.map((workspace, index) => (
										<WorkspaceButton
											key={workspace._id}
											workspace={workspace}
											isSelected={index === selectedIndex}
										/>
									))}
									{foundedAxonWorkspaces.map((workspace, index) => (
										<WorkspaceButton
											key={workspace._id}
											workspace={workspace}
											isSelected={
												index + foundedMainWorkspaces.length === selectedIndex
											}
										/>
									))}
								</div>
								{(workspaces?.workspace?.main?.length ?? 0) > 0 && (
									<div
										className={`${
											searchQuery ? "opacity-30" : "opacity-100"
										} transition-all p-2`}
									>
										<div className="px-2 py-2 text-xs font-medium text-white/50 uppercase">
											Main Workspaces
										</div>
										{workspaces.workspace?.main?.map((workspace, index) => (
											<WorkspaceButton
												key={workspace._id}
												workspace={workspace}
												isSelected={
													index +
														foundedMainWorkspaces.length +
														foundedAxonWorkspaces.length ===
													selectedIndex
												}
											/>
										))}
									</div>
								)}
								{(workspaces?.workspace?.axonverse?.length ?? 0) > 0 && (
									<div
										className={`${
											searchQuery ? "opacity-30" : "opacity-100"
										} transition-all p-2`}
									>
										<div className="px-2 py-4 text-xs font-medium text-white/50 uppercase">
											Axonverse Workspaces
										</div>
										{workspaces.workspace.axonverse?.map((workspace, index) => (
											<WorkspaceButton
												key={workspace._id}
												workspace={workspace}
												isSelected={
													index +
														foundedMainWorkspaces.length +
														foundedAxonWorkspaces.length +
														(workspaces.workspace?.main?.length || 0) ===
													selectedIndex
												}
											/>
										))}
									</div>
								)}
							</div>
						</motion.div>
						<motion.div
							initial={{ backdropFilter: "blur(0px)" }}
							animate={{ backdropFilter: "blur(10px)" }}
							exit={{ backdropFilter: "blur(0px)" }}
							className="fixed inset-0 z-[100] h-screen w-full"
						/>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default SearchWorkspace;

const WorkspaceButton = ({
	workspace,
	isSelected,
}: {
	workspace: IUserWorkspace;
	isSelected: boolean;
}) => {
	const router = useRouter();
	return (
		<button
			onClick={() =>
				router.push(
					`${process.env.NEXT_PUBLIC_WEB_URL}/workspace/${workspace.workspace}/${workspace._id}`,
				)
			}
			type="button"
			className={`flex gap-4 p-2 group items-center hover:bg-neutral-800 w-full rounded-md ${
				isSelected ? "bg-neutral-800" : ""
			}`}
		>
			<div className="group-hover:translate-x-1 transition-all">
				<DynamicIcon name={workspace.icon} DClassName="translate-y-[0.3px]" />
			</div>
			<div className="group-hover:translate-x-1 transition-all">
				{workspace.title}
				<span className="ml-2 text-sm text-neutral-300">
					{workspace.workspace}
				</span>
			</div>
		</button>
	);
};
