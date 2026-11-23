import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import AOS from "aos"
import "aos/dist/aos.css"
import { useWinvit } from "@/context/WinvitContext"
import type { ThemeItem } from "@/types/winvit"
import { DEFAULT_INVITATION } from "@/data/themes"
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ArrowRight,
  BookHeart,
  CalendarHeart,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  ExternalLink,
  Eye,
  Gem,
  Gift,
  Heart,
  Images,
  Landmark,
  Laptop,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquareHeart,
  Music,
  Palette,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { getAuthUser, clearTokens, type AuthUser } from "@/lib/api"

type ModalDevice = "mobile" | "tablet" | "desktop"

const ALL_INCLUSIVE_PERKS = [
  "Masa aktif undangan selamanya (tanpa biaya bulanan)",
  "Unlimited sebar undangan & custom nama tamu personal",
  "Amplop digital transfer bank 0% potongan komisi",
  "Ucapan doa & konfirmasi kehadiran (RSVP + jumlah pax)",
  "Multi-acara fleksibel (Akad, Resepsi, dll.) + Google Maps",
  "Galeri foto HD & kisah perjalanan cinta (Love Story)",
  "Musik latar MP3 autoplay yang bisa diunggah sendiri",
  "Custom link cantik /u/nama-pasangan sesuai keinginan",
  "Preview real-time iPhone 17 Pro, iPad Pro M3 & MacBook Pro",
  "Edit data, publish, atau unpublish kapan saja di Dashboard",
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pilih Tema & Pesan",
    desc: "Jelajahi katalog tema adat Nusantara hingga modern luxury, lalu kirim pesanan tema favoritmu dalam 1 menit.",
    Icon: Palette,
  },
  {
    step: "02",
    title: "Lengkapi di Dashboard",
    desc: "Isi profil mempelai, jadwal acara, galeri foto, kisah cinta, musik, dan rekening dengan editor tab yang praktis.",
    Icon: Sparkles,
  },
  {
    step: "03",
    title: "Preview & Sebar ke Tamu",
    desc: "Cek hasil di berbagai perangkat, klik Publish, lalu bagikan link personal ke ribuan tamu langsung via WhatsApp.",
    Icon: Send,
  },
]

export default function LandingPage() {
  const { themes, setInvitation } = useWinvit()
  const navigate = useNavigate()

  const [authUser, setAuthUserState] = useState<AuthUser | null>(() =>
    getAuthUser()
  )
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hero interactive theme showcase
  const heroThemes = useMemo(() => themes.slice(0, 4), [themes])
  const [heroThemeIdx, setHeroThemeIdx] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [copiedDemoBank, setCopiedDemoBank] = useState(false)
  const activeHeroTheme = heroThemes[heroThemeIdx] || themes[0]

  // Theme catalog states
  const [themeCat, setThemeCat] = useState<string>("all")
  const [themeSearch, setThemeSearch] = useState("")
  const [guestInput, setGuestInput] = useState("Bapak / Ibu / Saudara/i")
  const [appliedGuest, setAppliedGuest] = useState("Bapak / Ibu / Saudara/i")
  const [activeDevices, setActiveDevices] = useState<
    Record<string, "trio" | "tablet" | "desktop">
  >({})

  // Device Preview Modal
  const [previewTheme, setPreviewTheme] = useState<ThemeItem | null>(null)
  const [modalDevice, setModalDevice] = useState<ModalDevice>("mobile")
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  )

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(null), 2600)
  }

  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 56,
    })

    const onScroll = () => setScrolled(window.scrollY > 18)
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // Gentle auto-cycle for Hero iPhone showcase (pauses on hover)
  useEffect(() => {
    if (heroPaused || heroThemes.length <= 1) return
    const timer = window.setInterval(() => {
      setHeroThemeIdx((prev) => (prev + 1) % heroThemes.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [heroPaused, heroThemes.length])

  // Keep modal device valid when resizing window
  const effectiveModalDevice: ModalDevice =
    windowWidth < 768
      ? "mobile"
      : windowWidth < 1024 && modalDevice === "desktop"
        ? "tablet"
        : modalDevice

  const filteredThemes = useMemo(() => {
    const q = themeSearch.trim().toLowerCase()
    return themes.filter((t) => {
      const matchCat = themeCat === "all" || t.category === themeCat
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q) ||
        (t.tag || "").toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [themes, themeCat, themeSearch])

  useEffect(() => {
    const t = window.setTimeout(() => AOS.refresh(), 60)
    return () => window.clearTimeout(t)
  }, [filteredThemes.length, themeCat, themeSearch])

  const lowestPriceText = useMemo(() => {
    const prices = themes
      .map((t) => {
        if (typeof t.priceNumber === "number" && t.priceNumber > 0) {
          return t.priceNumber
        }
        const parsed = Number(t.pricePromo.replace(/[^0-9]/g, ""))
        return parsed > 0 ? parsed : 99000
      })
      .filter((n) => n > 0)
    const min = prices.length > 0 ? Math.min(...prices) : 99000
    return `Rp ${min.toLocaleString("id-ID")}`
  }, [themes])

  const handleOpenOrder = (theme?: ThemeItem | string) => {
    const targetId =
      typeof theme === "string"
        ? theme
        : theme?.backendId || theme?.id || themes[0]?.backendId || themes[0]?.id
    navigate("/daftar", { state: { themeId: targetId } })
  }

  const openThemePreview = (theme: ThemeItem, preferred: ModalDevice = "mobile") => {
    setPreviewTheme(theme)
    setModalDevice(windowWidth < 768 ? "mobile" : preferred)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F1] text-[#2C2018] overflow-x-clip">
      {/* ==================== NAVBAR ==================== */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
            ? "bg-[#FAF6F1]/92 backdrop-blur-xl border-b border-[#E5DDD5] shadow-[0_6px_24px_rgba(44,32,24,0.05)]"
            : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="max-w-[1320px] mx-auto px-5 sm:px-6 h-[74px] flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#2C2018] text-[#E5C27A] grid place-items-center shadow-xs group-hover:bg-[#A8763E] group-hover:text-white transition-colors">
              <Crown className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif-display text-xl font-bold tracking-tight text-[#2C2018]">
                In<span className="text-[#C89B57]">vitaa</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C7868] mt-0.5">
                Wedding Invitation
              </span>
            </div>
          </a>

          <ul className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#6B5B4E]">
            <li>
              <a href="#cara-kerja" className="hover:text-[#2C2018] transition">
                Cara Kerja
              </a>
            </li>
            <li>
              <a href="#tema" className="hover:text-[#2C2018] transition">
                Katalog Tema ({themes.length})
              </a>
            </li>
            <li>
              <a href="#fitur" className="hover:text-[#2C2018] transition">
                Fitur
              </a>
            </li>
            <li>
              <a href="#harga" className="hover:text-[#2C2018] transition">
                Harga
              </a>
            </li>
            <li>
              <a href="#kontak" className="hover:text-[#2C2018] transition">
                FAQ
              </a>
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-2">
            {authUser ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E5DDD5] bg-white text-[#2C2018] hover:border-[#C89B57] hover:bg-[#FAF6F1]"
                  asChild
                >
                  <Link to={authUser.role === "admin" ? "/admin" : "/customer"}>
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#A8763E]" />
                    Dashboard ({authUser.name})
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-[#E5DDD5] bg-white text-[#2C2018] hover:border-[#2C2018] hover:bg-white"
                asChild
              >
                <Link to="/login">
                  <LogIn className="w-3.5 h-3.5 text-[#A8763E]" />
                  Masuk
                </Link>
              </Button>
            )}
            <Button
              variant="gold"
              size="sm"
              className="px-4"
              onClick={() => handleOpenOrder(activeHeroTheme)}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Pesan Sekarang
            </Button>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl text-[#2C2018] hover:bg-[#F2ECE4] transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-y border-[#E5DDD5] px-6 py-4 flex flex-col gap-3 shadow-lg text-sm">
            <a
              href="#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium py-1.5 border-b border-[#F2ECE4] text-[#2C2018]"
            >
              Cara Kerja
            </a>
            <a
              href="#tema"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium py-1.5 border-b border-[#F2ECE4] text-[#2C2018]"
            >
              Katalog Tema ({themes.length})
            </a>
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium py-1.5 border-b border-[#F2ECE4] text-[#2C2018]"
            >
              Fitur
            </a>
            <a
              href="#harga"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium py-1.5 border-b border-[#F2ECE4] text-[#2C2018]"
            >
              Harga
            </a>
            {authUser ? (
              <>
                <Link
                  to={authUser.role === "admin" ? "/admin" : "/customer"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold py-1.5 text-[#A8763E]"
                >
                  Dashboard ({authUser.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setLogoutDialogOpen(true)
                  }}
                  className="text-left font-semibold py-1.5 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="font-semibold py-1.5 text-[#A8763E]"
              >
                Masuk / Login
              </Link>
            )}
            <Button
              variant="gold"
              className="mt-1"
              onClick={() => {
                setMobileMenuOpen(false)
                handleOpenOrder(activeHeroTheme)
              }}
            >
              Pesan Undangan Sekarang
            </Button>
          </div>
        )}
      </header>

      <main className="max-w-[1320px] mx-auto px-5 sm:px-6 w-full flex-1">
        {/* ==================== 1. SPLIT EDITORIAL HERO ==================== */}
        <section
          className="pt-8 sm:pt-12 pb-16 lg:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center"
          id="home"
        >
          {/* Left Editorial Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1
              data-aos="fade-up"
              data-aos-delay="50"
              className="font-serif-display text-4xl sm:text-5xl xl:text-[62px] font-bold leading-[1.12] tracking-tight text-[#2C2018]"
            >
              Undangan Digital <br className="hidden sm:inline" />
              yang <em className="text-[#A8763E] italic font-semibold">Elegan</em>{" "}
              &amp; Berkesan
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="140"
              className="text-[#6B5B4E] text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Dari sentuhan adat Nusantara hingga estetika modern luxury. Kelola
              sendiri foto, acara, musik, dan amplop digital dari dashboard
              Invitaa, lalu sebarkan tanpa batas tamu dalam hitungan menit.
            </p>

            <div
              data-aos="fade-up"
              data-aos-delay="220"
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1"
            >
              <Button variant="gold" size="lg" className="px-7 group" asChild>
                <a href="#tema">
                  Lihat Katalog Tema
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#D8CCC0] bg-white text-[#2C2018] hover:border-[#2C2018] hover:bg-[#2C2018] hover:text-white"
                onClick={() => handleOpenOrder(activeHeroTheme)}
              >
                Pesan Sekarang
              </Button>
            </div>

            {/* Minimal Trust Stats */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="pt-5 border-t border-[#E5DDD5] grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
            >
              <div>
                <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2C2018]">
                  {themes.length}+
                </p>
                <p className="text-[11px] sm:text-xs text-[#6B5B4E]">
                  Desain Eksklusif
                </p>
              </div>
              <div className="border-x border-[#E5DDD5] px-3">
                <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2C2018]">
                  0%
                </p>
                <p className="text-[11px] sm:text-xs text-[#6B5B4E]">
                  Potongan Amplop
                </p>
              </div>
              <div>
                <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2C2018]">
                  &infin;
                </p>
                <p className="text-[11px] sm:text-xs text-[#6B5B4E]">
                  Tamu Undangan
                </p>
              </div>
            </div>
          </div>

          {/* Right Interactive iPhone 17 Pro Showcase */}
          <div
            data-aos="zoom-in-up"
            data-aos-delay="160"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            className="lg:col-span-6 flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center py-2">
              {/* Warm Champagne Aura */}
              <div className="pointer-events-none absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[radial-gradient(circle,_rgba(200,155,87,0.24)_0%,_rgba(250,246,241,0)_70%)] blur-xl animate-aura-pulse" />

              {/* Floating Editorial Card Left */}
              <div className="hidden sm:flex items-center gap-2.5 absolute -left-24 lg:-left-20 top-14 bg-white/95 backdrop-blur-md border border-[#E5DDD5] rounded-2xl px-3.5 py-2.5 shadow-[0_14px_32px_rgba(44,32,24,0.09)] z-20 animate-float-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[#2C2018] leading-tight">
                    Amplop Digital
                  </p>
                  <p className="text-[10px] text-[#6B5B4E]">
                    100% langsung ke rekening
                  </p>
                </div>
              </div>

              {/* iPhone 17 Pro Hardware Mockup */}
              <div className="relative z-10 w-[268px] sm:w-[292px] rounded-[46px] p-[3px] bg-gradient-to-b from-[#6e6963] via-[#2b2927] to-[#4c4844] shadow-[0_28px_60px_rgba(44,32,24,0.26)] transition-transform duration-500 hover:-translate-y-1.5">
                {/* Titanium side buttons */}
                <span className="pointer-events-none absolute -left-[3px] top-[76px] w-[3px] h-[18px] rounded-l-sm bg-[#6e6963]" />
                <span className="pointer-events-none absolute -left-[3px] top-[106px] w-[3px] h-[34px] rounded-l-sm bg-[#6e6963]" />
                <span className="pointer-events-none absolute -left-[3px] top-[148px] w-[3px] h-[34px] rounded-l-sm bg-[#6e6963]" />
                <span className="pointer-events-none absolute -right-[3px] top-[122px] w-[3px] h-[52px] rounded-r-sm bg-[#6e6963]" />

                <div className="rounded-[43px] bg-[#0a0a0c] p-[9px]">
                  <div className="relative aspect-[9/19] rounded-[35px] overflow-hidden bg-[#141210]">
                    {/* Dynamic Island */}
                    <div className="pointer-events-none absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-[84px] h-[22px] rounded-full bg-black flex items-center justify-end pr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#131826] ring-1 ring-white/15" />
                    </div>

                    {activeHeroTheme && (
                      <img
                        key={activeHeroTheme.id}
                        src={
                          activeHeroTheme.thumbMobile ||
                          `/asset/img/thumbnails/${activeHeroTheme.id}/mobile-2.jpg`
                        }
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            activeHeroTheme.thumb || "/asset/img/pre3.jpeg"
                        }}
                        alt={`Preview ${activeHeroTheme.title}`}
                        className="w-full h-full object-cover object-top animate-hero-swap"
                      />
                    )}

                    {/* Bottom overlay info inside phone */}
                    {activeHeroTheme && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-12 text-white">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#E5C27A] font-semibold">
                          {activeHeroTheme.categoryName}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="font-serif-display text-base font-bold truncate">
                            {activeHeroTheme.title}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              openThemePreview(activeHeroTheme, "mobile")
                            }
                            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/20 hover:bg-[#C89B57] backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Home bar */}
                    <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/70 z-20" />
                  </div>
                </div>
              </div>

              {/* Floating Editorial Card Right */}
              <div className="hidden sm:flex items-center gap-2.5 absolute -right-24 lg:-right-16 bottom-20 bg-white/95 backdrop-blur-md border border-[#E5DDD5] rounded-2xl px-3.5 py-2.5 shadow-[0_14px_32px_rgba(44,32,24,0.09)] z-20 animate-float-right">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#A8763E] grid place-items-center shrink-0">
                  <MessageSquareHeart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[#2C2018] leading-tight">
                    RSVP &amp; Ucapan Live
                  </p>
                  <p className="text-[10px] text-[#6B5B4E]">
                    Konfirmasi hadir + jumlah pax
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Theme Switcher Pills below iPhone */}
            {heroThemes.length > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 bg-white/85 backdrop-blur-xs border border-[#E5DDD5] rounded-full p-1.5 shadow-2xs">
                {heroThemes.map((t, idx) => {
                  const active = idx === heroThemeIdx
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHeroThemeIdx(idx)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${active
                          ? "bg-[#2C2018] text-white shadow-xs"
                          : "text-[#6B5B4E] hover:text-[#2C2018] hover:bg-[#F2ECE4]"
                        }`}
                    >
                      {t.title}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ==================== 2. CARA KERJA (3 LANGKAH) ==================== */}
        <section
          className="py-12 border-t border-[#E5DDD5] scroll-mt-20"
          id="cara-kerja"
        >
          <div
            data-aos="fade-up"
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8763E]">
                Alur Praktis
              </p>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2C2018] mt-1">
                Siap Sebar dalam 3 Langkah Simpel
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B5B4E] max-w-md">
              Tanpa ribet coding atau tunggu lama. Begitu pesanan aktif, kamu
              bebas kelola seluruh isi undangan langsung dari dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {HOW_IT_WORKS.map(({ step, title, desc, Icon }, idx) => (
              <div
                key={step}
                data-aos="fade-up"
                data-aos-delay={idx * 110}
                className="group bg-white border border-[#E5DDD5] rounded-2xl p-6 space-y-3 hover:border-[#C89B57]/70 hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(44,32,24,0.07)] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6F1] border border-[#E5DDD5] text-[#A8763E] group-hover:bg-[#2C2018] group-hover:text-[#E5C27A] group-hover:scale-105 transition-all duration-300 grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-serif-display text-2xl font-bold text-[#E5DDD5] group-hover:text-[#C89B57]/60 transition-colors">
                    {step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#2C2018]">{title}</h3>
                <p className="text-xs sm:text-sm text-[#6B5B4E] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== 3. KATALOG TEMA (#tema) ==================== */}
        <section
          className="py-14 border-t border-[#E5DDD5] scroll-mt-20"
          id="tema"
        >
          <div
            data-aos="fade-up"
            className="text-center max-w-2xl mx-auto mb-8 space-y-2"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8763E]">
              Katalog Tema ({themes.length})
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2018]">
              Pilih Desain Undangan{" "}
              <em className="text-[#A8763E] italic font-semibold">Impianmu</em>
            </h2>
            <p className="text-[#6B5B4E] text-sm sm:text-base">
              Coba simulasi nama tamu dan lihat tampilan setiap tema di HP,
              Tablet, maupun Laptop sebelum memesan.
            </p>
          </div>

          {/* Unified Search + Guest Simulation Toolbar */}
          <div
            data-aos="fade-up"
            data-aos-delay="80"
            className="bg-white border border-[#E5DDD5] rounded-2xl p-3 mb-6 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"
          >
            <div className="lg:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 text-[#8C7868] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={themeSearch}
                onChange={(e) => setThemeSearch(e.target.value)}
                placeholder="Cari tema (misal: Sunda, Diamond, Botanical...)"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#FAF6F1] border border-[#E5DDD5] text-xs sm:text-sm text-[#2C2018] placeholder:text-[#9A8A7B] outline-none focus:border-[#C89B57]"
              />
            </div>

            <div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-[#FAF6F1] border border-[#E5DDD5]">
                <Users className="w-4 h-4 text-[#A8763E] shrink-0" />
                <span className="text-[11px] font-semibold text-[#8C7868] shrink-0 hidden sm:inline">
                  Nama Tamu:
                </span>
                <input
                  type="text"
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  placeholder="Cth: Bapak Budi & Keluarga"
                  className="w-full text-xs sm:text-sm font-medium text-[#2C2018] outline-none bg-transparent"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-[#D8CCC0] text-[#2C2018] hover:border-[#2C2018] hover:bg-[#2C2018] hover:text-white shrink-0"
                onClick={() => {
                  const v = guestInput.trim() || "Bapak / Ibu / Saudara/i"
                  setAppliedGuest(v)
                  triggerToast(`Simulasi nama tamu diatur ke "${v}"`)
                }}
              >
                Terapkan Nama
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            data-aos="fade-up"
            data-aos-delay="120"
            className="flex flex-wrap items-center justify-center gap-2 mb-9"
          >
            {[
              { id: "all", label: "Semua Tema", Icon: Sparkles },
              { id: "adat", label: "Adat Nusantara", Icon: Landmark },
              { id: "luxury", label: "Dark & Luxury", Icon: Gem },
              { id: "editorial", label: "Editorial & Paper", Icon: BookHeart },
              { id: "nature", label: "Tropical & Boho", Icon: Leaf },
            ].map(({ id, label, Icon }) => {
              const active = themeCat === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setThemeCat(id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition cursor-pointer inline-flex items-center gap-1.5 ${active
                      ? "bg-[#2C2018] text-white border-[#2C2018] shadow-xs"
                      : "bg-white text-[#6B5B4E] border-[#E5DDD5] hover:border-[#C89B57] hover:text-[#2C2018]"
                    }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${active ? "text-[#E5C27A]" : "text-[#A8763E]"
                      }`}
                  />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Cards Grid */}
          {filteredThemes.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-white border border-dashed border-[#E5DDD5] space-y-2">
              <p className="text-sm font-semibold text-[#2C2018]">
                Tema tidak ditemukan
              </p>
              <p className="text-xs text-[#6B5B4E]">
                Coba kata kunci lain atau pilih kategori Semua Tema.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredThemes.map((theme, idx) => {
                const activeDev = activeDevices[theme.id] || "trio"
                const targetUrl = `${theme.path}?to=${encodeURIComponent(appliedGuest)}`
                const thumbMobile =
                  theme.thumbMobile ||
                  `/asset/img/thumbnails/${theme.id}/mobile.jpg`
                const thumbMobile2 =
                  theme.thumbMobile ||
                  `/asset/img/thumbnails/${theme.id}/mobile-2.jpg`
                const thumbMobile3 =
                  theme.thumbMobile ||
                  `/asset/img/thumbnails/${theme.id}/mobile-3.jpg`
                const thumbTablet =
                  theme.thumbTablet ||
                  `/asset/img/thumbnails/${theme.id}/tablet.jpg`
                const thumbDesktop =
                  theme.thumbDesktop ||
                  `/asset/img/thumbnails/${theme.id}/desktop.jpg`
                const cleanPromo = theme.pricePromo.replace(/[^0-9.]/g, "").trim()

                return (
                  <div
                    key={theme.id}
                    data-aos="fade-up"
                    data-aos-delay={(idx % 4) * 70}
                    className="theme-card bg-white border border-[#E5DDD5] rounded-2xl overflow-hidden shadow-2xs hover:border-[#C89B57]/70 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(44,32,24,0.09)] transition-all duration-300 flex flex-col"
                  >
                    <div className="mockup-stage">
                      {/* Top Left Category Pill */}
                      <div className="absolute top-3 left-3 z-15 bg-white/92 backdrop-blur-md text-[#2C2018] text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full border border-[#E5DDD5] shadow-2xs">
                        {theme.categoryName}
                      </div>

                      {/* Subtle Champagne Promo Pill (replaces harsh red diagonal ribbon) */}
                      {theme.discount && (
                        <div className="absolute top-3 right-3 z-15 bg-[#2C2018]/90 text-[#E5C27A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                          {theme.discount}
                        </div>
                      )}

                      {/* 3-Device Switcher Pill */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-18 inline-flex gap-1 p-1 bg-white/92 backdrop-blur-md rounded-full border border-[#E5DDD5] shadow-sm">
                        <button
                          type="button"
                          title="Tampilan HP"
                          onClick={() =>
                            setActiveDevices((p) => ({
                              ...p,
                              [theme.id]: "trio",
                            }))
                          }
                          className={`w-8 h-7 rounded-full inline-flex items-center justify-center transition cursor-pointer ${activeDev === "trio"
                              ? "bg-[#2C2018] text-white"
                              : "text-[#8C7868] hover:text-[#2C2018]"
                            }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Tampilan Tablet"
                          onClick={() =>
                            setActiveDevices((p) => ({
                              ...p,
                              [theme.id]: "tablet",
                            }))
                          }
                          className={`w-8 h-7 rounded-full inline-flex items-center justify-center transition cursor-pointer ${activeDev === "tablet"
                              ? "bg-[#2C2018] text-white"
                              : "text-[#8C7868] hover:text-[#2C2018]"
                            }`}
                        >
                          <Tablet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Tampilan Laptop"
                          onClick={() =>
                            setActiveDevices((p) => ({
                              ...p,
                              [theme.id]: "desktop",
                            }))
                          }
                          className={`w-8 h-7 rounded-full inline-flex items-center justify-center transition cursor-pointer ${activeDev === "desktop"
                              ? "bg-[#2C2018] text-white"
                              : "text-[#8C7868] hover:text-[#2C2018]"
                            }`}
                        >
                          <Laptop className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Mockup Viewport */}
                      <div className="w-full h-full relative flex items-center justify-center">
                        {activeDev === "trio" && (
                          <div className="w-full h-full flex items-center justify-center pb-3">
                            <div className="phone-frame phone-trio phone-left">
                              <div className="phone-island" />
                              <div className="phone-screen">
                                <img
                                  src={thumbMobile}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = theme.thumb
                                  }}
                                  alt={`${theme.title} HP 1`}
                                  loading="lazy"
                                />
                              </div>
                              <div className="phone-glare" />
                              <div className="phone-home-bar" />
                            </div>
                            <div className="phone-frame phone-trio phone-center">
                              <div className="phone-island" />
                              <div className="phone-screen">
                                <img
                                  src={thumbMobile2}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src =
                                      theme.thumb2 || theme.thumb
                                  }}
                                  alt={`${theme.title} HP 2`}
                                  loading="lazy"
                                />
                              </div>
                              <div className="phone-glare" />
                              <div className="phone-home-bar" />
                            </div>
                            <div className="phone-frame phone-trio phone-right">
                              <div className="phone-island" />
                              <div className="phone-screen">
                                <img
                                  src={thumbMobile3}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src =
                                      theme.thumb3 || theme.thumb
                                  }}
                                  alt={`${theme.title} HP 3`}
                                  loading="lazy"
                                />
                              </div>
                              <div className="phone-glare" />
                              <div className="phone-home-bar" />
                            </div>
                          </div>
                        )}

                        {activeDev === "tablet" && (
                          <div className="tablet-frame">
                            <div className="tablet-cam" />
                            <div className="tablet-screen">
                              <img
                                src={thumbTablet}
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = theme.thumb
                                }}
                                alt={`${theme.title} Tablet`}
                                loading="lazy"
                              />
                            </div>
                            <div className="tablet-glare" />
                          </div>
                        )}

                        {activeDev === "desktop" && (
                          <div className="laptop-frame">
                            <div className="laptop-lid">
                              <div className="laptop-notch" />
                              <div className="laptop-screen">
                                <img
                                  src={thumbDesktop}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = theme.thumb
                                  }}
                                  alt={`${theme.title} Desktop`}
                                  loading="lazy"
                                />
                              </div>
                              <div className="laptop-glare" />
                            </div>
                            <div className="laptop-base">
                              <div className="laptop-groove" />
                            </div>
                          </div>
                        )}
                      </div>

                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka Demo di Tab Baru"
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/92 border border-[#E5DDD5] text-[#2C2018] grid place-items-center shadow-sm hover:bg-[#2C2018] hover:text-white transition z-16"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Clean Boutique Card Body */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3.5">
                      <div className="text-center space-y-1">
                        <h3 className="font-serif-display text-lg font-bold text-[#2C2018] leading-snug">
                          {theme.title}
                        </h3>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-xs font-medium text-[#9A8A7B] line-through">
                            {theme.priceRegular}
                          </span>
                          <span className="text-lg font-extrabold text-[#2C2018]">
                            Rp {cleanPromo}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openThemePreview(theme, "mobile")}
                          className="h-9 rounded-xl border border-[#D8CCC0] bg-white text-[#2C2018] hover:border-[#2C2018] hover:bg-[#FAF6F1] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#A8763E]" />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenOrder(theme)}
                          className="h-9 rounded-xl bg-[#2C2018] hover:bg-[#A8763E] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          Pilih Tema
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ==================== 4. BENTO GRID FITUR UNGGULAN ==================== */}
        <section
          className="py-14 border-t border-[#E5DDD5] scroll-mt-20"
          id="fitur"
        >
          <div
            data-aos="fade-up"
            className="text-center max-w-2xl mx-auto mb-10 space-y-2"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8763E]">
              Fitur Lengkap
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2018]">
              Semua Kebutuhan Acara dalam{" "}
              <em className="text-[#A8763E] italic font-semibold">
                Satu Undangan
              </em>
            </h2>
            <p className="text-[#6B5B4E] text-sm sm:text-base">
              Dirancang detail agar pengalaman tamu undangan terasa personal,
              hangat, dan praktis di perangkat apa pun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
            {/* Card 1: Wide - Sebar Undangan Personal */}
            <div
              data-aos="fade-up"
              data-aos-delay="0"
              className="md:col-span-4 bg-white border border-[#E5DDD5] rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-[#C89B57]/70 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(44,32,24,0.07)] transition-all duration-300"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8763E]">
                  <Send className="w-4 h-4" />
                  Unlimited Share &amp; Personalisasi Nama
                </div>
                <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2C2018]">
                  Sapa Setiap Tamu dengan Namanya Sendiri
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5B4E] max-w-lg leading-relaxed">
                  Kelola daftar tamu langsung di Dashboard lalu kirim pesan
                  undangan WhatsApp otomatis dengan tautan unik tanpa batas
                  kuota.
                </p>
              </div>
              <div className="rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[#8C7868] font-semibold">
                    Contoh Link Personal Tamu
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-[#2C2018] truncate mt-0.5">
                    invitaa.id/u/ani-budi?to={encodeURIComponent(appliedGuest)}
                  </p>
                </div>
                <a
                  href="#tema"
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                >
                  <Send className="w-3 h-3" /> Coba di Katalog
                </a>
              </div>
            </div>

            {/* Card 2: Amplop Digital */}
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="md:col-span-2 bg-[#2C2018] text-white rounded-3xl p-6 flex flex-col justify-between gap-5 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(44,32,24,0.22)] transition-all duration-300"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5C27A]">
                  <Gift className="w-4 h-4" />
                  Amplop Digital 0% Potongan
                </div>
                <h3 className="font-serif-display text-xl font-bold">
                  Langsung ke Rekening Pribadi
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Tamu cukup satu klik untuk menyalin nomor rekening bank atau
                  e-wallet tanpa potongan biaya platform.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#E5C27A] font-semibold">
                    Bank BCA
                  </p>
                  <p className="text-sm font-mono font-bold tracking-wider">
                    1234 5678 90
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText("1234567890").catch(() => {})
                    setCopiedDemoBank(true)
                    triggerToast("Contoh nomor rekening berhasil disalin!")
                    window.setTimeout(() => setCopiedDemoBank(false), 1800)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-[#C89B57] text-[11px] font-semibold transition cursor-pointer"
                >
                  {copiedDemoBank ? (
                    <>
                      <Check className="w-3 h-3" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Salin
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 3: RSVP & Ucapan Live */}
            <div
              data-aos="fade-up"
              data-aos-delay="120"
              className="md:col-span-2 bg-white border border-[#E5DDD5] rounded-3xl p-6 flex flex-col justify-between gap-4 hover:border-[#C89B57]/70 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(44,32,24,0.07)] transition-all duration-300"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8763E]">
                  <MessageSquareHeart className="w-4 h-4" />
                  Buku Tamu &amp; RSVP Live
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[#2C2018]">
                  Ucapan Doa &amp; Jumlah Pax
                </h3>
                <p className="text-xs text-[#6B5B4E] leading-relaxed">
                  Tamu bisa menulis doa restu sekaligus mengonfirmasi kehadiran
                  serta jumlah orang yang datang secara real-time.
                </p>
              </div>
              <div className="rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2C2018]">Raka Pratama</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Hadir · 2 Pax
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5B4E]">
                  “Barakallah, semoga langgeng sampai akhir hayat!”
                </p>
              </div>
            </div>

            {/* Card 4: Multi-Acara & Google Maps */}
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="md:col-span-2 bg-white border border-[#E5DDD5] rounded-3xl p-6 flex flex-col justify-between gap-4 hover:border-[#C89B57]/70 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(44,32,24,0.07)] transition-all duration-300"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8763E]">
                  <MapPin className="w-4 h-4" />
                  Jadwal &amp; Navigasi Presisi
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[#2C2018]">
                  Multi-Acara + Google Maps
                </h3>
                <p className="text-xs text-[#6B5B4E] leading-relaxed">
                  Tambahkan jadwal Akad, Resepsi, atau Ngunduh Mantu lengkap
                  dengan countdown, tombol simpan kalender, dan rute Maps.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-[11px] font-semibold text-[#2C2018]">
                  <CalendarHeart className="w-3 h-3 text-[#A8763E]" /> Akad Nikah
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-[11px] font-semibold text-[#2C2018]">
                  <Clock className="w-3 h-3 text-[#A8763E]" /> Countdown
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-[11px] font-semibold text-[#2C2018]">
                  <MapPin className="w-3 h-3 text-[#A8763E]" /> Google Maps
                </span>
              </div>
            </div>

            {/* Card 5: Love Story, Galeri & Musik */}
            <div
              data-aos="fade-up"
              data-aos-delay="280"
              className="md:col-span-2 bg-white border border-[#E5DDD5] rounded-3xl p-6 flex flex-col justify-between gap-4 hover:border-[#C89B57]/70 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(44,32,24,0.07)] transition-all duration-300"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8763E]">
                  <Images className="w-4 h-4" />
                  Galeri, Cerita &amp; Musik
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[#2C2018]">
                  Momen Lebih Hidup
                </h3>
                <p className="text-xs text-[#6B5B4E] leading-relaxed">
                  Upload galeri foto prewedding HD, tuliskan bab perjalanan
                  cinta kalian, dan iringi dengan lagu MP3 romantis favorit.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] px-3 py-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#2C2018] text-[#E5C27A] grid place-items-center shrink-0">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2C2018] truncate">
                      Autoplay Backsound MP3
                    </p>
                    <p className="text-[10px] text-[#6B5B4E]">
                      + Galeri Foto HD &amp; Love Story
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-0.5 h-4 shrink-0 px-1">
                  <span className="w-1 rounded-full bg-[#C89B57] animate-eq-1" />
                  <span className="w-1 rounded-full bg-[#A8763E] animate-eq-2" />
                  <span className="w-1 rounded-full bg-[#C89B57] animate-eq-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 5. TRANSPARANSI HARGA (ALL-INCLUSIVE) ==================== */}
        <section
          className="py-14 border-t border-[#E5DDD5] scroll-mt-20"
          id="harga"
        >
          <div
            data-aos="zoom-in-up"
            className="rounded-[32px] overflow-hidden border border-[#E5DDD5] bg-white shadow-xs grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Left Espresso Summary */}
            <div
              data-aos="fade-right"
              data-aos-delay="100"
              className="lg:col-span-5 bg-[#2C2018] text-white p-7 sm:p-10 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-semibold text-[#E5C27A]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Transparan · Tanpa Biaya Tersembunyi
                </div>
                <h2 className="font-serif-display text-3xl sm:text-4xl font-bold leading-tight">
                  Bayar Sekali, Sesuai Tema Pilihan
                </h2>
                <p className="text-sm text-white/75 leading-relaxed">
                  Tidak perlu bingung pilih paket bertingkat. Setiap tema di
                  katalog Invitaa sudah langsung membuka seluruh fitur premium.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/15">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#E5C27A] font-semibold">
                    Mulai Dari
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif-display text-4xl font-bold">
                      {lowestPriceText}
                    </span>
                    <span className="text-xs text-white/65">
                      / aktif selamanya
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button
                    variant="gold"
                    className="flex-1 sm:flex-none px-6"
                    onClick={() => handleOpenOrder(activeHeroTheme)}
                  >
                    Pesan Sekarang
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/25 bg-transparent text-white hover:bg-white hover:text-[#2C2018]"
                    asChild
                  >
                    <a href="#tema">Pilih Tema</a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right All-Inclusive Checklist */}
            <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8763E] mb-2">
                Semua Sudah Termasuk
              </p>
              <h3 className="font-serif-display text-2xl font-bold text-[#2C2018] mb-6">
                Fitur Lengkap Aktif di Semua Tema
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ALL_INCLUSIVE_PERKS.map((perk, idx) => (
                  <div
                    key={perk}
                    data-aos="fade-up"
                    data-aos-delay={Math.min(idx * 45, 360)}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[#4A3B31] text-xs sm:text-sm leading-snug">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 6. FAQ SECTION ==================== */}
        <section
          className="py-14 border-t border-[#E5DDD5] scroll-mt-20"
          id="kontak"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div data-aos="fade-right" className="lg:col-span-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8763E]">
                Bantuan &amp; FAQ
              </p>
              <h2 className="font-serif-display text-3xl font-bold text-[#2C2018]">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm text-[#6B5B4E] leading-relaxed">
                Masih ada hal yang ingin ditanyakan seputar pemesanan atau cara
                mengelola undangan digital di Invitaa?
              </p>
            </div>

            <div
              data-aos="fade-left"
              data-aos-delay="100"
              className="lg:col-span-8"
            >
              <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className="space-y-3"
              >
                <AccordionItem
                  value="item-1"
                  className="border-[#E5DDD5] bg-white rounded-2xl px-1"
                >
                  <AccordionTrigger className="text-[#2C2018]">
                    Bagaimana alur pemesanan undangan di Invitaa?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B5B4E]">
                    Pilih tema favoritmu di katalog, isi form pemesanan, lalu
                    tunggu verifikasi cepat dari Admin Invitaa. Setelah aktif,
                    kamu bisa langsung login ke Dashboard untuk mengisi data
                    mempelai, acara, galeri foto, musik, rekening, cek preview,
                    dan klik Publish.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="border-[#E5DDD5] bg-white rounded-2xl px-1"
                >
                  <AccordionTrigger className="text-[#2C2018]">
                    Apakah ada batasan jumlah tamu yang bisa diundang?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B5B4E]">
                    Tidak ada batasan sama sekali. Kamu bisa menambahkan daftar
                    tamu dan membuat link personal dengan nama masing-masing
                    tamu sebanyak yang dibutuhkan tanpa biaya tambahan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="border-[#E5DDD5] bg-white rounded-2xl px-1"
                >
                  <AccordionTrigger className="text-[#2C2018]">
                    Apakah amplop digital dikenakan potongan komisi?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B5B4E]">
                    0% potongan! Tamu langsung menyalin nomor rekening pribadi
                    yang kamu cantumkan di Dashboard, sehingga seluruh dana
                    hadiah langsung masuk 100% ke rekeningmu.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="border-[#E5DDD5] bg-white rounded-2xl px-1"
                >
                  <AccordionTrigger className="text-[#2C2018]">
                    Bisakah data undangan diubah lagi setelah di-publish?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B5B4E]">
                    Tentu bisa! Kamu bebas mengedit detail mempelai, jadwal
                    acara, love story, foto galeri, maupun rekening kapan saja
                    dari Dashboard, mengecek tampilannya lewat Preview
                    multi-device, bahkan melakukan Unpublish sementara jika
                    diperlukan.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* ==================== 7. EDITORIAL CTA BANNER ==================== */}
        <section className="py-10">
          <div
            data-aos="zoom-in"
            className="relative overflow-hidden rounded-[32px] bg-[#2C2018] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#C89B57]/25 blur-3xl animate-aura-pulse" />
            <div className="relative z-10 space-y-2 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E5C27A]">
                Mulai Hari Spesialmu
              </p>
              <h2 className="font-serif-display text-2xl sm:text-4xl font-bold leading-tight">
                Siap Membuat Undangan Pernikahan Impian?
              </h2>
              <p className="text-white/75 text-sm sm:text-base max-w-xl">
                Pilih dari {themes.length} tema eksklusif Invitaa dan mulai
                personalisasi undanganmu hari ini.
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
              <Button
                variant="gold"
                size="lg"
                className="px-7"
                onClick={() => handleOpenOrder(activeHeroTheme)}
              >
                <Heart className="w-4 h-4" />
                Buat Undangan Sekarang
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== EDITORIAL FOOTER ==================== */}
      <footer
        data-aos="fade-up"
        className="mt-10 border-t border-[#E5DDD5] bg-white/70"
      >
        <div className="max-w-[1320px] mx-auto px-5 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2C2018] text-[#E5C27A] grid place-items-center">
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-serif-display text-xl font-bold text-[#2C2018]">
                In<span className="text-[#C89B57]">vitaa</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B5B4E] max-w-sm leading-relaxed">
              Platform undangan pernikahan digital dengan desain adat Nusantara
              hingga modern luxury. Praktis dikelola, elegan dibagikan.
            </p>
          </div>

          <div className="md:col-span-4 space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-[#2C2018]">Navigasi</p>
            <div className="grid grid-cols-2 gap-1.5 text-[#6B5B4E]">
              <a href="#cara-kerja" className="hover:text-[#A8763E] transition">
                Cara Kerja
              </a>
              <a href="#tema" className="hover:text-[#A8763E] transition">
                Katalog Tema
              </a>
              <a href="#fitur" className="hover:text-[#A8763E] transition">
                Fitur Lengkap
              </a>
              <a href="#harga" className="hover:text-[#A8763E] transition">
                Harga
              </a>
              <a href="#kontak" className="hover:text-[#A8763E] transition">
                FAQ
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-[#2C2018]">Akses Cepat</p>
            <div className="flex flex-col gap-1.5 text-[#6B5B4E]">
              {authUser ? (
                <Link
                  to={authUser.role === "admin" ? "/admin" : "/customer"}
                  className="hover:text-[#A8763E] font-medium transition"
                >
                  Dashboard ({authUser.name})
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-[#A8763E] font-medium transition"
                >
                  Masuk / Login Akun
                </Link>
              )}
              <Link
                to="/daftar"
                className="hover:text-[#A8763E] font-medium transition"
              >
                Pesan Undangan
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5DDD5] py-4 text-center text-xs text-[#8C7868]">
          &copy; 2026 <strong className="text-[#2C2018]">Invitaa</strong>.
          Seluruh hak cipta dilindungi.
        </div>
      </footer>

      {/* ==================== MODAL APPLE DEVICE PREVIEW ==================== */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col">
          {/* Top Bar */}
          <div className="shrink-0 bg-slate-900/95 border-b border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between gap-2 text-white">
            <div className="min-w-0">
              <h3 className="font-serif-display font-bold text-sm sm:text-base truncate">
                {previewTheme.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {previewTheme.categoryName} · Tamu: {appliedGuest}
              </p>
            </div>

            {windowWidth >= 768 && (
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => setModalDevice("mobile")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${effectiveModalDevice === "mobile"
                      ? "bg-[#C89B57] text-slate-950"
                      : "text-slate-300 hover:text-white"
                    }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> iPhone 17 Pro
                </button>
                <button
                  type="button"
                  onClick={() => setModalDevice("tablet")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${effectiveModalDevice === "tablet"
                      ? "bg-[#C89B57] text-slate-950"
                      : "text-slate-300 hover:text-white"
                    }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> iPad Pro M3
                </button>
                {windowWidth >= 1024 && (
                  <button
                    type="button"
                    onClick={() => setModalDevice("desktop")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${effectiveModalDevice === "desktop"
                        ? "bg-[#C89B57] text-slate-950"
                        : "text-slate-300 hover:text-white"
                      }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> MacBook Pro
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  const chosen = previewTheme
                  setPreviewTheme(null)
                  handleOpenOrder(chosen)
                }}
              >
                Pesan Tema Ini
              </Button>
              <button
                type="button"
                aria-label="Tutup preview"
                onClick={() => setPreviewTheme(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-white grid place-items-center hover:bg-red-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hardware Stage */}
          <div
            className={`flex-1 min-h-0 flex items-center justify-center overflow-hidden ${windowWidth < 768
                ? "p-0"
                : "p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#090d16_65%,_#03050a_100%)]"
              }`}
          >
            <div
              className={`relative flex flex-col items-center transition-all duration-300 animate-modal-pop ${windowWidth < 768
                  ? "w-full h-full"
                  : effectiveModalDevice === "mobile"
                    ? "w-[396px] max-w-full h-full max-h-[820px]"
                    : effectiveModalDevice === "tablet"
                      ? "w-[768px] max-w-full h-full max-h-[860px]"
                      : "w-full max-w-[1140px] h-full max-h-[750px]"
                }`}
            >
              <div
                className={`relative flex-1 min-h-0 flex flex-col transition-all duration-300 ${windowWidth < 768
                    ? "w-full h-full bg-black"
                    : effectiveModalDevice === "mobile"
                      ? "w-full rounded-[50px] p-[3px] bg-gradient-to-b from-[#635e59] via-[#2b2927] to-[#4b4743] shadow-2xl"
                      : effectiveModalDevice === "tablet"
                        ? "w-full rounded-[32px] p-[3px] bg-gradient-to-b from-[#51555e] via-[#22242a] to-[#3a3d45] shadow-2xl"
                        : "w-[93%] rounded-t-[20px] p-[2.5px] pb-0 bg-gradient-to-b from-[#626670] via-[#2c2f36] to-[#1c1e24] shadow-2xl"
                  }`}
              >
                <div
                  className={`relative w-full h-full flex flex-col ${windowWidth < 768
                      ? "bg-black"
                      : effectiveModalDevice === "mobile"
                        ? "rounded-[47px] bg-[#08080a] p-[10px]"
                        : effectiveModalDevice === "tablet"
                          ? "rounded-[29px] bg-[#08080a] p-[14px]"
                          : "rounded-t-[18px] bg-[#08080a] p-[10px] pb-[6px]"
                    }`}
                >
                  <div
                    className={`relative w-full flex-1 min-h-0 overflow-hidden bg-black ${windowWidth < 768
                        ? ""
                        : effectiveModalDevice === "mobile"
                          ? "rounded-[38px]"
                          : effectiveModalDevice === "tablet"
                            ? "rounded-[18px]"
                            : "rounded-[8px]"
                      }`}
                  >
                    {windowWidth >= 768 && effectiveModalDevice === "mobile" && (
                      <div className="pointer-events-none absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-[100px] h-[25px] rounded-full bg-black" />
                    )}
                    {windowWidth >= 768 && effectiveModalDevice === "desktop" && (
                      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[110px] h-[16px] rounded-b-[10px] bg-[#08080a]" />
                    )}
                    <iframe
                      src={`${previewTheme.path}?to=${encodeURIComponent(appliedGuest)}`}
                      title={previewTheme.title}
                      onLoad={(e) => {
                        const doc = e.currentTarget.contentDocument
                        if (doc && !doc.getElementById("wv-hide-scrollbar")) {
                          const styleEl = doc.createElement("style")
                          styleEl.id = "wv-hide-scrollbar"
                          styleEl.textContent =
                            "html,body,*{-ms-overflow-style:none!important;scrollbar-width:none!important;}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;}"
                          doc.head?.appendChild(styleEl)
                        }
                      }}
                      className="w-full h-full border-0 block"
                    />
                  </div>
                  {windowWidth >= 768 && effectiveModalDevice === "desktop" && (
                    <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/30 text-center pt-1.5 pb-0.5 select-none">
                      MacBook Pro
                    </p>
                  )}
                </div>
              </div>

              {windowWidth >= 768 && effectiveModalDevice === "desktop" && (
                <div className="w-full flex flex-col items-center shrink-0 pointer-events-none">
                  <div className="w-[84%] h-[5px] bg-gradient-to-r from-[#14151a] via-[#2c2f37] to-[#14151a]" />
                  <div className="relative w-full h-[16px] rounded-b-[14px] rounded-t-[2px] bg-gradient-to-b from-[#9498a1] via-[#5d616a] to-[#32353c] shadow-2xl flex justify-center">
                    <div className="w-[120px] h-[5px] rounded-b-full bg-gradient-to-b from-[#2b2d34] to-[#4a4e57]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-7 left-1/2 z-50 bg-[#2C2018] text-white border border-[#C89B57]/40 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 animate-toast-up">
          <CheckCircle2 className="w-4 h-4 text-[#E5C27A]" />
          <span>{toastMsg}</span>
        </div>
      )}

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={() => {
          clearTokens()
          setInvitation(DEFAULT_INVITATION)
          setAuthUserState(null)
        }}
      />
    </div>
  )
}
