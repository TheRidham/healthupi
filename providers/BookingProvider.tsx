"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface PendingBooking {
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceType: 'service' | 'followup'
  serviceDescription?: string
  date: string
  timeSlot: string
  timeSlotEnd: string
  timeSlotDuration: number
  doctorId: string
}

interface BookingContextType {
  pendingBooking: PendingBooking | null
  setPendingBooking: (booking: PendingBooking | null) => void
  clearPendingBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null)

  const clearPendingBooking = () => {
    setPendingBooking(null)
  }

  return (
    <BookingContext.Provider value={{ pendingBooking, setPendingBooking, clearPendingBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
