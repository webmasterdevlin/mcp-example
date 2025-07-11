import { experimental_createMCPClient, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import type { CoreMessage } from "ai";

export const maxDuration = 30;

// This endpoint is specifically for Single Page Application (SPA) clients.
// It performs the full request-response cycle and returns a single JSON object.
export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const mcpClient = await experimental_createMCPClient({
      transport: new StreamableHTTPClientTransport(
        new URL(
          `${
            process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "http://localhost:3000"
          }/api/mcp`
        )
      ),
    });

    // --- Step 1: Get the initial AI response which might include a tool call. ---
    const { text, toolCalls } = await generateText({
      model: openai("gpt-4o"),
      messages,
      tools: await mcpClient.tools(),
    });

    // If the AI responds with text directly without using a tool, return it.
    if (text) {
      await mcpClient.close();
      return Response.json({ message: text });
    }

    // --- Step 2: If the AI wants to use a tool, execute it. ---
    const toolResponses: CoreMessage[] = [];
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const toolResult = await mcpClient.tool(
          toolCall.toolName,
          toolCall.args
        );
        toolResponses.push({
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: toolResult.content,
            },
          ],
        });
      }
    }

    // --- Step 3: Get the final summary and return it as a single JSON object. ---
    const finalHistory: CoreMessage[] = [
      ...messages,
      { role: "assistant", content: [{ type: "tool-call", toolCalls }] },
      ...toolResponses,
    ];

    const finalResult = await generateText({
      model: openai("gpt-4o"),
      messages: finalHistory,
      system:
        "You have just executed a tool for the user. Your task now is to summarize the result of that tool call in a friendly, conversational way. Confirm that the action was completed.",
    });

    await mcpClient.close();
    return Response.json({ message: finalResult.text });
  } catch (error) {
    console.error("SPA Chat API error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
