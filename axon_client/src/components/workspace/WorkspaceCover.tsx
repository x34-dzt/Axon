import { useWorkspaceStore, type IUserWorkspace } from "@/stores/workspace";
import Image from "next/image";
import React, { useEffect, useState, type ChangeEvent } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import useUploadCover from "@/hooks/workspace/useUploadCover";
import { toast } from "sonner";
import useUpdateYCoverPosition from "@/hooks/workspace/useUpdateCoverYPos";
import dynamic from "next/dynamic";
const IconModal = dynamic(() => import("./IconModal"), {
  ssr: false,
});

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import useRemoveCover from "@/hooks/workspace/useRemoveCover";

const DynamicWorkspaceIcon = dynamic(
  () => import("../ui/DynamicWorkspaceIcon"),
  {
    ssr: false,
  },
);

const WorkspaceCover = ({
  currentWorkspace,
}: {
  currentWorkspace: IUserWorkspace;
}) => {
  const currentWorkspaceTitle = currentWorkspace.title
    ? currentWorkspace.title
    : "Untitled";

  // stores
  const workspace = useWorkspaceStore();
  const { updateSavingContent, savingContent } = useWorkspaceStore();

  // helper function to upload the cover
  const { mutate: uploadCover, isPending } = useUploadCover();

  // states
  const [yPos, setYPos] = useState<number>(currentWorkspace.coverPos);
  const [openIconModal, setOpenIconModal] = useState<boolean>(false);

  const handleSelectedIcon = (icon: string | null) => {
    workspace.updateWorkspaceIcon(
      currentWorkspace._id,
      currentWorkspace.workspace,
      icon,
    );
  };

  const { handleRemoveCoverFromServer } = useRemoveCover();

  const {
    isError,
    mutate: updateYCoverPositionOnServer,
    data,
    isPending: updatingCoverYPosition,
  } = useUpdateYCoverPosition();

  const removeCover = () => {
    const currentCoverImage = currentWorkspace.cover;
    try {
      workspace.removeWorkspaceCover(
        currentWorkspace._id,
        currentWorkspace.workspace,
      );
      handleRemoveCoverFromServer({ workspaceId: currentWorkspace._id });
    } catch (error) {
      workspace.updateWorkspaceCover(
        currentWorkspace._id,
        currentWorkspace.workspace,
        currentCoverImage as string,
      );
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      // toggling the saving state
      updateSavingContent({
        workspaceId: currentWorkspace._id,
        workspaceType: currentWorkspace.workspace,
        savingStatus: true,
      });
      const file = event.target.files?.[0];

      // validating data
      if (!file) {
        throw new Error("Invalid image.");
      }

      // uploading the cover
      uploadCover(
        {
          workspaceId: currentWorkspace._id,
          file: file,
        },
        {
          onSuccess: (data) => {
            workspace.updateWorkspaceCover(
              currentWorkspace._id,
              currentWorkspace.workspace,
              data.data.url,
            );
            updateSavingContent({
              workspaceId: currentWorkspace._id,
              workspaceType: currentWorkspace.workspace,
              savingStatus: false,
            });
          },
          onError: (error) => {
            if (error.response?.data) {
              toast.error(error.response.data.message, {
                className: "bg-neutral-900 border border-neutral-800",
                action: {
                  label: "Close",
                  onClick: () => {},
                },
              });
              updateSavingContent({
                workspaceId: currentWorkspace._id,
                workspaceType: currentWorkspace.workspace,
                savingStatus: false,
              });
            } else {
              toast.error("An unexpected error occurred", {
                description:
                  "Check the internet connection or contact the developer",
                className: "bg-neutral-900 border border-neutral-800",
              });
              updateSavingContent({
                workspaceId: currentWorkspace._id,
                workspaceType: currentWorkspace.workspace,
                savingStatus: false,
              });
            }
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          className: "bg-neutral-900 border border-neutral-800",
        });
      }
    } finally {
      // toggling off the loading
      updateSavingContent({
        workspaceId: currentWorkspace._id,
        workspaceType: currentWorkspace.workspace,
        savingStatus: false,
      });
    }
  };

  // handling YPos
  const handleTheYPos = (yPos: number) => {
    setYPos(() => yPos);
    workspace.updateWorkspaceCoverYPosition(
      currentWorkspace._id,
      currentWorkspace.workspace,
      yPos,
    );
    updateYCoverPositionOnServer({
      workspaceId: currentWorkspace._id,
      yPos,
    });
  };

  return (
    <div
      className={`${currentWorkspace.cover ? "h-[290px]" : "h-[200px]"} group transition-all relative w-full `}
    >
      <div className=" fade-in-0 animate-in relative w-full h-full">
        <div className="bg-gradient-to-b from-slate-50/0 via-[#0F0F0F]/60 to-[#0F0F0F] to-[83%] h-full w-full select-none absolute z-[5] top-0 left-0" />

        <div className="absolute top-0 z-[10] w-full left-0">
          <div className="h-full relative opacity-0 group-hover:opacity-100 transition-all  w-full">
            <div className="flex gap-2 absolute top-[24px] right-[24px]">
              <label className="bg-[#262626]/50 hover:bg-[#262626] backdrop-blur-lg  transition-all cursor-pointer text-[13px] rounded-md px-[15px] py-[8px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className=" hidden w-0 h-0"
                  disabled={isPending}
                />
                {currentWorkspace.cover ? (
                  <span>
                    {isPending ? "Changing cover..." : "Change cover"}
                  </span>
                ) : isPending ? (
                  <span className="animate-pulse">Uploading...</span>
                ) : (
                  <span>Upload and image</span>
                )}
              </label>
              {currentWorkspace.cover && (
                <button
                  onClick={removeCover}
                  type="button"
                  className="p-2 w-fit rounded-sm bg-[#262626]/50 hover:bg-[#262626] backdrop-blur-lg transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* remove the asset when uploading images to cloud */}
        {currentWorkspace.cover ? (
          <Image
            src={`${currentWorkspace?.cover}`}
            alt={`${currentWorkspace.title}`}
            height={250}
            width={250}
            className={
              "w-full transition-all relative z-[1] h-full object-cover"
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

        {/* Limit yPos to stay within 0-100% range */}
        <div className="absolute active:opacity-60 items-end opacity-0 group-hover:opacity-100 top-[74px] flex flex-col gap-2 right-[24px] z-[10]">
          <button
            onClick={() =>
              handleTheYPos(
                Math.max(0, Math.min(currentWorkspace.coverPos - 10, 100)),
              )
            }
            type="button"
            className="p-2 w-fit rounded-sm active:opacity-60 bg-[#262626]/50 hover:bg-[#262626] backdrop-blur-lg transition-all"
          >
            <IoIosArrowUp size={13} />
          </button>
          <button
            onClick={() =>
              handleTheYPos(
                Math.max(0, Math.min(currentWorkspace.coverPos + 10, 100)),
              )
            }
            type="button"
            className="p-2 w-fit active:opacity-60 rounded-sm bg-[#262626]/50 hover:bg-[#262626] backdrop-blur-lg transition-all"
          >
            <IoIosArrowDown size={13} />
          </button>
        </div>
        <div
          className={`-translate-y-[83px] pl-[50px] custom-transition-all ${currentWorkspace.workspaceWidth === "sm" ? "w-[958px]  translate-x-[-35px] pl-0" : "w-full"}  mx-auto relative z-1  flex gap-2 items-end z-[10]`}
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <button
              type="button"
              onClick={() => setOpenIconModal((prev) => !prev)}
              className="active:opacity-20"
            >
              <div className="mr-2">
                <DynamicWorkspaceIcon
                  name={currentWorkspace.icon}
                  height={30}
                  width={30}
                  IconClassName="translate-x-[5px]"
                />
              </div>
            </button>
            <div className="absolute ">
              {openIconModal && (
                <IconModal
                  handleSelectedIcon={handleSelectedIcon}
                  workspaceId={currentWorkspace._id}
                  currentIcon={currentWorkspace.icon}
                  setIconModal={setOpenIconModal}
                />
              )}
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="text-[13px] translate-y-1 translate-x-1 relative inline-block leading-loose ">
              <span className="opacity-60">Welcome to</span>
              <img
                src="/assets/curve_line.svg"
                className="absolute top-[65%] -translate-y-[50%] -left-[20px]"
                alt="curve line"
              />
            </div>
            <h1
              className={`text-[30px] ${savingContent.workspaceId === currentWorkspace._id && savingContent.savingStatus ? "animate-pulse" : ""} leading-tight font-semibold`}
            >
              {currentWorkspaceTitle}
            </h1>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCover;
