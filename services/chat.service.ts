import { ChatMessage } from "@/types"

export async function getChatMessages(appointmentId: string): Promise<ChatMessage[]> {
  console.log("Fetching chat messages:", appointmentId)
  return []
}

export async function sendMessage(data: {
  appointmentId: string
  senderId: string
  receiverId: string
  content: string
}): Promise<ChatMessage> {
  console.log("Sending message:", data)
  throw new Error("Not implemented")
}

export async function markMessagesAsRead(appointmentId: string, userId: string): Promise<void> {
  console.log("Marking messages as read:", appointmentId, userId)
}

export async function startChatSession(appointmentId: string): Promise<string> {
  console.log("Starting chat session:", appointmentId)
  throw new Error("Not implemented")
}

export async function endChatSession(appointmentId: string): Promise<void> {
  console.log("Ending chat session:", appointmentId)
}
