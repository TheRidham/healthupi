'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { Message } from "@/types"
import { supabase } from "@/lib/supabase"
import {
  getMessages,
  createMessage,
  markMessagesAsRead,
  subscribeToMessages,
} from "@/services/chat.service"
import { useAuth } from "@/lib/auth-context"

interface ChatContextValue {
  messages: Message[]
  loading: boolean
  sendMessage: (content: string, type?: "text" | "image" | "audio" | "file") => Promise<Message>
  markAsRead: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
  conversationId: string
}

export const ChatProvider = ({ children, conversationId }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMessages(conversationId)
      setMessages(data)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const sendMessage = useCallback(
    async (content: string, type: any = "text") => {
      const newMessage = await createMessage({
        conversationId,
        content,
        type,
        senderId: user?.id as string
      })

      setMessages((prev) => [...prev, newMessage])
      return newMessage
    },
    [conversationId, user?.id]
  )

  const markAsRead = useCallback(async () => {

    await markMessagesAsRead(conversationId, user?.id as string)
  }, [conversationId])

  useEffect(() => {
    fetchMessages()

    const unsubscribe = subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage])
      }
    )

    return unsubscribe
  }, [conversationId, fetchMessages])

  return (
    <ChatContext.Provider
      value={{ messages, loading, sendMessage, markAsRead }}
    >
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use chat context
export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChatContext must be used within a ChatProvider")
  return context
}