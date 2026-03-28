import { useMemo, useState } from "react"
import { useChatContext } from "@/context/ChatProvider"
import { ChatHeader } from "./chat-header"
import { Button } from "../ui/button"
import { ChatWindow } from "./chat-window"
import { ChatInput } from "./chat-input"
import { useAuth } from "@/context/AuthProvider"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChatLayout({ currentUserId, conversationId }: { currentUserId: string; conversationId?: string }) {
  const { messages, loading, error, participants, sendMessage } = useChatContext()
  const { user } = useAuth()
  const router = useRouter()
  const [isLeaving, setIsLeaving] = useState(false)

  // Get the other participant (the person we're chatting with)
  const otherParticipant = useMemo(() => {
    return participants.find((p) => p.user_id !== currentUserId)
  }, [participants, currentUserId])

  // Determine header details from the other participant
  const headerDetails = useMemo(() => {
    if (!otherParticipant) {
      return {
        title: "Chat",
        subtitle: "Loading...",
        avatarSrc: undefined,
        avatarFallback: "U",
      }
    }

    return {
      title: otherParticipant.name || "Contact",
      subtitle: otherParticipant.role === "doctor" 
        ? otherParticipant.specialization || "Doctor"
        : "Patient",
      avatarSrc: otherParticipant.photo_url || undefined,
      avatarFallback: otherParticipant.avatar_initials || (otherParticipant.name || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }
  }, [otherParticipant])

  // Handler for leaving the conversation
  const handleLeaveConversation = async () => {
    setIsLeaving(true)
    try {
      // console.log('[ChatLayout] Navigating away from conversation')
      if ( user?.role == 'patient' ) router.push('/profile')
      else router.push('/dashboard')
    } catch (err) {
      console.error('[ChatLayout] Exception navigating away:', err)
      setIsLeaving(false)
    }
  }

  if (!currentUserId) {
    return (
      <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Error loading chat</p>
            <p className="text-sm">{error}</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col border rounded-lg overflow-hidden">
      <ChatHeader
        title={headerDetails.title}
        subtitle={headerDetails.subtitle}
        avatarSrc={headerDetails.avatarSrc}
        avatarFallback={headerDetails.avatarFallback}
        rightAction={
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLeaveConversation}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Leaving...
              </>
            ) : (
              'Leave'
            )}
          </Button>
        }
      />
      <ChatWindow messages={messages} currentUserId={currentUserId} />
      <ChatInput onSend={sendMessage} />
    </div>
  )
}