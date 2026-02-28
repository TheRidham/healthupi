"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Plus } from "lucide-react"

interface Props {
  onSend: (content: string) => void
}

export function ChatInput({ onSend }: Props) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value)
    setValue("")
  }

  return (
    <div className="border-t p-3 bg-background">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Plus className="w-5 h-5" />
        </Button>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <Button onClick={handleSend} size="icon">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}