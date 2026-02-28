import { supabase } from "@/lib/supabase"
import { Message } from "@/types"


function mapMessageFromDB(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    type: row.type,
    status: row.status,
    createdAt: row.created_at,
  }
}

// Create a new conversation
export async function createConversation(params: {
  appointmentId?: string
  type?: string
}): Promise<{ id: string }> {
  const { appointmentId, type } = params

  const { data, error } = await supabase
    .from("conversations")
    .insert([
      {
        appointment_id: appointmentId || null,
        type: type || "default",
      },
    ])
    .select()
    .single()

  if (error) throw error

  return { id: data.id }
}

// Fetch a conversation by ID
export async function getConversation(conversationId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single()

  if (error) throw error

  return data
}

export async function createConversationWithParticipants(params: {
  appointmentId?: string
  type?: string
  participants: { userId: string; role?: string }[]
}) {
  const { appointmentId, type, participants } = params

  const { id: conversationId } = await createConversation({ appointmentId, type })

  // Insert participants
  const inserts = participants.map(({ userId, role }) => ({
    conversation_id: conversationId,
    user_id: userId,
    role: role || "member",
  }))

  const { error } = await supabase.from("conversation_participants").insert(inserts)

  if (error) throw error

  return conversationId
}

/**
 * Fetch messages
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error

  return (data || []).map(mapMessageFromDB);
}

/**
 * Send message
 */
export async function createMessage(params: {
  conversationId: string
  content: string
  senderId: string,
  type?: "text" | "image" | "audio" | "file"
}): Promise<Message> {
  const { conversationId, content, type = "text", senderId } = params

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        content,
        type,
        sender_id: senderId,
      },
    ])
    .select()
    .single()

  if (error) throw error

  return mapMessageFromDB(data)
}

/**
 * Mark as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ status: "read" })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("status", "sent")

  if (error) throw error
}

/**
 * Subscribe
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (msg: Message) => void
) {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(mapMessageFromDB(payload.new))
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}