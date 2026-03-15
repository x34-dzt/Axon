"use client";

import {
  useWorkspaceStore,
  type IUserWorkspace,
  type Tab,
} from "@/stores/workspace";
import type { IRoutes } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward, IoIosAdd } from "react-icons/io";
import dynamic from "next/dynamic";
const DynamicWorkspaceModal = dynamic(() => import("./workspaceModal"));
import { useAuthStore } from "@/stores/auth";
import DynamicTopBarIcon from "../ui/DynamicTopBarIcon";
import DynamicIcon from "../ui/DynamicIcon";
import { FiSidebar } from "react-icons/fi";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useCreateNewParentWorkspace from "@/hooks/workspace/useCreateParentWorkspace";

const R = 18;

const ConcaveLeft = () => (
  <svg
    width={R}
    height={R}
    viewBox={`0 0 ${R} ${R}`}
    className="absolute bottom-0 pointer-events-none fill-accent"
    style={{ left: -R }}
  >
    <path d={`M ${R} 0 Q ${R} ${R} 0 ${R} L ${R} ${R} Z`} />
  </svg>
);

const ConcaveRight = () => (
  <svg
    width={R}
    height={R}
    viewBox={`0 0 ${R} ${R}`}
    className="absolute bottom-0 pointer-events-none fill-accent"
    style={{ right: -R }}
  >
    <path d={`M 0 0 Q 0 ${R} ${R} ${R} L 0 ${R} Z`} />
  </svg>
);

// ─── BrowserTab ───────────────────────────────────────────────────────────────

const BrowserTab = ({
  tab,
  index,
  isActive,
  isDragging,
  onTabClick,
  onTabClose,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  tab: Tab;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  onTabClick: (workspaceId: string) => void;
  onTabClose: (workspaceId: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) => {
  const workspaceStore = useWorkspaceStore();

  const workspaceList =
    tab.workspaceType === "main"
      ? workspaceStore.workspace.main
      : workspaceStore.workspace.axonverse;

  const workspace = workspaceList?.find((w) => w._id === tab.workspaceId);
  const currentTitle = workspace?.title || tab.title || "Untitled";
  const currentIcon = workspace?.icon ?? null;

  return (
    <div
      draggable
      onClick={() => onTabClick(tab.workspaceId)}
      onDragStart={(e) => {
        // Use a transparent 1×1 image so the browser ghost is invisible;
        // the tab's own opacity change serves as the visual cue.
        const ghost = document.createElement("div");
        ghost.style.position = "absolute";
        ghost.style.top = "-9999px";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`
        group relative flex items-center gap-1.5 px-3 pt-1.5 pb-[10px]
        select-none min-w-28 max-w-48 shrink-0
        transition-opacity duration-150
        ${isActive ? "z-10 cursor-pointer" : "z-0 hover:bg-accent/20 rounded-t-lg cursor-grab active:cursor-grabbing"}
        ${isDragging ? "opacity-40" : "opacity-100"}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 rounded-t-lg bg-accent"
          transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
        >
          <ConcaveLeft />
          <ConcaveRight />
        </motion.div>
      )}

      <DynamicIcon
        name={currentIcon}
        height={15}
        width={15}
        className="relative z-10 shrink-0 translate-y-[0.3px]"
      />
      <span
        className={`relative z-10 text-sm truncate flex-1 ${
          isActive ? "font-semibold text-foreground" : "text-muted-foreground"
        }`}
      >
        {currentTitle}
      </span>

      <AnimatePresence>
        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              type: "tween",
              duration: 0.4,
              ease: [0.76, 0, 0.24, 1],
            }}
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.workspaceId);
            }}
            className="relative z-10 p-0.5 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors flex-shrink-0"
          >
            <X size={12} />
          </motion.button>
        )}
        {!isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.workspaceId);
            }}
            className="relative z-10 p-0.5 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          >
            <X size={12} />
          </button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Drop indicator ───────────────────────────────────────────────────────────

const DropIndicator = () => (
  <motion.div
    layout
    initial={{ opacity: 0, scaleY: 0.5 }}
    animate={{ opacity: 1, scaleY: 1 }}
    exit={{ opacity: 0, scaleY: 0.5 }}
    transition={{ duration: 0.12 }}
    className="w-0.5 h-6 rounded-full bg-primary shrink-0 self-center mb-1"
  />
);

// ─── WorkspaceTopBar ──────────────────────────────────────────────────────────

const WorkspaceTopBar = ({
  currentWorkspace,
  folders,
}: {
  currentWorkspace: IUserWorkspace;
  folders: IRoutes[];
}) => {
  const router = useRouter();
  const workspaceStore = useWorkspaceStore();
  const { user } = useAuthStore();
  const { createParentWorkspace } = useCreateNewParentWorkspace();

  const { tabs, activeTabId, addTab, removeTab, setActiveTab, reorderTabs } =
    workspaceStore;

  // ── Drag state ──────────────────────────────────────────────────────────────
  // sourceIndexRef: doesn't need to trigger renders — used purely for calculation
  const sourceIndexRef = useRef<number | null>(null);
  // dragSourceIndex: used only to dim the dragged tab (needs a render)
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  // dragOverIndex: 0…tabs.length — the slot where the indicator should appear
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    sourceIndexRef.current = index;
    setDragSourceIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Insert before or after the hovered tab depending on cursor x position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const insertIndex = e.clientX < midX ? index : index + 1;
    setDragOverIndex(insertIndex);
  };

  // When dragging over the tab strip background (past the last tab)
  const handleStripDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Only update if we're not already hovering an individual tab
    // (individual tab's onDragOver fires first and takes priority)
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const from = sourceIndexRef.current;
    if (from === null || dragOverIndex === null) return;

    // Adjust target index to account for the removed element
    let to = dragOverIndex > from ? dragOverIndex - 1 : dragOverIndex;

    if (to !== from) {
      reorderTabs(from, to);
    }

    sourceIndexRef.current = null;
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    sourceIndexRef.current = null;
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  // ── Existing tab / routing logic ────────────────────────────────────────────
  useEffect(() => {
    if (currentWorkspace && currentWorkspace._id) {
      const existingTab = tabs.find(
        (tab) => tab.workspaceId === currentWorkspace._id,
      );
      if (!existingTab) {
        addTab(
          currentWorkspace._id,
          currentWorkspace.workspace,
          currentWorkspace.title || "Untitled",
          currentWorkspace.icon,
        );
      } else {
        setActiveTab(currentWorkspace._id);
      }
    }
  }, [currentWorkspace?._id]);

  const handleTabClick = (workspaceId: string) => {
    const tab = tabs.find((t) => t.workspaceId === workspaceId);
    if (tab) {
      setActiveTab(workspaceId);
      router.push(`/workspace/${tab.workspaceType}/${workspaceId}`);
    }
  };

  const handleTabClose = (workspaceId: string) => {
    const wasActive = activeTabId === workspaceId;
    removeTab(workspaceId);

    if (wasActive) {
      const remainingTabs = tabs.filter((t) => t.workspaceId !== workspaceId);
      if (remainingTabs.length > 0) {
        const newActiveTab = remainingTabs[0];
        router.push(
          `/workspace/${newActiveTab.workspaceType}/${newActiveTab.workspaceId}`,
        );
      } else {
        router.push("/");
      }
    }
  };

  const handleAddWorkspace = async () => {
    if (!user?._id || !currentWorkspace) return;

    const workspaceType = currentWorkspace.workspace;
    const { newWorkspaceId, newWorkspaceType } =
      workspaceStore.addNewParentWorkspace(workspaceType, user._id);
    createParentWorkspace({
      _id: newWorkspaceId,
      createdBy: user._id,
      workspace: newWorkspaceType,
      removeWorkspace: workspaceStore.removeWorkspace,
    });
    addTab(newWorkspaceId, newWorkspaceType, "Untitled", "axon_logo.svg");
    router.push(`/workspace/${newWorkspaceType}/${newWorkspaceId}`);
  };

  return (
    <div className="flex z-[100] workspace-top-bar bg-customMain/90 top-0 sticky items-end border-accent border-b">
      {/* Sidebar + history controls */}
      <div className="flex ml-2 gap-2 pl-2 py-2 pb-3 shrink-0">
        <HandleSidebar />
        <HandleHistoryNavigation />
      </div>

      <div className="w-px h-5 bg-accent/40 mx-2 mb-3 rounded-full shrink-0" />

      {/* ── Tab strip ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-end pt-1 overflow-visible"
        onDragOver={handleStripDragOver}
        onDrop={handleDrop}
      >
        {tabs.map((tab, index) => (
          <div key={tab.workspaceId} className="flex items-end">
            {/* Drop indicator BEFORE this tab */}
            <AnimatePresence>
              {dragOverIndex === index && <DropIndicator />}
            </AnimatePresence>

            <BrowserTab
              tab={tab}
              index={index}
              isActive={activeTabId === tab.workspaceId}
              isDragging={dragSourceIndex === index}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          </div>
        ))}

        {/* Drop indicator AFTER the last tab */}
        <AnimatePresence>
          {dragOverIndex === tabs.length && <DropIndicator />}
        </AnimatePresence>

        <button
          onClick={handleAddWorkspace}
          className="flex items-center justify-center w-8 h-8 mb-1 ml-1 rounded-md hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IoIosAdd size={20} />
        </button>
      </div>
    </div>
  );
};
export default WorkspaceTopBar;

// ─── HandleHistoryNavigation ──────────────────────────────────────────────────

const HandleHistoryNavigation = () => {
  const router = useRouter();
  return (
    <>
      <button type="button" className="group">
        <IoIosArrowBack
          className="group-active:scale-90"
          onClick={() => {
            router.back();
          }}
        />
      </button>
      <button type="button" className="group">
        <IoIosArrowForward
          className="group-active:scale-90"
          onClick={() => {
            router.forward();
          }}
        />
      </button>
    </>
  );
};

// ─── HandleSidebar ────────────────────────────────────────────────────────────

const HandleSidebar = () => {
  const { openNavHandler } = useWorkspaceStore();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        openNavHandler();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [openNavHandler]);

  return (
    <button className="hover:bg-neutral-800/20 rounded-md group">
      <FiSidebar
        height={30}
        width={30}
        onClick={openNavHandler}
        className="active:scale-90"
      />
    </button>
  );
};

// ─── BreadCrumb ───────────────────────────────────────────────────────────────

const BreadCrumb = ({
  currentWorkspace,
  folders,
}: {
  currentWorkspace: IUserWorkspace;
  folders: IRoutes[];
}) => {
  const { user } = useAuthStore();
  const bsThreeDotsRef = useRef<HTMLDivElement>(null);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleModalOperation = () => {
    setOpenModal((prev) => !prev);
    if (!bsThreeDotsRef.current) return;
    const { top, left } = bsThreeDotsRef.current.getBoundingClientRect();
    setModalPosition({
      x: left,
      y: top,
    });
  };

  return (
    <div className="flex gap-10 relative items-center">
      <div className="flex gap-2 items-center">
        <DynamicTopBarIcon
          height={15}
          width={15}
          name={currentWorkspace.icon}
          className="select-none"
        />
        <div className="text-[13px] items-center gap-[5px] flex">
          {folders.map((folder, index) => {
            return (
              <Link
                href={`/workspace/${folder.workspace}/${folder._id}`}
                key={folder._id}
              >
                {folder._id === currentWorkspace?._id ? (
                  <span className="hover:underline shadow_topBar--text">
                    {folder.title}
                  </span>
                ) : (
                  <span className="text-neutral-300 hover:underline">
                    {folder.title}
                  </span>
                )}
                {index !== folders.length - 1 && " /"}
              </Link>
            );
          })}
          <div className="bg-white rounded-[2.5px] shadow_topBar--box flex items-center justify-center h-[15px] w-[15px] text-black text-[11px] leading-tight">
            <span className="font-bold">
              {currentWorkspace.workspace === "main" ? "M" : "O"}
            </span>
          </div>
        </div>
      </div>
      <div ref={bsThreeDotsRef}>
        <BsThreeDots
          className="hover:bg-white active:opacity-50 hover:text-black cursor-pointer transition-all rounded-[2.5px] hover:shadow_topBar--box"
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
  );
};
