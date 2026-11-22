import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { getPublicThemesApi, placeOrderApi } from "@/lib/api"

interface PublicThemeItem {
  id: string
  name: string
  thumbnail_url: string
  is_active: boolean
  price: number
  tag: string
}

export default function RegistrationPage() {
  const location = useLocation()
  const routeState = location.state as { themeId?: string } | null

  const [apiThemes, setApiThemes] = useState<PublicThemeItem[]>([])
  const [loadingThemes, setLoadingThemes] = useState(true)
  const [selectedThemeId, setSelectedThemeId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoadingThemes(true)

    getPublicThemesApi({ page: 1, per_page: 50 })
      .then((res) => {
        if (!isMounted) return
        const list: PublicThemeItem[] = Array.isArray(res)
          ? res
          : res?.items || res?.themes || res?.data || []

        setApiThemes(list)

        if (list.length > 0) {
          const routeThemeId = routeState?.themeId
          const matched = routeThemeId
            ? list.find(
                (t) =>
                  t.id === routeThemeId ||
                  t.name.toLowerCase().includes(routeThemeId.toLowerCase())
              )
            : null
          setSelectedThemeId(matched ? matched.id : list[0].id)
        }
      })
      .catch((err: any) => {
        if (!isMounted) return
        setErrorMsg(err?.message || "")
      })
      .finally(() => {
        if (isMounted) setLoadingThemes(false)
      })

    return () => {
      isMounted = false
    }
  }, [routeState?.themeId])

  const chosenTheme =
    apiThemes.find((theme) => theme.id === selectedThemeId) ?? apiThemes[0]

  const amount = Number(chosenTheme?.price) || 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedThemeId) return

    setErrorMsg("")
    setSubmitting(true)

    try {
      await placeOrderApi({
        theme_id: selectedThemeId,
        customer_name: customerName.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
      })

      setOrderSuccess(true)
    } catch (err: any) {
      setErrorMsg(err?.message || "")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF6F1] text-[#2C2018] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#6B5B4E] hover:text-[#2C2018]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <section className="rounded-3xl border border-[#E5DDD5] bg-white p-6 shadow-xs sm:p-8">
          {orderSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#2C2018]">
                Pesanan Berhasil Dikirim!
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5B4E] max-w-md mx-auto leading-relaxed">
                Terima kasih <strong>{customerName}</strong>! Pesanan tema{" "}
                <strong>{chosenTheme?.name}</strong> telah kami terima. Tim Admin
                Winvitaa akan segera memverifikasi pesanan Anda dan menghubungi nomor
                WhatsApp <strong>{whatsapp}</strong>.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link to="/">Kembali ke Katalog</Link>
                </Button>
                <Button variant="gold" className="rounded-xl" asChild>
                  <Link to="/login">Masuk ke Akun (Login)</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8763E]">
                  Winvitaa Order
                </p>
                <h1 className="mt-1 text-xl sm:text-2xl font-bold text-[#2C2018]">
                  Buat Pesanan Undangan
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#6B5B4E]">
                  Pilih tema undangan favorit Anda dan lengkapi informasi kontak pemesan.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="theme" className="text-xs text-[#6B5B4E]">
                    Tema Undangan
                  </Label>
                  <select
                    id="theme"
                    disabled={loadingThemes || apiThemes.length === 0}
                    value={selectedThemeId}
                    onChange={(event) => {
                      setSelectedThemeId(event.target.value)
                      if (errorMsg) setErrorMsg("")
                    }}
                    className="mt-1 flex h-11 w-full rounded-xl border border-[#E5DDD5] bg-[#FAF6F1] px-3.5 py-2 text-sm font-semibold text-[#2C2018] disabled:opacity-60"
                  >
                    {loadingThemes ? (
                      <option value="">Memuat daftar tema dari server...</option>
                    ) : apiThemes.length === 0 ? (
                      <option value="">Tidak ada tema aktif</option>
                    ) : (
                      apiThemes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name} — Rp {Number(theme.price).toLocaleString("id-ID")}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <Label htmlFor="customerName" className="text-xs text-[#6B5B4E]">
                    Nama Pemesan
                  </Label>
                  <Input
                    id="customerName"
                    required
                    autoComplete="name"
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(event) => {
                      setCustomerName(event.target.value)
                      if (errorMsg) setErrorMsg("")
                    }}
                    className="mt-1 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs text-[#6B5B4E]">
                    Email Aktif
                  </Label>
                  <Input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="budi.santoso@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (errorMsg) setErrorMsg("")
                    }}
                    className="mt-1 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-xs text-[#6B5B4E]">
                    Nomor WhatsApp Aktif
                  </Label>
                  <Input
                    id="whatsapp"
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="Contoh: 628123456789"
                    value={whatsapp}
                    onChange={(event) => {
                      setWhatsapp(event.target.value)
                      if (errorMsg) setErrorMsg("")
                    }}
                    className={`mt-1 h-11 rounded-xl ${
                      errorMsg ? "border-red-400 focus-visible:ring-red-400" : ""
                    }`}
                  />
                  {errorMsg && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#E5DDD5] pt-4">
                  <span className="text-xs sm:text-sm text-[#6B5B4E]">
                    Harga Tema
                  </span>
                  <span className="text-lg font-extrabold text-[#2C2018]">
                    Rp {amount.toLocaleString("id-ID")}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  disabled={submitting || loadingThemes || !selectedThemeId}
                  className="h-11 w-full rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim Pesanan...
                    </>
                  ) : (
                    <>
                      Kirim Pesanan Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-[#6B5B4E] pt-1">
                  Sudah punya akun aktif?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#A8763E] underline"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
