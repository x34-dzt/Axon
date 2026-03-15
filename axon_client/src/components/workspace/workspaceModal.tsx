"use client";

import useWorkspaceUtils from "@/hooks/useWorkspaceUtils";
import { useWorkspaceStore } from "@/stores/workspace";
import type React from "react";
import { type SetStateAction, useEffect, useRef, useState } from "react";
import { FiTrash2, FiEdit, FiShare2, FiCopy } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { MdOutlineCancel } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import { LuArrowLeftRight, LuExternalLink } from "react-icons/lu";
import WorkspaceModalMoveToSectionFolder from "./WorkspaceModalMoveToSectionFolder";
import useUpdateWorkspaceTitle from "@/hooks/workspace/useUpdateWorkspaceTitle";
import useDeleteWorkspace from "@/hooks/workspace/useDeleteWorkspace";
import { Switch } from "../ui/switch";
import useUpdateWorkspaceWIdth from "@/hooks/workspace/useUpdateWorkspaceWIdth";
import { LiaBookReaderSolid } from "react-icons/lia";
import { TbNotes } from "react-icons/tb";
import useCreateBlog from "@/hooks/blogs/useCreateBlog";
import { motion, AnimatePresence } from "framer-motion";
import useUpdateBlogs from "@/hooks/blogs/useUpdateBlogs";
import { GrDocumentConfig } from "react-icons/gr";
import useDeleteBlog from "@/hooks/blogs/useDeleteABlog";
import DynamicIcon from "../ui/DynamicIcon";

interface WorkspaceModalProps {
  workspaceId: string;
  workspaceType: "main" | "axonverse";
  userId: string;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  top: number;
  left: number;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

interface INameState {
  openSetNameModal: boolean;
  nameOfBanner: string;
}

const WorkspaceModal = ({
  workspaceId,
  workspaceType,
  setModal,
  userId,
  top,
  left,
  triggerRef,
}: WorkspaceModalProps) => {
  const workspace = useWorkspaceUtils();
  const {
    updateWorkspaceWidth,
    updateWorkspaceTitleById,
    addNewSubWorkspaceById,
    removeWorkspace,
    updateSavingContent,
    blogIdOperation,
  } = useWorkspaceStore();

  // custom hooks to interact with the server through api
  const { updateWorkspaceTitle } = useUpdateWorkspaceTitle();
  const { deleteWorkspaceById } = useDeleteWorkspace();
  const { updateWorkspaceWidth: updateWorkspaceWidthOnServer } =
    useUpdateWorkspaceWIdth();
  const { turnToBlog } = useCreateBlog();
  const { updateBlog } = useUpdateBlogs();
  const modalRef = useRef<HTMLDivElement>(null);

  // finding the current workspace
  const currentWorkspace = workspace.findWorkspace(workspaceId, workspaceType);

  //states
  const [loadingBlogOperation, setLoadingBlogOperation] =
    useState<boolean>(false);
  const [moveToHover, setMoveToHover] = useState<boolean>(false);
  const [blogOptionHover, setBlogOptionHover] = useState<boolean>(false);
  const [newName, setNewName] = useState<INameState>({
    openSetNameModal: false,
    nameOfBanner: currentWorkspace?.title as string,
  });

  // refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isRenameModalOpenRef = useRef(newName.openSetNameModal);
  const renameButtonRef = useRef<HTMLButtonElement>(null);

  // keep ref in sync with state
  useEffect(() => {
    isRenameModalOpenRef.current = newName.openSetNameModal;
  }, [newName.openSetNameModal]);

  // focusing the input element when we open the rename modal input modal
  useEffect(() => {
    if (newName.openSetNameModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newName.openSetNameModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef?.current?.contains(event.target as Node)) {
        return;
      }
      if (renameButtonRef.current?.contains(event.target as Node)) {
        return;
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setModal, triggerRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isRenameModalOpenRef.current) {
          setNewName((prev) => ({ ...prev, openSetNameModal: false }));
        } else {
          setModal(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setModal]);

  // if the current workspace is not found entirely, then we don't show the modal
  if (!currentWorkspace) return null;

  /**
		Functions to perform workspace modal operations
	**/

  // handling rename of file
  const handleUpdateRenameOfTitle = (userId: string, workspaceId: string) => {
    // validating title
    if (newName.nameOfBanner.trim().length === 0) return;

    // toggling the saving state so user get the feedback the content is getting updated
    updateSavingContent({
      workspaceId: currentWorkspace._id,
      workspaceType: currentWorkspace.workspace,
      savingStatus: true,
    });

    // using the function from the useWorkspaceStore to update the title recursively by id
    updateWorkspaceTitleById(workspaceId, newName.nameOfBanner, workspaceType);

    // updating the workspace title by Id through backend by storing or saving it in the database
    updateWorkspaceTitle({
      userId,
      workspaceId,
      newTitle: newName.nameOfBanner,
      oldTitle: currentWorkspace.title,
      workspaceType,
      updateWorkspaceTitleById,
    });

    // togging the saving content loading state to false as the workspace was updated
    updateSavingContent({
      workspaceId: currentWorkspace._id,
      workspaceType: currentWorkspace.workspace,
      savingStatus: false,
    });
  };

  // handle delete workspace
  const handleDeleteWorkspace = (
    workspaceId: string,
    workspaceType: "main" | "axonverse",
  ) => {
    // toggling the saving state so user get the feedback the content is getting updated
    updateSavingContent({
      workspaceId: currentWorkspace._id,
      workspaceType: currentWorkspace.workspace,
      savingStatus: true,
    });

    // remove the workspace from the client
    removeWorkspace(workspaceId, workspaceType);

    // delete the workspace from the database through backend
    deleteWorkspaceById({ workspaceId, workspaceType });

    // toggling the saving state so user get the feedback of loading
    updateSavingContent({
      workspaceId: currentWorkspace._id,
      workspaceType: currentWorkspace.workspace,
      savingStatus: false,
    });
  };

  // function to handle the width
  const handleUpdateWidth = () => {
    // toggling loading
    updateSavingContent({
      workspaceId: currentWorkspace._id,
      workspaceType: currentWorkspace.workspace,
      savingStatus: true,
    });
    // storing old width, in case error occur we can revert it
    const oldWidth = currentWorkspace.workspaceWidth;
    // new updated width
    const updatedWidth = currentWorkspace.workspaceWidth === "sm" ? "lg" : "sm";

    // update the workspace width on the client side
    updateWorkspaceWidth(currentWorkspace._id, workspaceType, updatedWidth);

    // update the workspace width on the backend
    updateWorkspaceWidthOnServer({
      workspaceId,
      workspaceType,
      newWidth: updatedWidth,
      oldWidth,
      updateWorkspaceWidth,
    });

    // again the loading state to false
    updateSavingContent({
      workspaceId: currentWorkspace._id,
      workspaceType: currentWorkspace.workspace,
      savingStatus: false,
    });
  };

  const handleBlogOperations = async () => {
    // if the current blog is null then we allow the user to convert this workspace into a blog
    if (currentWorkspace.blogId === null) {
      const { blogId } = await turnToBlog({
        workspaceId,
        setLoading: setLoadingBlogOperation,
      });

      // once we receive the blogId from the backend we store in that particular workspace
      if (blogId) {
        blogIdOperation(
          currentWorkspace._id,
          blogId,
          currentWorkspace.workspace,
          // add operation since we are adding the workspace id
          "add",
        );
      }
    } else {
      // since the blog Id was present already
      // we update the blog
      await updateBlog({
        blogId: currentWorkspace.blogId,
        setLoading: setLoadingBlogOperation,
      });
    }
  };

  return (
    <div
      ref={modalRef}
      style={{ top: top - 2, left: left + 26 }}
      className="fixed shadow-lg shadow-lg z-[9999] rounded-xl bg-customMain/80 border-neutral-800 border w-[250px] h-auto"
    >
      <div className="parent_backdrop--blur p-[0.40rem] ">
        <div className="relative  h-full w-full">
          {newName.openSetNameModal && (
            <div className="absolute z-[5] duration-300 rename flex-col top-0  left-[70%] bg-none overflow-hidden rounded-xl">
              <div className="parent_backdrop--blur bg-customMain/70 border-neutral-800 border rounded-xl flex py-2 pr-2 pl-4 items-center gap-3">
                <DynamicIcon
                  name={currentWorkspace.icon}
                  className="size-[20px] translate-y-[0.2px]"
                />
                <Input
                  placeholder="Enter a new name"
                  ref={inputRef}
                  className="ring-0 animate-in fade-in-0 border border-border min-w-96 bg-neutral-900 backdrop-blur-md text-base focus-visible:ring-offset-0 focus-visible:ring-0"
                  value={newName.nameOfBanner}
                  onChange={(e) => {
                    setNewName((prev) => {
                      return {
                        ...prev,
                        nameOfBanner: e.target.value,
                      };
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateRenameOfTitle(userId, workspaceId);
                      setNewName((prev) => ({
                        ...prev,
                        openSetNameModal: false,
                      }));
                    }
                  }}
                />
                {/* <div className="flex animate-in fade-in-0 gap-[0.40rem]"> */}
                {/*   <Button */}
                {/*     size="sm" */}
                {/*     className="bg-neutral-900 text-sm hover:bg-green-900/50 text-white group" */}
                {/*     onClick={() => { */}
                {/*       handleUpdateRenameOfTitle(userId, workspaceId); */}
                {/*       setModal(() => false); */}
                {/*     }} */}
                {/*   > */}
                {/*     <span className="group-active:scale-[0.97] transition-transform duration-150"> */}
                {/*       Change */}
                {/*     </span> */}
                {/*   </Button> */}
                {/*   <Button */}
                {/*     size={"sm"} */}
                {/*     onClick={() => { */}
                {/*       setNewName((prev) => { */}
                {/*         return { */}
                {/*           ...prev, */}
                {/*           openSetNameModal: false, */}
                {/*         }; */}
                {/*       }); */}
                {/*     }} */}
                {/*     className="bg-neutral-900 text-sm animate-in fade-in-0 group hover:bg-neutral-800 text-white" */}
                {/*   > */}
                {/*     <span className="group-active:scale-[0.97] transition-transform duration-150"> */}
                {/*       Cancel */}
                {/*     </span> */}
                {/*   </Button> */}
                {/* </div> */}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-col animate-in fade-in-0 gap-[0.40rem]">
            <button
              type="button"
              ref={renameButtonRef}
              onClick={() => {
                setNewName((prev) => ({
                  ...prev,
                  openSetNameModal: !prev.openSetNameModal,
                }));
              }}
              className="flex group w-full relative items-center gap-3 py-1 px-2 hover:bg-neutral-800 rounded-md cursor-pointer"
            >
              <FiEdit
                className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                size={18}
              />
              <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                Rename
              </span>
            </button>
            <button
              type="button"
              className="flex group items-center w-full gap-3 py-1 px-2 hover:bg-neutral-800   rounded-md cursor-pointer"
              onClick={() => {
                addNewSubWorkspaceById(
                  currentWorkspace._id,
                  userId,
                  workspaceType,
                );
              }}
            >
              <IoAdd
                className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                size={18}
              />
              <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                Add a new sub workspace
              </span>
            </button>
            <button
              type="button"
              className="p-2 h-[30px] text-neutral-300 group    rounded-lg text-[13px] hover:bg-neutral-800 w-full flex items-center justify-between transition-all"
            >
              <div className="gap-[12px] flex items-center">
                <LiaBookReaderSolid className="text-neutral-400 h-[19px] w-[19px]  group-hover:translate-x-1 group-hover:opacity-100 transition-all group-hover:text-white" />
                <span className="text-neutral-400 group-hover:translate-x-1 group-hover:opacity-100 transition-all group-hover:text-white">
                  Note view
                </span>
              </div>
              <Switch
                onClick={handleUpdateWidth}
                checked={currentWorkspace.workspaceWidth === "sm"}
                className="bg-neutral-700"
              />
            </button>
            {/* biome-ignore lint/a11y/useKeyWithMouseEvents: <explanation> */}
            <div
              className="flex relative z-[1000] group items-center gap-3 py-1 px-2 hover:bg-neutral-800 rounded-md cursor-pointer"
              onMouseOver={() => setMoveToHover(() => true)}
              onMouseLeave={() => setMoveToHover(() => false)}
            >
              <LuArrowLeftRight
                className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                size={18}
              />
              <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                Move to
              </span>
              {moveToHover && (
                <WorkspaceMoveToModal
                  userId={userId}
                  workspaceType={workspaceType}
                  workspaceId={workspaceId}
                  setMoveToHover={setMoveToHover}
                />
              )}
            </div>
            <button
              type="button"
              className="p-2 h-[30px] text-neutral-300 group    rounded-lg text-[13px] hover:bg-neutral-800 w-full flex items-center justify-between transition-all"
              onClick={handleBlogOperations}
              disabled={loadingBlogOperation}
            >
              <div className="gap-[12px] flex items-center">
                <AnimatePresence mode="wait">
                  {loadingBlogOperation ? (
                    <motion.div
                      key="spinner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-neutral-400 h-[18px] w-[18px]  group-hover:translate-x-1 transition-all group-active:scale-90 "
                    >
                      <CgSpinner className="animate-spin h-full w-full text-neutral-400 group-hover:text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-neutral-400  h-[18px] w-[18px] group-hover:translate-x-1 transition-all group-active:scale-90 "
                    >
                      <TbNotes className="h-full w-full text-neutral-400 group-hover:text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="text-neutral-400 group-hover:translate-x-1 group-hover:opacity-100 transition-all group-hover:text-white">
                  {currentWorkspace.blogId ? "Update blog" : "Turn it to blog"}
                </span>
              </div>
            </button>

            {currentWorkspace.blogId !== null && (
              <>
                {/* biome-ignore lint/a11y/useKeyWithMouseEvents: <explanation> */}
                <div
                  className="flex relative z-[10] group items-center gap-3 py-1 px-2 hover:bg-neutral-800   rounded-md cursor-pointer"
                  onMouseOver={() => setBlogOptionHover(() => true)}
                  onMouseLeave={() => setBlogOptionHover(() => false)}
                >
                  <GrDocumentConfig
                    className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                    size={16}
                  />
                  <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                    Blog options
                  </span>
                  {blogOptionHover && (
                    <BlogOptionModal
                      blogId={currentWorkspace.blogId}
                      setBlogOptionHover={setBlogOptionHover}
                      workspaceId={currentWorkspace._id}
                      workspaceType={currentWorkspace.workspace}
                    />
                  )}
                </div>
              </>
            )}

            <button
              className="flex w-full group items-center gap-3 py-1 px-2 hover:bg-neutral-800   rounded-md cursor-pointer"
              type="button"
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                  toast("Link copied to clipboard", {
                    description: url,
                    action: {
                      label: "Open",
                      onClick: () => window.open(url, "_blank"),
                    },
                  });
                });
              }}
            >
              <FiShare2
                className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                size={18}
              />
              <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                Share
              </span>
            </button>

            <button
              type="button"
              className="flex w-full group items-center gap-3 py-1 px-2 hover:bg-red-800/50 rounded-md cursor-pointer"
              onClick={() => handleDeleteWorkspace(workspaceId, workspaceType)}
            >
              <FiTrash2
                className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                size={18}
              />
              <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                Trash
              </span>
            </button>

            <button
              className="flex group w-full items-center gap-3 py-1 px-2 hover:bg-neutral-800   rounded-md cursor-pointer"
              type="button"
              onClick={() => setModal(() => false)}
            >
              <MdOutlineCancel
                className="text-neutral-400 group-hover:translate-x-1 transition-all group-active:scale-90 "
                size={18}
              />
              <span className="text-sm text-neutral-300 group-hover:translate-x-1 transition-all opacity-75 group-hover:opacity-100">
                Close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModal;

type TWorkspaceMoveToModalProps = {
  setMoveToHover: React.Dispatch<SetStateAction<boolean>>;
  workspaceId: string;
  userId: string;
  workspaceType: "main" | "axonverse";
};

// workspace move modal to allow user to move a workspace to a different workspace
const WorkspaceMoveToModal = ({
  setMoveToHover,
  workspaceId,
  userId,
  workspaceType,
}: TWorkspaceMoveToModalProps) => {
  const workspaceStore = useWorkspaceStore();

  return (
    <div
      className="absolute z-[1000] select-none group rounded-xl right-[-60%] top-0 drop-shadow-xl backdrop-blur-md bg-customMain/80"
      onMouseLeave={() => setMoveToHover(() => false)}
    >
      <div className="relative p-[0.40rem] rounded-xl w-[250px] border-neutral-800 border bg-neutral-950/50">
        <p className="text-[13px] text-neutral-600 pl-3">main</p>
        <div className="max-h-[150px] overflow-y-auto  p-[0.40rem] flex flex-col gap-[0.40rem]">
          {workspaceStore.workspace?.main?.map((workspaceLink) => {
            if (workspaceLink._id !== workspaceId) {
              return (
                <WorkspaceModalMoveToSectionFolder
                  currentWorkspaceId={workspaceId}
                  workspaceLink={workspaceLink}
                  key={workspaceLink.title}
                  userId={userId}
                  currentWorkspaceType={workspaceType}
                />
              );
            }
          })}
        </div>

        <p className="text-[13px] text-neutral-600 pl-3">axonverse</p>
        <div className="max-h-[150px] overflow-y-auto  p-[0.40rem] flex flex-col gap-[0.40rem]">
          {workspaceStore.workspace?.axonverse?.map((workspaceLink) => {
            if (workspaceLink._id !== workspaceId) {
              return (
                <WorkspaceModalMoveToSectionFolder
                  currentWorkspaceId={workspaceId}
                  userId={userId}
                  workspaceLink={workspaceLink}
                  key={workspaceLink.title}
                  currentWorkspaceType={workspaceType}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

const BlogOptionModal = ({
  blogId,
  setBlogOptionHover,
  workspaceId,
  workspaceType,
}: {
  blogId: string;
  setBlogOptionHover: React.Dispatch<SetStateAction<boolean>>;
  workspaceId: string;
  workspaceType: "main" | "axonverse";
}) => {
  // custom hook functions to interact with the backend api
  const { deleteBlog } = useDeleteBlog();

  // blog id operation is used here again to remove the blog if from the workspace
  const { blogIdOperation } = useWorkspaceStore();

  // states
  const [deletingBlog, setDeletingBlog] = useState<boolean>(false);

  // function to handle delete blog
  const handleDeleteBlog = async () => {
    await deleteBlog({ blogId, setLoading: setDeletingBlog });
    blogIdOperation(workspaceId, blogId, workspaceType, "remove");
  };

  return (
    <div
      className="absolute select-none rounded-xl right-[-80%] top-0"
      onMouseLeave={() => setBlogOptionHover(() => false)}
    >
      <div className="relative p-[0.40rem] flex flex-col gap-[0.40rem] rounded-xl w-[250px] border-neutral-800 border bg-neutral-950/50">
        <a
          href={`${process.env.NEXT_PUBLIC_WEB_URL}/blog/${blogId}`}
          className="flex w-full group items-center gap-3 py-1 px-2 hover:bg-neutral-800   rounded-md cursor-pointer"
          target="_blank"
          rel="noreferrer"
        >
          <LuExternalLink
            className="text-neutral-300  transition-all "
            size={18}
          />
          <span className="text-sm text-neutral-300 transition-all">
            Open blog
          </span>
        </a>
        <button
          type="button"
          onClick={handleDeleteBlog}
          disabled={deletingBlog}
          className="p-2 h-[30px] text-neutral-300 group  rounded-lg text-[13px] hover:bg-neutral-800 w-full flex items-center justify-between transition-all"
        >
          <div className="gap-[12px] flex items-center">
            <AnimatePresence mode="wait">
              {deletingBlog ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-neutral-400 h-[18px] w-[18px]  transition-all  "
                >
                  <CgSpinner className="animate-spin h-full w-full text-neutral-400 group-hover:text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-neutral-400  h-[18px] w-[18px] "
                >
                  <FiTrash2 className="h-full w-full text-neutral-400 " />
                </motion.div>
              )}
            </AnimatePresence>

            <span className="text-neutral-300 transition-all">
              Delete the blog
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
