"use client";

import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import type { TNavigationWorkspaceContent } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import dynamic from "next/dynamic";

const DynamicIcon = dynamic(() => import("../ui/DynamicIcon"), {
  ssr: false,
});

const DynamicWorkspaceModal = dynamic(() => import("./workspaceModal"), {
  ssr: false,
});

const RecentWorkspace = () => {
  const workspaceStore = useWorkspaceStore();
  const path = usePathname();
  const recentRaw = workspaceStore.workspace.recent;
  const { user } = useAuthStore();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    _id: string;
    workspaceType: string;
  } | null>(null);

  if (!recentRaw || recentRaw.length === 0) return null;

  const recent = [...new Map(recentRaw.map((w) => [w._id, w])).values()].slice(
    0,
    3,
  );

  const handleModalOperation = (e: React.MouseEvent, workspace: TNavigationWorkspaceContent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setModalPosition({
      x: window.innerWidth < 500 ? rect.left - 200 : rect.left - 200,
      y: window.innerHeight < rect.top + 300 ? rect.top - 275 : rect.top,
    });
    setSelectedWorkspace({ _id: workspace._id, workspaceType: workspace.workspaceType });
    setOpenModal((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-1 pb-3">
      <div className="text-neutral-500 text-[11px] pb-2">Recents</div>
      {openModal && user?._id && selectedWorkspace && (
        <DynamicWorkspaceModal
          workspaceId={selectedWorkspace._id}
          setModal={setOpenModal}
          userId={user._id}
          workspaceType={selectedWorkspace.workspaceType as "main" | "axonverse"}
          top={modalPosition.y}
          left={modalPosition.x}
        />
      )}
      <div className="flex flex-col gap-1">
        {recent.map((recentWorkspace: TNavigationWorkspaceContent) => {
          const isActive = path.includes(recentWorkspace._id);

          return (
            <div
              key={recentWorkspace._id}
              className={`py-1 px-1 rounded-lg flex select-none relative z-[10] group cursor-pointer items-center justify-between text-[13px] hover:bg-accent ${isActive ? "bg-secondary/40 opacity-100" : "opacity-60"} hover:opacity-100 transition-all gap-1`}
            >
              <div className="flex items-center gap-[10px]">
                <div className="relative hover:bg-neutral-900 transition-all rounded-md w-[17px] h-[17px]">
                  <DynamicIcon
                    name={recentWorkspace.icon}
                    height={17}
                    width={17}
                    DClassName="absolute opacity-100 group-hover:opacity-0 transition-all top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
                  />
                </div>
                <Link
                  href={`/workspace/${recentWorkspace.workspaceType}/${recentWorkspace._id}`}
                  className="hover:underline leading-[0%]"
                >
                  {recentWorkspace.title
                    ? recentWorkspace.title.length > 18
                      ? `${recentWorkspace.title.substring(0, 10)}...`
                      : recentWorkspace.title
                    : "Empty page"}
                </Link>
              </div>
              <div
                className="md:opacity-0 relative active:scale-90 group-hover:opacity-100 p-[3px] hover:bg-neutral-900 rounded-md"
              >
                <BsThreeDots onClick={(e) => handleModalOperation(e, recentWorkspace)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentWorkspace;

