import { experimental_createMCPClient, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CoreMessage } from "ai";

export const maxDuration = 30;

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

    const tools = await mcpClient.tools(); // Get the toolbox

    const { text, toolCalls } = await generateText({
      model: openai("gpt-4o"),
      messages,
      tools,
    });

    if (text) {
      await mcpClient.close();
      return Response.json({ message: text });
    }

    const toolResponses: CoreMessage[] = [];
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const toolResult = await tools[toolCall.toolName](toolCall.args);
        toolResponses.push({
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: toolResult,
            },
          ],
        });
      }
    }

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
