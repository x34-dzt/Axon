"use client";
import { useEffect, useRef, useState } from "react";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  EditorCommandList,
  EditorBubble,
} from "novel";
import { handleCommandNavigation } from "novel";
import { useDebouncedCallback } from "use-debounce";
import { Separator } from "@/components/ui/separator";
import { defaultExtensions } from "./extension";
import { slashCommand, suggestionItems } from "./slashCommand";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-button";
import { ColorSelector } from "./selectors/color-selector";
import { type IUserWorkspace, useWorkspaceStore } from "@/stores/workspace";
import { Code, Image } from "lucide-react";
import useUpdateWorkspaceContent from "@/hooks/workspace/useUpdateWorkspaceContent";
import useGetWorkspaceContent from "@/hooks/workspace/useGetContent";
import { Skeleton } from "../ui/skeleton";
import useCreateNewParentWorkspace from "@/hooks/workspace/useCreateParentWorkspace";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { Editor } from "@tiptap/core";
import {
  addDeletedImage,
  removeDeletedImage,
  deletedImagesMap,
  setCurrentWorkspace,
  getCurrentWorkspace,
  getDeletedImagesExceptWorkspace,
  getDeletedImagesForCurrentWorkspace,
} from "@/lib/deletedImages";
import useDeleteImagesByUrl from "@/hooks/workspace/useDeleteImagesByUrl";
import { TableBubbleMenu } from "./tableBubble";
import { AxonAiModal } from "./AxonAi";

const extensions = [...defaultExtensions, slashCommand];

interface EditorProp {
  workspaceId: string;
  currentWorkspace: IUserWorkspace;
  initialValue?: string;
}

const extractImageUrls = (content: any): string[] => {
  const urls: string[] = [];
  const traverse = (node: any) => {
    if (node.type === "image" && node.attrs?.src) {
      urls.push(node.attrs.src);
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  };
  if (content?.content) {
    content.content.forEach(traverse);
  }
  return urls;
};

const AxonEditor = ({ currentWorkspace, workspaceId }: EditorProp) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAxonAiModal, setOpenAxonAiModal] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [editor, setEditor] = useState<Editor | null>(null);

  const previousImageUrls = useRef<string[]>([]);
  const deleteImagesMutation = useDeleteImagesByUrl();

  const {
    removeWorkspace,
    addNewParentWorkspace,
    updateSavingContent,
    updateWorkspaceContent,
  } = useWorkspaceStore();
  const { createParentWorkspace } = useCreateNewParentWorkspace();
  const { updateWorkspaceContentOnServer } = useUpdateWorkspaceContent();
  const { fetchWorkspaceContent } = useGetWorkspaceContent();
  const { user } = useAuthStore();
  const router = useRouter();

  const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    updateSavingContent({
      workspaceId,
      workspaceType: currentWorkspace.workspace,
      savingStatus: true,
    });

    const editorData = editor.getJSON();
    updateWorkspaceContent(workspaceId, currentWorkspace.workspace, editorData);

    if (editor) {
      await updateWorkspaceContentOnServer({
        workspaceId,
        content: editor.getJSON(),
      });
    }

    updateSavingContent({
      workspaceId,
      workspaceType: currentWorkspace.workspace,
      savingStatus: false,
    });
  }, 500);

  useEffect(() => {
    setWorkspaceContent();
  }, []);

  useEffect(() => {
    const previousWs = getCurrentWorkspace();
    setCurrentWorkspace(workspaceId);

    if (previousWs && previousWs !== workspaceId) {
      const imagesToDelete = getDeletedImagesExceptWorkspace(workspaceId);
      if (imagesToDelete.length > 0) {
        deleteImagesMutation.mutate(imagesToDelete);
      }
    }
  }, [workspaceId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const imagesToDelete = getDeletedImagesForCurrentWorkspace();
      if (imagesToDelete.length > 0) {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/workspace/image/delete-by-url`,
          JSON.stringify({ imageUrls: imagesToDelete }),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const setWorkspaceContent = async () => {
    if (currentWorkspace.content !== null) {
      setLoading(true);
      const response = await fetchWorkspaceContent(workspaceId);
      const content = response?.data?.content ? response.data.content : null;
      updateWorkspaceContent(workspaceId, currentWorkspace.workspace, content);
      setLoading(false);
    }
  };

  const handleAddWorkspace = (workspaceType: "main" | "axonverse") => {
    if (!user?._id) return;
    const { newWorkspaceId, newWorkspaceType } = addNewParentWorkspace(
      workspaceType,
      user._id,
    );
    createParentWorkspace({
      _id: newWorkspaceId,
      createdBy: user._id,
      workspace: newWorkspaceType,
      removeWorkspace: removeWorkspace,
    });
    router.push(`/workspace/${newWorkspaceType}/${newWorkspaceId}`);
  };

  if (loading) {
    return <WorkspaceLoader />;
  }

  return (
    <div
      spellCheck="false"
      className={`rounded-xl fade-in-0 animate-in ${currentWorkspace.workspaceWidth === "sm" ? "lg:w-[1024px] w-full" : "w-full"} custom-transition-all mx-auto flex relative items-center justify-center px-[16px] md:px-[50px]`}
    >
      <EditorRoot>
        <EditorContent
          immediatelyRender={false}
          initialContent={currentWorkspace?.content ?? undefined}
          className={"w-full"}
          extensions={extensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            setEditor(editor);

            const currentImageUrls = extractImageUrls(editor.getJSON());

            const newlyDeleted = previousImageUrls.current.filter(
              (url) =>
                !currentImageUrls.includes(url) && !deletedImagesMap[url],
            );

            if (newlyDeleted.length > 0) {
              newlyDeleted.forEach((url) => {
                addDeletedImage(url, workspaceId);
              });
            } else {
              previousImageUrls.current = currentImageUrls;
            }

            const restored = Object.keys(deletedImagesMap).filter((url) =>
              currentImageUrls.includes(url),
            );
            restored.forEach((url) => {
              removeDeletedImage(url);
            });

            if (restored.length > 0) {
              previousImageUrls.current = currentImageUrls;
            }

            debouncedUpdates(editor);
            updateSavingContent({
              workspaceId,
              workspaceType: currentWorkspace.workspace,
              savingStatus: true,
            });
          }}
          onCreate={({ editor }) => {
            setEditor(editor);
          }}
        >
          <span />
          <EditorCommand className="z-50 bg-neutral-900/80 backdrop-blur-lg h-auto max-h-[330px] overflow-y-auto rounded-md border-neutral-800 border-2 px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              <EditorCommandItem
                value={"Axon ai"}
                onCommand={({ editor, range }) => {
                  setOpenAxonAiModal((prev) => !prev);
                  const { view } = editor;
                  const { top, left } = view.coordsAtPos(range.from);
                  setCursorPosition({ x: left, y: top });
                  editor.chain().focus().deleteRange(range).run();
                }}
                className={
                  "flex w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                }
              >
                <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center rounded-md border-2 border-neutral-700 border-muted bg-background">
                  <Code size={18} />
                </div>
                <div>
                  <p className="font-medium">Axon AI</p>
                  <p className="text-xs text-muted-foreground">
                    Ask ai to do your tasks.
                  </p>
                </div>
              </EditorCommandItem>
              <EditorCommandItem
                value={"image"}
                onCommand={({ editor, range }) => {
                  editor.chain().focus().deleteRange(range).run();
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async () => {
                    if (input.files?.length) {
                      const file = input.files[0];
                      editor.commands.insertAxonImage(file);
                    }
                  };
                  input.click();
                }}
                className={
                  "flex w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                }
              >
                <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center rounded-md border-2 border-neutral-700 border-muted bg-background">
                  <Image size={18} />
                </div>
                <div>
                  <p className="font-medium">Image</p>
                  <p className="text-xs text-muted-foreground">
                    Add image to your notes
                  </p>
                </div>
              </EditorCommandItem>
              <EditorCommandItem
                value={"Create a new page"}
                onCommand={({ editor, range }) => {
                  editor.chain().focus().deleteRange(range).run();
                  handleAddWorkspace(currentWorkspace.workspace);
                }}
                className={
                  "flex w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                }
              >
                <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center rounded-md border-2 border-neutral-700 border-muted bg-background">
                  <Code size={18} />
                </div>
                <div>
                  <p className="font-medium">New page</p>
                  <p className="text-xs text-muted-foreground">
                    Create a new page
                  </p>
                </div>
              </EditorCommandItem>

              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className={
                    "flex w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                  }
                  key={item.title}
                >
                  <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center rounded-md border-2 border-neutral-700 border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <TableBubbleMenu editor={editor} />

          <EditorBubble
            tippyOptions={{ placement: "top" }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-2xl border-2 border-neutral-800 bg-accent/40 backdrop-blur-lg shadow-xl"
          >
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector
              open={openColor}
              onOpenChange={setOpenColor}
              setIsOpen={setOpenNode}
              isOpen={openNode}
            />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>

      {true && (
        <AxonAiModal
          editor={editor}
          open={openAxonAiModal}
          onClose={() => setOpenAxonAiModal(false)}
          position={cursorPosition}
        />
      )}
    </div>
  );
};

export default AxonEditor;

const WorkspaceLoader = () => {
  return (
    <p className="py-[20px] max-w-5xl flex flex-col gap-4 mx-auto px-[50px] animate-pulse">
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
    </p>
  );
};
