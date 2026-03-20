"use client"

import { useParams } from "next/navigation"
import { ChatProvider } from "@/providers/ChatProvider"
import ChatLayout from "@/components/chat/chat-layout"
import { useAuth } from "@/providers/authProvider"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const { user, loading: userLoading } = useAuth();

  // Wait for user to be loaded
  if (userLoading || !user?.id) {
    return (
      <div className="py-2 h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-2 h-screen">
      <ChatProvider conversationId={conversationId} userId={user.id}>
        <ChatLayout currentUserId={user.id} />
      </ChatProvider>
    </div>
  )
}