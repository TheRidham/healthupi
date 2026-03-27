"use client"

import { Message } from "@/types/chat"
import clsx from "clsx"
import { useEffect, useRef } from "react"

interface Props {
  messages: Message[]
  currentUserId: string
}

export function ChatWindow({ messages, currentUserId }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
      {messages.map((msg, index) => {
        const isOwn = msg.sender_id === currentUserId

        return (
          <div
            key={msg.id || index}
            className={clsx(
              "flex",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm",
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-secondary text-secondary-foreground rounded-bl-none"
              )}
            >
              {msg.content}
            </div>
          </div>
        )
      })}
      <div ref={endRef} />
    </div>
  )
}