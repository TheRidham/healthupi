"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ChatHeaderProps {
  title: string
  subtitle?: string
  avatarSrc?: string
  avatarFallback?: string
  showBackButton?: boolean
  onBack?: () => void
  rightAction?: ReactNode
}

export function ChatHeader({
  title,
  subtitle,
  avatarSrc,
  avatarFallback = "U",
  showBackButton = true,
  onBack,
  rightAction,
}: ChatHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) return onBack()
    router.back()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <Avatar className="h-9 w-9">
          {avatarSrc && <AvatarImage src={avatarSrc} />}
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-medium text-primary">{title}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {rightAction && <div>{rightAction}</div>}
    </div>
  )
}