"use client";

import useWorkspaceUtils from "@/hooks/useWorkspaceUtils";
import { useEffect, useRef, useState } from "react";
import type { IRoutes } from "@/types";
import WorkspaceTopBar from "./WorkspaceTopBar";
import WorkspaceCover from "./WorkspaceCover";
import dynamic from "next/dynamic";
import { useWorkspaceStore } from "@/stores/workspace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

// dynamically loading heavy editor to load the workspace faster
const DynamicAxonEditor = dynamic(
  () => import("@/components/AxonEditor/axonEditor"),
  {
    ssr: false,
    loading: () => (
      <p className=" py-[20px] max-w-5xl flex flex-col gap-4 mx-auto px-[50px] animate-pulse">
        <Skeleton className="h-[20px] w-full bg-neutral-800" />
        <Skeleton className="h-[20px] w-full bg-neutral-800" />
        <Skeleton className="h-[20px] w-full bg-neutral-800" />
        <Skeleton className="h-[20px] w-full bg-neutral-800" />
        <Skeleton className="h-[20px] w-full bg-neutral-800" />
      </p>
    ),
  },
);

const AxonWorkspace = ({
  workspaceId,
  workspaceType,
}: {
  workspaceId: string;
  workspaceType: string;
}) => {
  const { findWorkspace, findRoutes } = useWorkspaceUtils();
  const workspaceStore = useWorkspaceStore();
  const currentWorkspace = findWorkspace(workspaceId, workspaceType);

  // states
  const [folders, setFolders] = useState<IRoutes[]>([]);

  // folder refs as we don't want them to render
  const folderRef = useRef<IRoutes[]>([]);

  // This is a function to show all the parent, parent, and even their parent workspace
  // kind of similar to a folder path in a terminal like /parent/subParent/workspace
  const traversePreviousNodes = (node: IRoutes, nodes: IRoutes[]) => {
    const someList: IRoutes[] = [node, ...nodes];
    folderRef.current = someList;

    if (node.parentPageId === null) return;

    const parentNode = findRoutes(node.parentPageId, workspaceType);

    if (parentNode) {
      traversePreviousNodes(parentNode, someList);
    }
  };

  // if the current workspace exist we execute the traversePreviousNodes function to populate the folder ref :3
  if (currentWorkspace) {
    const demoObject: IRoutes = {
      _id: currentWorkspace._id,
      workspace: currentWorkspace.workspace,
      title: currentWorkspace.title || "untitled",
      parentPageId: currentWorkspace?.parentPageId,
    };
    traversePreviousNodes(demoObject, []);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    //setting the folder data in a state
    setFolders(() => folderRef.current);
  }, [workspaceStore.workspace]);

  // showing loading animations till all the workspaces are fetched
  if (!workspaceStore.allWorkspacesFetched) {
    return (
      <div className="h-screen  w-full ">
        <Skeleton className="bg-neutral-900 animate-pulse h-[248px] w-full" />
        <div className=" py-[20px] w-full flex flex-col gap-4 mx-auto px-[50px] animate-pulse">
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
          <Skeleton className="h-[20px] w-full bg-neutral-800" />
        </div>
      </div>
    );
  }

  // Tell user that the current workspace doesn't exists incase not found
  if (!currentWorkspace) {
    return (
      <div className="h-screen gap-3 w-full flex-col flex items-center justify-center">
        <div className="space-y-5 translate-y-[-50px]">
          <Image
            src="/assets/axon_logo.svg"
            height={32}
            width={32}
            alt="axon logo"
            className="mx-auto"
          />
          <div className="text-center">
            <p className="text-xl font-bold">
              This workspace doesn&apos;t exists
            </p>
            <div>
              Go back to&nbsp;
              <Link
                href={"/"}
                className="text-neutral-400 hover:underline hover:text-neutral-50"
              >
                home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <WorkspaceTopBar currentWorkspace={currentWorkspace} folders={folders} />
      <WorkspaceCover currentWorkspace={currentWorkspace} />
      <div className="min-h-[200vh]">
        <DynamicAxonEditor
          currentWorkspace={currentWorkspace}
          workspaceId={currentWorkspace._id}
        />
      </div>
    </>
  );
};

export default AxonWorkspace;
