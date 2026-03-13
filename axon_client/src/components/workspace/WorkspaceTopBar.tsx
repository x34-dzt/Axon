"use client";

import { useWorkspaceStore, type IUserWorkspace } from "@/stores/workspace";
import type { IRoutes } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BsPlus, BsThreeDots } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import dynamic from "next/dynamic";
const DynamicWorkspaceModal = dynamic(() => import("./workspaceModal"));

import { useAuthStore } from "@/stores/auth";
import DynamicTopBarIcon from "../ui/DynamicTopBarIcon";
import { FiSidebar } from "react-icons/fi";

const WorkspaceTopBar = ({
  currentWorkspace,
  folders,
}: {
  currentWorkspace: IUserWorkspace;
  folders: IRoutes[];
}) => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { openNavHandler } = useWorkspaceStore();

  const [modalPosition, setModalPosition] = useState({
    x: 0,
    y: 0,
  });
  const bsThreeDotsRef = useRef<HTMLDivElement>(null);
  const handleModalOperation = () => {
    setOpenModal((prev) => !prev);
    if (!bsThreeDotsRef.current) return;
    const { top, left } = bsThreeDotsRef.current.getBoundingClientRect();
    setModalPosition({
      x: left,
      y: top,
    });
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault(); // Prevent default browser behavior
        openNavHandler();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [openNavHandler]);

  const { user } = useAuthStore();

  return (
    <div className="flex transition-all z-[100] workspace-top-bar top-0  border-[#262626] sticky gap-[16px] h-[42px] items-center bg-customMain/80">
      <div className="absolute inset-0 " />
      <div className="flex ml-2 gap-2 relative z-0 pl-2">
        <button className="hover:bg-neutral-800/20  rounded-md group">
          <FiSidebar
            height={30}
            width={30}
            onClick={openNavHandler}
            className="active:scale-90"
          />
        </button>

        <button type="button" className="group">
          <IoIosArrowBack
            className=" group-active:scale-90"
            onClick={() => {
              router.back();
            }}
          />
        </button>
        <button type="button" className="group">
          <IoIosArrowForward
            className=" group-active:scale-90"
            onClick={() => {
              router.forward();
            }}
          />
        </button>
      </div>

      <div className="flex gap-10 relative items-center">
        <div className="flex gap-2 items-center">
          <DynamicTopBarIcon
            height={15}
            width={15}
            name={currentWorkspace.icon}
            DClassName="select-none"
          />
          <div className="text-[13px] items-center gap-[5px] flex">
            {folders.map((folder, index) => {
              return (
                <Link
                  href={`/workspace/${folder.workspace}/${folder._id}`}
                  key={folder._id}
                >
                  {folder._id === currentWorkspace?._id ? (
                    <span className="hover:underline  shadow_topBar--text ">
                      {folder.title}
                    </span>
                  ) : (
                    <span className="text-neutral-300  hover:underline">
                      {folder.title}
                    </span>
                  )}
                  {index !== folders.length - 1 && " /"}
                </Link>
              );
            })}
            <div className="bg-white rounded-[2.5px]  shadow_topBar--box flex items-center justify-center h-[15px] w-[15px] text-black text-[11px] leading-tight">
              <span className="font-bold">
                {currentWorkspace.workspace === "main" ? "M" : "E "}
              </span>
            </div>
          </div>
        </div>
        <div ref={bsThreeDotsRef}>
          <BsThreeDots
            className="hover:bg-white active:opacity-50  hover:text-black cursor-pointer transition-all rounded-[2.5px] hover:shadow_topBar--box"
            onClick={handleModalOperation}
          />
        </div>
        {openModal && user?._id && (
          <DynamicWorkspaceModal
            workspaceId={currentWorkspace._id}
            workspaceType={currentWorkspace.workspace}
            userId={user._id}
            setModal={setOpenModal}
            top={modalPosition.y}
            left={modalPosition.x}
            triggerRef={bsThreeDotsRef}
          />
        )}
      </div>
      <div className="border-l-2 pl-2  relative  border-neutral-800">
        <BsPlus className="hover:bg-white hover:text-black cursor-pointer transition-all rounded-[2.5px] hover:shadow_topBar--box" />
      </div>
    </div>
  );
};

export default WorkspaceTopBar;

// type TabProps = {
// 	workspaceIcon: string,
// 	folders
// }

// const Tab = ({workspace}) => {
// 	return (
// 		<div className="flex gap-10 relative items-center">
// 			<div className="flex gap-2 items-center">
// 				<Image
// 					alt="workspace_icon"
// 					src={`/assets/${currentWorkspace.icon}`}
// 					height={17}
// 					width={17}
// 					draggable={false}
// 					className=" mb-[1px]  select-none "
// 				/>
// 				<div className="text-[13px] items-center gap-[5px] flex">
// 					{folders.map((folder, index) => {
// 						return (
// 							<Link
// 								href={`/workspace/${folder.workspace}/${folder._id}`}
// 								key={folder._id}
// 							>
// 								{folder._id === currentWorkspace?._id ? (
// 									<span className="hover:underline  shadow_topBar--text ">
// 										{folder.title}
// 									</span>
// 								) : (
// 									<span className="text-neutral-300  hover:underline">
// 										{folder.title}
// 									</span>
// 								)}
// 								{index !== folders.length - 1 && " /"}
// 							</Link>
// 						);
// 					})}
// 					<div className="bg-white rounded-[2.5px]  shadow_topBar--box flex items-center justify-center h-[15px] w-[15px] text-black text-[11px] leading-tight">
// 						<span className="font-bold">
// 							{currentWorkspace.workspace === "main" ? "M" : "E "}
// 						</span>
// 					</div>
// 				</div>
// 			</div>
// 			<BsThreeDots
// 				className="hover:bg-white hover:text-black cursor-pointer transition-all rounded-[2.5px] hover:shadow_topBar--box"
// 				onClick={() => {
// 					setOpenModal((prev) => !prev);
// 				}}
// 			/>
// 			{openModal && user?._id && (
// 				<WorkspaceModal
// 					workspaceId={currentWorkspace._id}
// 					workspaceType={currentWorkspace.workspace}
// 					userId={user._id}
// 					setModal={setOpenModal}
// 				/>
// 			)}
// 		</div>
// 	);
// };
