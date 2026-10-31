import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useWinvit } from "@/context/WinvitContext"
import type { ThemeItem } from "@/types/winvit"
import { FEATURES_14 } from "@/data/themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Eye,
  Maximize2,
  ExternalLink,
  Smartphone,
  Tablet,
  Laptop,
  UserCheck,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react"

export default function LandingPage() {
  const { themes } = useWinvit()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Feature filter
  const [featureCat, setFeatureCat] = useState<string>("all")

  // Theme catalog states
  const [themeCat, setThemeCat] = useState<string>("all")
  const [guestInput, setGuestInput] = useState("Bapak / Ibu / Saudara/i")
  const [appliedGuest, setAppliedGuest] = useState("Bapak / Ibu / Saudara/i")
  const [activeDevices, setActiveDevices] = useState<
    Record<string, "trio" | "tablet" | "desktop">
  >({})

  // Device Preview Modal
  const [previewTheme, setPreviewTheme] = useState<ThemeItem | null>(null)
  const [modalDevice, setModalDevice] = useState<"mobile" | "tablet" | "desktop">("mobile")

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2600)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const filteredFeatures =
    featureCat === "all"
      ? FEATURES_14
      : FEATURES_14.filter((f) => f.cat === featureCat)

  const filteredThemes =
    themeCat === "all"
      ? themes
      : themes.filter((t) => t.category === themeCat)

  const handleOpenOrder = (themeId?: string) => {
    navigate("/daftar", { state: { themeId: themeId || "botanica" } })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ==================== NAVBAR ==================== */}
      <header
        className={`sticky top-0 z-40 w-full bg-white/92 backdrop-blur-xl border-b border-slate-200 transition-all ${
          scrolled ? "shadow-sm bg-white/98" : ""
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-6 h-[74px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center shadow-sm group-hover:bg-[#b3822a] transition-colors">
              <Crown className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                WInvit
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b3822a]">
                Digital Invitation SaaS
              </span>
            </div>
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <li>
              <a href="#fitur" className="hover:text-slate-900 transition">
                Fitur
              </a>
            </li>
            <li>
              <a href="#tema" className="hover:text-slate-900 transition">
                Katalog Tema ({themes.length})
              </a>
            </li>
            <li>
              <a href="#harga" className="hover:text-slate-900 transition">
                Harga
              </a>
            </li>
            <li>
              <a href="#kontak" className="hover:text-slate-900 transition">
                FAQ
              </a>
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-2.5">
            <Button variant="outline" size="sm" asChild>
              <Link to="/customer">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard Customer
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b3822a]" />
                Backoffice Admin
              </Link>
            </Button>
            <Button size="sm" onClick={() => handleOpenOrder("botanica")}>
              <UserCheck className="w-3.5 h-3.5" />
              Daftar / Pesan
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3 shadow-lg">
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="font-semibold py-1.5 border-b border-slate-100">
              Fitur
            </a>
            <a href="#tema" onClick={() => setMobileMenuOpen(false)} className="font-semibold py-1.5 border-b border-slate-100">
              Katalog Tema
            </a>
            <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="font-semibold py-1.5 border-b border-slate-100">
              Harga
            </a>
            <Link to="/customer" className="font-semibold py-1.5 text-[#b3822a]">
              Dashboard Customer
            </Link>
            <Link to="/admin" className="font-semibold py-1.5 text-slate-700">
              Backoffice Admin WInvit
            </Link>
            <Button onClick={() => { setMobileMenuOpen(false); handleOpenOrder("botanica") }}>
              Daftar / Masuk
            </Button>
          </div>
        )}
      </header>

      <main className="max-w-[1360px] mx-auto px-6 w-full flex-1">
        {/* ==================== 1. HERO SECTION ==================== */}
        <section className="pt-16 pb-12 text-center" id="home">
          <Badge variant="secondary" className="mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#b3822a]" />
            Platform SaaS Undangan Pernikahan Digital #1
          </Badge>

          <h1 className="font-serif-display text-4xl sm:text-5xl md:text-[64px] font-bold leading-[1.15] text-slate-900 max-w-4xl mx-auto mb-5">
            Rayakan Cinta Abadi, <br />
            Ciptakan <em className="text-[#b3822a] italic">Momen Istimewa</em>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Koleksi {themes.length} template web undangan pernikahan digital siap pakai dengan identitas adat
            nusantara &amp; modern luxury. Daftar, pilih tema, dan rilis undanganmu dalam hitungan menit.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Button size="lg" onClick={() => handleOpenOrder("sunda-siger")}>
              Buat Undangan Sekarang
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#tema">Lihat {themes.length} Katalog Tema</a>
            </Button>
          </div>

          {/* Center Phone Showcase */}
          <div className="relative max-w-[380px] mx-auto mb-14">
            <div className="hidden lg:flex items-center gap-3 absolute -left-36 top-1/4 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xl z-10 text-left animate-float-left">
              <div className="text-amber-500 text-xs">
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
              </div>
              <div>
                <div className="font-extrabold text-lg text-slate-900 leading-none">
                  500+
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  Pasangan Bahagia
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[46px] p-3 shadow-2xl relative z-0">
              <div className="rounded-[36px] overflow-hidden aspect-9/18 bg-white">
                <img
                  src="/asset/img/pre3.jpeg"
                  alt="Preview Undangan Pernikahan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="hidden lg:block absolute -right-36 top-[45%] bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xl z-10 text-left animate-float-right">
              <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                Amplop Digital
              </span>
              <div className="text-lg font-extrabold text-slate-900">
                Rp 0 Potongan
              </div>
              <div className="text-xs text-slate-400">
                100% Langsung ke Rekening
              </div>
            </div>
          </div>

          {/* Partner Bar */}
          <div className="py-8 border-y border-slate-200 mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Didukung Berbagai Metode Pembayaran &amp; Navigasi Presisi
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600 font-bold text-sm opacity-80">
              <div className="flex items-center gap-2"><i className="fas fa-building-columns text-slate-400" /> Bank BCA</div>
              <div className="flex items-center gap-2"><i className="fas fa-building-columns text-slate-400" /> Bank Mandiri</div>
              <div className="flex items-center gap-2"><i className="fas fa-qrcode text-slate-400" /> QRIS Semua Bank</div>
              <div className="flex items-center gap-2"><i className="fas fa-map-location-dot text-slate-400" /> Google Maps</div>
              <div className="flex items-center gap-2"><i className="fas fa-music text-slate-400" /> Autoplay Music</div>
              <div className="flex items-center gap-2"><i className="fas fa-bolt text-slate-400" /> Cloud Hosting Cepat</div>
            </div>
          </div>
        </section>

        {/* ==================== 2. KENAPA MEMILIH KAMI + 14 FITUR ==================== */}
        <section className="py-12 scroll-mt-24" id="fitur">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b3822a]" /> Kenapa Memilih Kami
            </Badge>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-3">
              Solusi Lengkap Undangan Pernikahan Impian
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Kemudahan dan keindahan terbaik untuk menyambut hari paling bersejarah Anda dan pasangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="bg-gradient-to-b from-sky-100 to-sky-50 p-8 flex items-center justify-center min-h-[165px]">
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center w-full max-w-[220px]">
                  <i className="fas fa-layer-group text-2xl text-sky-600 mb-1.5" />
                  <div className="text-xs font-extrabold text-slate-900">{themes.length}+ Tema Siap Pakai</div>
                  <div className="text-[11px] text-slate-500">Adat, Luxury &amp; Minimalis</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">Desain Berkelas &amp; Eksklusif</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pilihan tema Nusantara (Sunda, Jawa, Bali) hingga estetika dark luxury glassmorphism yang responsif di semua perangkat.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="bg-gradient-to-b from-amber-100 to-amber-50 p-8 flex items-center justify-center min-h-[165px]">
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center w-full max-w-[220px]">
                  <i className="fas fa-wallet text-2xl text-[#b3822a] mb-1.5" />
                  <div className="text-xs font-extrabold text-slate-900">Amplop &amp; RSVP Live</div>
                  <div className="text-[11px] text-slate-500">Bebas Potongan Komisi</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">Fitur Interaktif Terlengkap</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kirim kado pernikahan via QRIS, buku tamu realtime, rute petunjuk jalan Google Maps, dan alunan musik romantis pilihan.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="bg-gradient-to-b from-emerald-100 to-emerald-50 p-8 flex items-center justify-center min-h-[165px]">
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center w-full max-w-[220px]">
                  <i className="fas fa-tag text-2xl text-emerald-600 mb-1.5" />
                  <div className="text-xs font-extrabold text-slate-900">Mulai Rp 99.000</div>
                  <div className="text-[11px] text-slate-500">Aktif Selamanya</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">Hemat &amp; Tanpa Batas Tamu</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Satu harga terjangkau untuk membagikan undangan personal ke ribuan kontak kerabat tanpa batasan kuota.
                </p>
              </div>
            </div>
          </div>

          {/* 14 FITUR GRID */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <Badge variant="secondary">
              <i className="fas fa-wand-magic-sparkles text-[#b3822a]" /> 14 Fitur Lengkap
            </Badge>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-2">
              Fitur Lengkap, <em className="text-[#b3822a] italic">Semua Kebutuhan Terpenuhi</em>
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {[
              { id: "all", label: "Semua Fitur (14)", icon: "fa-border-all" },
              { id: "tamu", label: "Tamu & Undangan", icon: "fa-users" },
              { id: "media", label: "Media & Cerita", icon: "fa-photo-film" },
              { id: "acara", label: "Acara & Kado", icon: "fa-calendar-check" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFeatureCat(tab.id)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold border transition cursor-pointer inline-flex items-center gap-2 ${
                  featureCat === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                <i className={`fas ${tab.icon}`} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredFeatures.map((f) => (
              <div
                key={f.num}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl grid place-items-center text-lg ${
                      f.color === "blue"
                        ? "bg-sky-100 text-sky-600"
                        : f.color === "gold"
                        ? "bg-amber-100 text-[#b3822a]"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    <i className={`fas ${f.icon}`} />
                  </div>
                  <span className="font-serif-display text-xl font-bold text-slate-200">
                    {f.num}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-2 ${
                      f.color === "blue"
                        ? "bg-sky-50 text-sky-700"
                        : f.color === "gold"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {f.badge}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mb-1">
                    {f.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== 3. KATALOG TEMA (#tema) ==================== */}
        <section className="py-14 scroll-mt-24" id="tema">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <Badge variant="secondary">
              <i className="fas fa-border-all text-[#b3822a]" /> {themes.length} Tema Pilihan
            </Badge>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-2">
              Pilih Desain Undangan <em className="text-[#b3822a] italic">Impianmu</em>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Eksplorasi koleksi template dengan identitas visual khas adat nusantara, dark luxury, dan editorial minimalis.
            </p>
          </div>

          {/* Simulasi Nama Tamu */}
          <div className="max-w-xl mx-auto mb-8 bg-white border border-slate-200 rounded-2xl p-2 pl-4 flex items-center gap-3 shadow-xs">
            <i className="fas fa-user-tag text-[#b3822a]" />
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulasi Nama Tamu Undangan
              </label>
              <input
                type="text"
                value={guestInput}
                onChange={(e) => setGuestInput(e.target.value)}
                placeholder="Cth: Bapak Budi & Rekan"
                className="w-full text-sm font-bold text-slate-900 outline-none bg-transparent"
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                const v = guestInput.trim() || "Bapak / Ibu / Saudara/i"
                setAppliedGuest(v)
                triggerToast(`Nama tamu diatur ke "${v}"`)
              }}
            >
              Terapkan Nama
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: "all", label: "Semua Tema", icon: "fa-border-all" },
              { id: "adat", label: "Adat Nusantara", icon: "fa-archway" },
              { id: "luxury", label: "Dark & Luxury", icon: "fa-gem" },
              { id: "editorial", label: "Editorial & Paper", icon: "fa-book-open" },
              { id: "nature", label: "Tropical & Boho", icon: "fa-leaf" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setThemeCat(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition cursor-pointer inline-flex items-center gap-2 ${
                  themeCat === cat.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                <i className={`fas ${cat.icon}`} /> {cat.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredThemes.map((theme) => {
              const activeDev = activeDevices[theme.id] || "trio"
              const targetUrl = `${theme.path}?to=${encodeURIComponent(appliedGuest)}`
              const thumbMobile = `/asset/img/thumbnails/${theme.id}/mobile.jpg`
              const thumbMobile2 = `/asset/img/thumbnails/${theme.id}/mobile-2.jpg`
              const thumbMobile3 = `/asset/img/thumbnails/${theme.id}/mobile-3.jpg`
              const thumbTablet = `/asset/img/thumbnails/${theme.id}/tablet.jpg`
              const thumbDesktop = `/asset/img/thumbnails/${theme.id}/desktop.jpg`
              const cleanPromo = theme.pricePromo.replace(/[^0-9.]/g, "").trim()

              return (
                <div
                  key={theme.id}
                  className="theme-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 hover:-translate-y-1.5 hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="mockup-stage">
                    {/* Top Left Pill */}
                    <div className="absolute top-3 left-3.5 z-15 bg-white/92 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs inline-flex items-center gap-1.5">
                      <i className={`fas ${theme.vibeIcon} text-[#b3822a]`} />
                      <span>{theme.categoryName}</span>
                    </div>

                    {/* Discount Ribbon */}
                    <div className="mockup-corner-ribbon">
                      <span>{theme.discount || "Disc 50%"}</span>
                    </div>

                    {/* Icon-only 3-Device Switcher (3HP / Tab / PC) */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-18 inline-flex gap-1 p-1 bg-white/90 backdrop-blur-md rounded-full border border-black/10 shadow-md">
                      <button
                        type="button"
                        title="Showcase 3 HP"
                        onClick={() =>
                          setActiveDevices((p) => ({ ...p, [theme.id]: "trio" }))
                        }
                        className={`w-8 h-7 rounded-full inline-flex items-center justify-center text-xs transition cursor-pointer ${
                          activeDev === "trio"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <i className="fas fa-mobile-screen" />
                      </button>
                      <button
                        type="button"
                        title="Frame Tablet"
                        onClick={() =>
                          setActiveDevices((p) => ({ ...p, [theme.id]: "tablet" }))
                        }
                        className={`w-8 h-7 rounded-full inline-flex items-center justify-center text-xs transition cursor-pointer ${
                          activeDev === "tablet"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <i className="fas fa-tablet-screen-button" />
                      </button>
                      <button
                        type="button"
                        title="Frame Laptop"
                        onClick={() =>
                          setActiveDevices((p) => ({ ...p, [theme.id]: "desktop" }))
                        }
                        className={`w-8 h-7 rounded-full inline-flex items-center justify-center text-xs transition cursor-pointer ${
                          activeDev === "desktop"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <i className="fas fa-laptop" />
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
                                  e.currentTarget.src = theme.thumb2 || theme.thumb
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
                                  e.currentTarget.src = theme.thumb3 || theme.thumb
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
                      title="Buka Undangan Penuh"
                      className="absolute bottom-3 right-3.5 w-8 h-8 rounded-full bg-white/90 text-slate-800 grid place-items-center text-xs shadow-md hover:bg-slate-900 hover:text-white transition z-16"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col items-center text-center flex-1">
                    <h3 className="text-[17px] font-extrabold text-slate-900 leading-snug">
                      {theme.title}
                    </h3>
                    <div className="text-sm font-semibold text-red-500 line-through mt-1">
                      {theme.priceRegular}
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5 mb-4">
                      Rp{cleanPromo}
                    </div>

                    <div className="flex items-center justify-center gap-2 w-full">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-slate-900 text-white font-bold text-xs sm:text-sm py-2.5 px-3.5 rounded-full hover:bg-[#b3822a] transition inline-flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Contoh
                      </a>
                      <button
                        onClick={() => {
                          setPreviewTheme(theme)
                          setModalDevice("mobile")
                        }}
                        title="Preview Multi-Device"
                        className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 grid place-items-center hover:border-slate-900 hover:text-slate-900 transition cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenOrder(theme.id)}
                        title="Pesan Tema Ini"
                        className="w-9 h-9 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 grid place-items-center hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                      >
                        <i className="fas fa-cart-plus text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ==================== 4. PRICING SECTION ==================== */}
        <section className="py-14 scroll-mt-24" id="harga">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary">
              <i className="fas fa-tags text-[#b3822a]" /> Investasi Hemat
            </Badge>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-2">
              Pilihan Paket Harga Terbaik
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Investasi terbaik untuk momen sakral sekali seumur hidup. Tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
            {/* Silver */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-xs">
              <div className="text-xl font-extrabold text-slate-900">Paket Silver</div>
              <div className="text-xs text-slate-500 mt-1 mb-5">
                Pilihan tepat untuk acara pernikahan intim &amp; sederhana.
              </div>
              <div className="py-4 border-y border-slate-200 mb-5">
                <span className="text-xs text-slate-400 line-through block">Rp 198.000</span>
                <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1">
                  <span className="text-base text-[#b3822a]">Rp</span> 99.000
                  <span className="text-xs font-semibold text-slate-400">/ aktif 6 bulan</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mb-6" onClick={() => handleOpenOrder("sunda-siger")}>
                Pilih Paket Silver
              </Button>
              <ul className="space-y-2.5 text-sm text-slate-600 flex-1">
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Unlimited Share</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Custom Nama Tamu (hingga 500)</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Konfirmasi Kehadiran (RSVP)</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Gallery Foto HD (hingga 10 foto)</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Countdown Acara &amp; Navigasi Maps</li>
              </ul>
            </div>

            {/* Gold */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 flex flex-col shadow-lg relative">
              <span className="absolute -top-3 right-6 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                Paling Diminati
              </span>
              <div className="text-xl font-extrabold text-slate-900">Paket Gold</div>
              <div className="text-xs text-slate-500 mt-1 mb-5">
                Paket terlengkap &amp; terpopuler untuk pesta pernikahan idaman.
              </div>
              <div className="py-4 border-y border-slate-200 mb-5">
                <span className="text-xs text-slate-400 line-through block">Rp 249.000</span>
                <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1">
                  <span className="text-base text-[#b3822a]">Rp</span> 129.000
                  <span className="text-xs font-semibold text-slate-400">/ aktif selamanya</span>
                </div>
              </div>
              <Button className="w-full mb-6" onClick={() => handleOpenOrder("emerald")}>
                Pilih Paket Gold
              </Button>
              <ul className="space-y-2.5 text-sm text-slate-600 flex-1">
                <li><i className="fas fa-check text-emerald-500 mr-2" /> <strong>Semua 14 Fitur Lengkap Aktif</strong></li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> <strong>Unlimited Share &amp; Custom Nama Tamu</strong></li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Amplop Digital &amp; QRIS 0% Potongan</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Love Story + Buku Tamu Realtime</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> <strong>Masa Aktif SELAMANYA &amp; Bebas {themes.length} Tema</strong></li>
              </ul>
            </div>

            {/* Platinum */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-xs">
              <div className="text-xl font-extrabold text-slate-900">Paket Platinum</div>
              <div className="text-xs text-slate-500 mt-1 mb-5">
                Kustomisasi eksklusif didampingi desainer profesional.
              </div>
              <div className="py-4 border-y border-slate-200 mb-5">
                <span className="text-xs text-slate-400 line-through block">Rp 399.000</span>
                <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1">
                  <span className="text-base text-[#b3822a]">Rp</span> 199.000
                  <span className="text-xs font-semibold text-slate-400">/ VIP Eksklusif</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mb-6" onClick={() => handleOpenOrder("golden-regeria")}>
                Pilih Paket Platinum
              </Button>
              <ul className="space-y-2.5 text-sm text-slate-600 flex-1">
                <li><i className="fas fa-check text-emerald-500 mr-2" /> <strong>Semua 14 Fitur Paket Gold Lengkap</strong></li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Kustomisasi Palet Warna, Font &amp; Tema</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Pendampingan Input Data oleh Tim VIP</li>
                <li><i className="fas fa-check text-emerald-500 mr-2" /> Pengerjaan Prioritas Jalur Kilat 12 Jam</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==================== 5. FAQ SECTION (SHADCN ACCORDION) ==================== */}
        <section className="py-14 scroll-mt-24" id="kontak">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="secondary">
              <i className="fas fa-question-circle text-[#b3822a]" /> Bantuan
            </Badge>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Pertanyaan yang sering diajukan seputar pemesanan dan fitur undangan online WInvit.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible defaultValue="item-1" className="space-y-3">
              <AccordionItem value="item-1">
                <AccordionTrigger>Bagaimana alur pemesanan undangan di WInvit?</AccordionTrigger>
                <AccordionContent>
                  Sangat mudah! Daftar akun &amp; pilih tema favorit Anda, lakukan pembayaran, tunggu verifikasi cepat dari Admin WInvit, lalu Anda bisa langsung mengisi foto, lagu, nomor rekening, dan merilis web undangan Anda!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Apakah ada batasan jumlah tamu yang bisa diundang?</AccordionTrigger>
                <AccordionContent>
                  Tidak ada batasan sama sekali! Anda dapat membuat tautan personal dengan nama masing-masing tamu sebanyak yang Anda perlukan dan menyebarkannya via WhatsApp tanpa biaya tambahan.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Bagaimana sistem amplop digital &amp; QRIS bekerja?</AccordionTrigger>
                <AccordionContent>
                  Tamu dapat menyalin nomor rekening (BCA, Mandiri, dll.) atau memindai barcode QRIS langsung dari layar undangan. Dana hadiah langsung masuk 100% ke rekening pribadi Anda tanpa potongan sepeser pun.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Bisakah saya menyembunyikan section tertentu (misal tanpa Love Story)?</AccordionTrigger>
                <AccordionContent>
                  Bisa! Di Dashboard Customer WInvit tersedia fitur pengatur section di mana Anda bebas mengaktifkan atau menyembunyikan section seperti Love Story, Galeri, Amplop Digital, atau FAQ secara fleksibel.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* ==================== 6. BOTTOM CTA BANNER ==================== */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[30px] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 my-10">
          <div>
            <h2 className="font-serif-display text-2xl sm:text-4xl font-bold mb-2">
              Siap Membuat Undangan Pernikahan Impian Anda?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Daftar sekarang, pilih dari {themes.length} tema eksklusif kami, dan kelola undangan digitalmu langsung dari Dashboard WInvit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="whatsapp" size="lg" onClick={() => handleOpenOrder("botanica")}>
              <Sparkles className="w-4 h-4" /> Buat Undangan Sekarang
            </Button>
          </div>
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        <div className="max-w-[1360px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; 2026 <strong>WInvit SaaS</strong>. Seluruh tema dilengkapi Musik Latar, Countdown, RSVP Live, Maps &amp; Amplop Digital.
          </p>
          <div className="flex gap-4 text-xs font-bold text-slate-700">
            <Link to="/customer" className="hover:underline">Portal Customer</Link>
            <Link to="/admin" className="hover:underline">Backoffice Admin</Link>
          </div>
        </div>
      </footer>

      {/* ==================== MODAL DEVICE PREVIEW ==================== */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col">
          <div className="bg-white px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900">{previewTheme.title}</h3>
              <p className="text-xs text-slate-500">{previewTheme.categoryName}</p>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setModalDevice("mobile")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                  modalDevice === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> HP
              </button>
              <button
                onClick={() => setModalDevice("tablet")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                  modalDevice === "tablet" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" /> Tab
              </button>
              <button
                onClick={() => setModalDevice("desktop")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                  modalDevice === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> PC
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => {
                const id = previewTheme.id
                setPreviewTheme(null)
                handleOpenOrder(id)
              }}>
                Pesan Tema Ini
              </Button>
              <button
                onClick={() => setPreviewTheme(null)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 grid place-items-center hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div
              className={`bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-all duration-300 h-[85vh] ${
                modalDevice === "mobile"
                  ? "w-[412px]"
                  : modalDevice === "tablet"
                  ? "w-[768px]"
                  : "w-full max-w-[1240px]"
              }`}
            >
              <iframe
                src={`${previewTheme.path}?to=${encodeURIComponent(appliedGuest)}`}
                title={previewTheme.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
