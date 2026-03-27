"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Plus } from "lucide-react"
import { toast } from "sonner"

interface Props {
  onSend: (content: string) => void
}

export function ChatInput({ onSend }: Props) {
  const [value, setValue] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!value.trim()) return
    
    try {
      setIsSending(true)
      onSend(value)
      setValue("")
    } catch (error) {
      console.error('[ChatInput] Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t p-3 bg-background">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled={isSending}>
          <Plus className="w-5 h-5" />
        </Button>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
          disabled={isSending}
        />

        <Button onClick={handleSend} size="icon" disabled={isSending || !value.trim()}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}