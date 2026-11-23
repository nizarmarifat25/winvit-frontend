import { useState, useRef, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FileText,
  Send,
  User,
  ExternalLink,
  LogIn,
  LogOut,
  Heart,
  CalendarDays,
  BookHeart,
  Images,
  Gift,
  Eye,
  EyeOff,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react"
import { useWinvit } from "@/context/WinvitContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CoupleStep from "@/modules/customer/components/CoupleStep"
import EventsStep from "@/modules/customer/components/EventsStep"
import StoryStep from "@/modules/customer/components/StoryStep"
import GiftStep from "@/modules/customer/components/GiftStep"
import MediaStep from "@/modules/customer/components/MediaStep"
import CustomerProfile from "@/modules/customer/components/CustomerProfile"
import ShareInvitation from "@/modules/customer/components/ShareInvitation"
import { useInvitationDraft } from "@/modules/customer/hooks/useInvitationDraft"
import type { DetailSubTab } from "@/modules/customer/types"
import { getAccessToken, clearTokens } from "@/lib/api"
import { DEFAULT_INVITATION } from "@/data/themes"
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog"

type SidebarMenu = "detail" | "share" | "profile"

export function CustomerDashboard() {
  const navigate = useNavigate()
  const { themes, refreshPublicThemes, invitation, setInvitation } = useWinvit()

  useEffect(() => {
    refreshPublicThemes()
  }, [])
  const {
    draft,
    setDraft,
    generatedNotice,
    isGenerating,
    isPublishing,
    uploadingField,
    syncError,
    handleBridePhotoUpload,
    handleGroomPhotoUpload,
    handleCoverPhotoUpload,
    handleMusicUpload,
    handleStoryPhotoUpload,
    handleGalleryPhotosUpload,
    handleGenerateInvitation,
    handleSetPublishStatus,
  } = useInvitationDraft(invitation, setInvitation)

  // Main Menu: Detail Undangan | Sebar Undangan | Profile
  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenu>("detail")
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [showStatusTooltip, setShowStatusTooltip] = useState(false)

  // Free-jump section tabs inside Detail Undangan
  const [detailTab, setDetailTab] = useState<DetailSubTab>("couple")
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

  const isLocked =
    invitation.status === "PENDING_PAYMENT" ||
    invitation.status === "WAITING_APPROVAL"
  const isPublished =
    invitation.status === "PUBLISHED" || Boolean(invitation.isPublished)

  const slugPath = invitation.slug || draft.slug || "undangan"
  const editorTabs: Array<{
    id: DetailSubTab
    label: string
    Icon: typeof Heart
    count?: number
  }> = [
    { id: "couple", label: "Mempelai", Icon: Heart },
    {
      id: "events",
      label: "Acara",
      Icon: CalendarDays,
      count: (draft.eventList || []).length,
    },
    {
      id: "story",
      label: "Love Story",
      Icon: BookHeart,
      count: draft.stories.length,
    },
    {
      id: "media",
      label: "Galeri",
      Icon: Images,
      count: draft.media.gallery.length,
    },
    {
      id: "gift",
      label: "Rekening",
      Icon: Gift,
      count: draft.gifts.bankAccounts.length,
    },
  ]

  const draftTheme =
    themes.find(
      (t) => t.id === draft.themeId || t.backendId === draft.themeId
    ) || themes[0]
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(invitation),
    [draft, invitation]
  )
  const isLoggedIn = Boolean(getAccessToken())

  const handleLogout = () => {
    clearTokens()
    setInvitation(DEFAULT_INVITATION)
    navigate("/login")
  }

  const editorStepProps = {
    detailTab,
    draft,
    setDraft,
    isLocked,
    handleBridePhotoUpload,
    handleGroomPhotoUpload,
    handleCoverPhotoUpload,
    handleMusicUpload,
    handleStoryPhotoUpload,
    handleGalleryPhotosUpload,
    uploadingField,
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F1] text-[#2C2018]">
      {/* MOBILE TOP APP BAR (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5DDD5] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="font-serif text-lg font-bold text-[#2C2018]">
            In<span className="text-[#C89B57]">vitaa</span>
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
                ? "Sudah Publish"
                : "Belum Publish"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {!isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs rounded-full"
              asChild
            >
              <Link to="/login">
                <LogIn className="w-3 h-3" /> Login
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs rounded-full"
            asChild
          >
            <Link to={`/preview/${slugPath}`} target="_blank">
              Preview Web <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (lg and up) */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-[#E5DDD5] bg-white flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          <div>
            <Link to="/" className="font-serif text-xl font-bold text-[#2C2018]">
              In<span className="text-[#C89B57]">vitaa</span>
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
                    ? "Sudah Publish"
                    : "Belum Publish (Draft)"}
              </Badge>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setSidebarMenu("detail")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${sidebarMenu === "detail"
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
          <div className="px-3 py-2 rounded-xl bg-[#FAF6F1] border border-[#E5DDD5] text-xs space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[#6B5B4E]">
              Status Undangan
            </p>
            <p
              className={`font-semibold ${invitation.status === "PUBLISHED"
                  ? "text-emerald-700"
                  : "text-[#A8763E]"
                }`}
            >
              {invitation.status === "PUBLISHED"
                ? "Sudah Publish (Live)"
                : "Belum Publish (Draft)"}
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/preview/${slugPath}`} target="_blank">
              Lihat Preview Web
            </Link>
          </Button>

          <div className="pt-2 space-y-1 text-xs">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE4]"
            >
              Kembali ke Katalog
            </Link>
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left font-medium transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 overflow-x-clip">
        {isLocked && (
          <div className="mb-4 p-3.5 rounded-2xl border border-amber-300 bg-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-amber-900">
              Akun sedang menunggu approval Admin Invitaa.
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

        {/* MENU 1: DETAIL UNDANGAN (TAB EDITOR + STICKY ACTION BAR) */}
        {sidebarMenu === "detail" && (
          <div className="w-full space-y-4 min-w-0">
            {/* Sticky Editor Header + Free-Jump Section Tabs */}
            <div className="sticky top-14 lg:top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 -mt-4 pt-4 sm:-mt-6 sm:pt-5 lg:-mt-8 lg:pt-6 pb-3 bg-[#FAF6F1]/95 backdrop-blur-md space-y-3">
              <div className="bg-white rounded-2xl border border-[#E5DDD5] p-3.5 sm:px-4 sm:py-3 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={`/asset/img/thumbnails/${draftTheme.id}/mobile-2.jpg`}
                    onError={(e) => {
                      e.currentTarget.src = draftTheme.thumb
                    }}
                    alt={draftTheme.title}
                    className="hidden sm:block w-10 h-12 rounded-xl object-cover object-top border border-[#E5DDD5] shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="relative flex flex-wrap items-center gap-2">
                      <h1 className="text-base sm:text-lg font-bold leading-tight">
                        Detail Undangan
                      </h1>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPublished ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {isPublished ? "Live" : "Draft"}
                      </span>

                      <button
                        type="button"
                        aria-label="Info editor undangan"
                        onMouseEnter={() => setShowStatusTooltip(true)}
                        onMouseLeave={() => setShowStatusTooltip(false)}
                        onClick={() => setShowStatusTooltip((prev) => !prev)}
                        onBlur={() => setShowStatusTooltip(false)}
                        className="p-0.5 rounded-full text-[#6B5B4E] hover:text-[#2C2018] hover:bg-[#F2ECE4] transition cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {showStatusTooltip && (
                        <div
                          role="tooltip"
                          className="absolute left-0 top-full mt-2 z-30 w-64 sm:w-80 p-3 rounded-xl bg-[#2C2018] text-white text-xs leading-relaxed shadow-lg pointer-events-none"
                        >
                          {isPublished
                            ? "Undangan sedang Live dan bisa diakses tamu. Anda bebas edit tab mana saja lalu klik Simpan Perubahan, atau Unpublish untuk kembali ke Draft."
                            : "Undangan masih Draft. Edit bagian mana saja, klik Simpan Perubahan, cek hasil lewat Preview, lalu klik Publish agar undangan dapat dibuka tamu."}
                        </div>
                      )}

                      {generatedNotice ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Tersimpan
                        </span>
                      ) : hasUnsavedChanges ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Belum disimpan
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-[#6B5B4E] truncate">
                      <span>{draftTheme.title}</span>
                      <span className="mx-1.5 text-[#C8BBAE]">•</span>
                      <span className="text-[#A8763E] font-medium">
                        /u/{slugPath}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl bg-white gap-1.5"
                    asChild
                  >
                    <Link to={`/preview/${slugPath}`} target="_blank">
                      <Eye className="w-3.5 h-3.5 text-[#A8763E]" />
                      Preview
                    </Link>
                  </Button>

                  {isPublished ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 gap-1.5"
                      disabled={isLocked || isPublishing || isGenerating}
                      onClick={() => handleSetPublishStatus(false)}
                    >
                      {isPublishing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      disabled={isLocked || isPublishing || isGenerating}
                      onClick={() => handleSetPublishStatus(true)}
                    >
                      {isPublishing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                      Publish
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="gold"
                    size="sm"
                    className="h-9 rounded-xl px-4 gap-1.5"
                    disabled={isLocked || isGenerating}
                    onClick={() => handleGenerateInvitation(() => {})}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {syncError && (
                <p className="text-xs font-medium text-red-600 px-1">
                  {syncError}
                </p>
              )}

              {/* Free-Jump Section Tabs */}
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
                className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[#F2ECE4] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing"
              >
                {editorTabs.map(({ id, label, Icon, count }) => {
                  const active = detailTab === id
                  return (
                    <button
                      key={id}
                      data-step-tab={id}
                      type="button"
                      onClick={() => setDetailTab(id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer ${
                        active
                          ? "bg-white text-[#2C2018] shadow-xs font-semibold"
                          : "text-[#6B5B4E] hover:text-[#2C2018] hover:bg-white/60 font-medium"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          active ? "text-[#A8763E]" : "text-[#8A796B]"
                        }`}
                      />
                      <span>{label}</span>
                      {typeof count === "number" && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none font-semibold ${
                            active
                              ? "bg-[#C89B57]/15 text-[#A8763E]"
                              : "bg-white/70 text-[#6B5B4E]"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <CoupleStep {...editorStepProps} />
            <EventsStep {...editorStepProps} />
            <StoryStep {...editorStepProps} />
            <MediaStep {...editorStepProps} />
            <GiftStep {...editorStepProps} />
          </div>
        )}

        <ShareInvitation
          invitation={invitation}
          slugPath={slugPath}
          isActive={sidebarMenu === "share"}
        />
        <CustomerProfile
          draft={draft}
          setDraft={setDraft}
          isActive={sidebarMenu === "profile"}
        />
      </main>

      {/* NATIVE MOBILE APP FLOATING BOTTOM NAVIGATION BAR (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur-lg border border-[#E5DDD5] shadow-[0_8px_30px_rgba(44,32,24,0.14)] rounded-2xl grid grid-cols-3 p-1.5">
          {[
            { id: "detail" as SidebarMenu, label: "Detail", Icon: FileText },
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
                <span className="text-[11px] font-medium leading-none">
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </div>
  )
}
