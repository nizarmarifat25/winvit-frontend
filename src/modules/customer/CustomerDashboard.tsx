import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FileText,
  Send,
  User,
  Check,
  ExternalLink,
  LogIn,
  LogOut,
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
import ConfirmationStep from "@/modules/customer/components/ConfirmationStep"
import { useInvitationDraft } from "@/modules/customer/hooks/useInvitationDraft"
import type { DetailSubTab } from "@/modules/customer/types"
import { getAccessToken, clearTokens } from "@/lib/api"
import { DEFAULT_INVITATION } from "@/data/themes"

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
    hasGenerated,
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

  // Sub-menu inside Detail Undangan (Starts directly at "couple")
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

  const slugPath = invitation.slug || draft.slug || "undangan"
  const detailSubMenus: Array<{ id: DetailSubTab; label: string; step: number }> =
    [
      { id: "couple", label: "Mempelai", step: 1 },
      { id: "events", label: "Acara", step: 2 },
      { id: "story", label: "Love Story", step: 3 },
      { id: "media", label: "Galeri", step: 4 },
      { id: "gift", label: "Rekening", step: 5 },
      { id: "confirm", label: "Konfirmasi", step: 6 },
    ]

  const draftTheme =
    themes.find(
      (t) => t.id === draft.themeId || t.backendId === draft.themeId
    ) || themes[0]
  const currentStep =
    detailSubMenus.find((s) => s.id === detailTab)?.step || 1
  const progressPercent = (currentStep / detailSubMenus.length) * 100
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
    setDetailTab,
    handleBridePhotoUpload,
    handleGroomPhotoUpload,
    handleCoverPhotoUpload,
    handleMusicUpload,
    handleStoryPhotoUpload,
    handleGalleryPhotosUpload,
    uploadingField,
    draftTheme,
    hasGenerated,
    generatedNotice,
    isGenerating,
    isPublishing,
    syncError,
    onGenerateInvitation: () => handleGenerateInvitation(() => { }),
    onPublishInvitation: () => handleSetPublishStatus(true),
    onUnpublishInvitation: () => handleSetPublishStatus(false),
    onGoToShare: () => setSidebarMenu("share"),
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F1] text-[#2C2018]">
      {/* MOBILE TOP APP BAR (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5DDD5] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="font-serif text-lg font-bold text-[#2C2018]">
            Win<span className="text-[#C89B57]">vitaa</span>
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
            <Link to={`/u/${slugPath}`} target="_blank">
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
              Win<span className="text-[#C89B57]">vitaa</span>
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
            <Link to={`/u/${slugPath}`} target="_blank">
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
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left font-medium transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 overflow-x-hidden">
        {syncError && (
          <p className="mb-3 text-xs font-medium text-red-600">{syncError}</p>
        )}
        {isLocked && (
          <div className="mb-4 p-3.5 rounded-2xl border border-amber-300 bg-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-amber-900">
              Akun sedang menunggu approval Admin Winvitaa.
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
          <div className="w-full space-y-4 min-w-0">
            {/* App-like Step Header + Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-lg sm:text-xl font-bold">
                  Detail Undangan
                </h1>
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

            {/* Swipeable Horizontal Step Pills */}
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

            <CoupleStep {...editorStepProps} />
            <EventsStep {...editorStepProps} />
            <StoryStep {...editorStepProps} />
            <MediaStep {...editorStepProps} />
            <GiftStep {...editorStepProps} />
            <ConfirmationStep {...editorStepProps} />
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
    </div>
  )
}
