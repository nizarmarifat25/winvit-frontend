import { useState } from "react"
import { Link } from "react-router-dom"
import type { CustomerEditorStepProps } from "../types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Info,
  Loader2,
  Send,
} from "lucide-react"

export default function ConfirmationStep({
  detailTab,
  draft,
  isLocked,
  setDetailTab,
  draftTheme,
  hasGenerated,
  generatedNotice,
  isGenerating,
  isPublishing,
  syncError,
  onGenerateInvitation,
  onPublishInvitation,
  onUnpublishInvitation,
  onGoToShare,
}: CustomerEditorStepProps) {
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)

  if (detailTab !== "confirm") return null

  const eventsToDisplay = draft.eventList || []
  const isPublished = draft.status === "PUBLISHED" || Boolean(draft.isPublished)
  const slugPath = draft.slug || "undangan"

  const statusLabel = generatedNotice
    ? "Data Tersimpan"
    : isPublished
      ? "Sudah Publish"
      : "Belum Publish (Draft)"

  const tooltipText = isPublished
      ? "Undangan sudah live dan bisa diakses tamu. Anda tetap bisa edit lalu Simpan & Generate, atau klik Unpublish untuk menyembunyikan undangan sementara."
      : hasGenerated
        ? "Cek tampilan Mobile, Tablet, dan Desktop lewat Lihat Preview. Jika sudah sesuai, klik Publish Undangan agar dapat diakses oleh tamu."
        : "Klik Simpan & Generate Undangan untuk menyimpan data, cek lewat Lihat Preview, lalu klik Publish Undangan agar bisa diakses oleh tamu."

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {syncError && (
          <p className="text-xs font-medium text-red-600">{syncError}</p>
        )}

        {/* 1. Ringkasan Tema Aktif & URL */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={`/asset/img/thumbnails/${draftTheme.id}/mobile-2.jpg`}
              onError={(e) => {
                e.currentTarget.src = draftTheme.thumb
              }}
              alt={draftTheme.title}
              className="w-12 h-16 rounded-lg object-cover object-top border border-[#E5DDD5] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-[#6B5B4E]">Tema Aktif & URL Undangan</p>
              <p className="font-semibold text-sm truncate">
                {draftTheme.title}
              </p>
              <p className="text-xs text-[#A8763E] truncate">/u/{slugPath}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDetailTab("couple")}
            className="text-xs font-medium text-[#A8763E] underline shrink-0"
          >
            Ubah Slug
          </button>
        </div>

        {/* 2. Ringkasan Mempelai */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5B4E]">
              Data Mempelai & Media Utama
            </span>
            <button
              type="button"
              onClick={() => setDetailTab("couple")}
              className="text-xs font-medium text-[#A8763E] underline"
            >
              Ubah
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5DDD5] flex items-center gap-2.5">
              {draft.couple.groom.photo && (
                <img
                  src={draft.couple.groom.photo}
                  alt="Groom"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-[#2C2018] truncate">
                  {draft.couple.groom.fullName ||
                    draft.couple.groom.nickname ||
                    "Mempelai Pria belum diisi"}
                </p>
                <p className="text-[#6B5B4E] truncate">
                  {draft.couple.groom.info || "-"}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#E5DDD5] flex items-center gap-2.5">
              {draft.couple.bride.photo && (
                <img
                  src={draft.couple.bride.photo}
                  alt="Bride"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-[#2C2018] truncate">
                  {draft.couple.bride.fullName ||
                    draft.couple.bride.nickname ||
                    "Mempelai Wanita belum diisi"}
                </p>
                <p className="text-[#6B5B4E] truncate">
                  {draft.couple.bride.info || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Ringkasan Acara */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5B4E]">
              Jadwal & Lokasi Acara ({eventsToDisplay.length} Acara)
            </span>
            <button
              type="button"
              onClick={() => setDetailTab("events")}
              className="text-xs font-medium text-[#A8763E] underline"
            >
              Ubah
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {eventsToDisplay.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-2.5 rounded-xl bg-white border border-[#E5DDD5]"
              >
                <p className="font-semibold">
                  {ev.name || `Acara #${idx + 1}`}
                </p>
                <p className="text-[#6B5B4E]">
                  {ev.date || "-"} • {ev.startTime || "-"} - {ev.endTime || "-"}
                </p>
                <p className="text-[#6B5B4E] truncate">
                  {ev.locationName ? `${ev.locationName} — ` : ""}
                  {ev.locationAddress || "Alamat belum diisi"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Ringkasan Love Story, Galeri & Rekening */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <div className="flex justify-between mb-1">
              <span className="text-[#6B5B4E]">Love Story</span>
              <button
                type="button"
                onClick={() => setDetailTab("story")}
                className="text-[#A8763E] underline"
              >
                Ubah
              </button>
            </div>
            <p className="font-semibold">{draft.stories.length} Bab Cerita</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <div className="flex justify-between mb-1">
              <span className="text-[#6B5B4E]">Galeri Foto</span>
              <button
                type="button"
                onClick={() => setDetailTab("media")}
                className="text-[#A8763E] underline"
              >
                Ubah
              </button>
            </div>
            <p className="font-semibold">{draft.media.gallery.length} Foto</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <div className="flex justify-between mb-1">
              <span className="text-[#6B5B4E]">Rekening</span>
              <button
                type="button"
                onClick={() => setDetailTab("gift")}
                className="text-[#A8763E] underline"
              >
                Ubah
              </button>
            </div>
            <p className="font-semibold">
              {draft.gifts.bankAccounts.length} Rekening Bank
            </p>
          </div>
        </div>

        {/* 5. Ringkas: Status + Tooltip Info + Aksi Preview & Publish */}
        <div className="px-3.5 py-3 rounded-2xl bg-[#FAF6F1] border border-[#C89B57]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${isPublished || generatedNotice
                  ? "text-emerald-600"
                  : "text-[#A8763E]"
                }`}
            />
            <span className="text-sm font-semibold text-[#2C2018]">
              {statusLabel}
            </span>

            <button
              type="button"
              aria-label="Informasi status dan langkah undangan"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip((prev) => !prev)}
              onBlur={() => setShowInfoTooltip(false)}
              className="p-1 rounded-full text-[#6B5B4E] hover:text-[#2C2018] hover:bg-[#E5DDD5]/60 transition cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>

            {showInfoTooltip && (
              <div
                role="tooltip"
                className="absolute left-0 bottom-full mb-2 z-30 w-64 sm:w-72 p-3 rounded-xl bg-[#2C2018] text-white text-xs leading-relaxed shadow-lg pointer-events-none"
              >
                {tooltipText}
              </div>
            )}
          </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl bg-white gap-1.5"
                asChild
              >
                <Link to={`/u/${slugPath}`} target="_blank">
                  <Eye className="w-3.5 h-3.5 text-[#A8763E]" />
                  Lihat Preview
                </Link>
              </Button>

              {isPublished ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 gap-1.5"
                  onClick={onGoToShare}
                >
                  <Send className="w-3.5 h-3.5" />
                  Sebar Undangan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 gap-1.5"
                  disabled={isLocked || isPublishing || isGenerating}
                  onClick={onUnpublishInvitation}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Unpublish
                    </>
                  )}
                </Button>
              </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  disabled={isLocked || isPublishing || isGenerating}
                  onClick={onPublishInvitation}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mempublish...
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      Publish Undangan
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Footer Action Row */}
          <div className="pt-3 border-t border-[#E5DDD5] flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-11 rounded-xl"
              onClick={() => setDetailTab("gift")}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="gold"
              className="w-full flex-1 h-11 rounded-xl"
              disabled={isLocked || isGenerating}
              onClick={() => onGenerateInvitation()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan & Generate...
                </>
              ) : (
                "Simpan & Generate Undangan"
              )}
            </Button>
          </div>
      </CardContent>
    </Card>
  )
}
