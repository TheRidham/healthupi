import { supabaseClient } from "@/lib/supabase-client"
import { Message } from "@/types"


function mapMessageFromDB(row: any): Message {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    content: row.content,
    type: row.type,
    status: row.status,
    created_at: new Date(row.created_at),
  }
}

// Create a new conversation
export async function createConversation(params: {
  appointmentId?: string
  type?: string
}): Promise<{ id: string }> {
  const { appointmentId, type } = params

  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient
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

  const { error } = await supabaseClient.from("conversation_participants").insert(inserts)

  if (error) throw error

  return conversationId
}

/**
 * Fetch messages
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    console.log('[Chat Service] Fetching messages for conversation:', conversationId)

    const { data, error } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error('[Chat Service] Error fetching messages:', error)
      throw error
    }

    // console.log('[Chat Service] Fetched messages:', data)
    return (data || []).map(mapMessageFromDB);
  } catch (error) {
    console.error('[Chat Service] Exception in getMessages:', error)
    return []
  }
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

  try {
    console.log('[Chat Service] Creating message:', { conversationId, content, type, senderId })

    const { data, error } = await supabaseClient
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          content,
          type,
          sender_id: senderId,
          status: 'sent',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[Chat Service] Error creating message:', error)
      throw error
    }

    console.log('[Chat Service] Message created successfully:', data)
    return mapMessageFromDB(data)
  } catch (error) {
    console.error('[Chat Service] Exception in createMessage:', error)
    throw error
  }
}

/**
 * Mark as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabaseClient
    .from("messages")
    .update({ status: "read" })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("status", "sent")

  if (error) throw error
}

/**
 * Subscribe to messages in real-time
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (msg: Message) => void
) {
  try {
    console.log('[Chat Service] Setting up real-time message subscription for conversation:', conversationId)

    const channel = supabaseClient
      .channel(`messages:${conversationId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('[Chat Service] Real-time message payload received:', {
            event: payload.eventType,
            new: payload.new,
          })
          if (payload.new && payload.new.id) {
            try {
              const message = mapMessageFromDB(payload.new)
              console.log('[Chat Service] Real-time message received:', message.id, message.content)
              callback(message)
            } catch (error) {
              console.error('[Chat Service] Error mapping message:', error, payload.new)
            }
          }
        }
      )
      .on("system", {}, (message) => {
        console.log('[Chat Service] System event:', message.type)
      })
      .subscribe((status) => {
        console.log('[Chat Service] Subscription status:', status)
        if (status === "SUBSCRIBED") {
          console.log('[Chat Service] Successfully subscribed to messages for conversation:', conversationId)
        } else if (status === "CHANNEL_ERROR") {
          console.error('[Chat Service] Channel error - will retry on next message')
        } else if (status === "CLOSED") {
          console.log('[Chat Service] Subscription closed (normal cleanup)')
        }
      })

    return () => {
      console.log('[Chat Service] Unsubscribing from messages for conversation:', conversationId)
      supabaseClient.removeChannel(channel)
    }
  } catch (error) {
    console.error('[Chat Service] Error setting up subscription:', error)
    return () => {}
  }
}

/**
 * Get conversation participants (basic data only)
 */
export async function getConversationParticipants(conversationId: string) {
  try {
    console.log('[Chat Service] Fetching participants for conversation:', conversationId)

    const { data, error } = await supabaseClient
      .from("conversation_participants")
      .select("id, user_id, role, joined_at")
      .eq("conversation_id", conversationId)

    if (error) {
      console.error("[Chat Service] Error fetching participants:", error)
      return []
    }

    console.log('[Chat Service] Fetched participants:', data)
    return data || []
  } catch (error) {
    console.error("[Chat Service] Exception in getConversationParticipants:", error)
    return []
  }
}

/**
 * Get profile details for a user based on their role
 */
export async function getUserProfile(userId: string, role: 'doctor' | 'patient') {
  try {
    console.log('[Chat Service] Fetching profile for user:', userId, 'role:', role)

    if (role === 'doctor') {
      const { data, error } = await supabaseClient
        .from('doctor_profiles')
        .select('id, first_name, last_name, photo_url, specialization, user_id')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('[Chat Service] Error fetching doctor profile:', error)
        return null
      }

      return {
        id: data.id,
        user_id: data.user_id,
        name: `Dr. ${data.first_name} ${data.last_name}`,
        photo_url: data.photo_url,
        specialization: data.specialization,
        role: 'doctor'
      }
    } else {
      const { data, error } = await supabaseClient
        .from('patient_profiles')
        .select('id, name, photo_url, user_id')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('[Chat Service] Error fetching patient profile:', error)
        return null
      }

      return {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        photo_url: data.photo_url,
        role: 'patient'
      }
    }
  } catch (error) {
    console.error('[Chat Service] Exception in getUserProfile:', error)
    return null
  }
}