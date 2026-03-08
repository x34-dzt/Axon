import { verifyToken } from "@/lib/auth";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const axonUserToken = cookieStore.get("axon_user")?.value;
    if (!axonUserToken)
      return new Response(
        JSON.stringify({
          error: "Failed to generate text",
          details: "unauthorized user",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

    const verifiedUser = verifyToken(axonUserToken);
    if (!verifiedUser?._id) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate text",
          details: "unauthorized user",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { prompt } = await req.json();
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate text",
        details:
          error instanceof Error ? error.message : "unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
