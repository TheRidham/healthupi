import { useChatContext } from "@/providers/ChatProvider"
import { ChatHeader } from "./chat-header"
import { Button } from "../ui/button"
import { ChatWindow } from "./chat-window"
import { ChatInput } from "./chat-input"


export default function ChatLayout({ currentUserId }: { currentUserId: string }) {
  const { messages, loading, sendMessage } = useChatContext()

  if (loading) return <div className="p-4">Loading chat...</div>

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col border rounded-lg overflow-hidden">
      <ChatHeader
        title="John Doe"
        subtitle="Online"
        avatarSrc="/avatar.png"
        avatarFallback="JD"
        rightAction={
          <Button variant="destructive" size="sm">
            Leave
          </Button>
        }
      />
      <ChatWindow messages={messages} currentUserId={currentUserId} />
      <ChatInput onSend={sendMessage} />
    </div>
  )
}