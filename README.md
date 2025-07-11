# Project Pal: An AI-Powered Project Management Assistant

Project Pal is a full-stack Next.js application that demonstrates how to build a powerful, AI-driven chatbot capable of performing real-world actions. It uses the **Model Context Protocol (MCP)** to securely connect a large language model (LLM) to a set of tools, allowing users to manage project tasks using natural language.

![Project Pal Screenshot](public/demo_app.png)

---

## Features

-   **Conversational Interface:** Manage your project tasks by talking to an AI in plain English.
-   **AI-Powered Actions:** The AI can create and retrieve tasks from a database.
-   **Secure Tool Use with MCP:** Built on the Model Context Protocol, ensuring a secure and decoupled architecture between the AI and the application's business logic.
-   **Persistent Storage:** Easily connect to your preferred database (Supabase, Neon, etc.) to save your tasks.
-   **Modern Tech Stack:** Built with Next.js (App Router), the Vercel AI SDK, and shadcn/ui.

## Architecture Overview

This application uses a decoupled, client-server architecture based on MCP:

1.  **The MCP Server (`/api/mcp`):** A secure, headless API that exposes "tools" (like `create_task` and `get_tasks`). It contains all the business logic and is the only part of the app that communicates with the database.
2.  **The MCP Host (`/app/actions.tsx`):** The server-side logic that orchestrates the conversation. It takes the user's prompt, discovers the available tools from the MCP Server, and works with the LLM to decide which tool to call.
3.  **The UI (`/app/page.tsx`):** A client-side chat interface built with React, shadcn/ui, and the Vercel AI SDK's `useActions` hook.

This separation ensures that the AI model never has direct access to your database, providing a robust security layer.

## Getting Started

Follow these steps to get the application running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/webmasterdevlin/mcp-example.git
cd mcp-example
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env.local` in the root of your project and add your OpenAI API key:

```bash
# .env.local
OPENAI_API_KEY="sk-..."
```

You can get an API key from the [OpenAI Platform](https://platform.openai.com/api-keys).

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## Connecting a Database

By default, the application uses a temporary, in-memory mock database that **resets with every server restart**. To save your tasks permanently, you must connect a real database.

### Option 1: Using Supabase (Recommended)

1.  **Create a Supabase Project:** Go to [supabase.com](https://supabase.com), create a new project, and wait for it to be provisioned.

2.  **Create the `tasks` Table:** In your Supabase project, go to the **SQL Editor**, create a new query, and run the following script:
    ```sql
    CREATE TABLE tasks (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ```

3.  **Get API Credentials:** Go to **Project Settings > API**. Find and copy your **Project URL** and your **`anon` public API Key**.

4.  **Update Environment Variables:** Add your Supabase credentials to your `.env.local` file:
    ```bash
    # .env.local
    OPENAI_API_KEY="sk-..."
    NEXT_PUBLIC_SUPABASE_URL="YOUR_PROJECT_URL_HERE"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
    ```

5.  **Restart your server.** The application is already configured to use these variables and will automatically connect to your Supabase database.

### Option 2: Using Neon

1.  **Create a Neon Project:** Go to [neon.tech](https://neon.tech), create a new project, and get your database **connection string**.

2.  **Update Environment Variables:** Add the connection string to your `.env.local` file.
    ```bash
    # .env.local
    OPENAI_API_KEY="sk-..."
    DATABASE_URL="YOUR_NEON_CONNECTION_STRING_HERE"
    ```

3.  **Modify the MCP Server:** You'll need to adjust the code in `/app/api/mcp/route.ts` to use the Neon client instead of the Supabase client. You would replace the Supabase calls with queries using the `@neondatabase/serverless` package.

### Option 3: Using Any Other Database

The principle is the same for any database:

1.  Add your database connection details to `.env.local`.
2.  Install the necessary database client library (e.g., `pg` for PostgreSQL, `mysql2` for MySQL).
3.  Create a client instance in a new file (e.g., `lib/db.ts`).
4.  Go to `/app/api/mcp/route.ts` and replace the Supabase logic inside the `get_tasks` and `create_task` tools with the equivalent queries for your database.

---

## What's Missing in This Demo

This application is a proof-of-concept and is missing several features you'd want in a production application:

-   **User Authentication:** Currently, all tasks are global. There is no concept of individual users. You would need to add an authentication system (like NextAuth.js or Supabase Auth) to manage user-specific tasks.
-   **More Sophisticated Tools:** The AI can only create and get tasks. A real application would need tools for updating, deleting, and assigning tasks.
-   **UI Feedback for Tool Calls:** When the AI is using a tool, the UI doesn't show a loading state. A production app should stream UI updates to let the user know that work is being done in the background.
-   **Robust Error Handling:** While the server logs errors, the UI doesn't display them to the user in a friendly way.
-   **Persistent Chat History:** The conversation history is lost on every page refresh. You would need to store the AI and UI state in a database to make conversations persistent.