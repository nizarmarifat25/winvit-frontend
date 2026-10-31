export type ThemeCategory = "adat" | "luxury" | "editorial" | "nature"

export type SectionKey =
  | "cover"
  | "hero"
  | "quote"
  | "couple"
  | "events"
  | "story"
  | "gallery"
  | "countdown"
  | "gift"
  | "faq"
  | "wishes"
  | "livestream"

export interface ThemeItem {
  id: string
  title: string
  tagline: string
  category: ThemeCategory
  categoryName: string
  desc: string
  thumb: string
  thumb2: string
  thumb3: string
  path: string
  palette: string[]
  vibeIcon: string
  tags: string[]
  priceRegular: string
  pricePromo: string
  discount: string
  supportedSections?: SectionKey[]
}

export interface InvitationData {
  id: string
  slug: string
  status: "PENDING_PAYMENT" | "WAITING_APPROVAL" | "ACTIVE_DRAFT" | "PUBLISHED"
  themeId: string
  customer: {
    orderName: string
    phone: string
    email: string
  }
  layout: {
    sectionOrder: SectionKey[]
    hiddenSections: SectionKey[]
  }
  meta: {
    title: string
    coverPhoto: string
    heroPhoto: string
    audio: {
      url: string
      startTime: number
    }
  }
  quote: {
    arabic: string
    translation: string
    source: string
  }
  couple: {
    bride: {
      nickname: string
      fullName: string
      fatherName: string
      motherName: string
      photo: string
    }
    groom: {
      nickname: string
      fullName: string
      fatherName: string
      motherName: string
      photo: string
    }
  }
  events: {
    primaryDate: string
    akad: {
      title: string
      date: string
      startTime: string
      endTime: string
      address: string
      mapsUrl: string
    }
    resepsi: {
      title: string
      date: string
      startTime: string
      endTime: string
      address: string
      mapsUrl: string
    }
    liveStream: {
      enabled: boolean
      platform: string
      url: string
    }
  }
  stories: Array<{
    badge: string
    title: string
    content: string
    photo?: string
  }>
  media: {
    gallery: string[]
    videoUrl: string
  }
  gifts: {
    bankAccounts: Array<{
      bankName: string
      accountNumber: string
      accountHolder: string
    }>
    qrisImage: string
    giftAddress: string
  }
  faqs: Array<{
    question: string
    answer: string
  }>
}

export interface CustomerOrder {
  id: string
  orderName: string
  coupleName: string
  phone: string
  email: string
  themeId: string
  themeTitle: string
  amount: number
  paymentMethod: "Transfer Bank" | "QRIS" | "E-wallet"
  status: "WAITING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED"
  paymentProof: string
  createdAt: string
  slug: string
}
