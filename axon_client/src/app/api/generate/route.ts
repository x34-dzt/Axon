import { verifyToken } from "@/lib/auth";
import { createGroq } from "@ai-sdk/groq";
import { stepCountIs, streamText, tool } from "ai";
import { cookies } from "next/headers";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const axonUserToken = cookieStore.get("axon_user")?.value;

    if (!axonUserToken) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate text",
          details: "unauthorized user",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const verifiedUser = verifyToken(axonUserToken);
    if (!verifiedUser?._id) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate text",
          details: "unauthorized user",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const { messages } = await req.json();

    // Explicit generics on tool<INPUT, OUTPUT> force TS to pick the correct overload.
    // Without them TypeScript defaults to tool<INPUT, never> which prohibits execute.
    const insertText = tool<{ content: string }, { content: string }>({
      description:
        "Call this to insert written content into the user's document. Use it whenever the user wants something written or drafted.",
      inputSchema: z.object({
        content: z
          .string()
          .describe("Markdown content to insert into the document."),
      }),
      execute: async ({ content }) => ({ content }),
    });

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: [
        "You are Axon AI, a writing assistant inside a note-taking editor.",
        "Rules:",
        "1. For casual questions, answer conversationally and concisely.",
        "2. When the user asks you to write, draft, create, or generate any content for their document, you MUST call the insert_text function with the markdown content. Never output the content as plain text in that case.",
        "3. Markdown is supported in all your responses.",
      ].join("\n"),
      messages,
      tools: { insert_text: insertText },
      stopWhen: stepCountIs(3),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate text",
        details:
          error instanceof Error ? error.message : "unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
