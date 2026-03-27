export interface Conversation {
  id: string
  appointment_id?: string | null
  type: "chat" | "video" | "audio" | "group"
  is_archived: boolean
  created_at: Date
  updated_at: Date
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: string
  joined_at: Date
  last_read_at?: Date | null
}

export type MessageType = "text" | "image" | "audio" | "file" | "video" | "document"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: MessageType
  media_url?: string | null
  file_name?: string | null
  file_size?: number | null
  status: "sent" | "delivered" | "read"
  edited_at?: Date | null
  reacts?: string[]
  created_at: Date
}