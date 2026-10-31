import { useEffect, useRef } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { useWinvit } from "@/context/WinvitContext"
import type { InvitationData, SectionKey } from "@/types/winvit"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface InvitationRendererProps {
  previewData?: InvitationData
  previewThemePath?: string
  embedded?: boolean
  renderKey?: number
}

const SECTION_SELECTORS: Record<SectionKey, string> = {
  cover: "#cover, .cover, #opening",
  hero: "#hero, .hero",
  quote: "#quote, .quote, .ayat, #salam, section.ayat",
  couple: "#couple, .couple-section, #mempelai",
  events: "#events, #acara, .events-section",
  story: "#story, .story-wrap, .story-section",
  gallery: "#gallery, #galeri, .gallery-section",
  countdown: "#countdown, #countdown-section, .countdown-wrap",
  gift: "#gift, .gift-section",
  faq: "#faq, .faq-wrap, .faq-section",
  wishes: "#wishes, #ucapan, #rsvp",
  livestream: "#livestream",
}

export default function InvitationRenderer({
  previewData,
  previewThemePath,
  embedded = false,
  renderKey = 0,
}: InvitationRendererProps) {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const guestName = searchParams.get("to") || "Bapak / Ibu / Saudara/i"
  const { invitation: ctxInvitation, themes } = useWinvit()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const invitation = previewData || ctxInvitation
  const activeTheme =
    themes.find((t) => t.id === invitation.themeId) || themes[0]

  const rawPath = previewThemePath || activeTheme.path
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`
  const targetUrl = `${normalizedPath}?to=${encodeURIComponent(guestName)}`

  // Dynamic DOM Injector into the theme iframe once loaded
  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    const hasNicknames =
      invitation.couple.bride.nickname.trim() &&
      invitation.couple.groom.nickname.trim()

    if (hasNicknames) {
      const coupleShort = `${invitation.couple.bride.nickname} & ${invitation.couple.groom.nickname}`
      doc.title = `The Wedding of ${coupleShort}`

      // 1. Update Couple Names in Hero / Cover
      doc
        .querySelectorAll(
          ".cover-names, .hero-names, .cover-title, .hero-title, [data-wv='meta.title']"
        )
        .forEach((el) => {
          el.textContent = coupleShort
        })
    }

    // 2. Update Bride & Groom Full Names
    const coupleNames = doc.querySelectorAll(".couple-name, .mempelai-name, .person-name")
    if (coupleNames[0] && invitation.couple.bride.fullName.trim()) {
      coupleNames[0].textContent = invitation.couple.bride.fullName
    }
    if (coupleNames[1] && invitation.couple.groom.fullName.trim()) {
      coupleNames[1].textContent = invitation.couple.groom.fullName
    }

    // 3. Update Bride & Groom Parents
    const coupleParents = doc.querySelectorAll(".couple-parents, .mempelai-parents, .person-parents")
    if (
      coupleParents[0] &&
      (invitation.couple.bride.fatherName.trim() || invitation.couple.bride.motherName.trim())
    ) {
      coupleParents[0].textContent = `Putri dari ${invitation.couple.bride.fatherName} & ${invitation.couple.bride.motherName}`
    }
    if (
      coupleParents[1] &&
      (invitation.couple.groom.fatherName.trim() || invitation.couple.groom.motherName.trim())
    ) {
      coupleParents[1].textContent = `Putra dari ${invitation.couple.groom.fatherName} & ${invitation.couple.groom.motherName}`
    }

    // 4. Update Bride & Groom Photos
    const couplePhotos = doc.querySelectorAll<HTMLImageElement>(
      ".couple-photo img, .mempelai-photo img, .couple-card img, .person-photo img"
    )
    if (couplePhotos[0] && invitation.couple.bride.photo) {
      couplePhotos[0].src = invitation.couple.bride.photo
    }
    if (couplePhotos[1] && invitation.couple.groom.photo) {
      couplePhotos[1].src = invitation.couple.groom.photo
    }

    // 5. Update Gallery Photos
    if (invitation.media.gallery.length > 0) {
      const galleryImgs = doc.querySelectorAll<HTMLImageElement>(
        "#gallery img, #galeri img, .gallery-grid img, .gallery-item img"
      )
      galleryImgs.forEach((imgEl, idx) => {
        const uploadedUrl = invitation.media.gallery[idx % invitation.media.gallery.length]
        if (uploadedUrl) {
          imgEl.src = uploadedUrl
        }
      })
    }

    // 6. Toggle visibility of sections dynamically
    ;(Object.keys(SECTION_SELECTORS) as SectionKey[]).forEach((secKey) => {
      const sel = SECTION_SELECTORS[secKey]
      const isHidden = invitation.layout.hiddenSections.includes(secKey)
      doc.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        el.style.display = isHidden ? "none" : ""
      })
    })
  }

  useEffect(() => {
    handleIframeLoad()
  }, [invitation, renderKey])

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
    <div className="relative w-screen h-dvh overflow-hidden bg-slate-950">
      {/* Floating SaaS Preview Bar */}
      <div className="fixed top-3 left-3 z-50 flex items-center gap-2 rounded-full bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 text-xs text-white border border-white/15 shadow-lg">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">
          WInvit Live: /{slug || invitation.slug || "undangan"}
        </span>
        <span className="text-slate-400">|</span>
        <span className="text-amber-300 font-bold">{activeTheme.title}</span>
        <Link
          to="/customer"
          className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 hover:bg-white/20 transition"
        >
          <ArrowLeft className="h-3 w-3" /> Editor
        </Link>
        <a
          href={targetUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 hover:bg-white/20 transition"
        >
          Full <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <iframe
        ref={iframeRef}
        src={targetUrl}
        onLoad={handleIframeLoad}
        title={invitation.meta.title || activeTheme.title}
        className="w-full h-full border-0 block"
      />
    </div>
  )
}
