import React, { useState } from "react"
import { Link } from "react-router-dom"
import { CheckSquare, Upload, Wallet } from "lucide-react"
import { useWinvit } from "@/context/WinvitContext"
import type { SectionKey, ThemeCategory, ThemeItem } from "@/types/winvit"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const ALL_SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: "cover", label: "Cover" },
  { key: "hero", label: "Hero" },
  { key: "quote", label: "Quote / Ayat" },
  { key: "couple", label: "Mempelai" },
  { key: "events", label: "Acara & Maps" },
  { key: "story", label: "Love Story" },
  { key: "gallery", label: "Galeri" },
  { key: "countdown", label: "Countdown" },
  { key: "gift", label: "Amplop Digital" },
  { key: "faq", label: "FAQ" },
  { key: "wishes", label: "Ucapan & RSVP" },
]

type AdminTab = "approval" | "template" | "revenue"

export function AdminDashboard() {
  const { themes, addTheme, orders, updateOrderStatus } = useWinvit()
  const [activeTab, setActiveTab] = useState<AdminTab>("approval")

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [tagline, setTagline] = useState("")
  const [category, setCategory] = useState<ThemeCategory>("luxury")
  const [desc, setDesc] = useState("")
  const [pricePromo, setPricePromo] = useState("")
  const [priceRegular, setPriceRegular] = useState("")
  const [thumbUrl, setThumbUrl] = useState("")
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [detectedSections, setDetectedSections] = useState<SectionKey[]>(
    ALL_SECTIONS.map((s) => s.key)
  )
  const [savedNotice, setSavedNotice] = useState(false)

  const approvedOrders = orders.filter(
    (o) => o.status === "APPROVED" || o.status === "PUBLISHED"
  )
  const waitingOrders = orders.filter((o) => o.status === "WAITING_APPROVAL")
  const totalRevenue = approvedOrders.reduce((acc, o) => acc + o.amount, 0)

  const handleHtmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)
    const htmlText = await file.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, "text/html")
    const found: SectionKey[] = []

    ALL_SECTIONS.forEach((sec) => {
      const el =
        doc.getElementById(sec.key) ||
        doc.querySelector(`[data-section="${sec.key}"]`) ||
        doc.querySelector(`.${sec.key}`)
      if (el) found.push(sec.key)
    })

    if (found.length > 0) {
      setDetectedSections(found)
    }
  }

  const toggleDetectedSection = (key: SectionKey) => {
    setDetectedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handlePublishTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const cleanSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

    const categoryMap: Record<ThemeCategory, string> = {
      adat: "Adat & Tradisional",
      luxury: "Dark & Luxury",
      editorial: "Editorial & Modern",
      nature: "Tropical & Boho",
    }

    const newTheme: ThemeItem = {
      id: cleanSlug,
      title: title.trim(),
      tagline: tagline.trim(),
      category,
      categoryName: categoryMap[category],
      desc: desc.trim(),
      thumb: thumbUrl.trim() || "/asset/img/pre1.jpeg",
      thumb2: thumbUrl.trim() || "/asset/img/pre1.jpeg",
      thumb3: thumbUrl.trim() || "/asset/img/pre1.jpeg",
      path: `/themes/${cleanSlug}/index.html`,
      palette: ["#C89B57", "#2C2018", "#FAF6F1"],
      vibeIcon: "fa-star",
      tags: [],
      priceRegular: priceRegular.trim() || "Rp 198.000",
      pricePromo: pricePromo.trim() || "Rp 99.000",
      discount: "",
      supportedSections: detectedSections,
    }

    addTheme(newTheme)
    setTitle("")
    setSlug("")
    setTagline("")
    setDesc("")
    setPricePromo("")
    setPriceRegular("")
    setThumbUrl("")
    setUploadedFileName("")
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F1] text-[#2C2018]">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E5DDD5] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-serif text-lg font-bold text-[#2C2018]">
            W<span className="text-[#C89B57]">Invit</span>
          </Link>
          <span className="text-xs text-[#6B5B4E]">Admin</span>
        </div>
        <Link to="/customer" className="text-xs font-medium text-[#A8763E]">
          Dashboard Customer
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-[#E5DDD5] bg-white flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          <div>
            <Link to="/" className="font-serif text-xl font-bold text-[#2C2018]">
              W<span className="text-[#C89B57]">Invit</span>
            </Link>
            <p className="text-xs text-[#6B5B4E] mt-0.5">Admin Panel</p>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("approval")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "approval"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              <span>Approval Customer</span>
              {waitingOrders.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#C89B57] text-white">
                  {waitingOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "template"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              Upload Template
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("revenue")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "revenue"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              Pendapatan
            </button>
          </nav>
        </div>

        <div className="space-y-1.5 pt-4 border-t border-[#E5DDD5] text-xs">
          <Link
            to="/customer"
            className="block px-3 py-2 rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE4]"
          >
            Dashboard Customer
          </Link>
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE4]"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        {activeTab === "approval" && (
          <div className="max-w-5xl space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">Approval Customer</h1>

            <Card>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#6B5B4E]">
                    Belum ada pendaftaran customer.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5DDD5] text-xs text-[#6B5B4E]">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Pemesan</th>
                          <th className="py-3 px-4">Mempelai</th>
                          <th className="py-3 px-4">Kontak</th>
                          <th className="py-3 px-4">Tema</th>
                          <th className="py-3 px-4">Nominal</th>
                          <th className="py-3 px-4">Pembayaran</th>
                          <th className="py-3 px-4">Bukti</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DDD5]">
                        {orders.map((ord) => (
                          <tr key={ord.id}>
                            <td className="py-3 px-4 font-mono text-xs">{ord.id}</td>
                            <td className="py-3 px-4 font-medium">{ord.orderName}</td>
                            <td className="py-3 px-4">{ord.coupleName}</td>
                            <td className="py-3 px-4 text-xs text-[#6B5B4E]">
                              <div>{ord.phone}</div>
                              <div>{ord.email}</div>
                            </td>
                            <td className="py-3 px-4">{ord.themeTitle}</td>
                            <td className="py-3 px-4">
                              Rp {ord.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4">{ord.paymentMethod}</td>
                            <td className="py-3 px-4">
                              <a
                                href={ord.paymentProof}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-blue-700 underline"
                              >
                                Lihat bukti
                              </a>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  ord.status === "APPROVED" || ord.status === "PUBLISHED"
                                    ? "success"
                                    : ord.status === "WAITING_APPROVAL"
                                      ? "warning"
                                      : "outline"
                                }
                              >
                                {ord.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {ord.status === "WAITING_APPROVAL" && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="gold"
                                    onClick={() => updateOrderStatus(ord.id, "APPROVED")}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateOrderStatus(ord.id, "REJECTED")}
                                  >
                                    Tolak
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "template" && (
          <div className="max-w-4xl space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">Upload Template</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <Card className="md:col-span-7">
                <CardContent className="p-4 sm:p-5">
                  {savedNotice && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                      Template berhasil ditambahkan ke katalog.
                    </div>
                  )}

                  <form onSubmit={handlePublishTemplate} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        File HTML (index.html)
                      </label>
                      <input
                        type="file"
                        accept=".html,.htm"
                        onChange={handleHtmlFileUpload}
                        className="mt-1 block w-full text-xs text-[#6B5B4E] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-[#E5DDD5] file:text-xs file:font-medium file:bg-[#FAF6F1] file:text-[#2C2018]"
                      />
                      {uploadedFileName && (
                        <p className="text-xs text-emerald-700 mt-1">{uploadedFileName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">Nama Tema</label>
                        <Input
                          required
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value)
                            setSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, "")
                            )
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">Slug</label>
                        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">Kategori</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as ThemeCategory)}
                          className="mt-1 flex h-10 w-full rounded-lg border border-[#E5DDD5] bg-white px-3 py-2 text-sm"
                        >
                          <option value="luxury">Luxury</option>
                          <option value="adat">Adat</option>
                          <option value="editorial">Editorial</option>
                          <option value="nature">Nature</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">Harga Promo</label>
                        <Input
                          value={pricePromo}
                          onChange={(e) => setPricePromo(e.target.value)}
                          placeholder="Rp 99.000"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">Harga Normal</label>
                        <Input
                          value={priceRegular}
                          onChange={(e) => setPriceRegular(e.target.value)}
                          placeholder="Rp 198.000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">Tagline</label>
                      <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">Deskripsi</label>
                      <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">URL Thumbnail</label>
                      <Input value={thumbUrl} onChange={(e) => setThumbUrl(e.target.value)} />
                    </div>

                    <Button type="submit" variant="gold" className="w-full h-11 sm:h-10">
                      Simpan Template
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="md:col-span-5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Section Aktif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ALL_SECTIONS.map((sec) => (
                    <div
                      key={sec.key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#E5DDD5] bg-[#FAF6F1] text-xs"
                    >
                      <span>{sec.label}</span>
                      <Switch
                        checked={detectedSections.includes(sec.key)}
                        onCheckedChange={() => toggleDetectedSection(sec.key)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="max-w-5xl space-y-5">
            <h1 className="text-lg sm:text-xl font-bold">Pendapatan</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-[#6B5B4E]">Total Pendapatan</p>
                  <p className="text-xl font-bold mt-1">
                    Rp {totalRevenue.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-[#6B5B4E]">Order Disetujui</p>
                  <p className="text-xl font-bold mt-1">{approvedOrders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-[#6B5B4E]">Total Tema</p>
                  <p className="text-xl font-bold mt-1">{themes.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                {approvedOrders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#6B5B4E]">
                    Belum ada data transaksi.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5DDD5] text-xs text-[#6B5B4E]">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Pemesan</th>
                          <th className="py-3 px-4">Tema</th>
                          <th className="py-3 px-4 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DDD5]">
                        {approvedOrders.map((o) => (
                          <tr key={o.id}>
                            <td className="py-3 px-4 font-mono text-xs">{o.id}</td>
                            <td className="py-3 px-4">{o.orderName}</td>
                            <td className="py-3 px-4">{o.themeTitle}</td>
                            <td className="py-3 px-4 text-right font-medium">
                              Rp {o.amount.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom App Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur-lg border border-[#E5DDD5] shadow-[0_8px_30px_rgba(44,32,24,0.14)] rounded-2xl grid grid-cols-3 p-1.5">
          {[
            { id: "approval" as AdminTab, label: "Approval", Icon: CheckSquare },
            { id: "template" as AdminTab, label: "Template", Icon: Upload },
            { id: "revenue" as AdminTab, label: "Pendapatan", Icon: Wallet },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95 ${
                  active
                    ? "bg-[#2C2018] text-white shadow-sm"
                    : "text-[#6B5B4E] hover:text-[#2C2018]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[#C89B57]" : "text-[#6B5B4E]"
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
