'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { Message } from "@/types/chat"
import {
  getMessages,
  createMessage,
  markMessagesAsRead,
  subscribeToMessages,
  getConversationParticipants,
  getUserProfile,
} from "@/services/chat.service"
import { useAuth } from "@/context/AuthProvider"

interface Participant {
  id: string
  user_id: string
  role: string
  joined_at: string
  name?: string
  photo_url?: string
  avatar_initials?: string
  specialization?: string
}

interface ChatContextValue {
  messages: Message[]
  loading: boolean
  error: string | null
  participants: Participant[]
  sendMessage: (content: string, type?: "text" | "image" | "audio" | "file") => Promise<Message>
  markAsRead: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
  conversationId: string
  userId?: string
}

export const ChatProvider = ({ children, conversationId, userId }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth();

  const currentUserId = userId || user?.id

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!conversationId) {
        throw new Error('No conversation ID provided')
      }

      // console.log('[ChatProvider] Fetching messages and participants...')
      
      // Add timeout of 10 seconds
      const fetchPromise = Promise.all([
        getMessages(conversationId),
        getConversationParticipants(conversationId),
      ])
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const [messagesData, participantsData] = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any
      
      // console.log('[ChatProvider] Fetched successfully. Messages:', messagesData.length, 'Participants:', participantsData.length)
      
      // Now fetch profile details for each participant
      const participantsWithProfiles = await Promise.all(
        participantsData.map(async (p: any) => {
          const profile = await getUserProfile(p.user_id, p.role)
          return {
            ...p,
            name: profile?.name || p.role,
            photo_url: profile?.photo_url || null,
            avatar_initials: profile?.avatar_initials,
            specialization: profile?.specialization,
          }
        })
      )
      
      // console.log('[ChatProvider] Participants with profiles:', participantsWithProfiles)
      
      setMessages(messagesData)
      setParticipants(participantsWithProfiles)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      // console.error('[ChatProvider] Error fetching messages:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const sendMessage = useCallback(
    async (content: string, type: any = "text") => {
      try {
        if (!currentUserId) {
          // console.error('[ChatProvider] No user ID available')
          throw new Error('User not authenticated')
        }

        // console.log('[ChatProvider] Sending message:', { content, type, senderId: currentUserId, conversationId })

        const newMessage = await createMessage({
          conversationId,
          content,
          type,
          senderId: currentUserId,
        })

        // console.log('[ChatProvider] Message sent successfully:', newMessage)
        setMessages((prev) => [...prev, newMessage])
        return newMessage
      } catch (error) {
        // console.error('[ChatProvider] Error sending message:', error)
        throw error
      }
    },
    [conversationId, currentUserId]
  )

  const markAsRead = useCallback(async () => {
    if (!currentUserId) return
    await markMessagesAsRead(conversationId, currentUserId)
  }, [conversationId, currentUserId])

  useEffect(() => {
    fetchMessages()

    const unsubscribe = subscribeToMessages(
      conversationId,
      (newMessage) => {
        // console.log('[ChatProvider] Received real-time message:', newMessage)
        // Add message only if it doesn't already exist (avoid duplicates)
        setMessages((prev) => {
          const exists = prev.some(m => m.id === newMessage.id)
          if (exists) {
            // console.log('[ChatProvider] Message already exists, skipping duplicate')
            return prev
          }
          return [...prev, newMessage]
        })
      }
    )

    return () => {
      // console.log('[ChatProvider] Cleaning up subscription')
      unsubscribe()
    }
  }, [conversationId])

  return (
    <ChatContext.Provider
      value={{ messages, loading, error, participants, sendMessage, markAsRead }}
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