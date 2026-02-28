"use client"

import { useParams } from "next/navigation"
import { ChatProvider } from "@/providers/ChatProvider"
import ChatLayout from "@/components/chat/chat-layout"
import { useAuth } from "@/lib/auth-context"

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string

  const { user } = useAuth();

  return (
    <div
      className="py-2 h-screen"
    >
      <ChatProvider conversationId={conversationId}>
        <ChatLayout currentUserId={user?.id as string} />
      </ChatProvider>
    </div>
  )
}