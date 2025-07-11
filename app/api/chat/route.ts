import { experimental_createMCPClient, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import type { CoreMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  // Use the VERCEL_URL env var which is automatically set by Vercel.
  // Fallback to localhost for local development.
  const appUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const mcpServerUrl = `${appUrl}/api/mcp`;

  const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl));
  const mcpClient = await experimental_createMCPClient({ transport });

  try {
    const tools = await mcpClient.tools();

    const result = await streamText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful project management assistant. When a tool is used, you MUST respond to the user by confirming the action. Take the text from the tool's result and present it to the user in a clear, friendly sentence. For example, if a tool returns 'Task created with ID 5', you should say 'Okay, I've created the task for you. Its ID is 5.' Do not just say 'OK.' or give an empty response.",
      messages,
      tools,
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async (error) => {
        console.error("Error during text streaming:", error);
        await mcpClient.close();
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    if (mcpClient) {
      await mcpClient.close();
    }
    return new Response(
      "An error occurred while connecting to the MCP server.",
      { status: 500 }
    );
  }
}
