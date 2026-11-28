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
  backendId?: string
  title: string
  tagline: string
  category: ThemeCategory
  categoryName: string
  tag?: string
  priceNumber?: number
  isActive?: boolean
  desc: string
  thumb: string
  thumb2: string
  thumb3: string
  thumbDesktop?: string
  thumbMobile?: string
  thumbTablet?: string
  path: string
  palette: string[]
  vibeIcon: string
  tags: string[]
  priceRegular: string
  pricePromo: string
  discount: string
  supportedSections?: SectionKey[]
}

export interface EventItem {
  id?: string
  name: string
  date: string
  startTime: string
  endTime: string
  locationName: string
  locationAddress: string
  locationUrl: string
  sortOrder: number
}

export interface StoryItem {
  id?: string
  title: string
  badge: string // maps to date_label in BE
  storyDate?: string | null // maps to story_date in BE
  content: string // maps to story in BE
  photo?: string // maps to image_url in BE
  sortOrder?: number
}

export interface GalleryItem {
  id?: string
  mediaType: string
  mediaUrl: string
  sortOrder: number
}

export interface GiftBankAccount {
  id?: string
  bankName: string // maps to account_name in BE
  accountNumber: string // maps to account_number in BE
  accountHolder: string // maps to on_behalf_of in BE
  sortOrder?: number
}

export interface GuestItem {
  id: string
  invitation_id?: string
  name: string
  created_at?: string
  slug?: string
}

export interface InvitationData {
  id: string
  slug: string
  status: "PENDING_PAYMENT" | "WAITING_APPROVAL" | "ACTIVE_DRAFT" | "PUBLISHED"
  isPublished?: boolean
  themeId: string
  customer: {
    userId?: string
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
      info?: string
      photo: string
    }
    groom: {
      nickname: string
      fullName: string
      fatherName: string
      motherName: string
      info?: string
      photo: string
    }
  }
  eventList?: EventItem[]
  events: {
    primaryDate: string
    akad: {
      title: string
      date: string
      startTime: string
      endTime: string
      locationName?: string
      address: string
      mapsUrl: string
    }
    resepsi: {
      title: string
      date: string
      startTime: string
      endTime: string
      locationName?: string
      address: string
      mapsUrl: string
    }
    liveStream: {
      enabled: boolean
      platform: string
      url: string
    }
  }
  stories: StoryItem[]
  galleryItems?: GalleryItem[]
  media: {
    gallery: string[]
    videoUrl: string
  }
  gifts: {
    bankAccounts: GiftBankAccount[]
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
