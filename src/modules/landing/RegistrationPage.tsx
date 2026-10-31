import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, CreditCard, Upload, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { useWinvit } from "@/context/WinvitContext"

const paymentMethods = ["Transfer Bank", "QRIS", "E-wallet"] as const
type PaymentMethod = (typeof paymentMethods)[number]

export default function RegistrationPage() {
  const { themes, addOrder, setInvitation } = useWinvit()
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as { themeId?: string } | null

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedThemeId, setSelectedThemeId] = useState(
    routeState?.themeId ?? "botanica"
  )
  const [orderName, setOrderName] = useState("")
  const [brideName, setBrideName] = useState("")
  const [groomName, setGroomName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Transfer Bank")
  const [paymentProof, setPaymentProof] = useState("")
  const [paymentProofName, setPaymentProofName] = useState("")
  const [uploadError, setUploadError] = useState("")

  const chosenTheme = themes.find((theme) => theme.id === selectedThemeId) ?? themes[0]
  const amount = Number(chosenTheme.pricePromo.replace(/[^0-9]/g, "")) || 99000

  const handleProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setUploadError("")
    setPaymentProof("")
    setPaymentProofName("")

    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Pilih file gambar JPG, PNG, atau WEBP.")
      event.target.value = ""
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5 MB.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onerror = () => setUploadError("Bukti pembayaran gagal dibaca. Coba pilih ulang.")
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setUploadError("Bukti pembayaran gagal dibaca. Coba pilih ulang.")
        return
      }
      setPaymentProof(reader.result)
      setPaymentProofName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handlePaymentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!paymentProof) {
      setUploadError("Unggah bukti pembayaran terlebih dahulu.")
      return
    }

    const slug = `${groomName}-${brideName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    addOrder({
      orderName,
      coupleName: `${groomName} & ${brideName}`,
      phone,
      email,
      themeId: chosenTheme.id,
      themeTitle: chosenTheme.title,
      amount,
      paymentMethod,
      status: "WAITING_APPROVAL",
      paymentProof,
      slug,
    })

    setInvitation((previous) => ({
      ...previous,
      slug,
      status: "PENDING_PAYMENT",
      themeId: chosenTheme.id,
      customer: { orderName, phone, email },
      couple: {
        ...previous.couple,
        bride: {
          ...previous.couple.bride,
          nickname: brideName,
          fullName: brideName,
        },
        groom: {
          ...previous.couple.groom,
          nickname: groomName,
          fullName: groomName,
        },
      },
    }))

    navigate("/customer")
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke beranda
        </Link>

        <header className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b3822a]">
            WInvit
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Buat Pesanan Undangan
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Isi data pemesan, lalu pilih metode pembayaran dan unggah buktinya.
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {(["Data Pesanan", "Pembayaran"] as const).map((label, index) => {
            const stepNumber = (index + 1) as 1 | 2
            const isCurrent = step === stepNumber
            const isComplete = step > stepNumber
            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  isCurrent || isComplete
                    ? "border-slate-900 bg-white"
                    : "border-slate-200 bg-slate-100"
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                    isCurrent || isComplete
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                </span>
                <span className="text-sm font-bold text-slate-800">{label}</span>
              </div>
            )
          })}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {step === 1 ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setStep(2)
              }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">Data pemesan</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pastikan nomor WhatsApp dan email aktif.
                </p>
              </div>

              <div>
                <Label htmlFor="theme">Tema undangan</Label>
                <select
                  id="theme"
                  value={selectedThemeId}
                  onChange={(event) => setSelectedThemeId(event.target.value)}
                  className="mt-1 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900"
                >
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.title} — {theme.pricePromo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="orderName">Nama pemesan</Label>
                <Input
                  id="orderName"
                  required
                  autoComplete="name"
                  placeholder="Contoh: Budi Santoso"
                  value={orderName}
                  onChange={(event) => setOrderName(event.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="groomName">Nama panggilan pria</Label>
                  <Input
                    id="groomName"
                    required
                    placeholder="Contoh: Arkana"
                    value={groomName}
                    onChange={(event) => setGroomName(event.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="brideName">Nama panggilan wanita</Label>
                  <Input
                    id="brideName"
                    required
                    placeholder="Contoh: Aurora"
                    value={brideName}
                    onChange={(event) => setBrideName(event.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">No. WhatsApp aktif</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="0812xxxxxxxx"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-sm text-slate-600">Total pembayaran</span>
                <span className="text-lg font-extrabold text-slate-900">
                  Rp {amount.toLocaleString("id-ID")}
                </span>
              </div>
              <Button type="submit" className="h-11 w-full">
                Lanjut ke pembayaran
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pembayaran</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pilih metode pembayaran, lalu unggah bukti transfer.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {chosenTheme.title}
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {groomName} &amp; {brideName}
                    </p>
                  </div>
                  <p className="shrink-0 font-extrabold text-slate-900">
                    Rp {amount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-800">
                  Pilih metode pembayaran
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        paymentMethod === method
                          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-slate-900"
                      />
                      {method === "E-wallet" ? (
                        <Wallet className="h-5 w-5 text-[#b3822a]" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-[#b3822a]" />
                      )}
                      <span className="text-sm font-semibold text-slate-800">{method}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                Detail rekening, QRIS, atau akun e-wallet akan dikonfirmasi oleh admin.
              </div>

              <div>
                <Label htmlFor="paymentProof">Bukti pembayaran</Label>
                <label
                  htmlFor="paymentProof"
                  className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-slate-500"
                >
                  {paymentProof ? (
                    <>
                      <img
                        src={paymentProof}
                        alt="Pratinjau bukti pembayaran"
                        className="mb-3 max-h-40 rounded-lg object-contain"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {paymentProofName}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">Klik untuk mengganti file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 h-6 w-6 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-800">
                        Pilih gambar bukti pembayaran
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG, atau WEBP — maksimal 5 MB
                      </span>
                    </>
                  )}
                  <input
                    id="paymentProof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProofChange}
                    className="sr-only"
                  />
                </label>
                {uploadError && (
                  <p role="alert" className="mt-2 text-sm font-medium text-red-600">
                    {uploadError}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Button>
                <Button type="submit" className="h-11">
                  Kirim pesanan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
