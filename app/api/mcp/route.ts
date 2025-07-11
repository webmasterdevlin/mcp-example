import { z } from "zod"
import { createMcpHandler } from "@vercel/mcp-adapter"

// This is our mock database. In a real app, you'd connect to Supabase, Neon, etc.
const mockDb = {
  tasks: [
    { id: 1, title: "Design the new dashboard", status: "in-progress" },
    { id: 2, title: "Develop login API", status: "todo" },
    { id: 3, title: "Deploy staging environment", status: "todo" },
  ],
  getTasks: async (status?: "todo" | "in-progress" | "done") => {
    if (status) {
      return mockDb.tasks.filter((t) => t.status === status)
    }
    return mockDb.tasks
  },
  createTask: async (title: string, priority: "low" | "medium" | "high") => {
    const newTask = {
      id: mockDb.tasks.length + 1,
      title,
      status: "todo" as const,
      priority,
    }
    mockDb.tasks.push(newTask)
    return newTask
  },
}

const handler = createMcpHandler(
  (server) => {
    // Tool to get a list of tasks
    server.tool(
      "get_tasks",
      "Gets a list of tasks from the project management system.",
      {
        status: z.enum(["todo", "in-progress", "done"]).optional().describe("Filter tasks by status."),
      },
      async ({ status }) => {
        const tasks = await mockDb.getTasks(status)
        return {
          content: [{ type: "text", text: `Found tasks: ${JSON.stringify(tasks, null, 2)}` }],
        }
      },
    )

    // Tool to create a new task
    server.tool(
      "create_task",
      "Creates a new task.",
      {
        title: z.string().describe("The title of the task."),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      },
      async ({ title, priority }) => {
        const newTask = await mockDb.createTask(title, priority)
        return {
          content: [{ type: "text", text: `✅ Task "${newTask.title}" has been created with ID ${newTask.id}.` }],
        }
      },
    )
  },
  {},
  // The basePath is important for the client to know where to connect.
  { basePath: "/api" },
)

export { handler as GET, handler as POST, handler as DELETE }
