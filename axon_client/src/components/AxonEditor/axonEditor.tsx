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
import ReactDom from "react-dom/server";
import { Separator } from "@/components/ui/separator";
import { defaultExtensions } from "./extension";
import { slashCommand, suggestionItems } from "./slashCommand";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-button";
import { ColorSelector } from "./selectors/color-selector";
import { type IUserWorkspace, useWorkspaceStore } from "@/stores/workspace";
import { Code, Image } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import ReactMarkdown from "react-markdown";
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
    console.log("=== WORKSPACE CHANGE ===");
    console.log("Previous workspace:", previousWs);
    console.log("Current workspace:", workspaceId);

    setCurrentWorkspace(workspaceId);

    if (previousWs && previousWs !== workspaceId) {
      console.log("Workspace changed from:", previousWs, "to:", workspaceId);
      const imagesToDelete = getDeletedImagesExceptWorkspace(workspaceId);
      console.log("Images to delete (except current):", imagesToDelete);
      if (imagesToDelete.length > 0) {
        console.log("Deleting images for other workspaces...");
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

  // function to update the workspace content
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

  // showing workspace loader
  if (loading) {
    return <WorkspaceLoader />;
  }

  return (
    <div
      spellCheck="false"
      className={`rounded-xl fade-in-0 animate-in ${currentWorkspace.workspaceWidth === "sm" ? "lg:w-[1024px] w-full" : "w-full"} custom-transition-all mx-auto flex relative items-center justify-center  px-[16px] md:px-[50px]`}
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
        >
          <span />
          <EditorCommand className="z-50 bg-neutral-900/80 backdrop-blur-lg  h-auto max-h-[330px] overflow-y-auto rounded-md border-neutral-800 border-2 px-1 py-2  shadow-md transition-all">
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
                  setCursorPosition({
                    x: left,
                    y: top,
                  });
                  editor.chain().focus().deleteRange(range).run();
                }}
                className={
                  "flex  w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                }
              >
                <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center  rounded-md border-2  border-neutral-700 border-muted bg-background">
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
                      const pos = editor.view.state.selection.from;
                      console.log(
                        "Calling uploadFn with file:",
                        file,
                        "and position:",
                        pos,
                      );
                      console.log("hello world");
                      editor.commands.insertAxonImage(file);
                    }
                  };
                  input.click();
                }}
                className={
                  "flex  w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                }
              >
                <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center  rounded-md border-2  border-neutral-700 border-muted bg-background">
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
                  "flex  w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                }
              >
                <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center  rounded-md border-2  border-neutral-700 border-muted bg-background">
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
                    "flex  w-full group items-center space-x-2 transition-all cursor-pointer rounded-md px-2 py-1 text-left text-sm hover:bg-neutral-800 aria-selected:bg-neutral-800"
                  }
                  key={item.title}
                >
                  <div className="flex h-10 bg-neutral-900 w-10 items-center justify-center  rounded-md border-2  border-neutral-700 border-muted bg-background">
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

          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw]  overflow-hidden rounded-md border-2 border-neutral-800 bg-neutral-900/50 backdrop-blur-lg shadow-xl"
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
      {openAxonAiModal && (
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

// axon ai modal to allow user to type the axon ai
const AxonAiModal = ({
  onClose,
  position,
  editor,
}: {
  open: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  editor: Editor | null;
}) => {
  const [inputText, setInputText] = useState("");
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const generateResponse = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/generate",
        {
          prompt: inputText,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response);
      if (response.data.text) {
        setGeminiResponse(response.data.text);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    const htmlString = ReactDom.renderToString(
      <ReactMarkdown>{geminiResponse}</ReactMarkdown>,
    );
    if (editor) {
      editor.chain().focus().insertContent(htmlString).run();
      setInputText("");
      onClose();
    }
  };

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, []);

  return (
    <div
      className={
        "fixed  p-4 w-[600px] bg-neutral-900/50 backdrop-blur-md shadow-lg border-2 border-neutral-800 rounded-lg"
      }
      style={{
        top: `${position.y + 10}px`,
        left: `${position.x + 10}px`,
      }}
    >
      <div className={`${loading ? "animate-pulse" : "animate-none"}`}>
        <div className="flex justify-between items-center fade-in-0 animate-in">
          <h3 className="text-white font-bold">Axon AI</h3>
        </div>
        {geminiResponse && (
          <div className="animate-in fade-in-0">
            Response:
            <div className="bg-neutral-800 p-2 max-h-[200px] overflow-y-auto rounded-md">
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300 prose-pre:bg-neutral-800 prose-code:text-white">
                <ReactMarkdown>{geminiResponse}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        {error && (
          <p className="text-red-500 text-[13px]">
            Error generating response: {error}
          </p>
        )}
        <div className="mt-2 text-white fade-in-0 animate-in">
          <textarea
            rows={1}
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask ai anything.."
            className="ring-0 animate-in fade-in-0 rounded-md focus:border-none focus:outline-none px-2 py-1 w-full border-0 bg-neutral-900 backdrop-blur-md focus-visible:ring-offset-0 focus-visible:ring-0"
          />
        </div>
        <div className="mt-2 flex gap-2">
          {geminiResponse && (
            <Button
              onClick={handleInsert}
              size="sm"
              className="bg-neutral-800 animate-in fade-in-0 hover:bg-neutral-700"
            >
              Insert
            </Button>
          )}
          <Button
            onClick={generateResponse}
            disabled={loading}
            size="sm"
            className={`bg-neutral-800 hover:bg-neutral-700 ${loading && "animate-pulse"}`}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>

          <Button
            onClick={onClose}
            size="sm"
            className="bg-neutral-800 hover:bg-neutral-700"
          >
            {geminiResponse ? "Discard" : "Close"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const WorkspaceLoader = () => {
  return (
    <p className=" py-[20px] max-w-5xl flex flex-col gap-4 mx-auto px-[50px] animate-pulse">
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
      <Skeleton className="h-[20px] w-full bg-neutral-800" />
    </p>
  );
};
