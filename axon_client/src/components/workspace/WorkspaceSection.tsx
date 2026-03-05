"use client";

import { useWorkspaceStore, type WorkspaceStore } from "@/stores/workspace";
import Workspace from "./Workspace";
import { IoIosAdd } from "react-icons/io";
import { useAuthStore } from "@/stores/auth";
import useCreateNewParentWorkspace from "@/hooks/workspace/useCreateParentWorkspace";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import type { AxonError } from "@/types";
import { useRouter } from "next/navigation";

const WorkspaceSection = () => {
  const workspaceStore = useWorkspaceStore();
  const { allWorkspacesFetched, handleAllWorkspacesLoaded } =
    useWorkspaceStore();
  const { user } = useAuthStore();
  const { createParentWorkspace } = useCreateNewParentWorkspace();
  const router = useRouter();

  const handleAddWorkspace = (workspaceType: "main" | "axonverse") => {
    if (!user?._id) return;
    const { newWorkspaceId, newWorkspaceType } =
      workspaceStore.addNewParentWorkspace(workspaceType, user._id);
    createParentWorkspace({
      _id: newWorkspaceId,
      createdBy: user._id,
      workspace: newWorkspaceType,
      removeWorkspace: workspaceStore.removeWorkspace,
    });
    router.push(`/workspace/${newWorkspaceType}/${newWorkspaceId}`);
  };

  const fetchWorkspaces = async (): Promise<WorkspaceStore> => {
    const serverWorkspaces = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workspace/workspaces`,
      {
        withCredentials: true,
      },
    );
    return serverWorkspaces.data;
  };

  const { data, isLoading, error, isError } = useQuery<
    WorkspaceStore,
    AxonError
  >({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    refetchOnWindowFocus: false,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (data) {
      workspaceStore.addMainWorkspaces(data.data?.main ?? []);
      workspaceStore.addAxonverseWorkspaces(data.data?.axonverse ?? []);
    }
  }, [data]);

  useEffect(() => {
    handleAllWorkspacesLoaded(!isLoading);
  }, [isLoading, handleAllWorkspacesLoaded]);

  useEffect(() => {
    if (isError) {
      toast.error(error.response?.data?.message || error.message, {
        description: "Failed to fetch the workspaces",
        className: "bg-neutral-900 border border-neutral-800",
        action: {
          label: "Close",
          onClick: () => console.log("closed error notification"),
        },
      });
    }
  }, [error, isError]);

  return (
    <>
      <div className="text-[11px] flex items-center justify-between gap-1 group ">
        <span className="text-neutral-500">main</span>
        {!isLoading && (
          <button
            type="button"
            onClick={() => handleAddWorkspace("main")}
            className="opacity-0 group-hover:opacity-100 scale-[1.5]"
          >
            <IoIosAdd className="opacity-60 hover:opacity-100 active:scale-[0.9]" />
          </button>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="bg-neutral-800 w-full h-[23px]" />
      ) : (
        workspaceStore.workspace?.main?.map((workspaceLink) => {
          return (
            <Workspace workspaceLink={workspaceLink} key={workspaceLink._id} />
          );
        })
      )}
      {isLoading ? (
        <Skeleton className="bg-neutral-800 w-full h-[23px]" />
      ) : (
        workspaceStore.workspace.main?.length === 0 && (
          <button
            type="button"
            onClick={() => handleAddWorkspace("main")}
            className="opacity-100 text-[13px] justify-between p-1 bg-neutral-900 hover:bg-neutral-800 transition-all rounded-md px-2 flex gap-1 items-center"
          >
            Create main workspace
            <IoIosAdd className="opacity-60 hover:opacity-100 active:scale-[0.9]" />
          </button>
        )
      )}
      <div className="text-[10px] flex items-center justify-between gap-1 group ">
        <span className="text-neutral-500">axonverse</span>
        {!isLoading && (
          <button
            type="button"
            onClick={() => {
              handleAddWorkspace("axonverse");
            }}
            className="opacity-0 group-hover:opacity-100 scale-[1.5]"
          >
            <IoIosAdd className="opacity-60 hover:opacity-100 active:scale-[0.9]" />
          </button>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="bg-neutral-800 w-full h-[23px]" />
      ) : (
        workspaceStore.workspace?.axonverse?.map((workspaceLink) => {
          return (
            <Workspace workspaceLink={workspaceLink} key={workspaceLink._id} />
          );
        })
      )}
      {isLoading ? (
        <Skeleton className="bg-neutral-800 w-full h-[23px]" />
      ) : (
        workspaceStore.workspace.axonverse?.length === 0 && (
          <button
            type="button"
            onClick={() => {
              handleAddWorkspace("axonverse");
            }}
            className="opacity-100 text-nowrap text-[13px] justify-between p-1 bg-neutral-900 hover:bg-neutral-800 transition-all rounded-md px-2 flex gap-1 items-center"
          >
            Create workspace
            <IoIosAdd className="opacity-60 hover:opacity-100 active:scale-[0.9]" />
          </button>
        )
      )}
      <div className="h-[100px] w-full b" />
    </>
  );
};

export default WorkspaceSection;
