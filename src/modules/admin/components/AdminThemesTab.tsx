import { useState, useMemo } from "react"
import {
  CheckCircle2,
  Edit2,
  Image as ImageIcon,
  ImagePlus,
  Laptop,
  Loader2,
  Palette,
  Plus,
  Search,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createThemeApi, updateThemeApi, uploadMediaFile } from "@/lib/api"

interface AdminThemesTabProps {
  adminThemes: any[]
  loadingThemes: boolean
  onRefresh: () => Promise<void>
}

type ThumbSlot = "desktop" | "mobile" | "tablet"

const TAG_PRESETS = [
  "luxury",
  "adat-nusantara",
  "tropical-boho",
  "editorial",
  "special",
]

function isRenderableImageUrl(url?: string | null) {
  return Boolean(
    url &&
      typeof url === "string" &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/") ||
        url.startsWith("data:"))
  )
}

function formatDate(iso?: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function AdminThemesTab({
  adminThemes,
  loadingThemes,
  onRefresh,
}: AdminThemesTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  )
  const [brokenImgMap, setBrokenImgMap] = useState<Record<string, boolean>>({})
  const [lightboxImg, setLightboxImg] = useState<{
    url: string
    title: string
  } | null>(null)

  // Modal Create / Edit State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [themeName, setThemeName] = useState("")
  const [themeTag, setThemeTag] = useState("tropical-boho")
  const [themePrice, setThemePrice] = useState("198000")
  const [themeThumbUrl, setThemeThumbUrl] = useState("")
  const [themeThumbMobileUrl, setThemeThumbMobileUrl] = useState("")
  const [themeThumbTabUrl, setThemeThumbTabUrl] = useState("")
  const [themeIsActive, setThemeIsActive] = useState(true)
  const [uploadingThumbSlot, setUploadingThumbSlot] = useState<ThumbSlot | null>(
    null
  )
  const [savingTheme, setSavingTheme] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [themeError, setThemeError] = useState("")
  const [themeNotice, setThemeNotice] = useState("")

  const stats = useMemo(() => {
    const active = adminThemes.filter((t) => Boolean(t.is_active)).length
    return {
      total: adminThemes.length,
      active,
      inactive: adminThemes.length - active,
    }
  }, [adminThemes])

  const filteredThemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return adminThemes.filter((t) => {
      const isAct = Boolean(t.is_active)
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isAct) ||
        (statusFilter === "inactive" && !isAct)
      const matchQuery =
        !q ||
        String(t.name || "")
          .toLowerCase()
          .includes(q) ||
        String(t.tag || "")
          .toLowerCase()
          .includes(q)
      return matchStatus && matchQuery
    })
  }, [adminThemes, searchQuery, statusFilter])

  const openCreateModal = () => {
    setEditingThemeId(null)
    setThemeName("")
    setThemeTag("tropical-boho")
    setThemePrice("198000")
    setThemeThumbUrl("")
    setThemeThumbMobileUrl("")
    setThemeThumbTabUrl("")
    setThemeIsActive(true)
    setThemeError("")
    setModalOpen(true)
  }

  const openEditModal = (t: any) => {
    setEditingThemeId(t.id)
    setThemeName(t.name || "")
    setThemeTag(t.tag || "tropical-boho")
    setThemePrice(String(t.price || 198000))
    setThemeThumbUrl(t.thumbnail_url || "")
    setThemeThumbMobileUrl(t.thumbnail_mobile_url || "")
    setThemeThumbTabUrl(t.thumbnail_tab_url || "")
    setThemeIsActive(Boolean(t.is_active ?? true))
    setThemeError("")
    setModalOpen(true)
  }

  const handleThumbUpload = async (
    slot: ThumbSlot,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setUploadingThumbSlot(slot)
    setThemeError("")
    try {
      const url = await uploadMediaFile(file)
      if (slot === "desktop") setThemeThumbUrl(url)
      else if (slot === "mobile") setThemeThumbMobileUrl(url)
      else setThemeThumbTabUrl(url)
      setBrokenImgMap((prev) => ({ ...prev, [url]: false }))
    } catch (err: any) {
      setThemeError(err?.message || "")
    } finally {
      setUploadingThumbSlot(null)
    }
  }

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingTheme(true)
    setThemeError("")
    setThemeNotice("")

    try {
      const payload = {
        name: themeName.trim(),
        thumbnail_url: themeThumbUrl.trim() || "placeholder.png",
        thumbnail_mobile_url:
          themeThumbMobileUrl.trim() ||
          (editingThemeId ? "placeholder-mobile.png" : "placeholder.png"),
        thumbnail_tab_url:
          themeThumbTabUrl.trim() ||
          (editingThemeId ? "placeholder-tab.png" : "placeholder.png"),
        price: Number(themePrice) || 198000,
        tag: themeTag.trim() || "tropical-boho",
        ...(editingThemeId ? { is_active: themeIsActive } : {}),
      }

      if (editingThemeId) {
        await updateThemeApi(editingThemeId, payload)
        setThemeNotice(`Tema "${themeName.trim()}" berhasil diperbarui.`)
      } else {
        await createThemeApi(payload)
        setThemeNotice(`Tema "${themeName.trim()}" berhasil ditambahkan.`)
      }

      setModalOpen(false)
      await onRefresh()
      window.setTimeout(() => setThemeNotice(""), 3000)
    } catch (err: any) {
      setThemeError(err?.message || "")
    } finally {
      setSavingTheme(false)
    }
  }

  const handleToggleThemeActive = async (themeItem: any) => {
    setTogglingId(themeItem.id)
    setThemeError("")
    try {
      await updateThemeApi(themeItem.id, {
        name: themeItem.name,
        thumbnail_url: themeItem.thumbnail_url || "placeholder.png",
        ...(themeItem.thumbnail_mobile_url
          ? { thumbnail_mobile_url: themeItem.thumbnail_mobile_url }
          : {}),
        ...(themeItem.thumbnail_tab_url
          ? { thumbnail_tab_url: themeItem.thumbnail_tab_url }
          : {}),
        price: Number(themeItem.price) || 198000,
        tag: themeItem.tag || "tropical-boho",
        is_active: !themeItem.is_active,
      })
      await onRefresh()
    } catch (err: any) {
      setThemeError(err?.message || "")
    } finally {
      setTogglingId(null)
    }
  }

  const columns: DataTableColumn<any>[] = [
    {
      key: "thumbnails",
      header: "Preview (PC · HP · Tab)",
      render: (t) => {
        const slots = [
          { label: "PC", url: t.thumbnail_url },
          { label: "HP", url: t.thumbnail_mobile_url },
          { label: "Tab", url: t.thumbnail_tab_url },
        ]
        return (
          <div className="flex items-center gap-1.5">
            {slots.map(({ label, url }) => {
              const showImg =
                isRenderableImageUrl(url) && !brokenImgMap[url]
              return (
                <button
                  key={label}
                  type="button"
                  disabled={!showImg}
                  title={
                    showImg
                      ? `Klik untuk perbesar ${label}`
                      : `${label}: ${url || "Belum diupload"}`
                  }
                  onClick={() =>
                    showImg &&
                    setLightboxImg({ url, title: `${t.name} (${label})` })
                  }
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border border-[#E5DDD5] bg-[#FAF6F1] flex items-center justify-center shrink-0 ${
                    showImg
                      ? "cursor-pointer hover:ring-2 hover:ring-[#C89B57] transition"
                      : "cursor-default"
                  }`}
                >
                  {showImg ? (
                    <img
                      src={url}
                      alt={`${t.name} ${label}`}
                      onError={() =>
                        setBrokenImgMap((prev) => ({
                          ...prev,
                          [url]: true,
                        }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-[#C8BBAE]" />
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[8px] font-semibold text-center leading-tight py-0.5">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        )
      },
    },
    {
      key: "name",
      header: "Nama Tema",
      render: (t) => (
        <div className="min-w-[150px]">
          <p className="font-semibold text-[#2C2018]">{t.name || "-"}</p>
          <p className="text-[11px] text-[#8C7868]">
            Dibuat {formatDate(t.created_at)}
          </p>
        </div>
      ),
    },
    {
      key: "tag",
      header: "Tag Kategori",
      render: (t) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-[#6B5B4E] text-[11px] font-mono font-medium">
          #{t.tag || "umum"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Harga",
      render: (t) => (
        <span className="font-bold text-[#2C2018] whitespace-nowrap">
          Rp {Number(t.price || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => {
        const isAct = Boolean(t.is_active)
        return (
          <div className="flex items-center gap-2">
            <Switch
              disabled={togglingId === t.id}
              checked={isAct}
              onCheckedChange={() => handleToggleThemeActive(t)}
            />
            <span
              className={`text-xs font-medium ${
                isAct ? "text-emerald-700" : "text-[#8C7868]"
              }`}
            >
              {isAct ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        )
      },
    },
    {
      key: "action",
      header: "Aksi",
      align: "right",
      render: (t) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-xl px-3 text-xs gap-1.5 border-[#E5DDD5] hover:border-[#2C2018]"
          onClick={() => openEditModal(t)}
        >
          <Edit2 className="w-3.5 h-3.5 text-[#A8763E]" />
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div className="w-full space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#2C2018]">
            Kelola Tema Undangan
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4E]">
            Atur katalog tema, harga, status publikasi, dan thumbnail Desktop,
            Mobile, serta Tablet.
          </p>
        </div>
        <Button
          type="button"
          variant="gold"
          size="sm"
          className="h-10 rounded-xl px-4 gap-1.5 self-start sm:self-auto"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          Tambah Tema
        </Button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">Total Tema</p>
          <p className="text-2xl font-bold text-[#2C2018] mt-0.5">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">
            Aktif di Katalog
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">
            {stats.active}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">Nonaktif</p>
          <p className="text-2xl font-bold text-[#8C7868] mt-0.5">
            {stats.inactive}
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {themeNotice && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{themeNotice}</span>
        </div>
      )}
      {themeError && !modalOpen && (
        <p className="text-xs font-medium text-red-600">{themeError}</p>
      )}

      {/* Search + Status Filter Toolbar */}
      <div className="bg-white border border-[#E5DDD5] rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C7868] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tema atau tag..."
            className="pl-9 h-9 text-xs rounded-xl bg-[#FAF6F1] border-[#E5DDD5]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#F2ECE4] p-1 rounded-xl self-start sm:self-auto">
          {(
            [
              { id: "all", label: `Semua (${stats.total})` },
              { id: "active", label: `Aktif (${stats.active})` },
              { id: "inactive", label: `Nonaktif (${stats.inactive})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-[#2C2018] shadow-2xs"
                  : "text-[#6B5B4E] hover:text-[#2C2018]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Reusable DataTable */}
      <DataTable
        columns={columns}
        data={filteredThemes}
        getRowKey={(t) => t.id}
        loading={loadingThemes}
        loadingText="Memuat daftar tema..."
        emptyIcon={<Palette className="w-5 h-5" />}
        emptyTitle="Tidak ada tema ditemukan"
        emptyDescription="Ubah kata kunci pencarian atau tambahkan tema baru."
      />

      {/* Quick Lightbox Preview Dialog for Table Thumbnails */}
      <Dialog
        open={Boolean(lightboxImg)}
        onOpenChange={(open) => !open && setLightboxImg(null)}
      >
        <DialogContent className="max-w-lg p-5 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#2C2018]">
              {lightboxImg?.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Pratinjau gambar thumbnail tema
            </DialogDescription>
          </DialogHeader>
          {lightboxImg && (
            <div className="rounded-2xl overflow-hidden border border-[#E5DDD5] bg-[#FAF6F1] max-h-[70vh] flex items-center justify-center">
              <img
                src={lightboxImg.url}
                alt={lightboxImg.title}
                className="w-full h-full max-h-[68vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Theme Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2C2018]">
              {editingThemeId ? "Edit Tema Undangan" : "Tambah Tema Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B5B4E]">
              Lengkapi nama, kategori, harga, dan upload gambar preview untuk
              Desktop, Mobile, serta Tablet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTheme} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#6B5B4E] mb-1">
                Nama Tema
              </label>
              <Input
                required
                placeholder="Contoh: Sage Green Botanical 2026"
                value={themeName}
                onChange={(e) => {
                  setThemeName(e.target.value)
                  if (themeError) setThemeError("")
                }}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#6B5B4E] mb-1">
                  Tag Kategori
                </label>
                <Input
                  required
                  placeholder="cth: tropical-boho"
                  value={themeTag}
                  onChange={(e) => setThemeTag(e.target.value)}
                  className="h-10 rounded-xl"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {TAG_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setThemeTag(preset)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition cursor-pointer ${
                        themeTag === preset
                          ? "bg-[#2C2018] text-white border-[#2C2018]"
                          : "bg-[#FAF6F1] text-[#6B5B4E] border-[#E5DDD5] hover:border-[#C89B57]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B5B4E] mb-1">
                  Harga Tema (Rp)
                </label>
                <Input
                  required
                  type="number"
                  min={0}
                  placeholder="198000"
                  value={themePrice}
                  onChange={(e) => setThemePrice(e.target.value)}
                  className="h-10 rounded-xl"
                />
                <p className="text-[11px] text-[#A8763E] font-semibold mt-1.5">
                  Preview: Rp {Number(themePrice || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* 3 Visual Image Upload Dropzones (No text URL inputs) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6B5B4E]">
                Thumbnail Gambar (Desktop · Mobile · Tablet)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    {
                      slot: "desktop" as const,
                      label: "Desktop",
                      Icon: Laptop,
                      value: themeThumbUrl,
                      clear: () => setThemeThumbUrl(""),
                    },
                    {
                      slot: "mobile" as const,
                      label: "Mobile",
                      Icon: Smartphone,
                      value: themeThumbMobileUrl,
                      clear: () => setThemeThumbMobileUrl(""),
                    },
                    {
                      slot: "tablet" as const,
                      label: "Tablet",
                      Icon: Tablet,
                      value: themeThumbTabUrl,
                      clear: () => setThemeThumbTabUrl(""),
                    },
                  ] as const
                ).map(({ slot, label, Icon, value, clear }) => {
                  const isUploading = uploadingThumbSlot === slot
                  const canShowImage =
                    isRenderableImageUrl(value) && !brokenImgMap[value]
                  return (
                    <div
                      key={slot}
                      className="rounded-2xl border border-[#E5DDD5] bg-[#FAF6F1] p-2.5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2C2018]">
                        <span className="inline-flex items-center gap-1">
                          <Icon className="w-3.5 h-3.5 text-[#A8763E]" />
                          {label}
                        </span>
                        {value && (
                          <button
                            type="button"
                            title={`Hapus gambar ${label}`}
                            onClick={clear}
                            className="p-0.5 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <label className="relative block aspect-[4/3] rounded-xl overflow-hidden border border-dashed border-[#C89B57]/80 bg-white cursor-pointer group">
                        {isUploading ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[11px] text-[#A8763E]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mengupload...</span>
                          </div>
                        ) : canShowImage ? (
                          <>
                            <img
                              src={value}
                              alt={`Thumbnail ${label}`}
                              onError={() =>
                                setBrokenImgMap((prev) => ({
                                  ...prev,
                                  [value]: true,
                                }))
                              }
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-semibold">
                              Ganti Foto
                            </div>
                          </>
                        ) : value ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center gap-1 text-[#8C7868]">
                            <ImageIcon className="w-4 h-4 text-[#C89B57]" />
                            <span className="text-[10px] leading-tight line-clamp-2 break-all">
                              {value}
                            </span>
                            <span className="text-[9px] text-[#A8763E] font-semibold">
                              Klik untuk upload
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#8C7868] group-hover:text-[#A8763E] transition">
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-[11px] font-medium">
                              Upload
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={Boolean(uploadingThumbSlot)}
                          onChange={(e) => handleThumbUpload(slot, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {editingThemeId && (
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-[#E5DDD5] bg-[#FAF6F1]">
                <div>
                  <p className="text-xs font-semibold text-[#2C2018]">
                    Status Aktif di Katalog
                  </p>
                  <p className="text-[11px] text-[#6B5B4E]">
                    Tema aktif akan tampil di Landing Page dan halaman Order
                  </p>
                </div>
                <Switch
                  checked={themeIsActive}
                  onCheckedChange={setThemeIsActive}
                />
              </div>
            )}

            {themeError && (
              <p className="text-xs font-medium text-red-600">{themeError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DDD5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={savingTheme || Boolean(uploadingThumbSlot)}
                className="h-10 rounded-xl px-5 gap-1.5"
              >
                {savingTheme ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingThemeId ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Tema"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
