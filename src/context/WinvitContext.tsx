import React, { createContext, useContext, useState, useEffect } from "react"
import type {
  ThemeItem,
  ThemeCategory,
  InvitationData,
  CustomerOrder,
} from "@/types/winvit"
import {
  INITIAL_THEMES,
  DEFAULT_INVITATION,
  INITIAL_ORDERS,
} from "@/data/themes"
import { getPublicThemesApi } from "@/lib/api"

interface WinvitContextType {
  themes: ThemeItem[]
  setThemes: React.Dispatch<React.SetStateAction<ThemeItem[]>>
  addTheme: (theme: ThemeItem) => void
  refreshPublicThemes: () => Promise<void>
  orders: CustomerOrder[]
  addOrder: (order: Omit<CustomerOrder, "id" | "createdAt">) => CustomerOrder
  updateOrderStatus: (id: string, status: CustomerOrder["status"]) => void
  invitation: InvitationData
  setInvitation: React.Dispatch<React.SetStateAction<InvitationData>>
}

const WinvitContext = createContext<WinvitContextType | null>(null)

function mapTagToCategory(tag?: string): {
  category: ThemeCategory
  categoryName: string
} {
  const t = (tag || "").toLowerCase()
  if (t.includes("adat") || t.includes("sunda") || t.includes("jawa") || t.includes("batik")) {
    return { category: "adat", categoryName: "Adat Nusantara" }
  }
  if (t.includes("tropical") || t.includes("boho") || t.includes("nature") || t.includes("sage")) {
    return { category: "nature", categoryName: "Tropical & Boho" }
  }
  if (t.includes("editorial") || t.includes("bento") || t.includes("rose") || t.includes("blush")) {
    return { category: "editorial", categoryName: "Editorial & Paper" }
  }
  return { category: "luxury", categoryName: "Dark & Luxury" }
}

export function WinvitProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<ThemeItem[]>(INITIAL_THEMES)
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS)
  const [invitation, setInvitation] =
    useState<InvitationData>(DEFAULT_INVITATION)

  const refreshPublicThemes = async () => {
    try {
      const res = await getPublicThemesApi({ page: 1, per_page: 50 })
      const rawList: any[] = Array.isArray(res)
        ? res
        : res?.items || res?.themes || res?.data || []

      if (!Array.isArray(rawList) || rawList.length === 0) return

      setThemes((prev) => {
        const next = [...prev]

        rawList.forEach((bt) => {
          if (!bt || !bt.name) return
          const normalizedName = String(bt.name).trim().toLowerCase()
          const slugFromName = normalizedName
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")

          const existingIdx = next.findIndex(
            (lt) =>
              lt.backendId === bt.id ||
              lt.id === bt.id ||
              lt.title.toLowerCase() === normalizedName ||
              lt.id === slugFromName ||
              normalizedName.includes(lt.id)
          )

          const priceNum = Number(bt.price) || 99000
          const formattedPrice = `Rp ${priceNum.toLocaleString("id-ID")}`
          const formattedRegular = `Rp ${(priceNum * 2).toLocaleString("id-ID")}`
          const { category, categoryName } = mapTagToCategory(bt.tag)

          const isValidImg = (u?: string | null) =>
            Boolean(
              u &&
                typeof u === "string" &&
                (u.startsWith("http://") ||
                  u.startsWith("https://") ||
                  u.startsWith("/") ||
                  u.startsWith("data:"))
            )

          const desktopThumb = isValidImg(bt.thumbnail_url)
            ? bt.thumbnail_url
            : undefined
          const mobileThumb = isValidImg(bt.thumbnail_mobile_url)
            ? bt.thumbnail_mobile_url
            : undefined
          const tabletThumb = isValidImg(bt.thumbnail_tab_url)
            ? bt.thumbnail_tab_url
            : undefined

          if (existingIdx >= 0) {
            next[existingIdx] = {
              ...next[existingIdx],
              backendId: bt.id,
              tag: bt.tag || next[existingIdx].tag,
              priceNumber: priceNum,
              pricePromo: formattedPrice,
              isActive: bt.is_active ?? true,
              thumb: desktopThumb || mobileThumb || next[existingIdx].thumb,
              thumbDesktop: desktopThumb || next[existingIdx].thumbDesktop,
              thumbMobile: mobileThumb || next[existingIdx].thumbMobile,
              thumbTablet: tabletThumb || next[existingIdx].thumbTablet,
            }
          } else {
            next.unshift({
              id: bt.id || slugFromName,
              backendId: bt.id,
              title: bt.name,
              tagline: bt.tag || categoryName,
              category,
              categoryName,
              tag: bt.tag,
              priceNumber: priceNum,
              isActive: bt.is_active ?? true,
              desc: `Template undangan digital eksklusif ${bt.name}.`,
              thumb: desktopThumb || mobileThumb || "/asset/img/pre1.jpeg",
              thumb2: mobileThumb || desktopThumb || "/asset/img/pre2.jpeg",
              thumb3: tabletThumb || desktopThumb || "/asset/img/pre3.jpeg",
              thumbDesktop: desktopThumb,
              thumbMobile: mobileThumb,
              thumbTablet: tabletThumb,
              path: `/themes/botanica/index.html`,
              palette: ["#C89B57", "#2C2018", "#FAF6F1"],
              vibeIcon: "fa-star",
              tags: bt.tag ? [bt.tag] : [],
              priceRegular: formattedRegular,
              pricePromo: formattedPrice,
              discount: "Disc 50%",
            })
          }
        })

        return next
      })
    } catch {
      // Keep local INITIAL_THEMES if backend is unreachable
    }
  }

  useEffect(() => {
    refreshPublicThemes()
  }, [])

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
        setThemes,
        addTheme,
        refreshPublicThemes,
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
