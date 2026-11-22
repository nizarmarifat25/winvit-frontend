import React, { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { useWinvit } from "@/context/WinvitContext"
import type {
  InvitationData,
  EventItem,
  StoryItem,
  GiftBankAccount,
} from "@/types/winvit"
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  MessageSquareHeart,
  X,
  Send,
  Loader2,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getPublicInvitationBySlugApi,
  getInvitationsApi,
  getEventsApi,
  getStoriesApi,
  getGalleriesApi,
  getGiftsApi,
  getWishesBySlugApi,
  createWishApi,
  getAccessToken,
  getAuthUser,
} from "@/lib/api"
import { DEFAULT_INVITATION } from "@/data/themes"
import { injectInvitationIntoIframe } from "./injectInvitationData"

interface InvitationRendererProps {
  previewData?: InvitationData
  previewThemePath?: string
  embedded?: boolean
  renderKey?: number
}

function parseIsoDateAndTime(isoStr?: string | null): {
  date: string
  time: string
} {
  if (!isoStr) return { date: "", time: "" }
  const match = isoStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (match) return { date: match[1], time: match[2] }
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return { date: "", time: "" }
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  }
}

export default function InvitationRenderer({
  previewData,
  previewThemePath,
  embedded = false,
  renderKey = 0,
}: InvitationRendererProps) {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const guestNameParam = searchParams.get("to") || "Bapak / Ibu / Saudara/i"
  const { invitation: ctxInvitation, themes } = useWinvit()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [publicInvitation, setPublicInvitation] =
    useState<InvitationData | null>(null)
  const [isDraftPreview, setIsDraftPreview] = useState(false)
  const [loadingPublic, setLoadingPublic] = useState(!embedded && Boolean(slug))
  const [publicError, setPublicError] = useState<string | null>(null)
  const [viewportMode, setViewportMode] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  )
  const [isAtBottom, setIsAtBottom] = useState(false)
  const scrollCleanupRef = useRef<(() => void) | null>(null)
  const [wishes, setWishes] = useState<any[]>([])
  const [wishesOpen, setWishesOpen] = useState(false)
  const [wishName, setWishName] = useState(searchParams.get("to") || "")
  const [wishMessage, setWishMessage] = useState("")
  const [wishStatus, setWishStatus] = useState<"attending" | "not_attending">(
    "attending"
  )
  const [wishPax, setWishPax] = useState(1)
  const [submittingWish, setSubmittingWish] = useState(false)
  const [wishError, setWishError] = useState("")

  const activeSlug =
    slug || previewData?.slug || ctxInvitation.slug || "undangan"
  const authUser = getAuthUser()

  // Fetch public invitation & wishes by slug when in public view
  useEffect(() => {
    if (embedded || !slug) return

    let isMounted = true
    setLoadingPublic(true)
    setPublicError(null)

    getPublicInvitationBySlugApi(slug)
      .then((data) => {
        if (!isMounted || !data) return
        const inv = data.invitation || data

        const rawEvents: any[] = data.events || inv.events || []
        const mappedEvents: EventItem[] = rawEvents.map(
          (ev: any, idx: number) => {
            const start = parseIsoDateAndTime(ev.start_time)
            const end = parseIsoDateAndTime(ev.end_time)
            return {
              id: ev.id,
              name: ev.name || `Acara ${idx + 1}`,
              date: start.date,
              startTime: start.time,
              endTime: end.time,
              locationName: ev.location_name || "",
              locationAddress: ev.location_address || "",
              locationUrl: ev.location_url || "",
              sortOrder: ev.sort_order ?? idx + 1,
            }
          }
        )

        const rawStories: any[] = data.stories || inv.stories || []
        const mappedStories: StoryItem[] = rawStories.map(
          (st: any, idx: number) => ({
            id: st.id,
            title: st.title || "",
            badge: st.date_label || "",
            storyDate: st.story_date || null,
            content: st.story || "",
            photo: st.image_url || "",
            sortOrder: st.sort_order ?? idx + 1,
          })
        )

        const rawGalleries: any[] = data.galleries || inv.galleries || []
        const galleryUrls = rawGalleries
          .map((g: any) => (typeof g === "string" ? g : g.media_url))
          .filter(Boolean)

        const rawGifts: any[] = data.gifts || inv.gifts || []
        const mappedGifts: GiftBankAccount[] = rawGifts.map(
          (gf: any, idx: number) => ({
            id: gf.id,
            bankName: gf.account_name || "",
            accountNumber: gf.account_number || "",
            accountHolder: gf.on_behalf_of || "",
            sortOrder: gf.sort_order ?? idx + 1,
          })
        )

        const akadEv = mappedEvents[0]
        const resepsiEv = mappedEvents[1]

        const mapped: InvitationData = {
          ...DEFAULT_INVITATION,
          id: inv.id || "",
          slug: inv.slug || slug,
          themeId: inv.theme?.tag || inv.theme_id || DEFAULT_INVITATION.themeId,
          meta: {
            ...DEFAULT_INVITATION.meta,
            coverPhoto: inv.cover_photo_url || "",
            audio: {
              ...DEFAULT_INVITATION.meta.audio,
              url: inv.music_url || "",
            },
          },
          couple: {
            groom: {
              ...DEFAULT_INVITATION.couple.groom,
              fullName: inv.groom_name || "",
              nickname: inv.groom_name?.split(" ")[0] || "",
              info: inv.groom_info || "",
              photo: inv.groom_photo_url || "",
            },
            bride: {
              ...DEFAULT_INVITATION.couple.bride,
              fullName: inv.bride_name || "",
              nickname: inv.bride_name?.split(" ")[0] || "",
              info: inv.bride_info || "",
              photo: inv.bride_photo_url || "",
            },
          },
          eventList: mappedEvents,
          events: {
            ...DEFAULT_INVITATION.events,
            akad: akadEv
              ? {
                  title: akadEv.name,
                  date: akadEv.date,
                  startTime: akadEv.startTime,
                  endTime: akadEv.endTime,
                  locationName: akadEv.locationName,
                  address: akadEv.locationAddress,
                  mapsUrl: akadEv.locationUrl,
                }
              : DEFAULT_INVITATION.events.akad,
            resepsi: resepsiEv
              ? {
                  title: resepsiEv.name,
                  date: resepsiEv.date,
                  startTime: resepsiEv.startTime,
                  endTime: resepsiEv.endTime,
                  locationName: resepsiEv.locationName,
                  address: resepsiEv.locationAddress,
                  mapsUrl: resepsiEv.locationUrl,
                }
              : DEFAULT_INVITATION.events.resepsi,
          },
          stories: mappedStories,
          media: {
            ...DEFAULT_INVITATION.media,
            gallery: galleryUrls,
          },
          gifts: {
            ...DEFAULT_INVITATION.gifts,
            bankAccounts: mappedGifts,
          },
        }
        setIsDraftPreview(false)
        setPublicInvitation(mapped)
      })
      .catch(async (err: any) => {
        if (!isMounted) return
        // If unpublished (404 on public endpoint) but the owner is logged in, load authenticated draft for Preview!
        if (getAccessToken()) {
          try {
            const invRes = await getInvitationsApi()
            const list = Array.isArray(invRes)
              ? invRes
              : invRes?.items || invRes?.invitations || (invRes ? [invRes] : [])
            const ownerInv =
              list.find((item: any) => item?.slug === slug) || list[0]

            if (ownerInv?.id && isMounted) {
              const [eventsRes, storiesRes, galleriesRes, giftsRes] =
                await Promise.all([
                  getEventsApi(ownerInv.id).catch(() => []),
                  getStoriesApi(ownerInv.id).catch(() => []),
                  getGalleriesApi(ownerInv.id).catch(() => []),
                  getGiftsApi(ownerInv.id).catch(() => []),
                ])
              if (!isMounted) return

              const mappedEvents: EventItem[] = (
                Array.isArray(eventsRes) ? eventsRes : []
              ).map((ev: any, idx: number) => {
                const start = parseIsoDateAndTime(ev.start_time)
                const end = parseIsoDateAndTime(ev.end_time)
                return {
                  id: ev.id,
                  name: ev.name || `Acara ${idx + 1}`,
                  date: start.date,
                  startTime: start.time,
                  endTime: end.time,
                  locationName: ev.location_name || "",
                  locationAddress: ev.location_address || "",
                  locationUrl: ev.location_url || "",
                  sortOrder: ev.sort_order ?? idx + 1,
                }
              })

              const mappedStories: StoryItem[] = (
                Array.isArray(storiesRes) ? storiesRes : []
              ).map((st: any, idx: number) => ({
                id: st.id,
                title: st.title || "",
                badge: st.date_label || "",
                storyDate: st.story_date || null,
                content: st.story || "",
                photo: st.image_url || "",
                sortOrder: st.sort_order ?? idx + 1,
              }))

              const galleryUrls = (
                Array.isArray(galleriesRes) ? galleriesRes : []
              )
                .map((g: any) => (typeof g === "string" ? g : g.media_url))
                .filter(Boolean)

              const mappedGifts: GiftBankAccount[] = (
                Array.isArray(giftsRes) ? giftsRes : []
              ).map((gf: any, idx: number) => ({
                id: gf.id,
                bankName: gf.account_name || "",
                accountNumber: gf.account_number || "",
                accountHolder: gf.on_behalf_of || "",
                sortOrder: gf.sort_order ?? idx + 1,
              }))

              setPublicInvitation({
                ...DEFAULT_INVITATION,
                id: ownerInv.id,
                slug: ownerInv.slug || slug,
                themeId: ownerInv.theme_id || DEFAULT_INVITATION.themeId,
                meta: {
                  ...DEFAULT_INVITATION.meta,
                  coverPhoto: ownerInv.cover_photo_url || "",
                  audio: {
                    ...DEFAULT_INVITATION.meta.audio,
                    url: ownerInv.music_url || "",
                  },
                },
                couple: {
                  groom: {
                    ...DEFAULT_INVITATION.couple.groom,
                    fullName: ownerInv.groom_name || "",
                    nickname: ownerInv.groom_name?.split(" ")[0] || "",
                    info: ownerInv.groom_info || "",
                    photo: ownerInv.groom_photo_url || "",
                  },
                  bride: {
                    ...DEFAULT_INVITATION.couple.bride,
                    fullName: ownerInv.bride_name || "",
                    nickname: ownerInv.bride_name?.split(" ")[0] || "",
                    info: ownerInv.bride_info || "",
                    photo: ownerInv.bride_photo_url || "",
                  },
                },
                eventList: mappedEvents,
                stories: mappedStories,
                media: {
                  ...DEFAULT_INVITATION.media,
                  gallery: galleryUrls,
                },
                gifts: {
                  ...DEFAULT_INVITATION.gifts,
                  bankAccounts: mappedGifts,
                },
              })
              setIsDraftPreview(true)
              setPublicError(null)
              return
            }
          } catch {
            // Fall through to publicError
          }
        }
        setPublicError(
          err?.message || "Gagal mengambil data undangan dari server."
        )
      })
      .finally(() => {
        if (isMounted) setLoadingPublic(false)
      })

    getWishesBySlugApi(slug)
      .then((res) => {
        if (!isMounted) return
        const list = Array.isArray(res)
          ? res
          : res?.items || res?.wishes || res?.data || []
        if (Array.isArray(list)) setWishes(list)
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [embedded, slug])

  const invitation = previewData || publicInvitation || ctxInvitation
  const activeTheme =
    themes.find(
      (t) =>
        t.id === invitation.themeId ||
        t.backendId === invitation.themeId ||
        t.tag === invitation.themeId
    ) || themes[0]

  const rawPath = previewThemePath || activeTheme.path
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`
  const targetUrl = `${normalizedPath}?to=${encodeURIComponent(guestNameParam)}`

  const attachIframeScrollListener = () => {
    scrollCleanupRef.current?.()
    scrollCleanupRef.current = null

    const win = iframeRef.current?.contentWindow
    const doc = iframeRef.current?.contentDocument
    if (!win || !doc) return

    const updateScrollState = () => {
      const scrollTop =
        win.scrollY ||
        doc.documentElement?.scrollTop ||
        doc.body?.scrollTop ||
        0
      const viewHeight =
        win.innerHeight || doc.documentElement?.clientHeight || 0
      const scrollHeight = Math.max(
        doc.body?.scrollHeight || 0,
        doc.documentElement?.scrollHeight || 0
      )
      const hasScrollableContent = scrollHeight > viewHeight + 40
      const reachedBottom =
        hasScrollableContent && scrollTop + viewHeight >= scrollHeight - 32
      setIsAtBottom(reachedBottom)
    }

    updateScrollState()
    win.addEventListener("scroll", updateScrollState, { passive: true })
    win.addEventListener("resize", updateScrollState, { passive: true })
    scrollCleanupRef.current = () => {
      win.removeEventListener("scroll", updateScrollState)
      win.removeEventListener("resize", updateScrollState)
    }
  }

  const handleScrollDown = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.scrollBy({
      top: Math.round((win.innerHeight || 600) * 0.7),
      behavior: "smooth",
    })
  }

  const handleIframeLoad = () => {
    if (!iframeRef.current) return
    injectInvitationIntoIframe(
      iframeRef.current,
      invitation,
      activeSlug,
      (list) => setWishes(list)
    )
    attachIframeScrollListener()
  }

  useEffect(() => {
    handleIframeLoad()
  }, [invitation, renderKey])

  useEffect(() => {
    setIsAtBottom(false)
    const timer = window.setTimeout(() => {
      attachIframeScrollListener()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [viewportMode])

  useEffect(() => {
    return () => {
      scrollCleanupRef.current?.()
    }
  }, [])

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wishName.trim() || !wishMessage.trim()) return

    setSubmittingWish(true)
    setWishError("")

    const guestSlug = wishName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    try {
      const created = await createWishApi({
        slug: activeSlug,
        guest_name: wishName.trim(),
        message: wishMessage.trim(),
        guest_slug: guestSlug,
        status: wishStatus,
        pax: Number(wishPax) || 1,
      })
      setWishes((prev) => [
        created || {
          id: `wish-${Date.now()}`,
          guest_name: wishName.trim(),
          message: wishMessage.trim(),
          status: wishStatus,
          pax: Number(wishPax) || 1,
        },
        ...prev,
      ])
      setWishMessage("")
    } catch (err: any) {
      setWishError(err?.message || "")
    } finally {
      setSubmittingWish(false)
    }
  }

  if (embedded) {
    return (
      <iframe
        key={renderKey}
        ref={iframeRef}
        src={targetUrl}
        onLoad={handleIframeLoad}
        title={invitation.meta.title || activeTheme.title}
        className="w-full h-full border-0 block bg-black"
      />
    )
  }

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-slate-950 flex flex-col">
      {/* Top SaaS Bar with Mobile / Tablet / Desktop Viewport Switcher */}
      <div className="relative z-40 shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-5 h-13 flex items-center justify-between gap-2 text-xs text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-block h-2 w-2 rounded-full animate-pulse shrink-0 ${
              isDraftPreview ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span className="font-semibold truncate">/{activeSlug}</span>
          {isDraftPreview && (
            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold shrink-0">
              Preview (Belum Publish)
            </span>
          )}
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-amber-300 font-bold truncate">
            {activeTheme.title}
          </span>
        </div>

        {/* Viewport Mode Switcher: Mobile | Tablet | Desktop */}
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 border border-white/10">
          {(
            [
              { id: "mobile", label: "Mobile", Icon: Smartphone },
              { id: "tablet", label: "Tablet", Icon: Tablet },
              { id: "desktop", label: "Desktop", Icon: Monitor },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = viewportMode === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setViewportMode(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? "bg-[#C89B57] text-slate-950 shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {authUser && (
            <Link
              to={authUser.role === "admin" ? "/admin" : "/customer"}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </Link>
          )}
          <a
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 hover:bg-white/20 transition"
          >
            Full <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Floating Wishes & RSVP Button */}
      <button
        type="button"
        onClick={() => setWishesOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#2C2018] text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-[#C89B57]/40 hover:bg-[#3d2d22] transition cursor-pointer"
      >
        <MessageSquareHeart className="w-4 h-4 text-[#C89B57]" />
        <span>Ucapan & RSVP ({wishes.length})</span>
      </button>

      {/* Slide-over Drawer for Wishes & RSVP */}
      {wishesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#FAF6F1] text-[#2C2018] h-full flex flex-col shadow-2xl">
            <div className="p-4 bg-white border-b border-[#E5DDD5] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Ucapan Doa & RSVP</h3>
                <p className="text-[11px] text-[#6B5B4E]">
                  Kirimkan doa restu & konfirmasi kehadiran Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWishesOpen(false)}
                className="p-1.5 rounded-lg text-[#6B5B4E] hover:bg-[#FAF6F1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <form
                onSubmit={handleSubmitWish}
                className="p-4 rounded-2xl bg-white border border-[#E5DDD5] space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">
                    Nama Tamu
                  </label>
                  <Input
                    required
                    placeholder="Nama Anda"
                    value={wishName}
                    onChange={(e) => {
                      setWishName(e.target.value)
                      if (wishError) setWishError("")
                    }}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">
                      Kehadiran
                    </label>
                    <select
                      value={wishStatus}
                      onChange={(e) =>
                        setWishStatus(
                          e.target.value as "attending" | "not_attending"
                        )
                      }
                      className="flex h-9 w-full rounded-xl border border-[#E5DDD5] bg-white px-2.5 text-xs"
                    >
                      <option value="attending">Hadir</option>
                      <option value="not_attending">Tidak Hadir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">
                      Jumlah Tamu (Pax)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={wishPax}
                      onChange={(e) => setWishPax(Number(e.target.value) || 1)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">
                    Ucapan & Doa
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Semoga menjadi keluarga sakinah, mawaddah, warahmah..."
                    value={wishMessage}
                    onChange={(e) => {
                      setWishMessage(e.target.value)
                      if (wishError) setWishError("")
                    }}
                    className="w-full rounded-xl border border-[#E5DDD5] bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C89B57]"
                  />
                  {wishError && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {wishError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  disabled={submittingWish}
                  className="w-full h-9 text-xs rounded-xl gap-1.5"
                >
                  {submittingWish ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Kirim Ucapan
                </Button>
              </form>

              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-[#6B5B4E]">
                  Daftar Ucapan ({wishes.length})
                </h4>
                {wishes.length === 0 ? (
                  <p className="text-xs text-[#6B5B4E] py-6 text-center rounded-2xl bg-white border border-dashed border-[#E5DDD5]">
                    Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
                  </p>
                ) : (
                  wishes.map((w, idx) => (
                    <div
                      key={w.id || idx}
                      className="p-3 rounded-2xl bg-white border border-[#E5DDD5] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C2018]">
                          {w.guest_name || "Tamu Undangan"}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            w.status === "attending"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {w.status === "attending"
                            ? `Hadir (${w.pax || 1})`
                            : "Tidak Hadir"}
                        </span>
                      </div>
                      <p className="text-[#6B5B4E] leading-relaxed">
                        {w.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingPublic ? (
        <div className="flex-1 w-full flex items-center justify-center text-white text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#C89B57]" />
          <span>Memuat data undangan dari server...</span>
        </div>
      ) : publicError ? (
        <div className="flex-1 w-full flex items-center justify-center p-6 bg-[#FAF6F1] text-[#2C2018]">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#E5DDD5] p-6 sm:p-8 text-center space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-[#2C2018]">
              Gagal Memuat Undangan
            </h2>
            <p className="text-xs sm:text-sm text-red-600 font-medium">
              {publicError}
            </p>
            <p className="text-xs text-[#6B5B4E]">
              Pastikan slug <span className="font-mono font-semibold">/{activeSlug}</span> sudah benar dan undangan sudah berstatus rilis (published).
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
              <Button variant="gold" size="sm" className="rounded-xl" asChild>
                <Link to="/">Kembali ke Beranda</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`flex-1 w-full overflow-hidden flex items-center justify-center transition-all duration-300 ${
            viewportMode === "desktop" ? "p-0 bg-black" : "p-4 sm:p-6 bg-slate-950"
          }`}
        >
          <div
            className={`relative transition-all duration-300 ${
              viewportMode === "mobile"
                ? "w-[390px] max-w-full h-full max-h-[820px]"
                : viewportMode === "tablet"
                  ? "w-[768px] max-w-full h-full max-h-[960px]"
                  : "w-full h-full"
            }`}
          >
            <div
              className={`w-full h-full overflow-hidden bg-black ${
                viewportMode === "mobile"
                  ? "rounded-[42px] border-[6px] border-slate-800 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                  : viewportMode === "tablet"
                    ? "rounded-[28px] border-[5px] border-slate-800 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                    : ""
              }`}
            >
              <iframe
                key={publicInvitation?.id || "public"}
                ref={iframeRef}
                src={targetUrl}
                onLoad={handleIframeLoad}
                title={invitation.meta.title || activeTheme.title}
                className="w-full h-full border-0 block"
              />
            </div>

            {/* Animated Mouse Scroll Indicator at the right edge */}
            <button
              type="button"
              onClick={handleScrollDown}
              title="Scroll ke bawah"
              aria-label="Scroll ke bawah"
              className={`absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 px-2 py-3 rounded-full bg-slate-900/75 hover:bg-slate-900/95 backdrop-blur-md border border-white/15 hover:border-[#C89B57]/60 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer ${
                isAtBottom
                  ? "opacity-0 pointer-events-none scale-95"
                  : "opacity-100 scale-100"
              } ${
                viewportMode === "mobile"
                  ? "right-3 sm:right-auto sm:left-full sm:ml-4"
                  : viewportMode === "tablet"
                    ? "right-3 lg:right-auto lg:left-full lg:ml-4"
                    : "right-3 sm:right-5"
              }`}
            >
              <span className="w-[18px] h-[28px] rounded-full border-[1.75px] border-[#C89B57] flex justify-center pt-1.5">
                <span className="w-[3px] h-[6px] rounded-full bg-[#C89B57] animate-mouse-wheel" />
              </span>
              <span className="flex flex-col items-center -space-y-1.5 text-[#C89B57]">
                <ChevronDown className="w-3.5 h-3.5 animate-scroll-chevron-1" />
                <ChevronDown className="w-3.5 h-3.5 animate-scroll-chevron-2" />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80 [writing-mode:vertical-rl]">
                Scroll
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
