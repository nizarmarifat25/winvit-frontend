import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  FileText,
  Smartphone,
  Send,
  User,
  Camera,
  Video,
  ImagePlus,
  Check,
  ExternalLink,
  Search,
  X,
} from "lucide-react"
import { useWinvit } from "@/context/WinvitContext"
import type { InvitationData, SectionKey, ThemeCategory } from "@/types/winvit"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import InvitationRenderer from "@/modules/renderer/InvitationRenderer"

const SECTION_LABELS: Array<{ key: SectionKey; label: string; locked?: boolean }> = [
  { key: "cover", label: "Cover Pembuka", locked: true },
  { key: "hero", label: "Hero Utama", locked: true },
  { key: "quote", label: "Kutipan Ayat / Quote" },
  { key: "couple", label: "Profil Mempelai" },
  { key: "events", label: "Acara & Maps" },
  { key: "story", label: "Love Story" },
  { key: "gallery", label: "Galeri Foto & Video" },
  { key: "countdown", label: "Countdown" },
  { key: "gift", label: "Amplop Digital" },
  { key: "faq", label: "FAQ" },
  { key: "wishes", label: "Ucapan & RSVP" },
]

type SidebarMenu = "detail" | "preview" | "share" | "profile"

type DetailSubTab =
  | "theme"
  | "couple"
  | "events"
  | "media"
  | "gift"
  | "sections"
  | "confirm"

export function CustomerDashboard() {
  const { themes, invitation, setInvitation } = useWinvit()

  // Main Menu: Detail Undangan | Preview (Mobile) | Sebar Undangan | Profile
  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenu>("detail")

  // Sub-menu inside Detail Undangan
  const [detailTab, setDetailTab] = useState<DetailSubTab>("theme")
  const stepStripRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  useEffect(() => {
    const activeBtn = stepStripRef.current?.querySelector<HTMLElement>(
      `[data-step-tab="${detailTab}"]`
    )
    activeBtn?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [detailTab])

  // Draft state for Detail Undangan (applied to preview when "Generate Undangan" is clicked)
  const [draft, setDraft] = useState<InvitationData>(invitation)
  const [renderKey, setRenderKey] = useState(0)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [generatedNotice, setGeneratedNotice] = useState(false)

  // Theme Filter & Search state
  const [themeSearch, setThemeSearch] = useState("")
  const [themeCatFilter, setThemeCatFilter] = useState<"all" | ThemeCategory>("all")

  const filteredCustomerThemes = themes.filter((t) => {
    const matchCat = themeCatFilter === "all" || t.category === themeCatFilter
    const q = themeSearch.trim().toLowerCase()
    const matchQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.categoryName.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    return matchCat && matchQuery
  })

  // Sebar Undangan state
  const [guestName, setGuestName] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)

  // Profile state
  const [profilePassword, setProfilePassword] = useState("")
  const [profileSaved, setProfileSaved] = useState(false)

  const previewTheme = themes.find((t) => t.id === invitation.themeId) || themes[0]
  const isLocked =
    invitation.status === "PENDING_PAYMENT" || invitation.status === "WAITING_APPROVAL"

  const slugPath = invitation.slug || draft.slug || "undangan"
  const baseInviteUrl = `${window.location.origin}/u/${slugPath}`
  const personalizedUrl = guestName
    ? `${baseInviteUrl}?to=${encodeURIComponent(guestName)}`
    : baseInviteUrl

  // File Upload Helpers
  const handleBridePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setDraft((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        bride: { ...prev.couple.bride, photo: url },
      },
    }))
  }

  const handleGroomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setDraft((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        groom: { ...prev.couple.groom, photo: url },
      },
    }))
  }

  const handleGalleryPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const urls = Array.from(files).map((file) => URL.createObjectURL(file))
    setDraft((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        gallery: [...prev.media.gallery, ...urls],
      },
    }))
    e.target.value = ""
  }

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setDraft((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        videoUrl: url,
      },
    }))
  }

  const toggleDraftSection = (key: SectionKey) => {
    setDraft((prev) => {
      const isHidden = prev.layout.hiddenSections.includes(key)
      const nextHidden = isHidden
        ? prev.layout.hiddenSections.filter((k) => k !== key)
        : [...prev.layout.hiddenSections, key]
      return {
        ...prev,
        layout: {
          ...prev.layout,
          hiddenSections: nextHidden,
        },
      }
    })
  }

  // Triggered when clicking "Generate Undangan" in the last section
  const handleGenerateInvitation = () => {
    setInvitation(draft)
    setHasGenerated(true)
    setRenderKey((prev) => prev + 1)
    setGeneratedNotice(true)
    setTimeout(() => setGeneratedNotice(false), 2500)
    if (window.innerWidth < 1024) {
      setSidebarMenu("preview")
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const getWaMessage = (targetGuest: string) => {
    const link = targetGuest
      ? `${baseInviteUrl}?to=${encodeURIComponent(targetGuest)}`
      : baseInviteUrl
    const coupleTitle =
      invitation.couple.bride.nickname && invitation.couple.groom.nickname
        ? `${invitation.couple.bride.nickname} & ${invitation.couple.groom.nickname}`
        : "Kami"
    return `Kepada Yth. ${targetGuest || "Bapak/Ibu/Saudara/i"}\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan ${coupleTitle}.\n\nLink Undangan:\n${link}`
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setInvitation((prev) => ({
      ...prev,
      customer: draft.customer,
    }))
    setProfilePassword("")
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  const detailSubMenus: Array<{ id: DetailSubTab; label: string; step: number }> = [
    { id: "theme", label: "Tema", step: 1 },
    { id: "couple", label: "Mempelai", step: 2 },
    { id: "events", label: "Acara", step: 3 },
    { id: "media", label: "Foto & Video", step: 4 },
    { id: "gift", label: "Rekening", step: 5 },
    { id: "sections", label: "Section", step: 6 },
    { id: "confirm", label: "Konfirmasi", step: 7 },
  ]

  const draftTheme = themes.find((t) => t.id === draft.themeId) || themes[0]
  const currentStep = detailSubMenus.find((s) => s.id === detailTab)?.step || 1
  const progressPercent = (currentStep / detailSubMenus.length) * 100

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F1] text-[#2C2018]">
      {/* MOBILE TOP APP BAR (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5DDD5] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="font-serif text-lg font-bold text-[#2C2018]">
            W<span className="text-[#C89B57]">Invit</span>
          </Link>
          <Badge
            variant={
              invitation.status === "PUBLISHED"
                ? "success"
                : isLocked
                  ? "warning"
                  : "gold"
            }
          >
            {invitation.status === "WAITING_APPROVAL"
              ? "Pending"
              : invitation.status === "PUBLISHED"
                ? "Rilis"
                : "Aktif"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs rounded-full"
            asChild
          >
            <Link to={`/u/${slugPath}`} target="_blank">
              Web Live <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
          <Button
            variant="gold"
            size="sm"
            className="h-8 px-3.5 text-xs rounded-full"
            disabled={isLocked}
            onClick={() =>
              setInvitation((prev) => ({
                ...prev,
                status: "PUBLISHED",
              }))
            }
          >
            {invitation.status === "PUBLISHED" ? "Sudah Rilis" : "Rilis"}
          </Button>
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (lg and up) */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-[#E5DDD5] bg-white flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          <div>
            <Link to="/" className="font-serif text-xl font-bold text-[#2C2018]">
              W<span className="text-[#C89B57]">Invit</span>
            </Link>
            <div className="mt-2">
              <Badge
                variant={
                  invitation.status === "PUBLISHED"
                    ? "success"
                    : isLocked
                      ? "warning"
                      : "gold"
                }
              >
                {invitation.status === "WAITING_APPROVAL"
                  ? "Menunggu Approval"
                  : invitation.status === "PUBLISHED"
                    ? "Sudah Rilis"
                    : "Aktif"}
              </Badge>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setSidebarMenu("detail")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${sidebarMenu === "detail" || sidebarMenu === "preview"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Detail Undangan</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarMenu("share")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${sidebarMenu === "share"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
                }`}
            >
              <Send className="w-4 h-4" />
              <span>Sebar Undangan</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarMenu("profile")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${sidebarMenu === "profile"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
                }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#E5DDD5]">
          <Button
            variant="gold"
            size="sm"
            className="w-full"
            disabled={isLocked}
            onClick={() =>
              setInvitation((prev) => ({
                ...prev,
                status: "PUBLISHED",
              }))
            }
          >
            {invitation.status === "PUBLISHED" ? "Sudah Rilis" : "Rilis Undangan"}
          </Button>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/u/${slugPath}`} target="_blank">
              Lihat Web Undangan
            </Link>
          </Button>

          <div className="pt-2 space-y-1 text-xs">
            <Link
              to="/admin"
              className="block px-3 py-1.5 rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE4]"
            >
              Admin Panel
            </Link>
            <Link
              to="/"
              className="block px-3 py-1.5 rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE4]"
            >
              Kembali ke Katalog
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 overflow-x-hidden">
        {isLocked && (
          <div className="mb-4 p-3.5 rounded-2xl border border-amber-300 bg-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-amber-900">
              Akun sedang menunggu approval Admin WInvit.
            </p>
            <Button
              size="sm"
              variant="gold"
              className="w-full sm:w-auto rounded-xl"
              onClick={() =>
                setInvitation((prev) => ({ ...prev, status: "ACTIVE_DRAFT" }))
              }
            >
              Buka Kunci (Simulasi)
            </Button>
          </div>
        )}

        {/* MENU 1: DETAIL UNDANGAN */}
        {sidebarMenu === "detail" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="xl:col-span-7 space-y-4 min-w-0">
              {/* App-like Step Header + Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg sm:text-xl font-bold">Detail Undangan</h1>
                  <span className="text-xs font-semibold text-[#A8763E] bg-[#C89B57]/15 px-2.5 py-1 rounded-full">
                    Step {currentStep} / {detailSubMenus.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E5DDD5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C89B57] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Swipeable Horizontal Step Pills (Hidden Scrollbar) */}
              <div
                ref={stepStripRef}
                onMouseDown={(e) => {
                  if (!stepStripRef.current) return
                  isDraggingRef.current = true
                  startXRef.current = e.pageX - stepStripRef.current.offsetLeft
                  scrollLeftRef.current = stepStripRef.current.scrollLeft
                }}
                onMouseLeave={() => {
                  isDraggingRef.current = false
                }}
                onMouseUp={() => {
                  isDraggingRef.current = false
                }}
                onMouseMove={(e) => {
                  if (!isDraggingRef.current || !stepStripRef.current) return
                  e.preventDefault()
                  const x = e.pageX - stepStripRef.current.offsetLeft
                  const walk = (x - startXRef.current) * 1.5
                  stepStripRef.current.scrollLeft = scrollLeftRef.current - walk
                }}
                className="flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-1.5 sm:py-1.5 sm:rounded-2xl sm:bg-[#F2ECE4] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing"
              >
                {detailSubMenus.map((sub) => {
                  const active = detailTab === sub.id
                  const passed = sub.step < currentStep
                  return (
                    <button
                      key={sub.id}
                      data-step-tab={sub.id}
                      type="button"
                      onClick={() => setDetailTab(sub.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-full sm:rounded-xl text-xs font-medium transition active:scale-95 ${active
                          ? "bg-[#2C2018] text-white sm:bg-white sm:text-[#2C2018] shadow-sm"
                          : passed
                            ? "bg-[#C89B57]/15 text-[#A8763E] sm:bg-transparent"
                            : "bg-white sm:bg-transparent text-[#6B5B4E] border border-[#E5DDD5] sm:border-0"
                        }`}
                    >
                      {passed ? (
                        <Check className="w-3 h-3 text-[#A8763E]" />
                      ) : (
                        <span>{sub.step}.</span>
                      )}
                      <span>{sub.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* SUB 1: TEMA */}
              {detailTab === "theme" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-3.5 sm:p-5 space-y-3.5">
                    {/* Free-text Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#6B5B4E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        value={themeSearch}
                        onChange={(e) => setThemeSearch(e.target.value)}
                        placeholder="Cari nama tema, adat, warna..."
                        className="pl-9 pr-9 h-11 sm:h-10 rounded-xl bg-[#FAF6F1]"
                      />
                      {themeSearch && (
                        <button
                          type="button"
                          onClick={() => setThemeSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5B4E] hover:text-[#2C2018]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {[
                        { id: "all", label: "Semua" },
                        { id: "adat", label: "Adat" },
                        { id: "luxury", label: "Luxury" },
                        { id: "editorial", label: "Editorial" },
                        { id: "nature", label: "Nature" },
                      ].map((cat) => {
                        const active = themeCatFilter === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              setThemeCatFilter(cat.id as "all" | ThemeCategory)
                            }
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition active:scale-95 ${active
                                ? "bg-[#C89B57] text-white"
                                : "bg-[#FAF6F1] text-[#6B5B4E] border border-[#E5DDD5]"
                              }`}
                          >
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>

                    {filteredCustomerThemes.length === 0 ? (
                      <div className="py-10 text-center text-xs text-[#6B5B4E]">
                        Tema tidak ditemukan untuk pencarian "{themeSearch}".
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-[54vh] lg:max-h-[460px] overflow-y-auto pr-0.5">
                        {filteredCustomerThemes.map((t) => {
                          const selected = t.id === draft.themeId
                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  themeId: t.id,
                                }))
                              }
                              className={`text-left rounded-2xl border p-2 transition active:scale-[0.98] ${selected
                                  ? "border-[#C89B57] bg-[#C89B57]/10 ring-2 ring-[#C89B57]"
                                  : "border-[#E5DDD5] bg-white"
                                }`}
                            >
                              <div className="aspect-[9/16] rounded-xl overflow-hidden bg-[#F2ECE4] mb-1.5 relative">
                                <img
                                  src={`/asset/img/thumbnails/${t.id}/mobile-2.jpg`}
                                  onError={(e) => {
                                    e.currentTarget.src = t.thumb
                                  }}
                                  alt={t.title}
                                  className="w-full h-full object-cover object-top"
                                />
                                {selected && (
                                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#C89B57] text-white flex items-center justify-center">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-xs truncate px-0.5">{t.title}</p>
                              <p className="text-[10px] text-[#6B5B4E] truncate px-0.5">
                                {t.categoryName}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E5DDD5] flex justify-end">
                      <Button
                        type="button"
                        variant="gold"
                        className="w-full sm:w-auto h-11 rounded-xl"
                        onClick={() => setDetailTab("couple")}
                      >
                        Lanjut: Data Mempelai
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB 2: DATA MEMPELAI */}
              {detailTab === "couple" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
                        Slug URL (/u/slug)
                      </label>
                      <Input
                        disabled={isLocked}
                        value={draft.slug}
                        placeholder="contoh: romeo-juliet"
                        className="h-11 sm:h-10 rounded-xl"
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mempelai Wanita */}
                      <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <h4 className="font-semibold text-sm">Mempelai Wanita</h4>
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Panggilan"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.bride.nickname}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                bride: { ...prev.couple.bride, nickname: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Lengkap"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.bride.fullName}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                bride: { ...prev.couple.bride, fullName: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Ayah"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.bride.fatherName}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                bride: { ...prev.couple.bride, fatherName: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Ibu"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.bride.motherName}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                bride: { ...prev.couple.bride, motherName: e.target.value },
                              },
                            }))
                          }
                        />

                        <div className="pt-1">
                          <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                            <Camera className="w-4 h-4 text-[#C89B57]" />
                            <span>Upload Foto Wanita</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isLocked}
                              onChange={handleBridePhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {draft.couple.bride.photo && (
                            <div className="mt-2 flex items-center gap-2.5">
                              <img
                                src={draft.couple.bride.photo}
                                alt="Bride"
                                className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    couple: {
                                      ...prev.couple,
                                      bride: { ...prev.couple.bride, photo: "" },
                                    },
                                  }))
                                }
                                className="text-xs text-red-600 underline"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mempelai Pria */}
                      <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <h4 className="font-semibold text-sm">Mempelai Pria</h4>
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Panggilan"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.groom.nickname}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                groom: { ...prev.couple.groom, nickname: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Lengkap"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.groom.fullName}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                groom: { ...prev.couple.groom, fullName: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Ayah"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.groom.fatherName}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                groom: { ...prev.couple.groom, fatherName: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Nama Ibu"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.couple.groom.motherName}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              couple: {
                                ...prev.couple,
                                groom: { ...prev.couple.groom, motherName: e.target.value },
                              },
                            }))
                          }
                        />

                        <div className="pt-1">
                          <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                            <Camera className="w-4 h-4 text-[#C89B57]" />
                            <span>Upload Foto Pria</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isLocked}
                              onChange={handleGroomPhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {draft.couple.groom.photo && (
                            <div className="mt-2 flex items-center gap-2.5">
                              <img
                                src={draft.couple.groom.photo}
                                alt="Groom"
                                className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    couple: {
                                      ...prev.couple,
                                      groom: { ...prev.couple.groom, photo: "" },
                                    },
                                  }))
                                }
                                className="text-xs text-red-600 underline"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5DDD5] flex gap-2 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("theme")}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="gold"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("events")}
                      >
                        Lanjut: Acara
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB 3: ACARA */}
              {detailTab === "events" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <h4 className="font-semibold text-sm">Akad Nikah</h4>
                        <Input
                          disabled={isLocked}
                          type="date"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.events.akad.date}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                akad: { ...prev.events.akad, date: e.target.value },
                              },
                            }))
                          }
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            disabled={isLocked}
                            placeholder="Jam Mulai"
                            className="h-11 sm:h-10 bg-white rounded-xl"
                            value={draft.events.akad.startTime}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                events: {
                                  ...prev.events,
                                  akad: { ...prev.events.akad, startTime: e.target.value },
                                },
                              }))
                            }
                          />
                          <Input
                            disabled={isLocked}
                            placeholder="Jam Selesai"
                            className="h-11 sm:h-10 bg-white rounded-xl"
                            value={draft.events.akad.endTime}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                events: {
                                  ...prev.events,
                                  akad: { ...prev.events.akad, endTime: e.target.value },
                                },
                              }))
                            }
                          />
                        </div>
                        <Input
                          disabled={isLocked}
                          placeholder="Alamat Lokasi"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.events.akad.address}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                akad: { ...prev.events.akad, address: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Link Google Maps"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.events.akad.mapsUrl}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                akad: { ...prev.events.akad, mapsUrl: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <h4 className="font-semibold text-sm">Resepsi</h4>
                        <Input
                          disabled={isLocked}
                          type="date"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.events.resepsi.date}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                resepsi: { ...prev.events.resepsi, date: e.target.value },
                              },
                            }))
                          }
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            disabled={isLocked}
                            placeholder="Jam Mulai"
                            className="h-11 sm:h-10 bg-white rounded-xl"
                            value={draft.events.resepsi.startTime}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                events: {
                                  ...prev.events,
                                  resepsi: { ...prev.events.resepsi, startTime: e.target.value },
                                },
                              }))
                            }
                          />
                          <Input
                            disabled={isLocked}
                            placeholder="Jam Selesai"
                            className="h-11 sm:h-10 bg-white rounded-xl"
                            value={draft.events.resepsi.endTime}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                events: {
                                  ...prev.events,
                                  resepsi: { ...prev.events.resepsi, endTime: e.target.value },
                                },
                              }))
                            }
                          />
                        </div>
                        <Input
                          disabled={isLocked}
                          placeholder="Alamat Lokasi"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.events.resepsi.address}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                resepsi: { ...prev.events.resepsi, address: e.target.value },
                              },
                            }))
                          }
                        />
                        <Input
                          disabled={isLocked}
                          placeholder="Link Google Maps"
                          className="h-11 sm:h-10 bg-white rounded-xl"
                          value={draft.events.resepsi.mapsUrl}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                resepsi: { ...prev.events.resepsi, mapsUrl: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5DDD5] flex gap-2 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("couple")}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="gold"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("media")}
                      >
                        Lanjut: Foto & Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB 4: FOTO & VIDEO */}
              {detailTab === "media" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                        Upload Video
                      </label>
                      <label className="flex items-center justify-center gap-2 w-full h-12 px-4 rounded-2xl border border-dashed border-[#C89B57] bg-[#FAF6F1] text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                        <Video className="w-4 h-4 text-[#C89B57]" />
                        <span>Pilih Video dari HP</span>
                        <input
                          type="file"
                          accept="video/*"
                          disabled={isLocked}
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                      {draft.media.videoUrl && (
                        <div className="mt-2.5 flex items-center gap-3">
                          <video
                            src={draft.media.videoUrl}
                            controls
                            className="h-24 rounded-xl border border-[#E5DDD5] bg-black"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                media: { ...prev.media, videoUrl: "" },
                              }))
                            }
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-[#E5DDD5]">
                      <label className="block text-xs font-medium text-[#6B5B4E]">
                        Upload Foto Galeri
                      </label>
                      <label className="flex items-center justify-center gap-2 w-full h-12 px-4 rounded-2xl border border-dashed border-[#C89B57] bg-[#FAF6F1] text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                        <ImagePlus className="w-4 h-4 text-[#C89B57]" />
                        <span>Pilih Foto Galeri</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isLocked}
                          onChange={handleGalleryPhotosUpload}
                          className="hidden"
                        />
                      </label>

                      {draft.media.gallery.length === 0 ? (
                        <p className="text-xs text-[#6B5B4E] py-4 text-center">
                          Belum ada foto yang diupload.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                          {draft.media.gallery.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-[#E5DDD5] p-2 bg-[#FAF6F1] space-y-2"
                            >
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white">
                                <img
                                  src={imgUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs rounded-lg"
                                disabled={isLocked}
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    media: {
                                      ...prev.media,
                                      gallery: prev.media.gallery.filter((_, i) => i !== idx),
                                    },
                                  }))
                                }
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E5DDD5] flex gap-2 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("events")}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="gold"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("gift")}
                      >
                        Lanjut: Rekening
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB 5: REKENING */}
              {detailTab === "gift" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Daftar Rekening</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        disabled={isLocked}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            gifts: {
                              ...prev.gifts,
                              bankAccounts: [
                                ...prev.gifts.bankAccounts,
                                { bankName: "", accountNumber: "", accountHolder: "" },
                              ],
                            },
                          }))
                        }
                      >
                        + Tambah Rekening
                      </Button>
                    </div>

                    {draft.gifts.bankAccounts.length === 0 ? (
                      <p className="text-xs text-[#6B5B4E] py-4 text-center">
                        Belum ada nomor rekening.
                      </p>
                    ) : (
                      draft.gifts.bankAccounts.map((acc, idx) => (
                        <div
                          key={idx}
                          className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]"
                        >
                          <Input
                            disabled={isLocked}
                            placeholder="Nama Bank"
                            className="h-11 sm:h-10 bg-white rounded-xl"
                            value={acc.bankName}
                            onChange={(e) => {
                              const next = [...draft.gifts.bankAccounts]
                              next[idx] = { ...next[idx], bankName: e.target.value }
                              setDraft((prev) => ({
                                ...prev,
                                gifts: { ...prev.gifts, bankAccounts: next },
                              }))
                            }}
                          />
                          <Input
                            disabled={isLocked}
                            placeholder="No. Rekening"
                            className="h-11 sm:h-10 bg-white rounded-xl"
                            value={acc.accountNumber}
                            onChange={(e) => {
                              const next = [...draft.gifts.bankAccounts]
                              next[idx] = { ...next[idx], accountNumber: e.target.value }
                              setDraft((prev) => ({
                                ...prev,
                                gifts: { ...prev.gifts, bankAccounts: next },
                              }))
                            }}
                          />
                          <div className="flex gap-1.5">
                            <Input
                              disabled={isLocked}
                              placeholder="Atas Nama"
                              className="h-11 sm:h-10 bg-white rounded-xl"
                              value={acc.accountHolder}
                              onChange={(e) => {
                                const next = [...draft.gifts.bankAccounts]
                                next[idx] = { ...next[idx], accountHolder: e.target.value }
                                setDraft((prev) => ({
                                  ...prev,
                                  gifts: { ...prev.gifts, bankAccounts: next },
                                }))
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-11 sm:h-10 px-3 rounded-xl"
                              disabled={isLocked}
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  gifts: {
                                    ...prev.gifts,
                                    bankAccounts: prev.gifts.bankAccounts.filter(
                                      (_, i) => i !== idx
                                    ),
                                  },
                                }))
                              }
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="pt-2">
                      <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
                        Alamat Kado Fisik
                      </label>
                      <Input
                        disabled={isLocked}
                        placeholder="Alamat lengkap penerima kado..."
                        className="h-11 sm:h-10 rounded-xl"
                        value={draft.gifts.giftAddress}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            gifts: { ...prev.gifts, giftAddress: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="pt-2 border-t border-[#E5DDD5] flex gap-2 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("media")}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="gold"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("sections")}
                      >
                        Lanjut: Section
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB 6: ATUR SECTION */}
              {detailTab === "sections" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="space-y-2">
                      {SECTION_LABELS.map((sec) => {
                        const isVisible = !draft.layout.hiddenSections.includes(sec.key)
                        return (
                          <div
                            key={sec.key}
                            className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-[#E5DDD5] bg-[#FAF6F1] text-sm"
                          >
                            <span>{sec.label}</span>
                            <Switch
                              disabled={isLocked || sec.locked}
                              checked={isVisible}
                              onCheckedChange={() => toggleDraftSection(sec.key)}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#E5DDD5] flex gap-2 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("gift")}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="gold"
                        className="h-11 rounded-xl"
                        onClick={() => setDetailTab("confirm")}
                      >
                        Lanjut: Konfirmasi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB 7: KONFIRMASI & DETAIL + BUTTON GENERATE UNDANGAN */}
              {detailTab === "confirm" && (
                <Card className="rounded-2xl shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {generatedNotice && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                        Undangan berhasil di-generate ke preview.
                      </div>
                    )}

                    {/* 1. Ringkasan Tema & Slug */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={`/asset/img/thumbnails/${draftTheme.id}/mobile-2.jpg`}
                          onError={(e) => {
                            e.currentTarget.src = draftTheme.thumb
                          }}
                          alt={draftTheme.title}
                          className="w-12 h-16 rounded-lg object-cover object-top border border-[#E5DDD5] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-[#6B5B4E]">Tema & URL Undangan</p>
                          <p className="font-semibold text-sm truncate">{draftTheme.title}</p>
                          <p className="text-xs text-[#A8763E] truncate">
                            /u/{draft.slug || "undangan"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailTab("theme")}
                        className="text-xs font-medium text-[#A8763E] underline shrink-0"
                      >
                        Ubah
                      </button>
                    </div>

                    {/* 2. Ringkasan Mempelai */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#6B5B4E]">
                          Data Mempelai
                        </span>
                        <button
                          type="button"
                          onClick={() => setDetailTab("couple")}
                          className="text-xs font-medium text-[#A8763E] underline"
                        >
                          Ubah
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-[#E5DDD5] flex items-center gap-2.5">
                          {draft.couple.bride.photo && (
                            <img
                              src={draft.couple.bride.photo}
                              alt="Bride"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2C2018] truncate">
                              {draft.couple.bride.fullName ||
                                draft.couple.bride.nickname ||
                                "Belum diisi"}
                            </p>
                            <p className="text-[#6B5B4E] truncate">
                              Putri {draft.couple.bride.fatherName || "-"} &{" "}
                              {draft.couple.bride.motherName || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-[#E5DDD5] flex items-center gap-2.5">
                          {draft.couple.groom.photo && (
                            <img
                              src={draft.couple.groom.photo}
                              alt="Groom"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2C2018] truncate">
                              {draft.couple.groom.fullName ||
                                draft.couple.groom.nickname ||
                                "Belum diisi"}
                            </p>
                            <p className="text-[#6B5B4E] truncate">
                              Putra {draft.couple.groom.fatherName || "-"} &{" "}
                              {draft.couple.groom.motherName || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Ringkasan Acara */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#6B5B4E]">
                          Jadwal & Lokasi Acara
                        </span>
                        <button
                          type="button"
                          onClick={() => setDetailTab("events")}
                          className="text-xs font-medium text-[#A8763E] underline"
                        >
                          Ubah
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-[#E5DDD5]">
                          <p className="font-semibold">Akad Nikah</p>
                          <p className="text-[#6B5B4E]">
                            {draft.events.akad.date || "-"} •{" "}
                            {draft.events.akad.startTime || "-"}
                          </p>
                          <p className="text-[#6B5B4E] truncate">
                            {draft.events.akad.address || "Alamat belum diisi"}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-[#E5DDD5]">
                          <p className="font-semibold">Resepsi</p>
                          <p className="text-[#6B5B4E]">
                            {draft.events.resepsi.date || "-"} •{" "}
                            {draft.events.resepsi.startTime || "-"}
                          </p>
                          <p className="text-[#6B5B4E] truncate">
                            {draft.events.resepsi.address || "Alamat belum diisi"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Ringkasan Media, Rekening & Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <div className="flex justify-between mb-1">
                          <span className="text-[#6B5B4E]">Galeri & Video</span>
                          <button
                            type="button"
                            onClick={() => setDetailTab("media")}
                            className="text-[#A8763E] underline"
                          >
                            Ubah
                          </button>
                        </div>
                        <p className="font-semibold">
                          {draft.media.gallery.length} Foto •{" "}
                          {draft.media.videoUrl ? "1 Video" : "0 Video"}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <div className="flex justify-between mb-1">
                          <span className="text-[#6B5B4E]">Rekening</span>
                          <button
                            type="button"
                            onClick={() => setDetailTab("gift")}
                            className="text-[#A8763E] underline"
                          >
                            Ubah
                          </button>
                        </div>
                        <p className="font-semibold">
                          {draft.gifts.bankAccounts.length} Rekening Bank
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
                        <div className="flex justify-between mb-1">
                          <span className="text-[#6B5B4E]">Section Aktif</span>
                          <button
                            type="button"
                            onClick={() => setDetailTab("sections")}
                            className="text-[#A8763E] underline"
                          >
                            Ubah
                          </button>
                        </div>
                        <p className="font-semibold">
                          {SECTION_LABELS.length - draft.layout.hiddenSections.length} /{" "}
                          {SECTION_LABELS.length} Section
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5DDD5] flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto h-11 rounded-xl"
                        onClick={() => setDetailTab("sections")}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="gold"
                        className="w-full flex-1 h-11 rounded-xl"
                        disabled={isLocked}
                        onClick={handleGenerateInvitation}
                      >
                        Generate Undangan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Desktop Right 5 Cols: Sticky iPhone 15 Preview */}
            <div className="hidden xl:block xl:col-span-5 xl:sticky xl:top-6">
              <div className="flex flex-col items-center">
                {/* iPhone 15 Pro Frame */}
                <div className="relative w-[330px] h-[660px] rounded-[52px] bg-[#1c1c1e] p-[11px] shadow-[0_24px_60px_rgba(44,32,24,0.28)] border-[3px] border-[#3a3a3c]">
                  {/* Side Hardware Buttons */}
                  <div className="absolute -left-[5px] top-28 w-[3px] h-7 bg-[#3a3a3c] rounded-l-md" />
                  <div className="absolute -left-[5px] top-40 w-[3px] h-12 bg-[#3a3a3c] rounded-l-md" />
                  <div className="absolute -left-[5px] top-56 w-[3px] h-12 bg-[#3a3a3c] rounded-l-md" />
                  <div className="absolute -right-[5px] top-44 w-[3px] h-16 bg-[#3a3a3c] rounded-r-md" />

                  {/* Inner Screen */}
                  <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#FAF6F1] flex flex-col">
                    {/* Dynamic Island */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-24 h-6 bg-black rounded-full flex items-center justify-end pr-2.5 shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e] border border-white/10" />
                    </div>

                    {hasGenerated ? (
                      <div className="w-full h-full pt-0">
                        <InvitationRenderer
                          previewData={invitation}
                          previewThemePath={previewTheme.path}
                          embedded
                          renderKey={renderKey}
                        />
                      </div>
                    ) : (
                      /* Dummy Skeleton Layout + Message when not generated yet */
                      <div className="relative w-full h-full flex flex-col justify-between p-5 pt-12 pb-8 bg-gradient-to-b from-[#FAF6F1] via-[#F2ECE4] to-[#E5DDD5] select-none">
                        {/* Background Dummy Skeleton Elements */}
                        <div className="space-y-4 opacity-45 pointer-events-none">
                          <div className="w-20 h-3 mx-auto rounded-full bg-[#C89B57]/40" />
                          <div className="w-36 h-44 mx-auto rounded-t-full rounded-b-2xl bg-white/80 border border-[#C89B57]/30" />
                          <div className="w-44 h-5 mx-auto rounded-full bg-[#2C2018]/25" />
                          <div className="w-28 h-3 mx-auto rounded-full bg-[#6B5B4E]/30" />
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="h-14 rounded-xl bg-white/70" />
                            <div className="h-14 rounded-xl bg-white/70" />
                            <div className="h-14 rounded-xl bg-white/70" />
                          </div>
                        </div>

                        {/* Center Callout Card */}
                        <div className="my-auto relative z-10 bg-white/95 backdrop-blur-md border border-[#E5DDD5] rounded-2xl p-5 text-center shadow-lg space-y-2.5">
                          <div className="w-10 h-10 rounded-full bg-[#C89B57]/15 text-[#A8763E] flex items-center justify-center mx-auto">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-sm text-[#2C2018]">
                            Preview Belum Tersedia
                          </h3>
                          <p className="text-xs text-[#6B5B4E] leading-relaxed">
                            Lengkapi data undangan untuk melihat preview.
                          </p>
                        </div>

                        <div className="w-32 h-8 mx-auto rounded-full bg-[#2C2018]/15 opacity-40" />
                      </div>
                    )}

                    {/* iPhone Home Bar */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-28 h-1 bg-[#2C2018]/40 rounded-full pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE DEDICATED PREVIEW VIEW */}
        {sidebarMenu === "preview" && (
          <div className="max-w-md mx-auto flex flex-col items-center space-y-3">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-lg font-bold">Preview Undangan</h1>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setSidebarMenu("detail")}
              >
                Kembali ke Detail
              </Button>
            </div>

            {/* Mobile iPhone 15 Frame */}
            <div className="relative w-full max-w-[330px] h-[640px] rounded-[50px] bg-[#1c1c1e] p-[10px] shadow-[0_20px_50px_rgba(44,32,24,0.25)] border-[3px] border-[#3a3a3c]">
              <div className="absolute -left-[5px] top-28 w-[3px] h-7 bg-[#3a3a3c] rounded-l-md" />
              <div className="absolute -left-[5px] top-40 w-[3px] h-12 bg-[#3a3a3c] rounded-l-md" />
              <div className="absolute -right-[5px] top-44 w-[3px] h-16 bg-[#3a3a3c] rounded-r-md" />

              <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#FAF6F1] flex flex-col">
                {/* Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-24 h-6 bg-black rounded-full flex items-center justify-end pr-2.5 shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e] border border-white/10" />
                </div>

                {hasGenerated ? (
                  <div className="w-full h-full">
                    <InvitationRenderer
                      previewData={invitation}
                      previewThemePath={previewTheme.path}
                      embedded
                      renderKey={renderKey}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col justify-between p-5 pt-12 pb-8 bg-gradient-to-b from-[#FAF6F1] via-[#F2ECE4] to-[#E5DDD5] select-none">
                    <div className="space-y-4 opacity-45 pointer-events-none">
                      <div className="w-20 h-3 mx-auto rounded-full bg-[#C89B57]/40" />
                      <div className="w-36 h-40 mx-auto rounded-t-full rounded-b-2xl bg-white/80 border border-[#C89B57]/30" />
                      <div className="w-44 h-5 mx-auto rounded-full bg-[#2C2018]/25" />
                      <div className="w-28 h-3 mx-auto rounded-full bg-[#6B5B4E]/30" />
                    </div>

                    <div className="my-auto relative z-10 bg-white/95 backdrop-blur-md border border-[#E5DDD5] rounded-2xl p-5 text-center shadow-lg space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#C89B57]/15 text-[#A8763E] flex items-center justify-center mx-auto">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-sm text-[#2C2018]">
                        Preview Belum Tersedia
                      </h3>
                      <p className="text-xs text-[#6B5B4E] leading-relaxed">
                        Lengkapi data undangan untuk melihat preview.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="gold"
                        className="w-full rounded-xl"
                        onClick={() => setSidebarMenu("detail")}
                      >
                        Isi Data Undangan
                      </Button>
                    </div>

                    <div className="w-32 h-8 mx-auto rounded-full bg-[#2C2018]/15 opacity-40" />
                  </div>
                )}

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-28 h-1 bg-[#2C2018]/40 rounded-full pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* MENU 2: SEBAR UNDANGAN */}
        {sidebarMenu === "share" && (
          <div className="max-w-xl space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">Sebar Undangan</h1>
            <Card className="rounded-2xl shadow-xs">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                    Nama Tamu Undangan
                  </label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Contoh: Budi Santoso & Partner"
                    className="h-11 sm:h-10 rounded-xl"
                  />
                  <p className="text-xs text-[#6B5B4E] mt-2 break-all bg-[#FAF6F1] p-2.5 rounded-xl border border-[#E5DDD5]">
                    {personalizedUrl}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 sm:h-10 rounded-xl"
                    onClick={() => handleCopyLink(personalizedUrl)}
                  >
                    {copiedLink ? "Tersalin" : "Salin Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="gold"
                    className="h-11 sm:h-10 rounded-xl"
                    asChild
                  >
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        getWaMessage(guestName)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Kirim ke WA
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MENU 3: PROFILE CUSTOMER */}
        {sidebarMenu === "profile" && (
          <div className="max-w-xl space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">Profile</h1>
            <Card className="rounded-2xl shadow-xs">
              <CardContent className="p-4 sm:p-5">
                {profileSaved && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    Profile berhasil disimpan.
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
                      Nama Pemesan
                    </label>
                    <Input
                      value={draft.customer.orderName}
                      placeholder="Nama lengkap pemesan"
                      className="h-11 sm:h-10 rounded-xl"
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, orderName: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
                      No. HP / WhatsApp
                    </label>
                    <Input
                      value={draft.customer.phone}
                      placeholder="0812xxxxxxxx"
                      className="h-11 sm:h-10 rounded-xl"
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, phone: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={draft.customer.email}
                      placeholder="email@domain.com"
                      className="h-11 sm:h-10 rounded-xl"
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, email: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
                      Password Baru
                    </label>
                    <Input
                      type="password"
                      value={profilePassword}
                      placeholder="Kosongkan jika tidak diubah"
                      className="h-11 sm:h-10 rounded-xl"
                      onChange={(e) => setProfilePassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" variant="gold" className="w-full h-11 sm:h-10 rounded-xl">
                    Simpan Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* NATIVE MOBILE APP FLOATING BOTTOM NAVIGATION BAR (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur-lg border border-[#E5DDD5] shadow-[0_8px_30px_rgba(44,32,24,0.14)] rounded-2xl grid grid-cols-4 p-1.5">
          {[
            { id: "detail" as SidebarMenu, label: "Detail", Icon: FileText },
            { id: "preview" as SidebarMenu, label: "Preview", Icon: Smartphone },
            { id: "share" as SidebarMenu, label: "Sebar", Icon: Send },
            { id: "profile" as SidebarMenu, label: "Profile", Icon: User },
          ].map(({ id, label, Icon }) => {
            const active = sidebarMenu === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSidebarMenu(id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95 ${active
                    ? "bg-[#2C2018] text-white shadow-sm"
                    : "text-[#6B5B4E] hover:text-[#2C2018]"
                  }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-[#C89B57]" : "text-[#6B5B4E]"
                    }`}
                />
                <span className="text-[11px] font-medium leading-none">{label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
