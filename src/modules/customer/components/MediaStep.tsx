import type { CustomerEditorStepProps } from "../types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImagePlus, Loader2 } from "lucide-react"

export default function MediaStep({
  detailTab,
  draft,
  setDraft,
  isLocked,
  handleGalleryPhotosUpload,
  uploadingField,
}: CustomerEditorStepProps) {
  if (detailTab !== "media") return null

  const removeGalleryAt = (idx: number) => {
    setDraft((prev) => {
      const nextGallery = prev.media.gallery.filter((_, i) => i !== idx)
      const nextItems = prev.galleryItems
        ? prev.galleryItems.filter((_, i) => i !== idx)
        : undefined
      return {
        ...prev,
        galleryItems: nextItems,
        media: {
          ...prev.media,
          gallery: nextGallery,
        },
      }
    })
  }

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-5">
        <div className="space-y-2.5">
          <div>
            <label className="block text-sm font-semibold">
              Galeri Foto Undangan
            </label>
            <p className="text-xs text-[#6B5B4E]">
              Upload foto-foto prewedding terbaik untuk ditampilkan di galeri undangan
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 w-full h-12 px-4 rounded-2xl border border-dashed border-[#C89B57] bg-[#FAF6F1] text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
            {uploadingField === "gallery" ? (
              <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4 text-[#C89B57]" />
            )}
            <span>
              {uploadingField === "gallery"
                ? "Mengupload Foto..."
                : "Pilih Foto Galeri"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isLocked || uploadingField === "gallery"}
              onChange={handleGalleryPhotosUpload}
              className="hidden"
            />
          </label>

          {draft.media.gallery.length === 0 ? (
            <p className="text-xs text-[#6B5B4E] py-6 text-center rounded-2xl bg-[#FAF6F1] border border-dashed border-[#E5DDD5]">
              Belum ada foto galeri yang diupload.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {draft.media.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E5DDD5] p-2 bg-[#FAF6F1] space-y-2"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white">
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs rounded-lg"
                    disabled={isLocked}
                    onClick={() => removeGalleryAt(idx)}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
