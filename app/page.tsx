"use client"

import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SendHorizontalIcon } from "lucide-react"
import { useRef, useEffect } from "react"
import { ChatMessage } from "@/components/chat-message"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
      <CardHeader className="border-b">
        <CardTitle>Project Pal</CardTitle>
        <CardDescription>Your AI-powered project management assistant.</CardDescription>
      </CardHeader>
      <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length > 0 ? (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        ) : (
          <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <p className="text-lg font-medium">Start managing your project!</p>
            <p className="mt-2 text-sm">Try one of these commands:</p>
            <ul className="mt-2 text-sm list-disc list-inside text-left bg-gray-50 p-3 rounded-md">
              <li>"Create a task to design the new logo"</li>
              <li>"What are the current to-do tasks?"</li>
              <li>"Show me all tasks"</li>
            </ul>
          </div>
        )}
      </CardContent>
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            className="flex-1"
            value={input}
            placeholder="Tell Project Pal what to do..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <SendHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  )
}
