import React, { createContext, useContext, useState } from "react"
import type { ThemeItem, InvitationData, CustomerOrder } from "@/types/winvit"
import { INITIAL_THEMES, DEFAULT_INVITATION, INITIAL_ORDERS } from "@/data/themes"

interface WinvitContextType {
  themes: ThemeItem[]
  addTheme: (theme: ThemeItem) => void
  orders: CustomerOrder[]
  addOrder: (order: Omit<CustomerOrder, "id" | "createdAt">) => CustomerOrder
  updateOrderStatus: (id: string, status: CustomerOrder["status"]) => void
  invitation: InvitationData
  setInvitation: React.Dispatch<React.SetStateAction<InvitationData>>
}

const WinvitContext = createContext<WinvitContextType | null>(null)

export function WinvitProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<ThemeItem[]>(INITIAL_THEMES)
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS)
  const [invitation, setInvitation] = useState<InvitationData>(DEFAULT_INVITATION)

  const addTheme = (theme: ThemeItem) => {
    setThemes((prev) => [theme, ...prev])
  }

  const addOrder = (orderInput: Omit<CustomerOrder, "id" | "createdAt">) => {
    const newOrder: CustomerOrder = {
      ...orderInput,
      id: `ORD-2026-00${orders.length + 1}`,
      createdAt: "Baru saja",
    }
    setOrders((prev) => [newOrder, ...prev])
    return newOrder
  }

  const updateOrderStatus = (id: string, status: CustomerOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    )
    if (status === "APPROVED") {
      setInvitation((prev) => ({ ...prev, status: "ACTIVE_DRAFT" }))
    }
  }

  return (
    <WinvitContext.Provider
      value={{
        themes,
        addTheme,
        orders,
        addOrder,
        updateOrderStatus,
        invitation,
        setInvitation,
      }}
    >
      {children}
    </WinvitContext.Provider>
  )
}

export function useWinvit() {
  const ctx = useContext(WinvitContext)
  if (!ctx) throw new Error("useWinvit must be used within WinvitProvider")
  return ctx
}

