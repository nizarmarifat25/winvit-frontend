import type { CustomerEditorStepProps } from "../types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, ImagePlus, Music, Loader2 } from "lucide-react"

export default function CoupleStep({
  detailTab,
  draft,
  setDraft,
  isLocked,
  setDetailTab,
  handleBridePhotoUpload,
  handleGroomPhotoUpload,
  handleCoverPhotoUpload,
  handleMusicUpload,
  uploadingField,
}: CustomerEditorStepProps) {
  if (detailTab !== "couple") return null

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
            Slug URL Undangan (/u/slug)
          </label>
          <Input
            disabled={isLocked}
            value={draft.slug}
            placeholder="contoh: ani-budi"
            className="h-11 sm:h-10 rounded-xl"
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mempelai Pria */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <h4 className="font-semibold text-sm">Mempelai Pria</h4>
            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Nama Mempelai Pria (groom_name)
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Budi Santoso"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.groom.fullName}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      groom: {
                        ...prev.couple.groom,
                        fullName: e.target.value,
                        nickname: e.target.value.split(" ")[0] || e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Info Orang Tua / Keterangan (groom_info)
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Putra Pertama dari Bapak Paijan & Ibu Warsi"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.groom.info ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      groom: {
                        ...prev.couple.groom,
                        info: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                {uploadingField === "groom_photo" ? (
                  <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-[#C89B57]" />
                )}
                <span>
                  {uploadingField === "groom_photo"
                    ? "Mengupload..."
                    : "Upload Foto Pria"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLocked || uploadingField === "groom_photo"}
                  onChange={handleGroomPhotoUpload}
                  className="hidden"
                />
              </label>
              {draft.couple.groom.photo && (
                <div className="mt-2 flex items-center gap-2.5">
                  <img
                    src={draft.couple.groom.photo}
                    alt="Groom"
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        couple: {
                          ...prev.couple,
                          groom: { ...prev.couple.groom, photo: "" },
                        },
                      }))
                    }
                    className="text-xs text-red-600 underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mempelai Wanita */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <h4 className="font-semibold text-sm">Mempelai Wanita</h4>
            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Nama Mempelai Wanita (bride_name)
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Ani Wijaya"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.bride.fullName}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      bride: {
                        ...prev.couple.bride,
                        fullName: e.target.value,
                        nickname: e.target.value.split(" ")[0] || e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Info Orang Tua / Keterangan (bride_info)
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Putri Bungsu dari Bapak Indra & Ibu Narti"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.bride.info ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      bride: {
                        ...prev.couple.bride,
                        info: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                {uploadingField === "bride_photo" ? (
                  <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-[#C89B57]" />
                )}
                <span>
                  {uploadingField === "bride_photo"
                    ? "Mengupload..."
                    : "Upload Foto Wanita"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLocked || uploadingField === "bride_photo"}
                  onChange={handleBridePhotoUpload}
                  className="hidden"
                />
              </label>
              {draft.couple.bride.photo && (
                <div className="mt-2 flex items-center gap-2.5">
                  <img
                    src={draft.couple.bride.photo}
                    alt="Bride"
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        couple: {
                          ...prev.couple,
                          bride: { ...prev.couple.bride, photo: "" },
                        },
                      }))
                    }
                    className="text-xs text-red-600 underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cover Photo & Backsound Music (Sesuai PATCH /api/v1/invitations/:id) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DDD5]">
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <label className="block text-xs font-semibold">
              Foto Sampul Undangan (cover_photo_url)
            </label>
            <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer">
              {uploadingField === "cover_photo" ? (
                <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4 text-[#C89B57]" />
              )}
              <span>
                {uploadingField === "cover_photo"
                  ? "Mengupload..."
                  : "Upload Foto Cover"}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={isLocked || uploadingField === "cover_photo"}
                onChange={handleCoverPhotoUpload}
                className="hidden"
              />
            </label>
            {draft.meta.coverPhoto && (
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={draft.meta.coverPhoto}
                  alt="Cover"
                  className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      meta: { ...prev.meta, coverPhoto: "" },
                    }))
                  }
                  className="text-xs text-red-600 underline"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <label className="block text-xs font-semibold">
              Musik Latar / Backsound (music_url)
            </label>
            <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer">
              {uploadingField === "music_url" ? (
                <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
              ) : (
                <Music className="w-4 h-4 text-[#C89B57]" />
              )}
              <span>
                {uploadingField === "music_url"
                  ? "Mengupload..."
                  : "Upload File Musik (MP3)"}
              </span>
              <input
                type="file"
                accept="audio/*"
                disabled={isLocked || uploadingField === "music_url"}
                onChange={handleMusicUpload}
                className="hidden"
              />
            </label>
            <Input
              disabled={isLocked}
              placeholder="Atau tempel URL musik (misal: bgmusic.mp3)"
              className="h-9 bg-white rounded-xl text-xs"
              value={draft.meta.audio.url}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  meta: {
                    ...prev.meta,
                    audio: { ...prev.meta.audio, url: e.target.value },
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#E5DDD5] flex justify-end">
          <Button
            type="button"
            variant="gold"
            className="h-11 rounded-xl w-full sm:w-auto"
            onClick={() => setDetailTab("events")}
          >
            Lanjut: Acara
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
