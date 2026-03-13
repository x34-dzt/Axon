"use client";

import { useWorkspaceStore, type IUserWorkspace } from "@/stores/workspace";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosAdd } from "react-icons/io";
import { useAuthStore } from "@/stores/auth";
import useCreateNewSubParentWorkspace from "@/hooks/workspace/useCreateParentSubWorkspace";
import dynamic from "next/dynamic";
const DynamicIcon = dynamic(() => import("../ui/DynamicIcon"), {
  ssr: false,
});

const DynamicWorkspaceModal = dynamic(() => import("./workspaceModal"));
const Workspace = ({ workspaceLink }: { workspaceLink: IUserWorkspace }) => {
  const [openFolder, setOpenFolder] = useState<boolean>(false);
  const path = usePathname();
  const isActive = path.includes(workspaceLink._id);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { addNewSubWorkspaceById, addNewRecentWorkspace, removeWorkspace } =
    useWorkspaceStore();

  const { createSubParentWorkspace } = useCreateNewSubParentWorkspace();
  const router = useRouter();
  const { user } = useAuthStore();

  const [modalPosition, setModalPosition] = useState({
    x: 0,
    y: 0,
  });
  const bsThreeDotsRef = useRef<HTMLDivElement>(null);
  const handleModalOperation = (e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    if (!bsThreeDotsRef.current) return;
    const { top, left } = bsThreeDotsRef.current.getBoundingClientRect();

    setModalPosition({
      x: left,
      y: window.innerHeight < top + 300 ? top - 275 : top,
    });

    setOpenModal((prev) => !prev);
  };

  const addNewSubWorkspace = () => {
    if (!user?._id) return;
    const { newWorkspaceId, newWorkspaceType, newWorkspaceParentPageId } =
      addNewSubWorkspaceById(
        workspaceLink._id,
        user._id,
        workspaceLink.workspace,
      );

    if (newWorkspaceParentPageId) {
      createSubParentWorkspace({
        _id: newWorkspaceId,
        parentPageId: newWorkspaceParentPageId,
        workspace: newWorkspaceType,
        createdBy: user._id,
        removeWorkspace,
      });
    }

    router.push(`/workspace/${newWorkspaceType}/${newWorkspaceId}`);
  };

  return (
    <>
      {openModal && user?._id && (
        <DynamicWorkspaceModal
          workspaceId={workspaceLink._id}
          setModal={setOpenModal}
          userId={user?._id}
          workspaceType={workspaceLink.workspace}
          top={modalPosition.y}
          left={modalPosition.x}
          triggerRef={bsThreeDotsRef as React.RefObject<HTMLElement>}
        />
      )}
      <div
        key={workspaceLink._id}
        className="flex animate-in rounded-[8px] fade-in-0 justify-center relative flex-col"
      >
        <div
          className={`py-1 px-1 rounded-lg flex select-none relative z-[10] group cursor-pointer items-center justify-between text-[13px] hover:bg-accent ${isActive ? "bg-accent opacity-100" : "opacity-60"} hover:opacity-100 transition-all gap-1`}
        >
          <div className="flex items-center gap-[10px]">
            <div className="relative hover:bg-neutral-900  transition-all rounded-md w-[17px] h-[17px]">
              <DynamicIcon
                name={workspaceLink.icon}
                height={17}
                width={17}
                DClassName="absolute opacity-100 group-hover:opacity-0 transition-all top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
              />
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <div
                className={`absolute 
								${openFolder ? "rotate-90" : "rotate-0"}
								opacity-0 group-hover:opacity-100 transition-all top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}
                onClick={() => setOpenFolder((prev) => !prev)}
              >
                <IoIosArrowForward />
              </div>
            </div>
            <Link
              href={`/workspace/${workspaceLink.workspace}/${workspaceLink._id}`}
              className="hover:underline leading-[0%]"
              onClick={() => {
                addNewRecentWorkspace(
                  workspaceLink._id,
                  workspaceLink.workspace,
                  workspaceLink.title ? workspaceLink.title : "undefined",
                  workspaceLink.icon ? workspaceLink.icon : "axon_logo.svg",
                  workspaceLink.cover ? workspaceLink.cover : "",
                );
              }}
            >
              {workspaceLink.title
                ? workspaceLink.title.length > 18
                  ? `${workspaceLink.title.substring(0, 10)}...`
                  : workspaceLink.title
                : "Empty page"}
            </Link>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="md:opacity-0 relative active:scale-90 group-hover:opacity-100  hover:bg-neutral-900 p-[3px]  rounded-md"
              onClick={addNewSubWorkspace}
            >
              <IoIosAdd />
            </button>
            <div
              ref={bsThreeDotsRef}
              className="md:opacity-0 relative active:scale-90 group-hover:opacity-100 p-[3px] hover:bg-neutral-900  rounded-md"
            >
              <BsThreeDots onClick={handleModalOperation} />
            </div>
          </div>
        </div>

        {openFolder &&
          (workspaceLink?.subPages && workspaceLink?.subPages?.length !== 0 ? (
            openFolder && (
              <div className="flex ml-2 border-l-2 pl-2 border-neutral-800 flex-col mt-1 gap-1">
                {workspaceLink?.subPages?.map((subPage) => {
                  return (
                    <WorkspaceFolder
                      key={subPage._id}
                      workspaceLink={subPage}
                    />
                  );
                })}
              </div>
            )
          ) : (
            <p className="text-[13px] pl-3 opacity-35 my-1">Reached end</p>
          ))}
      </div>
    </>
  );
};

export default Workspace;

const WorkspaceFolder = ({
  workspaceLink,
}: {
  workspaceLink: IUserWorkspace;
}) => {
  const [openFolder, setOpenFolder] = useState<boolean>(false);
  const { createSubParentWorkspace } = useCreateNewSubParentWorkspace();
  const path = usePathname();
  const isActive = path.includes(workspaceLink._id);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { addNewSubWorkspaceById, addNewRecentWorkspace, removeWorkspace } =
    useWorkspaceStore();
  const router = useRouter();
  const { user } = useAuthStore();

  const [modalPosition, setModalPosition] = useState({
    x: 0,
    y: 0,
  });
  const bsThreeDotsRef = useRef<HTMLDivElement>(null);
  const handleModalOperation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bsThreeDotsRef.current) return;
    const { top, left } = bsThreeDotsRef.current.getBoundingClientRect();

    setModalPosition({
      x: left,
      y: window.innerHeight < top + 300 ? top - 285 : top,
    });

    setOpenModal((prev) => !prev);
  };

  const addNewSubWorkspace = () => {
    if (!user?._id) return;
    const { newWorkspaceId, newWorkspaceType, newWorkspaceParentPageId } =
      addNewSubWorkspaceById(
        workspaceLink._id,
        user._id,
        workspaceLink.workspace,
      );

    if (newWorkspaceParentPageId) {
      createSubParentWorkspace({
        _id: newWorkspaceId,
        parentPageId: newWorkspaceParentPageId,
        workspace: newWorkspaceType,
        createdBy: user._id,
        removeWorkspace,
      });
    }

    router.push(`/workspace/${newWorkspaceType}/${newWorkspaceId}`);
  };

  return (
    <div className="flex flex-col fade-in-0 animate-in">
      <div
        key={workspaceLink.title}
        className={`flex py-1 px-1 rounded-lg hover:bg-accent group cursor-pointer items-center justify-between text-[13px] ${isActive ? "bg-accent opacity-100" : "opacity-60"} hover:opacity-100 transition-all  gap-[10px]`}
      >
        <div className="flex flex-shrink-0 items-center gap-[10px]">
          <div className="relative w-[17px] h-[17px]">
            <DynamicIcon
              name={workspaceLink.icon}
              height={17}
              width={17}
              DClassName="absolute opacity-100 group-hover:opacity-0 transition-all top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
            />
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className={`absolute 
								${openFolder ? "rotate-90" : "rotate-0"}
								opacity-0 group-hover:opacity-100 transition-all top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}
              onClick={() => setOpenFolder((prev) => !prev)}
            >
              <IoIosArrowForward />
            </div>
          </div>
          <Link
            onClick={() => {
              addNewRecentWorkspace(
                workspaceLink._id,
                workspaceLink.workspace,
                workspaceLink.title ? workspaceLink.title : "undefined",
                workspaceLink.icon ? workspaceLink.icon : "axon_logo.svg",
                workspaceLink.cover ? workspaceLink.cover : "",
              );
            }}
            href={`/workspace/${workspaceLink.workspace}/${workspaceLink._id}`}
            className="text-nowrap hover:underline "
          >
            {workspaceLink.title
              ? workspaceLink.title.length > 18
                ? `${workspaceLink.title.substring(0, 10)}...`
                : workspaceLink.title
              : "Empty page"}
          </Link>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            className="opacity-0 relative active:scale-90 group-hover:opacity-100  hover:bg-neutral-900 p-[3px]  rounded-md"
            onClick={addNewSubWorkspace}
          >
            <IoIosAdd />
          </button>
          <div
            ref={bsThreeDotsRef}
            className="opacity-0 relative active:scale-90 group-hover:opacity-100 p-[3px] hover:bg-neutral-900  rounded-md"
          >
            <BsThreeDots onClick={handleModalOperation} />
          </div>
        </div>
      </div>
      {openModal && user?._id && (
        <DynamicWorkspaceModal
          workspaceId={workspaceLink._id}
          setModal={setOpenModal}
          userId={user._id}
          workspaceType={workspaceLink.workspace}
          top={modalPosition.y}
          left={modalPosition.x}
          triggerRef={bsThreeDotsRef as React.RefObject<HTMLElement>}
        />
      )}
      {openFolder && (
        <div className="flex border-l-2 ml-2 border-neutral-800 pl-2 gap-1 flex-col mt-1">
          {workspaceLink?.subPages && workspaceLink?.subPages?.length !== 0 ? (
            workspaceLink?.subPages?.map((folderName) => {
              return (
                <WorkspaceFolder
                  key={folderName._id}
                  workspaceLink={folderName}
                />
              );
            })
          ) : (
            <p className="text-[13px] opacity-35">No workspace here</p>
          )}
        </div>
      )}
    </div>
  );
};
