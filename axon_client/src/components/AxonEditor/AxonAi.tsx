"use client";

import { Editor } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ReactDom from "react-dom/server";
import { User } from "lucide-react";

type TextPart = { type: "text"; text: string };

type ToolCallPart = {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  input: unknown;
};

type ToolResultPart = {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  output: { type: "json"; value: unknown };
};

type UserMessage = { role: "user"; content: string | TextPart[] };
type AssistantMessage = {
  role: "assistant";
  content: (TextPart | ToolCallPart)[];
};
type ToolMessage = { role: "tool"; content: ToolResultPart[] };

type LLMMessage = UserMessage | AssistantMessage | ToolMessage;

interface DisplayMessage {
  role: "user" | "assistant";
  text: string;
  didInsert?: boolean;
}

const AxonAiMascot = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="23.1955" height="23" rx="5" fill="white" />
    <rect
      x="5"
      y="5"
      width="4.3985"
      height="8.79699"
      rx="2.19925"
      fill="black"
    />
    <rect
      x="13.797"
      y="5"
      width="4.3985"
      height="8.79699"
      rx="2.19925"
      fill="black"
    />
    <path
      d="M6.9549 16.436C6.9549 16.436 8.17485 17.9999 9.12031 17.9999C10.0658 17.9999 11.6466 16.436 11.6466 16.436"
      stroke="black"
    />
    <path
      d="M11.6466 16.436C11.6466 16.436 13.2275 17.9999 14.1729 17.9999C15.1184 17.9999 16.3383 16.436 16.3383 16.436"
      stroke="black"
    />
  </svg>
);

interface StreamCallbacks {
  onTextDelta: (delta: string) => void;
  onToolCalling: (toolCallId: string, toolName: string, input: unknown) => void;
  onToolOutput: (toolCallId: string, toolName: string, output: unknown) => void;
}

async function readUIStream(
  body: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const toolCallIdToName = new Map<string, string>();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;

      try {
        const chunk = JSON.parse(payload) as {
          type: string;
          [k: string]: unknown;
        };

        if (chunk.type === "text-delta") {
          callbacks.onTextDelta(chunk.delta as string);
        }

        // tool-input-available → model decided to call a tool, input is ready
        if (chunk.type === "tool-input-available") {
          const toolCallId = chunk.toolCallId as string;
          const toolName = chunk.toolName as string;
          const input = chunk.input;
          toolCallIdToName.set(toolCallId, toolName);
          callbacks.onToolCalling(toolCallId, toolName, input);
        }

        // tool-output-available → execute() result is ready
        if (chunk.type === "tool-output-available") {
          const toolCallId = chunk.toolCallId as string;
          const toolName = toolCallIdToName.get(toolCallId);
          if (toolName) {
            callbacks.onToolOutput(toolCallId, toolName, chunk.output);
          }
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

const AxonAiModal = ({
  onClose,
  editor,
}: {
  open: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  editor: Editor | null;
}) => {
  const [displayHistory, setDisplayHistory] = useState<DisplayMessage[]>([
    {
      role: "user",
      text: "hello",
      didInsert: false,
    },
    {
      role: "assistant",
      text: "hello how are you?",
      didInsert: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [toolStatus, setToolStatus] = useState<"idle" | "calling" | "done">(
    "idle",
  );

  const llmMessages = useRef<LLMMessage[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const inputEmpty = inputText.trim() === "";
  const hasHistory = displayHistory.length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayHistory, streamingText]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        abortRef.current?.abort();
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    abortRef.current?.abort();
    // Reset both display and LLM history
    setDisplayHistory([]);
    llmMessages.current = [];
    onClose();
  };

  const handleSend = async () => {
    const prompt = inputText.trim();
    if (!prompt || loading) return;

    setInputText("");
    setLoading(true);
    setStreamingText("");
    setToolStatus("idle");

    const userLLM: UserMessage = {
      role: "user",
      content: [{ type: "text", text: prompt }],
    };
    llmMessages.current = [...llmMessages.current, userLLM];

    setDisplayHistory((prev) => [...prev, { role: "user", text: prompt }]);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Send the full proper LLM message history
        body: JSON.stringify({ messages: llmMessages.current }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body)
        throw new Error(`Request failed: ${res.status}`);

      let fullText = "";
      const toolCalls: ToolCallPart[] = [];
      const toolResults: ToolResultPart[] = [];
      let didInsert = false;

      await readUIStream(res.body, {
        onTextDelta: (delta) => {
          fullText += delta;
          setStreamingText(fullText);
        },

        onToolCalling: (toolCallId, toolName, input) => {
          toolCalls.push({ type: "tool-call", toolCallId, toolName, input });
          if (toolName === "insert_text") setToolStatus("calling");
        },

        onToolOutput: (toolCallId, toolName, output) => {
          toolResults.push({
            type: "tool-result",
            toolCallId,
            toolName,
            output: { type: "json", value: output },
          });

          if (toolName === "insert_text" && editor) {
            const result = output as { content: string };
            const html = ReactDom.renderToString(
              <ReactMarkdown>{result.content}</ReactMarkdown>,
            );
            editor.chain().focus().insertContent(html).run();
            didInsert = true;
            setToolStatus("done");
          }
        },
      });

      const assistantContent: (TextPart | ToolCallPart)[] = [];
      if (fullText) assistantContent.push({ type: "text", text: fullText });
      assistantContent.push(...toolCalls);

      const assistantLLM: AssistantMessage = {
        role: "assistant",
        content: assistantContent,
      };
      llmMessages.current = [...llmMessages.current, assistantLLM];

      if (toolResults.length > 0) {
        const toolLLM: ToolMessage = { role: "tool", content: toolResults };
        llmMessages.current = [...llmMessages.current, toolLLM];
      }

      setDisplayHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            fullText ||
            (didInsert ? "Done — content inserted into your document." : ""),
          didInsert,
        },
      ]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setDisplayHistory((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${msg}` },
        ]);
      }
    } finally {
      setLoading(false);
      setStreamingText("");
      setToolStatus("idle");
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[580px] max-w-[calc(100vw-32px)] z-50 flex flex-col gap-0 animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
      {(hasHistory || loading) && (
        <div className="bg-[#2e2e2e] rounded-2xl px-5 py-4 pb-6 flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-200 rounded-b-none translate-y-4 z-0 relative">
          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-4 pr-0.5">
            {displayHistory.map((msg, i) =>
              msg.role === "user" ? (
                <div key={i} className="flex items-start gap-2.5 justify-end">
                  <div className="max-w-[80%] px-0 py-2.5">
                    <p className="text-white/90 text-[14px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                  <div className="shrink-0 w-6 aspect-square rounded-sm bg-neutral-600 flex items-center justify-center mt-1">
                    <User size={18} />
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="shrink-0 mt-0.5">
                    <AxonAiMascot size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {msg.didInsert && (
                      <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-white bg-neutral-400/10 rounded-md px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 inline-block" />
                        Inserted into your document
                      </div>
                    )}
                    <div className="prose prose-sm prose-invert max-w-none prose-p:text-white/90 prose-p:leading-relaxed prose-p:my-1 prose-headings:text-white prose-strong:text-white prose-code:text-emerald-300 prose-pre:bg-black/30 prose-a:text-blue-400 prose-ul:text-white/90 prose-ol:text-white/90 prose-li:my-0 prose-ul:my-1 prose-ol:my-1">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ),
            )}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 mt-0.5">
                  <AxonAiMascot size={24} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {toolStatus === "calling" && (
                    <div className="inline-flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-400/10 rounded-full px-2.5 py-1 w-fit animate-in fade-in-0 duration-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                      Writing to document…
                    </div>
                  )}
                  {toolStatus === "done" && (
                    <div className="inline-flex items-center gap-2 text-[11px] text-emerald-400/80 bg-emerald-400/10 rounded-full px-2.5 py-1 w-fit animate-in fade-in-0 duration-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Inserted into document
                    </div>
                  )}
                  {streamingText ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:text-white/90 prose-p:leading-relaxed prose-p:my-1 prose-headings:text-white prose-strong:text-white prose-code:text-emerald-300 prose-pre:bg-black/30 prose-ul:text-white/90 prose-ol:text-white/90 prose-li:my-0">
                      <ReactMarkdown>{streamingText}</ReactMarkdown>
                    </div>
                  ) : toolStatus === "idle" ? (
                    <div className="flex items-center gap-1.5 h-5">
                      {[0, 120, 240].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="flex items-center gap-4 pt-2.5 border-t border-white/[0.07] text-[11px] text-white/25">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/35">
                ↵
              </kbd>
              send
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/35">
                ⇧↵
              </kbd>
              new line
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/35">
                Esc
              </kbd>
              close
            </span>
          </div>
        </div>
      )}

      <div className="bg-[#1F1F1F] rounded-2xl px-4 py-3.5 border-4 border-[#2e2e2e] relative z-10">
        <div className="relative">
          <textarea
            rows={3}
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={
              hasHistory ? "Ask a follow-up…" : "Ask anything to the axon ai"
            }
            className="w-full resize-none bg-transparent text-white text-base leading-relaxed placeholder:text-white/25 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed pr-10"
          />

          <div className="absolute bottom-0 right-0">
            {loading ? (
              <div className="opacity-50 animate-pulse pointer-events-none">
                <AxonAiMascot size={28} />
              </div>
            ) : !inputEmpty ? (
              <button
                onClick={handleSend}
                title="Send (Enter)"
                className="transition-all duration-150 hover:scale-110 active:scale-95 flex"
              >
                <AxonAiMascot size={28} />
              </button>
            ) : (
              <div className="opacity-50 pointer-events-none">
                <AxonAiMascot size={28} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { AxonAiModal };
