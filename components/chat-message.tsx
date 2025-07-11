import type { Message } from "ai"
import { BotIcon, UserIcon } from "lucide-react"

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const isTool = message.role === "tool"

  if (isTool) {
    return (
      <div className="text-xs text-gray-500 p-2 my-2 bg-gray-100 rounded-md border">
        <strong>Tool Result:</strong>
        <pre className="whitespace-pre-wrap break-all">{message.content}</pre>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="bg-primary text-primary-foreground rounded-full p-2">
          <BotIcon className="h-5 w-5" />
        </div>
      )}
      <div
        className={`px-4 py-2 rounded-lg max-w-[80%] ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <div className="bg-gray-200 text-gray-700 rounded-full p-2">
          <UserIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}
